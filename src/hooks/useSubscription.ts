import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePlanStore, PlanTier } from "@/stores/usePlanStore";

export interface SubscriptionRecord {
  plan: PlanTier;
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

/**
 * Reads the signed-in user's live subscription from the backend and mirrors
 * the entitlement into the plan store (Live mode only — Prototype mode keeps
 * the simulated plan switcher behaviour).
 */
export function useSubscription() {
  const { user } = useAuth();
  const setCurrentPlan = usePlanStore((s) => s.setCurrentPlan);
  const [subscription, setSubscription] = useState<SubscriptionRecord | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("subscriptions")
      .select("plan, status, current_period_end, cancel_at_period_end")
      .eq("user_id", user.id)
      .maybeSingle();
    setLoading(false);
    if (error) {
      console.error("Failed to load subscription:", error.message);
      return;
    }
    if (data) {
      const record = data as SubscriptionRecord;
      setSubscription(record);
      if (record.status === "active") setCurrentPlan(record.plan);
    } else {
      setSubscription(null);
    }
  }, [user, setCurrentPlan]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { subscription, loading, refresh };
}
