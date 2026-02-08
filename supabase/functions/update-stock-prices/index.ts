import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

// Fetch stock price from Yahoo Finance
async function fetchStockPrice(symbol: string): Promise<StockQuote | null> {
  try {
    // Add .NS suffix for NSE stocks
    const yahooSymbol = `${symbol}.NS`;
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=1d`;
    
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch ${symbol}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const result = data.chart?.result?.[0];
    
    if (!result) {
      console.error(`No data for ${symbol}`);
      return null;
    }

    const meta = result.meta;
    const currentPrice = meta.regularMarketPrice;
    const previousClose = meta.chartPreviousClose || meta.previousClose;
    const change = currentPrice - previousClose;
    const changePercent = (change / previousClose) * 100;

    return {
      symbol,
      price: currentPrice,
      change,
      changePercent,
    };
  } catch (error) {
    console.error(`Error fetching ${symbol}:`, error);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get JWT token and verify user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user's holdings
    const { data: holdings, error: holdingsError } = await supabase
      .from("portfolio_holdings")
      .select("id, stock_symbol")
      .eq("user_id", user.id);

    if (holdingsError) {
      throw holdingsError;
    }

    if (!holdings || holdings.length === 0) {
      return new Response(
        JSON.stringify({ message: "No holdings to update", updated: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get unique symbols
    const uniqueSymbols = [...new Set(holdings.map((h) => h.stock_symbol))];
    
    // Fetch prices for all symbols
    const pricePromises = uniqueSymbols.map((symbol) => fetchStockPrice(symbol));
    const prices = await Promise.all(pricePromises);
    
    // Create price map
    const priceMap = new Map<string, number>();
    prices.forEach((quote) => {
      if (quote) {
        priceMap.set(quote.symbol, quote.price);
      }
    });

    // Update holdings with new prices
    let updatedCount = 0;
    const updates: StockQuote[] = [];

    for (const holding of holdings) {
      const newPrice = priceMap.get(holding.stock_symbol);
      if (newPrice) {
        const { error: updateError } = await supabase
          .from("portfolio_holdings")
          .update({ current_price: newPrice })
          .eq("id", holding.id);

        if (!updateError) {
          updatedCount++;
          const quote = prices.find((p) => p?.symbol === holding.stock_symbol);
          if (quote) updates.push(quote);
        }
      }
    }

    return new Response(
      JSON.stringify({
        message: `Updated ${updatedCount} holdings`,
        updated: updatedCount,
        prices: updates,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error updating prices:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to update prices" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
