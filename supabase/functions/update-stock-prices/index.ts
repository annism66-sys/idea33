import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import {
  angelFetch,
  getAngelConnection,
  getUserId,
  resolveTokens,
  serviceClient,
} from "../_shared/angelone.ts";

interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

// Fallback price source for users without a broker connection.
async function fetchStockPrice(symbol: string): Promise<StockQuote | null> {
  try {
    const url =
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}.NS?interval=1d&range=1d`;
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });
    if (!response.ok) {
      console.error(`Failed to fetch ${symbol}: ${response.status}`);
      return null;
    }
    const data = await response.json();
    const result = data.chart?.result?.[0];
    if (!result) return null;

    const meta = result.meta;
    const currentPrice = meta.regularMarketPrice;
    const previousClose = meta.chartPreviousClose ?? meta.previousClose;
    const change = currentPrice - previousClose;
    return {
      symbol,
      price: currentPrice,
      change,
      changePercent: (change / previousClose) * 100,
    };
  } catch (error) {
    console.error(`Error fetching ${symbol}:`, error);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const userId = await getUserId(req);
    if (!userId) return json({ error: "Unauthorized" }, 401);

    const supabase = serviceClient();

    const { data: holdings, error: holdingsError } = await supabase
      .from("portfolio_holdings")
      .select("id, stock_symbol")
      .eq("user_id", userId);

    if (holdingsError) throw holdingsError;
    if (!holdings || holdings.length === 0) {
      return json({ message: "No holdings to update", updated: 0, prices: [] });
    }

    const uniqueSymbols = [...new Set(holdings.map((h) => h.stock_symbol))];
    const priceMap = new Map<string, number>();
    const updates: StockQuote[] = [];
    let source: "angelone" | "yahoo" = "yahoo";

    // Prefer Angel One live LTP when the user has an active connection.
    const conn = await getAngelConnection(supabase, userId);
    if (conn) {
      try {
        const tokenMap = await resolveTokens(supabase, uniqueSymbols);
        const tokens = Object.values(tokenMap);
        if (tokens.length > 0) {
          const { ok, json: payload } = await angelFetch(
            supabase,
            conn,
            "/rest/secure/angelbroking/market/v1/quote/",
            { method: "POST", body: { mode: "LTP", exchangeTokens: { NSE: tokens } } },
          );
          if (ok) {
            const byToken = new Map<string, number>();
            for (const q of payload?.data?.fetched ?? []) {
              if (q?.symbolToken && Number.isFinite(Number(q.ltp))) {
                byToken.set(String(q.symbolToken), Number(q.ltp));
              }
            }
            for (const [symbol, token] of Object.entries(tokenMap)) {
              const ltp = byToken.get(token);
              if (ltp && ltp > 0) {
                priceMap.set(symbol, ltp);
                updates.push({ symbol, price: ltp, change: 0, changePercent: 0 });
              }
            }
            if (priceMap.size > 0) source = "angelone";
          } else {
            console.error("Angel LTP failed, falling back to Yahoo:", payload?.message);
          }
        }
      } catch (e) {
        console.error("Angel LTP error, falling back to Yahoo:", e);
      }
    }

    if (priceMap.size === 0) {
      const quotes = await Promise.all(uniqueSymbols.map(fetchStockPrice));
      for (const q of quotes) {
        if (q) {
          priceMap.set(q.symbol, q.price);
          updates.push(q);
        }
      }
    }

    let updatedCount = 0;
    for (const holding of holdings) {
      const newPrice = priceMap.get(holding.stock_symbol);
      if (newPrice) {
        const { error } = await supabase
          .from("portfolio_holdings")
          .update({ current_price: newPrice })
          .eq("id", holding.id);
        if (!error) updatedCount++;
      }
    }

    return json({
      message: `Updated ${updatedCount} holdings`,
      updated: updatedCount,
      source,
      prices: updates,
    });
  } catch (error: unknown) {
    console.error("Error updating prices:", error);
    const message = error instanceof Error
      ? error.message
      : "Failed to update prices";
    return json({ error: message }, 500);
  }
});
