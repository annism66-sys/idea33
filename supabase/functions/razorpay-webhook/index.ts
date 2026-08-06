import { createClient } from 'npm:@supabase/supabase-js@2';

const WEBHOOK_SECRET = Deno.env.get('RAZORPAY_WEBHOOK_SECRET');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

async function verifySignature(payload: string, signature: string, secret: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  const expected = Array.from(new Uint8Array(mac))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  return diff === 0;
}

const ACTIVE_STATES = ['active', 'authenticated', 'resumed', 'charged'];

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  if (!WEBHOOK_SECRET) {
    console.error('RAZORPAY_WEBHOOK_SECRET missing');
    return new Response('Not configured', { status: 503 });
  }

  const raw = await req.text();
  const signature = req.headers.get('x-razorpay-signature') ?? '';
  if (!signature || !(await verifySignature(raw, signature, WEBHOOK_SECRET))) {
    console.error('Invalid Razorpay webhook signature');
    return new Response('Invalid signature', { status: 401 });
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

  try {
    const event = JSON.parse(raw);
    const type: string = event.event ?? '';
    const sub = event.payload?.subscription?.entity;
    const payment = event.payload?.payment?.entity;

    const subscriptionId: string | undefined = sub?.id ?? payment?.subscription_id;
    let resolvedUserId: string | undefined =
      sub?.notes?.supabase_user_id ?? payment?.notes?.supabase_user_id;
    let resolvedPlan: string | undefined = sub?.notes?.plan ?? payment?.notes?.plan;

    console.log(`Razorpay webhook: ${type} sub=${subscriptionId}`);

    if (subscriptionId) {
      const { data: row } = await admin
        .from('subscriptions')
        .select('user_id, plan')
        .eq('razorpay_subscription_id', subscriptionId)
        .maybeSingle();
      resolvedUserId = resolvedUserId ?? row?.user_id;
      resolvedPlan = resolvedPlan ?? row?.plan;

      if (resolvedUserId) {
        const status =
          type === 'subscription.cancelled'
            ? 'cancelled'
            : type === 'subscription.halted' || type === 'subscription.paused'
              ? 'paused'
              : type === 'subscription.completed'
                ? 'completed'
                : ACTIVE_STATES.includes(sub?.status ?? '') || type === 'subscription.charged'
                  ? 'active'
                  : (sub?.status ?? 'pending');

        const periodEnd = sub?.current_end
          ? new Date(sub.current_end * 1000).toISOString()
          : undefined;

        await admin.from('subscriptions').upsert(
          {
            user_id: resolvedUserId,
            plan: status === 'active' ? (resolvedPlan ?? 'pro') : 'basic',
            status,
            razorpay_subscription_id: subscriptionId,
            razorpay_plan_id: sub?.plan_id ?? undefined,
            razorpay_customer_id: sub?.customer_id ?? undefined,
            ...(periodEnd ? { current_period_end: periodEnd } : {}),
            cancel_at_period_end: Boolean(sub?.cancel_at_cycle_end),
          },
          { onConflict: 'user_id' },
        );

        if (payment?.id) {
          await admin.from('payments').upsert(
            {
              user_id: resolvedUserId,
              plan: resolvedPlan ?? null,
              amount: (payment.amount ?? 0) / 100,
              currency: payment.currency ?? 'INR',
              status: payment.status ?? 'captured',
              razorpay_payment_id: payment.id,
              razorpay_subscription_id: subscriptionId,
              razorpay_order_id: payment.order_id ?? null,
            },
            { onConflict: 'razorpay_payment_id' },
          );
        }
      } else {
        console.error(`No user mapped for subscription ${subscriptionId}`);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('razorpay-webhook error:', err);
    return new Response('Webhook handling failed', { status: 500 });
  }
});
