import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Shield, CheckCircle2, XCircle, AlertTriangle, ArrowLeft,
  Zap, TrendingUp, DollarSign, Scale, Droplets, Receipt
} from "lucide-react";
import { useStrategyStore } from "@/stores/useStrategyStore";

interface FeasibilityItem {
  label: string;
  value: string;
  status: "pass" | "warn" | "fail";
  detail: string;
  icon: React.ElementType;
}

export default function ExecutionFeasibility() {
  const navigate = useNavigate();
  const { activeStrategy } = useStrategyStore();

  const feasibility = useMemo<FeasibilityItem[]>(() => {
    if (!activeStrategy) return [];
    const capital = activeStrategy.capitalAllocation;
    const stockCount = activeStrategy.stocks.length;
    const avgPerStock = capital / stockCount;

    return [
      {
        label: "Liquidity Assessment",
        value: stockCount <= 10 ? "High Liquidity" : "Moderate",
        status: stockCount <= 10 ? "pass" : "warn",
        detail: `${stockCount} stocks in universe — all large/mid-cap with adequate daily volumes`,
        icon: Droplets,
      },
      {
        label: "Impact Cost",
        value: avgPerStock > 500000 ? "0.08-0.12%" : "0.03-0.05%",
        status: "pass",
        detail: `Estimated market impact for ₹${(avgPerStock / 100000).toFixed(1)}L per stock order`,
        icon: TrendingUp,
      },
      {
        label: "Minimum Capital Required",
        value: `₹${(stockCount * 25000).toLocaleString("en-IN")}`,
        status: capital >= stockCount * 25000 ? "pass" : "fail",
        detail: `Minimum ₹25,000 per stock × ${stockCount} stocks. You have ₹${capital.toLocaleString("en-IN")}`,
        icon: DollarSign,
      },
      {
        label: "Tax Implications",
        value: "STCG @ 15%",
        status: "warn",
        detail: "Holding period < 1 year = Short-Term Capital Gains. Consider tax-loss harvesting.",
        icon: Receipt,
      },
      {
        label: "Position Sizing",
        value: `₹${Math.round(avgPerStock).toLocaleString("en-IN")}/stock`,
        status: avgPerStock >= 10000 ? "pass" : "fail",
        detail: `Equal allocation of ₹${Math.round(avgPerStock).toLocaleString("en-IN")} per position`,
        icon: Scale,
      },
      {
        label: "Margin Requirement",
        value: "Not Required",
        status: "pass",
        detail: "Cash delivery trades — no margin needed for equity holdings",
        icon: Shield,
      },
    ];
  }, [activeStrategy]);

  const executionScore = useMemo(() => {
    const scores = { pass: 1, warn: 0.6, fail: 0 };
    if (feasibility.length === 0) return 0;
    const total = feasibility.reduce((sum, f) => sum + scores[f.status], 0);
    return Math.round((total / feasibility.length) * 100);
  }, [feasibility]);

  const totalCost = useMemo(() => {
    if (!activeStrategy) return 0;
    const brokerage = activeStrategy.stocks.length * 20; // ₹20 per trade
    const stt = activeStrategy.capitalAllocation * 0.001;
    return Math.round(brokerage + stt);
  }, [activeStrategy]);

  const statusIcon = (status: string) => {
    if (status === "pass") return <CheckCircle2 className="w-5 h-5 text-gain" />;
    if (status === "warn") return <AlertTriangle className="w-5 h-5 text-warning" />;
    return <XCircle className="w-5 h-5 text-loss" />;
  };

  if (!activeStrategy) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Strategy to Evaluate</h2>
          <p className="text-muted-foreground mb-6">Complete the backtest flow first</p>
          <Button variant="hero" onClick={() => navigate("/backtest")}>Go to Backtest</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-4">
            <Zap className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent">Execution Feasibility Engine</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Execution Feasibility</h1>
          <p className="text-muted-foreground">Pre-merge evaluation for "{activeStrategy.name}"</p>
        </motion.div>

        {/* Execution Score */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="glass-card p-6 text-center">
            <div className="text-sm text-muted-foreground mb-2">Execution Score</div>
            <div className={`text-4xl font-bold font-mono ${executionScore >= 80 ? "stat-gain" : executionScore >= 50 ? "text-warning" : "stat-loss"}`}>
              {executionScore}/100
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {executionScore >= 80 ? "Ready to execute" : executionScore >= 50 ? "Proceed with caution" : "Review required"}
            </div>
          </div>
          <div className="glass-card p-6 text-center">
            <div className="text-sm text-muted-foreground mb-2">Est. Transaction Cost</div>
            <div className="text-4xl font-bold font-mono">₹{totalCost.toLocaleString("en-IN")}</div>
            <div className="text-xs text-muted-foreground mt-1">Brokerage + STT + charges</div>
          </div>
          <div className="glass-card p-6 text-center">
            <div className="text-sm text-muted-foreground mb-2">Capital Needed</div>
            <div className="text-4xl font-bold font-mono">₹{activeStrategy.capitalAllocation.toLocaleString("en-IN")}</div>
            <div className="text-xs text-muted-foreground mt-1">{activeStrategy.stocks.length} positions</div>
          </div>
        </motion.div>

        {/* Detailed Checks */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 mb-8">
          <h3 className="font-semibold mb-4">Detailed Feasibility Checks</h3>
          <div className="space-y-3">
            {feasibility.map((item, i) => (
              <div key={i} className={`flex items-start gap-4 p-4 rounded-xl border ${
                item.status === "pass" ? "bg-gain/5 border-gain/20" :
                item.status === "warn" ? "bg-warning/5 border-warning/20" :
                "bg-loss/5 border-loss/20"
              }`}>
                <div className="mt-0.5">{statusIcon(item.status)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <item.icon className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{item.label}</span>
                    <span className="ml-auto font-mono text-sm">{item.value}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Warning Alerts */}
        {feasibility.some(f => f.status !== "pass") && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6 mb-8 border-warning/30">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <h3 className="font-semibold">Alerts</h3>
            </div>
            <div className="space-y-2">
              {feasibility.filter(f => f.status !== "pass").map((f, i) => (
                <div key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-warning">•</span>
                  <span>{f.label}: {f.detail}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => navigate("/backtest")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Backtest
          </Button>
          <Button
            variant="hero"
            className="flex-1"
            onClick={() => {
              navigate("/portfolio");
              // In a real app, this would trigger the actual merge
              import("@/hooks/use-toast").then(({ toast }) => {
                toast({ title: "Strategy Merged", description: `"${activeStrategy.name}" has been merged into your portfolio` });
              });
            }}
            disabled={executionScore < 50}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Confirm & Merge to Portfolio
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
