import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import {
  ANGEL_BASE,
  API_KEY,
  angelHeaders,
  getUserId,
  serviceClient,
} from "../_shared/angelone.ts";

const BodySchema = z.object({
  clientcode: z.string().trim().min(3).max(32),
  password: z.string().trim().min(4).max(8), // MPIN
  totp: z.string().trim().regex(/^\d{6}$/, "TOTP must be 6 digits"),
});

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

    const parsed = BodySchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return json({ error: parsed.error.flatten().fieldErrors }, 400);
    }
    const { clientcode, password, totp } = parsed.data;

    const res = await fetch(
      `${ANGEL_BASE}/rest/auth/angelbroking/user/v1/loginByPassword`,
      {
        method: "POST",
        headers: angelHeaders(),
        body: JSON.stringify({ clientcode, password, totp }),
      },
    );

    const payload = await res.json().catch(() => null);
    const d = payload?.data;

    if (!res.ok || payload?.status === false || !d?.jwtToken) {
      // Never log credentials — only Angel's own error text.
      console.error("Angel login failed:", payload?.message, payload?.errorcode);
      return json(
        {
          error:
            payload?.message ||
            "Angel One rejected the login. Check your Client ID, MPIN and TOTP.",
        },
        401,
      );
    }

    const supabase = serviceClient();

    // Store session tokens only — MPIN and TOTP are never persisted.
    const { error: upsertError } = await supabase
      .from("broker_connections")
      .upsert(
        {
          user_id: userId,
          broker: "angelone",
          client_id: clientcode.toUpperCase(),
          api_key: null,
          access_token: d.jwtToken,
          refresh_token: d.refreshToken ?? null,
          feed_token: d.feedToken ?? null,
          token_expiry: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
          is_active: true,
        },
        { onConflict: "user_id,broker" },
      );

    if (upsertError) throw upsertError;

    return json({ success: true, client_id: clientcode.toUpperCase() });
  } catch (error: unknown) {
    console.error("angel-one-auth error:", error);
    const message =
      error instanceof Error ? error.message : "Angel One login failed";
    return json({ error: message }, 500);
  }
});
