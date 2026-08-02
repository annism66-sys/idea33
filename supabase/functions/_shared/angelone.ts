import { createClient, SupabaseClient } from "npm:@supabase/supabase-js@2";

export const ANGEL_BASE = "https://apiconnect.angelone.in";
export const SCRIP_MASTER_URL =
  "https://margincalculator.angelone.in/OpenAPI_File/files/OpenAPIScripMaster.json";

export const API_KEY = Deno.env.get("ANGELONE_API_KEY") ?? "";

/** Angel One requires these on every request. */
export function angelHeaders(extra: Record<string, string> = {}) {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-UserType": "USER",
    "X-SourceID": "WEB",
    "X-ClientLocalIP": "127.0.0.1",
    "X-ClientPublicIP": "127.0.0.1",
    "X-MACAddress": "00:00:00:00:00:00",
    "X-PrivateKey": API_KEY,
    ...extra,
  };
}

export function serviceClient(): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

/** Validate the caller's Supabase JWT and return their user id. */
export async function getUserId(req: Request): Promise<string | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.replace("Bearer ", "");
  const anon = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
  );
  const { data, error } = await anon.auth.getClaims(token);
  if (error || !data?.claims?.sub) return null;
  return data.claims.sub as string;
}

export interface BrokerConnection {
  id: string;
  user_id: string;
  client_id: string;
  access_token: string | null;
  refresh_token: string | null;
  feed_token: string | null;
  token_expiry: string | null;
}

export async function getAngelConnection(
  supabase: SupabaseClient,
  userId: string,
): Promise<BrokerConnection | null> {
  const { data } = await supabase
    .from("broker_connections")
    .select("*")
    .eq("user_id", userId)
    .eq("broker", "angelone")
    .eq("is_active", true)
    .maybeSingle();
  return (data as BrokerConnection) ?? null;
}

/**
 * Exchange the stored refresh token for a fresh JWT + feed token.
 * Returns the new access token, or null when the refresh itself failed
 * (user must re-authenticate with MPIN + TOTP).
 */
export async function refreshAngelToken(
  supabase: SupabaseClient,
  conn: BrokerConnection,
): Promise<string | null> {
  if (!conn.refresh_token) return null;

  const res = await fetch(
    `${ANGEL_BASE}/rest/auth/angelbroking/jwt/v1/generateTokens`,
    {
      method: "POST",
      headers: angelHeaders({
        Authorization: `Bearer ${conn.access_token ?? ""}`,
      }),
      body: JSON.stringify({ refreshToken: conn.refresh_token }),
    },
  );

  const json = await res.json().catch(() => null);
  const d = json?.data;
  if (!res.ok || !json?.status || !d?.jwtToken) {
    console.error("Angel token refresh failed:", json?.message ?? res.status);
    return null;
  }

  await supabase
    .from("broker_connections")
    .update({
      access_token: d.jwtToken,
      refresh_token: d.refreshToken ?? conn.refresh_token,
      feed_token: d.feedToken ?? conn.feed_token,
      token_expiry: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    })
    .eq("id", conn.id);

  conn.access_token = d.jwtToken;
  return d.jwtToken as string;
}

/**
 * Call an Angel One secure endpoint, transparently refreshing the session
 * once on 401 / invalid-token responses.
 */
export async function angelFetch(
  supabase: SupabaseClient,
  conn: BrokerConnection,
  path: string,
  init: { method: string; body?: unknown },
): Promise<{ ok: boolean; status: number; json: any }> {
  const call = async (token: string) => {
    const res = await fetch(`${ANGEL_BASE}${path}`, {
      method: init.method,
      headers: angelHeaders({ Authorization: `Bearer ${token}` }),
      body: init.body ? JSON.stringify(init.body) : undefined,
    });
    const json = await res.json().catch(() => null);
    return { res, json };
  };

  let token = conn.access_token ?? "";
  let { res, json } = await call(token);

  const unauthorized =
    res.status === 401 ||
    (json && json.status === false &&
      typeof json.errorcode === "string" &&
      /AG8001|AG8002|AB8050|AB8051/i.test(json.errorcode));

  if (unauthorized) {
    const fresh = await refreshAngelToken(supabase, conn);
    if (!fresh) return { ok: false, status: 401, json };
    ({ res, json } = await call(fresh));
  }

  return { ok: res.ok && json?.status !== false, status: res.status, json };
}

/**
 * Ensure the cached Angel One scrip master is present and fresh (< 24h).
 * Only NSE/BSE cash equity rows are stored to keep the table small.
 */
export async function ensureInstrumentCache(supabase: SupabaseClient) {
  const { data: newest } = await supabase
    .from("angelone_instruments")
    .select("updated_at")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const isFresh =
    newest?.updated_at &&
    Date.now() - new Date(newest.updated_at).getTime() < 24 * 60 * 60 * 1000;
  if (isFresh) return;

  console.log("Refreshing Angel One scrip master cache...");
  const res = await fetch(SCRIP_MASTER_URL);
  if (!res.ok) throw new Error(`Scrip master fetch failed: ${res.status}`);
  const all = (await res.json()) as any[];

  const rows = all
    .filter(
      (i) =>
        (i.exch_seg === "NSE" || i.exch_seg === "BSE") &&
        (!i.instrumenttype || i.instrumenttype === "") &&
        typeof i.symbol === "string" &&
        i.symbol.endsWith("-EQ") === (i.exch_seg === "NSE"),
    )
    .map((i) => ({
      token: String(i.token),
      symbol: String(i.symbol),
      name: i.name ? String(i.name) : null,
      exchange: String(i.exch_seg),
      lotsize: i.lotsize ? Number(i.lotsize) : null,
      instrumenttype: i.instrumenttype || null,
      tick_size: i.tick_size ? Number(i.tick_size) : null,
      updated_at: new Date().toISOString(),
    }));

  // Upsert in chunks so we never blow the request size limit.
  for (let i = 0; i < rows.length; i += 1000) {
    const chunk = rows.slice(i, i + 1000);
    const { error } = await supabase
      .from("angelone_instruments")
      .upsert(chunk, { onConflict: "exchange,token" });
    if (error) throw error;
  }
  console.log(`Cached ${rows.length} Angel One instruments.`);
}

/** Resolve plain trading symbols (e.g. RELIANCE) to Angel One NSE tokens. */
export async function resolveTokens(
  supabase: SupabaseClient,
  symbols: string[],
): Promise<Record<string, string>> {
  if (symbols.length === 0) return {};
  await ensureInstrumentCache(supabase);

  const candidates = symbols.flatMap((s) => [s.toUpperCase(), `${s.toUpperCase()}-EQ`]);
  const { data } = await supabase
    .from("angelone_instruments")
    .select("token, symbol, exchange")
    .eq("exchange", "NSE")
    .in("symbol", candidates);

  const map: Record<string, string> = {};
  for (const row of data ?? []) {
    const base = String(row.symbol).replace(/-EQ$/, "").toUpperCase();
    map[base] = String(row.token);
  }
  return map;
}
