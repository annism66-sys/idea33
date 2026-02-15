import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Shield, AlertTriangle, Target, ArrowRight, ArrowLeft,
  CheckCircle2, XCircle, TrendingDown, Zap, Play
} from "lucide-react";
import { useStrategyStore } from "@/stores/useStrategyStore";
import { toast } from "@/hooks/use-toast";

export default function RiskBudget() {
  const navigate = useNavigate();
  const { activeStrategy, riskBudget, setRiskBudget, setFlowStep } = useStrategyStore();

  const [maxDrawdown, setMaxDrawdown] = useState(riskBudget.maxDrawdown);
  const [maxSingleStock, setMaxSingleStock] = useState(riskBudget.maxSingleStockAllocation);
  const [sectorLimit, setSectorLimit] = useState(riskBudget.sectorExposureLimit);
  const [volTolerance, setVolTolerance] = useState(riskBudget.volatilityTolerance);
  const [targetSharpe, setTargetSharpe] = useState<string>(riskBudget.targetSharpe?.toString() || "");

  const violations = useMemo(() => {
    const v: string[] = [];
    if (!activeStrategy) return v;

    activeStrategy.stocks.forEach((s) => {
      if (s.weight > maxSingleStock) {
        v.push(`${s.symbol} allocation (${s.weight}%) exceeds max single stock limit (${maxSingleStock}%)`);
      }
    });

    // Check if any stock group could represent a sector (simplified)
    if (activeStrategy.stocks.length > 0) {
      const maxWeight = Math.max(...activeStrategy.stocks.map((s) => s.weight));
      if (maxWeight > sectorLimit) {
        v.push(`Highest stock weight (${maxWeight}%) is close to sector exposure limit (${sectorLimit}%)`);
      }
    }

    if (maxDrawdown < 5) {
      v.push("Max drawdown tolerance is very tight — strategy may trigger frequent exits");
    }

    return v;
  }, [activeStrategy, maxSingleStock, sectorLimit, maxDrawdown]);

  const optimizedAllocation = useMemo(() => {
    if (!activeStrategy) return [];
    return activeStrategy.stocks.map((s) => ({
      ...s,
      optimizedWeight: Math.min(s.weight, maxSingleStock),
      violated: s.weight > maxSingleStock,
    }));
  }, [activeStrategy, maxSingleStock]);

  const handleValidateAndProceed = () => {
    setRiskBudget({
      maxDrawdown,
      maxSingleStockAllocation: maxSingleStock,
      sectorExposureLimit: sectorLimit,
      volatilityTolerance: volTolerance,
      targetSharpe: targetSharpe ? Number(targetSharpe) : null,
      validated: true,
      violations,
    });
    setFlowStep("backtest");
    toast({ title: "Risk validated", description: violations.length > 0 ? `${violations.length} warnings noted` : "All checks passed" });
    navigate("/backtest");
  };

  if (!activeStrategy) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Strategy Selected</h2>
          <p className="text-muted-foreground mb-6">Build a strategy first from the Ideas or Strategy section</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate("/ideas")}>Go to Ideas</Button>
            <Button variant="hero" onClick={() => navigate("/strategy")}>Go to Strategy</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-warning/10 border border-warning/20 mb-4">
            <Shield className="w-4 h-4 text-warning" />
            <span className="text-sm font-medium text-warning">Risk Budget Engine</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Risk Validation</h1>
          <p className="text-muted-foreground">
            Define your risk limits for "{activeStrategy.name}" before backtesting
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Risk Parameters */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <div className="glass-card-elevated p-6 rounded-2xl space-y-6">
              <h3 className="font-semibold flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Risk Parameters
              </h3>

              <div>
                <Label className="text-sm">Maximum Portfolio Drawdown (%)</Label>
                <div className="flex items-center gap-3 mt-1">
                  <input type="range" min={5} max={50} value={maxDrawdown} onChange={(e) => setMaxDrawdown(Number(e.target.value))} className="flex-1 accent-primary" />
                  <span className="font-mono text-sm w-12 text-right">{maxDrawdown}%</span>
                </div>
              </div>

              <div>
                <Label className="text-sm">Maximum Single Stock Allocation (%)</Label>
                <div className="flex items-center gap-3 mt-1">
                  <input type="range" min={5} max={50} value={maxSingleStock} onChange={(e) => setMaxSingleStock(Number(e.target.value))} className="flex-1 accent-primary" />
                  <span className="font-mono text-sm w-12 text-right">{maxSingleStock}%</span>
                </div>
              </div>

              <div>
                <Label className="text-sm">Sector Exposure Limit (%)</Label>
                <div className="flex items-center gap-3 mt-1">
                  <input type="range" min={10} max={60} value={sectorLimit} onChange={(e) => setSectorLimit(Number(e.target.value))} className="flex-1 accent-primary" />
                  <span className="font-mono text-sm w-12 text-right">{sectorLimit}%</span>
                </div>
              </div>

              <div>
                <Label className="text-sm">Volatility Tolerance (%)</Label>
                <div className="flex items-center gap-3 mt-1">
                  <input type="range" min={5} max={40} value={volTolerance} onChange={(e) => setVolTolerance(Number(e.target.value))} className="flex-1 accent-primary" />
                  <span className="font-mono text-sm w-12 text-right">{volTolerance}%</span>
                </div>
              </div>

              <div>
                <Label className="text-sm">Target Sharpe Ratio (optional)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={targetSharpe}
                  onChange={(e) => setTargetSharpe(e.target.value)}
                  placeholder="e.g., 1.5"
                  className="mt-1 font-mono"
                />
              </div>
            </div>
          </motion.div>

          {/* Validation Results */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="space-y-6">
            {/* Allocation Review */}
            <div className="glass-card-elevated p-6 rounded-2xl">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Allocation Review
              </h3>
              <div className="space-y-2">
                {optimizedAllocation.map((s) => (
                  <div key={s.symbol} className={`flex items-center justify-between p-3 rounded-lg ${s.violated ? "bg-loss/10 border border-loss/20" : "bg-secondary/30"}`}>
                    <div className="flex items-center gap-2">
                      {s.violated ? <XCircle className="w-4 h-4 text-loss" /> : <CheckCircle2 className="w-4 h-4 text-gain" />}
                      <span className="font-mono text-sm">{s.symbol}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`font-mono text-sm ${s.violated ? "text-loss line-through" : ""}`}>{s.weight}%</span>
                      {s.violated && (
                        <>
                          <ArrowRight className="w-3 h-3 text-muted-foreground" />
                          <span className="font-mono text-sm text-gain">{s.optimizedWeight}%</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Violations */}
            <div className="glass-card-elevated p-6 rounded-2xl">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                {violations.length > 0 ? <AlertTriangle className="w-5 h-5 text-warning" /> : <CheckCircle2 className="w-5 h-5 text-gain" />}
                {violations.length > 0 ? `${violations.length} Warning${violations.length > 1 ? "s" : ""}` : "All Checks Passed"}
              </h3>
              {violations.length === 0 ? (
                <p className="text-sm text-muted-foreground">Your strategy passes all risk validation checks.</p>
              ) : (
                <div className="space-y-2">
                  {violations.map((v, i) => (
                    <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20">
                      <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Risk Summary */}
            <div className="glass-card p-6 rounded-2xl">
              <h3 className="font-semibold mb-4">Risk Summary</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-secondary/30">
                  <div className="text-xs text-muted-foreground">Max Drawdown</div>
                  <div className="font-mono font-medium">{maxDrawdown}%</div>
                </div>
                <div className="p-3 rounded-lg bg-secondary/30">
                  <div className="text-xs text-muted-foreground">Max Stock Alloc</div>
                  <div className="font-mono font-medium">{maxSingleStock}%</div>
                </div>
                <div className="p-3 rounded-lg bg-secondary/30">
                  <div className="text-xs text-muted-foreground">Sector Limit</div>
                  <div className="font-mono font-medium">{sectorLimit}%</div>
                </div>
                <div className="p-3 rounded-lg bg-secondary/30">
                  <div className="text-xs text-muted-foreground">Vol Tolerance</div>
                  <div className="font-mono font-medium">{volTolerance}%</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => navigate("/strategy")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Strategy
              </Button>
              <Button variant="hero" className="flex-1" onClick={handleValidateAndProceed}>
                <Play className="w-4 h-4 mr-2" />
                Run Backtest
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
