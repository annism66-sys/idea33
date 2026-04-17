import { motion } from "framer-motion";
import { Compass, TrendingUp, BarChart3, Activity, Minus } from "lucide-react";

type Regime = "trending_up" | "trending_down" | "range_bound" | "high_vol" | "low_vol";

interface RegimeData {
  regime: Regime;
  label: string;
  confidence: number;
  icon: any;
  color: string;
  bg: string;
  description: string;
  implication: string;
}

const regimes: RegimeData[] = [
  {
    regime: "trending_up",
    label: "Trending Up",
    confidence: 62,
    icon: TrendingUp,
    color: "text-gain",
    bg: "bg-gain",
    description: "Market shows sustained directional momentum with higher highs and higher lows.",
    implication: "Historically, momentum strategies perform well in this regime. Spreads may have lower edge.",
  },
  {
    regime: "range_bound",
    label: "Range-Bound",
    confidence: 25,
    icon: Minus,
    color: "text-warning",
    bg: "bg-warning",
    description: "Market consolidating within defined support/resistance zones.",
    implication: "Range-bound regimes historically favor mean-reversion and selling strategies.",
  },
  {
    regime: "high_vol",
    label: "High Volatility",
    confidence: 45,
    icon: Activity,
    color: "text-loss",
    bg: "bg-loss",
    description: "Volatility elevated above historical averages with rapid price swings.",
    implication: "High-vol regimes increase option premiums but also drawdown risk. Position sizing discipline is critical.",
  },
  {
    regime: "low_vol",
    label: "Low Volatility",
    confidence: 15,
    icon: BarChart3,
    color: "text-accent",
    bg: "bg-accent",
    description: "Volatility compressed below median — potential for expansion.",
    implication: "Low-vol regimes may precede large moves. Long premium strategies historically gain from vol expansion.",
  },
];

const currentRegime = regimes[0]; // trending_up as detected

const historicalRegimes = [
  { period: "Feb 2026", regime: "Trending Up", duration: "Current" },
  { period: "Jan 2026", regime: "High Volatility", duration: "12 days" },
  { period: "Dec 2025", regime: "Range-Bound", duration: "18 days" },
  { period: "Nov 2025", regime: "Trending Up", duration: "25 days" },
  { period: "Oct 2025", regime: "Low Volatility", duration: "14 days" },
];

export function RegimeDetection() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/20 border border-primary/30">
          <Compass className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Market Regime Detection</h3>
          <p className="text-sm text-muted-foreground">Automated market environment classification</p>
        </div>
      </div>

      {/* Current Regime */}
      <div className={`p-6 rounded-2xl border-2 ${currentRegime.bg}/10 border-${currentRegime.bg}/30`} style={{ borderColor: `hsl(var(--gain) / 0.3)`, backgroundColor: `hsl(var(--gain) / 0.05)` }}>
        <div className="flex items-center gap-3 mb-3">
          <currentRegime.icon className={`w-6 h-6 ${currentRegime.color}`} />
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-lg">{currentRegime.label}</h4>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${currentRegime.color} ${currentRegime.bg}/20`}>
                {currentRegime.confidence}% confidence
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Current detected regime</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-3">{currentRegime.description}</p>
        <div className="p-3 rounded-lg bg-secondary/30">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Probabilistic implication:</strong> {currentRegime.implication}
          </p>
        </div>
      </div>

      {/* All Regime Probabilities */}
      <div className="glass-card-elevated p-6 rounded-2xl">
        <h4 className="font-semibold mb-4">Regime Probability Distribution</h4>
        <div className="space-y-3">
          {regimes.map((r) => (
            <div key={r.regime} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <r.icon className={`w-3.5 h-3.5 ${r.color}`} />
                  <span className="text-sm">{r.label}</span>
                </div>
                <span className={`font-mono text-sm font-medium ${r.color}`}>{r.confidence}%</span>
              </div>
              <div className="h-2 rounded-full bg-secondary/50 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${r.confidence}%` }}
                  transition={{ duration: 0.8 }}
                  className={`h-full rounded-full ${r.bg}`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Historical Regimes */}
      <div className="glass-card-elevated p-6 rounded-2xl">
        <h4 className="font-semibold mb-4">Regime History</h4>
        <div className="space-y-2">
          {historicalRegimes.map((h, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20">
              <span className="text-sm text-muted-foreground">{h.period}</span>
              <span className="text-sm font-medium">{h.regime}</span>
              <span className="text-xs font-mono text-muted-foreground">{h.duration}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
