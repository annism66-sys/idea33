import { useState } from "react";
import { motion } from "framer-motion";
import { Check, X, Sparkles, Crown, Building2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/landing/Footer";
import { planFeatures, planDetails, PlanTier, usePlanStore } from "@/stores/usePlanStore";
import { toast } from "@/hooks/use-toast";

const tierIcons = {
  basic: Sparkles,
  pro: Crown,
  institutional: Building2,
};

const tierColors = {
  basic: "primary",
  pro: "accent",
  institutional: "warning",
};

export default function Plans() {
  const { currentPlan, setCurrentPlan } = usePlanStore();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  const handleSelectPlan = (tier: PlanTier) => {
    setCurrentPlan(tier);
    toast({
      title: `Switched to ${planDetails[tier].name}`,
      description: "Plan updated successfully. All features are now unlocked for preview.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Crown className="w-4 h-4" />
              <span>Choose Your Plan</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Institutional-Grade Intelligence
              <span className="block mt-2 gradient-text">At Every Level</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From retail investors to professional portfolio managers — unlock the intelligence layer that matches your ambition.
            </p>
          </motion.div>

          {/* Billing Toggle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-center gap-3 mb-12"
          >
            <span className={`text-sm font-medium ${billingCycle === "monthly" ? "text-foreground" : "text-muted-foreground"}`}>Monthly</span>
            <button
              onClick={() => setBillingCycle(billingCycle === "monthly" ? "annual" : "monthly")}
              className={`relative w-14 h-7 rounded-full transition-colors ${billingCycle === "annual" ? "bg-primary" : "bg-secondary"}`}
            >
              <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${billingCycle === "annual" ? "translate-x-8" : "translate-x-1"}`} />
            </button>
            <span className={`text-sm font-medium ${billingCycle === "annual" ? "text-foreground" : "text-muted-foreground"}`}>
              Annual <span className="text-primary text-xs font-semibold">Save 20%</span>
            </span>
          </motion.div>

          {/* Plan Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-20">
            {(["basic", "pro", "institutional"] as PlanTier[]).map((tier, index) => {
              const plan = planDetails[tier];
              const Icon = tierIcons[tier];
              const isPopular = tier === "pro";
              const isCurrent = currentPlan === tier;
              const annualPrice = billingCycle === "annual"
                ? `₹${Math.round(parseInt(plan.price.replace(/[₹,]/g, "")) * 0.8).toLocaleString("en-IN")}`
                : plan.price;

              return (
                <motion.div
                  key={tier}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + index * 0.1 }}
                  className={`relative glass-card-elevated rounded-2xl overflow-hidden ${isPopular ? "ring-2 ring-accent" : ""}`}
                >
                  {isPopular && (
                    <div className="absolute top-0 left-0 right-0 bg-accent text-accent-foreground text-center text-xs font-semibold py-1.5 tracking-wide uppercase">
                      Most Popular
                    </div>
                  )}

                  <div className={`p-8 ${isPopular ? "pt-12" : ""}`}>
                    {/* Icon + Name */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                      tier === "basic" ? "bg-primary/10" : tier === "pro" ? "bg-accent/10" : "bg-warning/10"
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        tier === "basic" ? "text-primary" : tier === "pro" ? "text-accent" : "text-warning"
                      }`} />
                    </div>

                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{plan.tagline}</p>

                    {/* Price */}
                    <div className="mb-6">
                      <span className="text-4xl font-bold font-mono">{annualPrice}</span>
                      <span className="text-muted-foreground text-sm">{plan.period}</span>
                      {billingCycle === "annual" && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Billed annually
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>

                    {/* CTA */}
                    <Button
                      variant={isCurrent ? "outline" : isPopular ? "hero" : "default"}
                      className="w-full gap-2 mb-6"
                      onClick={() => handleSelectPlan(tier)}
                      disabled={isCurrent}
                    >
                      {isCurrent ? "Current Plan" : `Get ${plan.name}`}
                      {!isCurrent && <ArrowRight className="w-4 h-4" />}
                    </Button>

                    {/* Feature List */}
                    <div className="space-y-3">
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {tier === "basic" ? "Includes:" : tier === "pro" ? "Everything in Basic, plus:" : "Everything in Pro, plus:"}
                      </div>
                      {planFeatures
                        .filter((f) => {
                          if (tier === "basic") return f.basic;
                          if (tier === "pro") return f.pro && !f.basic;
                          return f.institutional && !f.pro;
                        })
                        .map((feature) => (
                          <div key={feature.name} className="flex items-center gap-2 text-sm">
                            <Check className={`w-4 h-4 flex-shrink-0 ${
                              tier === "basic" ? "text-primary" : tier === "pro" ? "text-accent" : "text-warning"
                            }`} />
                            <span>{feature.name}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Full Comparison Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto"
          >
            <h2 className="text-2xl font-bold text-center mb-8">Full Feature Comparison</h2>
            <div className="glass-card-elevated rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left p-4 text-sm font-semibold">Feature</th>
                      <th className="text-center p-4 text-sm font-semibold text-primary">Basic</th>
                      <th className="text-center p-4 text-sm font-semibold text-accent">Pro</th>
                      <th className="text-center p-4 text-sm font-semibold text-warning">Institutional</th>
                    </tr>
                  </thead>
                  <tbody>
                    {planFeatures.map((feature, i) => (
                      <tr key={feature.name} className={i % 2 === 0 ? "bg-secondary/20" : ""}>
                        <td className="p-4 text-sm">{feature.name}</td>
                        {(["basic", "pro", "institutional"] as const).map((tier) => (
                          <td key={tier} className="text-center p-4">
                            {feature[tier] ? (
                              <Check className={`w-4 h-4 mx-auto ${
                                tier === "basic" ? "text-primary" : tier === "pro" ? "text-accent" : "text-warning"
                              }`} />
                            ) : (
                              <X className="w-4 h-4 mx-auto text-muted-foreground/30" />
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
