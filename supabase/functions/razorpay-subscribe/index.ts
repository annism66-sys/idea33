import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID');
const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Razorpay plan IDs are created in the Razorpay dashboard and stored as secrets.
const PLAN_IDS: Record<string, string | undefined> = {
  'pro:monthly': Deno.env.get('RAZORPAY_PLAN_PRO_MONTHLY'),
  'pro:annual': Deno.env.get('RAZORPAY_PLAN_PRO_ANNUAL'),
  'institutional:monthly': Deno.env.get('RAZORPAY_PLAN_INSTITUTIONAL_MONTHLY'),
  'institutional:annual': Deno.env.get('RAZORPAY_PLAN_INSTITUTIONAL_ANNUAL'),
};

const VALID_PLANS = ['pro', 'institutional'];
const VALID_CYCLES = ['monthly', 'annual'];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  try {
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return json({ error: 'Payment gateway is not configured yet.' }, 503);
    }

    // --- Auth: subscriptions are always tied to a signed-in user ---
    const authHeader = req.headers.get('Authorization') ?? '';
    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) return json({ error: 'Sign in required to subscribe.' }, 401);

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
      auth: { persistSession: false },
    });
    const { data: userData, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !userData?.user) return json({ error: 'Invalid session.' }, 401);
    const user = userData.user;

    // --- Input validation ---
    const body = await req.json().catch(() => ({}));
    const plan = String(body?.plan ?? '');
    const cycle = String(body?.billingCycle ?? 'monthly');
    if (!VALID_PLANS.includes(plan)) return json({ error: 'Invalid plan.' }, 400);
    if (!VALID_CYCLES.includes(cycle)) return json({ error: 'Invalid billing cycle.' }, 400);

    const razorpayPlanId = PLAN_IDS[`${plan}:${cycle}`];
    if (!razorpayPlanId) {
      return json(
        { error: `No Razorpay plan configured for ${plan} (${cycle}).` },
        503,
      );
    }

    const auth = 'Basic ' + btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);

    // --- Reuse / create Razorpay customer ---
    const { data: existing } = await admin
      .from('subscriptions')
      .select('razorpay_customer_id')
      .eq('user_id', user.id)
      .maybeSingle();

    let customerId = existing?.razorpay_customer_id ?? null;
    if (!customerId) {
      const custRes = await fetch('https://api.razorpay.com/v1/customers', {
        method: 'POST',
        headers: { Authorization: auth, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user.user_metadata?.display_name ?? user.email?.split('@')[0] ?? 'Arken User',
          email: user.email,
          fail_existing: 0,
          notes: { supabase_user_id: user.id },
        }),
      });
      const custBody = await custRes.text();
      if (!custRes.ok) {
        console.error(`Razorpay customer failed [${custRes.status}]: ${custBody}`);
        return json({ error: 'Could not create customer', details: custBody }, custRes.status);
      }
      customerId = JSON.parse(custBody).id;
    }

    // --- Create the subscription ---
    const totalCount = cycle === 'annual' ? 10 : 120; // 10 yrs / 10 yrs of months
    const subRes = await fetch('https://api.razorpay.com/v1/subscriptions', {
      method: 'POST',
      headers: { Authorization: auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plan_id: razorpayPlanId,
        customer_id: customerId,
        total_count: totalCount,
        customer_notify: 1,
        notes: { supabase_user_id: user.id, plan, billing_cycle: cycle },
      }),
    });
    const subText = await subRes.text();
    if (!subRes.ok) {
      console.error(`Razorpay subscription failed [${subRes.status}]: ${subText}`);
      return json({ error: 'Could not start subscription', details: subText }, subRes.status);
    }
    const subscription = JSON.parse(subText);

    // --- Record pending state ---
    await admin.from('subscriptions').upsert(
      {
        user_id: user.id,
        plan,
        status: 'created',
        razorpay_subscription_id: subscription.id,
        razorpay_customer_id: customerId,
        razorpay_plan_id: razorpayPlanId,
      },
      { onConflict: 'user_id' },
    );

    return json({
      subscriptionId: subscription.id,
      keyId: RAZORPAY_KEY_ID,
      shortUrl: subscription.short_url,
      plan,
      billingCycle: cycle,
    });
  } catch (err) {
    console.error('razorpay-subscribe error:', err);
    return json({ error: (err as Error).message ?? 'Unexpected error' }, 500);
  }
});
