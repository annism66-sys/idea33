import { motion } from "framer-motion";
import { Crosshair, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface DriftItem {
  label: string;
  target: number;
  current: number;
}

const driftData: DriftItem[] = [
  { label: "Banking", target: 25, current: 32 },
  { label: "IT", target: 20, current: 18 },
  { label: "Consumer", target: 15, current: 14 },
  { label: "Pharma", target: 15, current: 11 },
  { label: "Energy", target: 10, current: 15 },
  { label: "Others", target: 15, current: 10 },
];

export function DriftIndicator() {
  const maxDrift = Math.max(...driftData.map((d) => Math.abs(d.current - d.target)));

  return (
    <div className="glass-card-elevated p-6 rounded-2xl">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-accent/20 border border-accent/30">
          <Crosshair className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h3 className="font-semibold">Drift Indicator</h3>
          <p className="text-xs text-muted-foreground">Target vs. actual allocation</p>
        </div>
        <div className="ml-auto">
          <span className={`text-sm font-mono font-medium ${maxDrift > 5 ? "text-warning" : "text-gain"}`}>
            Max drift: {maxDrift}%
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {driftData.map((item) => {
          const drift = item.current - item.target;
          const absDrift = Math.abs(drift);
          return (
            <div key={item.label} className="flex items-center gap-3">
              <span className="text-sm w-20 truncate">{item.label}</span>
              <div className="flex-1 relative h-6">
                {/* Target line */}
                <div
                  className="absolute top-0 bottom-0 w-px bg-muted-foreground/40 z-10"
                  style={{ left: `${item.target}%` }}
                />
                {/* Bar */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.current}%` }}
                  transition={{ duration: 0.8 }}
                  className={`absolute top-1 bottom-1 rounded-md ${
                    absDrift > 5 ? "bg-warning/60" : "bg-primary/40"
                  }`}
                />
              </div>
              <div className="flex items-center gap-1 w-16 justify-end">
                {drift > 2 ? (
                  <ArrowUpRight className="w-3 h-3 text-warning" />
                ) : drift < -2 ? (
                  <ArrowDownRight className="w-3 h-3 text-accent" />
                ) : (
                  <Minus className="w-3 h-3 text-muted-foreground" />
                )}
                <span className={`font-mono text-xs ${absDrift > 5 ? "text-warning" : "text-muted-foreground"}`}>
                  {drift > 0 ? "+" : ""}{drift}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-xs text-muted-foreground flex items-center gap-2">
        <div className="w-px h-3 bg-muted-foreground/40" />
        <span>Vertical line = target weight</span>
      </div>
    </div>
  );
}
