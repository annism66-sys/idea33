import { useState } from "react";
import { motion } from "framer-motion";
import { Sliders, TrendingUp, TrendingDown, Minus, BarChart3 } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface Scenario {
  label: string;
  pnl: number;
  pnlPercent: number;
}

export function PLDistributionSimulator() {
  const [priceMove, setPriceMove] = useState([0]);
  const [ivChange, setIvChange] = useState([0]);
  const [daysForward, setDaysForward] = useState([1]);

  // Simulated P/L based on slider values
  const premium = 285;
  const delta = 0.45;
  const gamma = 0.0012;
  const theta = -8.2;
  const vega = 12.5;

  const simulatedPnl = (
    delta * priceMove[0] * 50 +
    0.5 * gamma * Math.pow(priceMove[0] * 50, 2) +
    theta * daysForward[0] +
    vega * ivChange[0]
  );
  const simulatedPnlPercent = (simulatedPnl / premium) * 100;

  const presetScenarios: Scenario[] = [
    { label: "+1% move", pnl: delta * 220 + 0.5 * gamma * 220 * 220, pnlPercent: 0 },
    { label: "-2% move", pnl: delta * -440 + 0.5 * gamma * 440 * 440, pnlPercent: 0 },
    { label: "IV drop 5%", pnl: vega * -5, pnlPercent: 0 },
    { label: "Flat (3d theta)", pnl: theta * 3, pnlPercent: 0 },
  ].map((s) => ({ ...s, pnlPercent: (s.pnl / premium) * 100 }));

  return (
    <div className="glass-card-elevated p-6 rounded-2xl">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-warning/20 border border-warning/30">
          <Sliders className="w-5 h-5 text-warning" />
        </div>
        <div>
          <h3 className="font-semibold">P/L Distribution Simulator</h3>
          <p className="text-xs text-muted-foreground">Interactive scenario analysis • NIFTY 22000 CE</p>
        </div>
      </div>

      {/* Interactive Sliders */}
      <div className="space-y-5 mb-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm">Price Move (%)</span>
            <span className={`font-mono text-sm font-medium ${priceMove[0] >= 0 ? "text-gain" : "text-loss"}`}>
              {priceMove[0] > 0 ? "+" : ""}{priceMove[0]}%
            </span>
          </div>
          <Slider min={-5} max={5} step={0.5} value={priceMove} onValueChange={setPriceMove} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm">IV Change (%)</span>
            <span className={`font-mono text-sm font-medium ${ivChange[0] >= 0 ? "text-gain" : "text-loss"}`}>
              {ivChange[0] > 0 ? "+" : ""}{ivChange[0]}%
            </span>
          </div>
          <Slider min={-10} max={10} step={1} value={ivChange} onValueChange={setIvChange} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm">Days Forward</span>
            <span className="font-mono text-sm font-medium">{daysForward[0]}d</span>
          </div>
          <Slider min={1} max={7} step={1} value={daysForward} onValueChange={setDaysForward} />
        </div>
      </div>

      {/* Simulated Result */}
      <div className={`p-4 rounded-xl border mb-6 ${simulatedPnl >= 0 ? "bg-gain/10 border-gain/20" : "bg-loss/10 border-loss/20"}`}>
        <div className="text-sm text-muted-foreground mb-1">Estimated P/L</div>
        <div className="flex items-baseline gap-3">
          <span className={`text-2xl font-bold font-mono ${simulatedPnl >= 0 ? "text-gain" : "text-loss"}`}>
            {simulatedPnl >= 0 ? "+" : ""}₹{simulatedPnl.toFixed(0)}
          </span>
          <span className={`text-sm font-mono ${simulatedPnlPercent >= 0 ? "text-gain" : "text-loss"}`}>
            ({simulatedPnlPercent >= 0 ? "+" : ""}{simulatedPnlPercent.toFixed(1)}%)
          </span>
        </div>
      </div>

      {/* Preset Scenarios */}
      <h4 className="text-sm font-semibold mb-3">Quick Scenarios</h4>
      <div className="grid grid-cols-2 gap-3">
        {presetScenarios.map((s) => (
          <div key={s.label} className="p-3 rounded-lg bg-secondary/30">
            <div className="text-xs text-muted-foreground mb-1">{s.label}</div>
            <div className={`font-mono text-sm font-medium ${s.pnl >= 0 ? "text-gain" : "text-loss"}`}>
              {s.pnl >= 0 ? "+" : ""}₹{s.pnl.toFixed(0)} ({s.pnlPercent >= 0 ? "+" : ""}{s.pnlPercent.toFixed(1)}%)
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
