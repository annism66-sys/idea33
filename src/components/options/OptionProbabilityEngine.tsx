import { useState } from "react";
import { motion } from "framer-motion";
import { Gauge, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ProbabilityResult {
  label: string;
  probability: number;
  color: string;
}

const mockResults: ProbabilityResult[] = [
  { label: "Finish In-The-Money", probability: 38, color: "bg-gain" },
  { label: "Gain 20%+", probability: 22, color: "bg-primary" },
  { label: "Lose 50%+", probability: 45, color: "bg-loss" },
  { label: "Break Even", probability: 18, color: "bg-accent" },
];

const strikes = [
  { strike: 22000, type: "CE", iv: 14.2, oi: 1245000, premium: 285, delta: 0.45, theta: -8.2, gamma: 0.0012 },
  { strike: 22100, type: "CE", iv: 15.1, oi: 980000, premium: 210, delta: 0.38, theta: -7.5, gamma: 0.0010 },
  { strike: 22200, type: "CE", iv: 16.5, oi: 1560000, premium: 155, delta: 0.30, theta: -6.8, gamma: 0.0009 },
  { strike: 22300, type: "CE", iv: 18.2, oi: 2100000, premium: 108, delta: 0.22, theta: -5.9, gamma: 0.0007 },
  { strike: 21900, type: "PE", iv: 13.8, oi: 1100000, premium: 195, delta: -0.40, theta: -7.8, gamma: 0.0011 },
  { strike: 21800, type: "PE", iv: 15.0, oi: 870000, premium: 140, delta: -0.32, theta: -6.5, gamma: 0.0009 },
];

export function OptionProbabilityEngine() {
  const [selectedStrike, setSelectedStrike] = useState(22000);

  return (
    <div className="glass-card-elevated p-6 rounded-2xl">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/20 border border-primary/30">
          <Gauge className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">Option Probability Engine</h3>
          <p className="text-xs text-muted-foreground">NIFTY {selectedStrike} CE • 7 DTE • Spot: 22,050</p>
        </div>
      </div>

      {/* Probability Results */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {mockResults.map((r) => (
          <div key={r.label} className="p-3 rounded-xl bg-secondary/30 border border-border/30">
            <div className="text-xs text-muted-foreground mb-1">{r.label}</div>
            <div className="text-xl font-bold font-mono">{r.probability}%</div>
            <div className="h-1.5 rounded-full bg-secondary/50 mt-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${r.probability}%` }}
                transition={{ duration: 0.8 }}
                className={`h-full rounded-full ${r.color}`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Plain Language Insight */}
      <div className="p-4 rounded-xl bg-accent/5 border border-accent/20 mb-6">
        <p className="text-sm text-muted-foreground leading-relaxed">
          <strong className="text-accent">Insight:</strong> There is a <strong>62% probability</strong> this option may lose value if price remains range-bound. 
          Implied volatility is <strong>elevated vs 1-year average</strong> — options are relatively expensive. 
          Time decay will reduce value by approximately <strong>18%</strong> if the underlying stays flat.
        </p>
      </div>

      {/* Mini Option Chain */}
      <h4 className="text-sm font-semibold mb-3">Option Chain Summary</h4>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left py-2 px-2 font-medium text-muted-foreground">Strike</th>
              <th className="text-left py-2 px-2 font-medium text-muted-foreground">Type</th>
              <th className="text-right py-2 px-2 font-medium text-muted-foreground">IV%</th>
              <th className="text-right py-2 px-2 font-medium text-muted-foreground">OI</th>
              <th className="text-right py-2 px-2 font-medium text-muted-foreground">Premium</th>
              <th className="text-right py-2 px-2 font-medium text-muted-foreground">Delta</th>
              <th className="text-right py-2 px-2 font-medium text-muted-foreground">Theta</th>
            </tr>
          </thead>
          <tbody>
            {strikes.map((s, i) => (
              <tr
                key={i}
                className={`border-b border-border/20 cursor-pointer transition-colors ${
                  s.strike === selectedStrike ? "bg-primary/10" : "hover:bg-secondary/30"
                }`}
                onClick={() => setSelectedStrike(s.strike)}
              >
                <td className="py-2 px-2 font-mono">{s.strike}</td>
                <td className="py-2 px-2">
                  <span className={s.type === "CE" ? "text-gain" : "text-loss"}>{s.type}</span>
                </td>
                <td className="text-right py-2 px-2 font-mono">{s.iv}</td>
                <td className="text-right py-2 px-2 font-mono">{(s.oi / 1000).toFixed(0)}K</td>
                <td className="text-right py-2 px-2 font-mono">₹{s.premium}</td>
                <td className="text-right py-2 px-2 font-mono">{s.delta}</td>
                <td className="text-right py-2 px-2 font-mono text-loss">{s.theta}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
