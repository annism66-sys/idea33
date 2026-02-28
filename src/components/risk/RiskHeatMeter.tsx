import { motion } from "framer-motion";
import { Flame, TrendingDown, Activity, Target } from "lucide-react";

interface RiskHeatMeterProps {
  concentrationRisk: number;
  volatilityRisk: number;
  drawdownRisk: number;
  correlationRisk: number;
}

export function RiskHeatMeter({
  concentrationRisk = 68,
  volatilityRisk = 45,
  drawdownRisk = 52,
  correlationRisk = 37,
}: Partial<RiskHeatMeterProps>) {
  const overallRisk = Math.round((concentrationRisk + volatilityRisk + drawdownRisk + correlationRisk) / 4);

  const getColor = (val: number) => {
    if (val >= 70) return "text-loss";
    if (val >= 40) return "text-warning";
    return "text-gain";
  };

  const getBg = (val: number) => {
    if (val >= 70) return "bg-loss/20 border-loss/30";
    if (val >= 40) return "bg-warning/20 border-warning/30";
    return "bg-gain/20 border-gain/30";
  };

  const getBarBg = (val: number) => {
    if (val >= 70) return "bg-loss";
    if (val >= 40) return "bg-warning";
    return "bg-gain";
  };

  const factors = [
    { label: "Concentration Risk", value: concentrationRisk, icon: Target, insight: "Portfolio exposure may be concentrated in fewer positions." },
    { label: "Volatility Exposure", value: volatilityRisk, icon: Activity, insight: "Volatility is within historical norms for this allocation." },
    { label: "Drawdown Sensitivity", value: drawdownRisk, icon: TrendingDown, insight: "Current allocation increases drawdown sensitivity moderately." },
    { label: "Correlation Clustering", value: correlationRisk, icon: Flame, insight: "Holdings show moderate correlation clustering." },
  ];

  return (
    <div className="glass-card-elevated p-6 rounded-2xl">
      <div className="flex items-center gap-2 mb-6">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getBg(overallRisk)}`}>
          <Flame className={`w-5 h-5 ${getColor(overallRisk)}`} />
        </div>
        <div>
          <h3 className="font-semibold">Risk Heat Meter</h3>
          <p className="text-xs text-muted-foreground">Composite risk temperature</p>
        </div>
        <div className="ml-auto text-right">
          <div className={`text-2xl font-bold font-mono ${getColor(overallRisk)}`}>{overallRisk}</div>
          <div className="text-xs text-muted-foreground">/ 100</div>
        </div>
      </div>

      {/* Overall meter bar */}
      <div className="h-3 rounded-full bg-secondary/50 mb-6 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${overallRisk}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full rounded-full ${getBarBg(overallRisk)}`}
        />
      </div>

      <div className="space-y-4">
        {factors.map((factor) => (
          <div key={factor.label} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <factor.icon className={`w-3.5 h-3.5 ${getColor(factor.value)}`} />
                <span className="text-sm font-medium">{factor.label}</span>
              </div>
              <span className={`font-mono text-sm font-medium ${getColor(factor.value)}`}>{factor.value}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-secondary/50 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${factor.value}%` }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className={`h-full rounded-full ${getBarBg(factor.value)}`}
              />
            </div>
            <p className="text-xs text-muted-foreground">{factor.insight}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
