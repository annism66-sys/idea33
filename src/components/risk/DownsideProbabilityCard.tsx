import { motion } from "framer-motion";
import { TrendingDown, BarChart3 } from "lucide-react";

const scenarios = [
  { label: "5% market correction", probability: 38, portfolioImpact: -4.2 },
  { label: "10% market drawdown", probability: 22, portfolioImpact: -9.8 },
  { label: "20% bear market", probability: 8, portfolioImpact: -21.5 },
  { label: "Sector rotation shock", probability: 15, portfolioImpact: -6.3 },
  { label: "Volatility spike (VIX +50%)", probability: 18, portfolioImpact: -7.1 },
];

export function DownsideProbabilityCard() {
  return (
    <div className="glass-card-elevated p-6 rounded-2xl">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-loss/20 border border-loss/30">
          <TrendingDown className="w-5 h-5 text-loss" />
        </div>
        <div>
          <h3 className="font-semibold">Downside Probability</h3>
          <p className="text-xs text-muted-foreground">Scenario-based stress analysis</p>
        </div>
      </div>

      <div className="space-y-3">
        {scenarios.map((s) => (
          <div key={s.label} className="p-3 rounded-lg bg-secondary/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">{s.label}</span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground font-mono">{s.probability}% prob.</span>
                <span className="font-mono text-sm font-medium text-loss">{s.portfolioImpact}%</span>
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-secondary/50 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${s.probability}%` }}
                transition={{ duration: 0.8 }}
                className="h-full rounded-full bg-loss/60"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 rounded-lg bg-secondary/20 border border-border/30">
        <p className="text-xs text-muted-foreground">
          <strong>Note:</strong> Probabilities are modeled estimates based on historical data and current market conditions. 
          Actual outcomes may differ. This is not investment advice.
        </p>
      </div>
    </div>
  );
}
