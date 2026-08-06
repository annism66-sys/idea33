import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { getUserId, serviceClient } from "../_shared/angelone.ts";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

// Only holdings imported by a real broker feed are valid live portfolio data.
const LIVE_BROKER_SOURCES = ["angelone"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const userId = await getUserId(req);
    if (!userId) return json({ error: "Unauthorized" }, 401);

    let mode = "prototype";
    try {
      const body = await req.json();
      if (body?.mode === "live") mode = "live";
    } catch {
      // no body -> prototype
    }

    const supabase = serviceClient();
    let query = supabase
      .from("portfolio_holdings")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (mode === "live") {
      query = query.in("broker_source", LIVE_BROKER_SOURCES);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Defence in depth: strip anything that is not a real broker row in Live mode,
    // even if the query filter is ever relaxed or bypassed.
    const holdings = mode === "live"
      ? (data ?? []).filter((h: { broker_source: string | null }) =>
        h.broker_source !== null && LIVE_BROKER_SOURCES.includes(h.broker_source)
      )
      : (data ?? []);

    return json({ mode, holdings });
  } catch (error: unknown) {
    console.error("portfolio-holdings error:", error);
    const message = error instanceof Error
      ? error.message
      : "Failed to fetch holdings";
    return json({ error: message }, 500);
  }
});
