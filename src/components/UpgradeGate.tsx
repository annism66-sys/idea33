import { motion } from "framer-motion";
import { Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PlanTier, planDetails, usePlanStore } from "@/stores/usePlanStore";

interface UpgradeGateProps {
  requiredPlan: PlanTier;
  featureName: string;
  children: React.ReactNode;
}

export function UpgradeGate({ requiredPlan, featureName, children }: UpgradeGateProps) {
  // Plan gating temporarily disabled — full-access demo mode.
  // All features are unlocked regardless of the user's plan tier.
  return <>{children}</>;

  // eslint-disable-next-line no-unreachable
  const { hasAccess } = usePlanStore();

  if (hasAccess(requiredPlan)) {
    return <>{children}</>;
  }

  const plan = planDetails[requiredPlan];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative rounded-2xl overflow-hidden"
    >
      {/* Blurred preview */}
      <div className="pointer-events-none select-none blur-sm opacity-40">
        {children}
      </div>

      {/* Lock overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
        <div className="text-center max-w-sm px-6">
          <div className="w-14 h-14 rounded-2xl bg-secondary/80 border border-border/50 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-1">{featureName}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Available on the <span className="font-semibold text-foreground">{plan.name}</span> plan and above.
          </p>
          <Link to="/plans">
            <Button variant="hero" size="sm" className="gap-2">
              Upgrade to {plan.name}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
