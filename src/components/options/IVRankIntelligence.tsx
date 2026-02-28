import { motion } from "framer-motion";
import { Activity, Clock, AlertTriangle } from "lucide-react";

export function IVRankIntelligence() {
  const currentIV = 16.8;
  const ivRank = 72;
  const ivPercentile = 68;
  const historicalAvg = 14.2;
  const historicalHigh = 28.5;
  const historicalLow = 9.4;

  const getIVColor = (rank: number) => {
    if (rank >= 60) return { text: "text-loss", bg: "bg-loss", label: "Elevated" };
    if (rank >= 30) return { text: "text-warning", bg: "bg-warning", label: "Moderate" };
    return { text: "text-gain", bg: "bg-gain", label: "Low" };
  };

  const ivStatus = getIVColor(ivRank);

  return (
    <div className="glass-card-elevated p-6 rounded-2xl">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-accent/20 border border-accent/30">
          <Activity className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h3 className="font-semibold">IV Rank Intelligence</h3>
          <p className="text-xs text-muted-foreground">NIFTY implied volatility analysis</p>
        </div>
        <span className={`ml-auto text-xs font-semibold uppercase px-2 py-1 rounded-full ${ivStatus.text} ${ivStatus.bg}/20 border ${ivStatus.bg}/30`}>
          {ivStatus.label}
        </span>
      </div>

      {/* IV Gauge */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">IV Rank</span>
          <span className={`text-xl font-bold font-mono ${ivStatus.text}`}>{ivRank}%</span>
        </div>
        <div className="h-3 rounded-full bg-secondary/50 overflow-hidden relative">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${ivRank}%` }}
            transition={{ duration: 1 }}
            className={`h-full rounded-full ${ivStatus.bg}`}
          />
        </div>
        <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
          <span>0 (Options cheap)</span>
          <span>100 (Options expensive)</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="p-3 rounded-lg bg-secondary/30">
          <div className="text-xs text-muted-foreground">Current IV</div>
          <div className="font-mono font-medium">{currentIV}%</div>
        </div>
        <div className="p-3 rounded-lg bg-secondary/30">
          <div className="text-xs text-muted-foreground">IV Percentile</div>
          <div className="font-mono font-medium">{ivPercentile}%</div>
        </div>
        <div className="p-3 rounded-lg bg-secondary/30">
          <div className="text-xs text-muted-foreground">1Y High</div>
          <div className="font-mono font-medium">{historicalHigh}%</div>
        </div>
        <div className="p-3 rounded-lg bg-secondary/30">
          <div className="text-xs text-muted-foreground">1Y Low</div>
          <div className="font-mono font-medium">{historicalLow}%</div>
        </div>
      </div>

      {/* Insights */}
      <div className="space-y-2">
        <div className="p-3 rounded-lg bg-warning/5 border border-warning/20">
          <p className="text-xs text-muted-foreground">
            <strong className="text-warning">⚡</strong> Volatility is in the <strong>top 28%</strong> of the past year. Options are relatively expensive compared to historical levels.
          </p>
        </div>
        <div className="p-3 rounded-lg bg-accent/5 border border-accent/20">
          <p className="text-xs text-muted-foreground">
            <strong className="text-accent">📊</strong> Current IV of {currentIV}% is <strong>{((currentIV / historicalAvg - 1) * 100).toFixed(0)}% above</strong> the 1-year average of {historicalAvg}%.
          </p>
        </div>
      </div>
    </div>
  );
}
