import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import {
  angelFetch,
  API_KEY,
  getAngelConnection,
  getUserId,
  resolveTokens,
  serviceClient,
} from "../_shared/angelone.ts";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!API_KEY) {
      return json({ error: "Angel One API key is not configured." }, 500);
    }

    const userId = await getUserId(req);
    if (!userId) return json({ error: "Unauthorized" }, 401);

    const supabase = serviceClient();
    const conn = await getAngelConnection(supabase, userId);
    if (!conn) {
      return json({ error: "No active Angel One connection found." }, 400);
    }

    // Optional explicit symbol list; otherwise use the user's Angel One holdings.
    const body = await req.json().catch(() => ({}));
    let symbols: string[] = Array.isArray(body?.symbols)
      ? body.symbols.filter((s: unknown) => typeof s === "string").slice(0, 200)
      : [];

    if (symbols.length === 0) {
      const { data } = await supabase
        .from("portfolio_holdings")
        .select("stock_symbol")
        .eq("user_id", userId)
        .eq("broker_source", "angelone");
      symbols = [...new Set((data ?? []).map((h) => h.stock_symbol))];
    }

    if (symbols.length === 0) {
      return json({ success: true, updated: 0, prices: [] });
    }

    const tokenMap = await resolveTokens(supabase, symbols);
    const tokens = Object.values(tokenMap);
    if (tokens.length === 0) {
      return json({ success: true, updated: 0, prices: [] });
    }

    const { ok, status, json: payload } = await angelFetch(
      supabase,
      conn,
      "/rest/secure/angelbroking/market/v1/quote/",
      {
        method: "POST",
        body: { mode: "LTP", exchangeTokens: { NSE: tokens } },
      },
    );

    if (!ok) {
      if (status === 401) {
        return json(
          {
            error: "Angel One session expired. Please reconnect your broker.",
            requiresReauth: true,
          },
          401,
        );
      }
      return json(
        { error: payload?.message || "Failed to fetch live prices." },
        502,
      );
    }

    const fetched: any[] = payload?.data?.fetched ?? [];
    const byToken = new Map<string, number>();
    for (const q of fetched) {
      if (q?.symbolToken && Number.isFinite(Number(q.ltp))) {
        byToken.set(String(q.symbolToken), Number(q.ltp));
      }
    }

    const prices: { symbol: string; price: number }[] = [];
    for (const [symbol, token] of Object.entries(tokenMap)) {
      const ltp = byToken.get(token);
      if (ltp && ltp > 0) prices.push({ symbol, price: ltp });
    }

    let updated = 0;
    for (const p of prices) {
      const { error } = await supabase
        .from("portfolio_holdings")
        .update({ current_price: p.price })
        .eq("user_id", userId)
        .eq("stock_symbol", p.symbol);
      if (!error) updated++;
    }

    return json({ success: true, updated, prices });
  } catch (error: unknown) {
    console.error("angel-one-ltp error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch live prices";
    return json({ error: message }, 500);
  }
});
