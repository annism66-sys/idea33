import { motion } from "framer-motion";
import { Check, ArrowRight, Sparkles, Crown, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { planDetails, PlanTier } from "@/stores/usePlanStore";

const tierIcons = {
  basic: Sparkles,
  pro: Crown,
  institutional: Building2,
};

const highlights: Record<PlanTier, string[]> = {
  basic: ["Portfolio Sync", "Intelligent Idea Generation", "Risk Dashboard", "Strategy Simulation"],
  pro: ["Live Risk Radar", "Behavioral Intelligence", "Option Probability Engine", "Regime Detection"],
  institutional: ["Multi-Portfolio Monitoring", "Capital Survival Modeling", "API Access", "Compliance Logs"],
};

export function PricingSection() {
  return (
    <section className="py-24 relative" id="pricing">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Plans for Every Investor</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Start free. Scale to institutional.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {(["basic", "pro", "institutional"] as PlanTier[]).map((tier, index) => {
            const plan = planDetails[tier];
            const Icon = tierIcons[tier];
            const isPopular = tier === "pro";

            return (
              <motion.div
                key={tier}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`glass-card-elevated rounded-2xl p-7 relative ${isPopular ? "ring-2 ring-accent" : ""}`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-accent text-accent-foreground text-xs font-semibold">
                    Most Popular
                  </div>
                )}

                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                  tier === "basic" ? "bg-primary/10" : tier === "pro" ? "bg-accent/10" : "bg-warning/10"
                }`}>
                  <Icon className={`w-5 h-5 ${
                    tier === "basic" ? "text-primary" : tier === "pro" ? "text-accent" : "text-warning"
                  }`} />
                </div>

                <h3 className="text-lg font-bold">{plan.name}</h3>
                <p className="text-xs text-muted-foreground mb-3">{plan.tagline}</p>

                <div className="mb-4">
                  <span className="text-3xl font-bold font-mono">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </div>

                <div className="space-y-2 mb-6">
                  {highlights[tier].map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm">
                      <Check className={`w-3.5 h-3.5 flex-shrink-0 ${
                        tier === "basic" ? "text-primary" : tier === "pro" ? "text-accent" : "text-warning"
                      }`} />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>

                <Link to="/plans">
                  <Button variant={isPopular ? "hero" : "outline"} className="w-full gap-2" size="sm">
                    {isPopular ? "Get Started" : "View Plan"}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
