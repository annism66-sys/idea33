import { motion } from "framer-motion";
import { Crosshair, TrendingUp, Shield, BarChart3 } from "lucide-react";

const trades = [
  { id: 1, symbol: "NIFTY 22000 CE", expectedEV: 1.32, realizedReturn: 0.85, edge: -0.47, status: "negative" },
  { id: 2, symbol: "BANKNIFTY 49000 PE", expectedEV: 0.95, realizedReturn: 1.45, edge: 0.50, status: "positive" },
  { id: 3, symbol: "RELIANCE 2800 CE", expectedEV: 1.15, realizedReturn: 1.10, edge: -0.05, status: "neutral" },
  { id: 4, symbol: "TCS Equity", expectedEV: 1.22, realizedReturn: 1.38, edge: 0.16, status: "positive" },
  { id: 5, symbol: "HDFCBANK 1700 CE", expectedEV: 0.88, realizedReturn: 0.42, edge: -0.46, status: "negative" },
];

const qualityScores = [
  { label: "Strategy Diversification", score: 72 },
  { label: "Risk-Adjusted Sizing", score: 58 },
  { label: "Entry Timing Quality", score: 65 },
  { label: "Exit Discipline", score: 81 },
  { label: "Correlation Management", score: 45 },
];

export function AdvancedIntelligenceModules() {
  const avgEdge = trades.reduce((sum, t) => sum + t.edge, 0) / trades.length;
  const overallQuality = Math.round(qualityScores.reduce((sum, q) => sum + q.score, 0) / qualityScores.length);
  const survivalProbability = 74;

  return (
    <div className="space-y-6">
      {/* Edge Tracker */}
      <div className="glass-card-elevated p-6 rounded-2xl">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-accent/20 border border-accent/30">
            <Crosshair className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold">Edge Tracker</h3>
            <p className="text-xs text-muted-foreground">Expected value vs. realized outcomes</p>
          </div>
          <div className="ml-auto text-right">
            <div className={`text-lg font-bold font-mono ${avgEdge >= 0 ? "text-gain" : "text-loss"}`}>
              {avgEdge >= 0 ? "+" : ""}{avgEdge.toFixed(2)}
            </div>
            <div className="text-[10px] text-muted-foreground">Avg Edge</div>
          </div>
        </div>

        <div className="space-y-2">
          {trades.map((t) => (
            <div key={t.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20">
              <span className="text-sm font-mono w-40 truncate">{t.symbol}</span>
              <div className="flex-1 grid grid-cols-3 gap-2 text-xs text-center">
                <div>
                  <div className="text-muted-foreground">Expected</div>
                  <div className="font-mono">{t.expectedEV.toFixed(2)}x</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Realized</div>
                  <div className="font-mono">{t.realizedReturn.toFixed(2)}x</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Edge</div>
                  <div className={`font-mono font-medium ${t.edge >= 0 ? "text-gain" : "text-loss"}`}>
                    {t.edge >= 0 ? "+" : ""}{t.edge.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Strategy Quality Score */}
        <div className="glass-card-elevated p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/20 border border-primary/30">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Strategy Quality Score</h3>
              <p className="text-xs text-muted-foreground">Pre-trade risk assessment</p>
            </div>
            <span className={`ml-auto text-2xl font-bold font-mono ${overallQuality >= 70 ? "text-gain" : overallQuality >= 50 ? "text-warning" : "text-loss"}`}>
              {overallQuality}
            </span>
          </div>

          <div className="space-y-3">
            {qualityScores.map((q) => {
              const color = q.score >= 70 ? "bg-gain" : q.score >= 50 ? "bg-warning" : "bg-loss";
              return (
                <div key={q.label} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs">{q.label}</span>
                    <span className="font-mono text-xs">{q.score}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary/50 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${q.score}%` }}
                      transition={{ duration: 0.8 }}
                      className={`h-full rounded-full ${color}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Capital Survival Probability */}
        <div className="glass-card-elevated p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-warning/20 border border-warning/30">
              <Shield className="w-5 h-5 text-warning" />
            </div>
            <div>
              <h3 className="font-semibold">Capital Survival Probability</h3>
              <p className="text-xs text-muted-foreground">Drawdown risk modeling</p>
            </div>
          </div>

          {/* Main gauge */}
          <div className="text-center mb-6">
            <div className={`text-5xl font-bold font-mono ${survivalProbability >= 70 ? "text-gain" : "text-warning"}`}>
              {survivalProbability}%
            </div>
            <p className="text-sm text-muted-foreground mt-1">Probability of avoiding 30% drawdown in next 3 months</p>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-secondary/30">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">10% drawdown probability</span>
                <span className="font-mono text-warning">38%</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-secondary/30">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">20% drawdown probability</span>
                <span className="font-mono text-loss">19%</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-secondary/30">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">30% drawdown probability</span>
                <span className="font-mono text-loss">{100 - survivalProbability}%</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-xs text-muted-foreground">
              Based on current portfolio composition, volatility regime, and historical drawdown patterns. 
              This is a statistical estimate — not a guarantee.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
