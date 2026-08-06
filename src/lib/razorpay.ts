import { supabase } from "@/integrations/supabase/client";
import { PlanTier } from "@/stores/usePlanStore";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

function loadCheckoutScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${CHECKOUT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }
    const script = document.createElement("script");
    script.src = CHECKOUT_SRC;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export interface CheckoutParams {
  plan: Exclude<PlanTier, "basic">;
  billingCycle: "monthly" | "annual";
  userEmail?: string | null;
  userName?: string | null;
  onSuccess: () => void;
  onDismiss?: () => void;
}

/**
 * Starts a Razorpay recurring subscription checkout for the given plan.
 * Throws with a readable message when the gateway is not configured or the
 * subscription could not be created.
 */
export async function startRazorpayCheckout({
  plan,
  billingCycle,
  userEmail,
  userName,
  onSuccess,
  onDismiss,
}: CheckoutParams) {
  const { data, error } = await supabase.functions.invoke("razorpay-subscribe", {
    body: { plan, billingCycle },
  });

  if (error) {
    let details = error.message;
    // Surface the real backend message instead of "non-2xx status code".
    const ctx = (error as unknown as { context?: Response }).context;
    if (ctx && typeof ctx.text === "function") {
      const text = await ctx.text();
      try {
        details = JSON.parse(text).error ?? text;
      } catch {
        details = text || details;
      }
    }
    throw new Error(details);
  }

  if (!data?.subscriptionId || !data?.keyId) {
    throw new Error("Payment gateway did not return a valid subscription.");
  }

  const loaded = await loadCheckoutScript();
  if (!loaded || !window.Razorpay) {
    // Fallback: Razorpay hosted page
    if (data.shortUrl) {
      window.open(data.shortUrl as string, "_blank", "noopener");
      return;
    }
    throw new Error("Could not load the payment window. Please retry.");
  }

  const rzp = new window.Razorpay({
    key: data.keyId,
    subscription_id: data.subscriptionId,
    name: "Arken",
    description: `${plan === "pro" ? "Pro" : "Institutional"} plan — ${billingCycle}`,
    theme: { color: "#10b981" },
    prefill: {
      email: userEmail ?? undefined,
      name: userName ?? undefined,
    },
    handler: () => onSuccess(),
    modal: {
      ondismiss: () => onDismiss?.(),
    },
  });

  rzp.open();
}
