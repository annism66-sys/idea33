import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import {
  angelFetch,
  API_KEY,
  getAngelConnection,
  getUserId,
  serviceClient,
} from "../_shared/angelone.ts";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const num = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

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

    const { ok, status, json: payload } = await angelFetch(
      supabase,
      conn,
      "/rest/secure/angelbroking/portfolio/v1/getAllHolding",
      { method: "GET" },
    );

    if (!ok) {
      if (status === 401) {
        return json(
          {
            error:
              "Your Angel One session has expired. Please reconnect with your MPIN and TOTP.",
            requiresReauth: true,
          },
          401,
        );
      }
      return json(
        { error: payload?.message || "Failed to fetch Angel One holdings." },
        502,
      );
    }

    const raw = payload?.data?.holdings ?? payload?.data ?? [];
    const holdings: any[] = Array.isArray(raw) ? raw : [];

    const mapped = holdings
      .filter((h) => h?.tradingsymbol)
      .map((h) => {
        const symbol = String(h.tradingsymbol).replace(/-EQ$/i, "").toUpperCase();
        return {
          user_id: userId,
          stock_symbol: symbol,
          stock_name: h.symbolname ? String(h.symbolname) : symbol,
          quantity: num(h.quantity) + num(h.t1quantity),
          average_price: num(h.averageprice),
          current_price: num(h.ltp) || null,
          sector: null,
          exchange: h.exchange ? String(h.exchange) : "NSE",
          broker_source: "angelone",
        };
      })
      .filter((h) => h.quantity > 0);

    // Replace the previous Angel One snapshot so we never duplicate rows.
    const { error: delError } = await supabase
      .from("portfolio_holdings")
      .delete()
      .eq("user_id", userId)
      .eq("broker_source", "angelone");
    if (delError) throw delError;

    if (mapped.length > 0) {
      const { error: insError } = await supabase
        .from("portfolio_holdings")
        .insert(mapped);
      if (insError) throw insError;
    }

    return json({
      success: true,
      imported: mapped.length,
      holdings: mapped.map((h) => ({
        stock_symbol: h.stock_symbol,
        quantity: h.quantity,
        current_price: h.current_price,
      })),
    });
  } catch (error: unknown) {
    console.error("angel-one-portfolio error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to import holdings";
    return json({ error: message }, 500);
  }
});
