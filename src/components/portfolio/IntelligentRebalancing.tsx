import { motion } from "framer-motion";
import { RefreshCw, TrendingUp, TrendingDown, ArrowRight, AlertTriangle, Minus, Plus } from "lucide-react";
import { Holding } from "@/hooks/usePortfolio";
import { useMemo } from "react";

interface IntelligentRebalancingProps {
  holdings: Holding[];
  totalValue: number;
}

interface RebalanceAction {
  symbol: string;
  name: string;
  action: "reduce" | "increase" | "average" | "book_profit" | "hold";
  quantityChange: number;
  targetAllocation: number;
  currentAllocation: number;
  reasoning: string;
  priority: "high" | "medium" | "low";
}

export function IntelligentRebalancing({ holdings, totalValue }: IntelligentRebalancingProps) {
  const actions = useMemo(() => {
    if (holdings.length === 0) return [];
    const result: RebalanceAction[] = [];
    const equalWeight = 100 / holdings.length;

    holdings.forEach(h => {
      const currentPrice = h.current_price || h.average_price;
      const holdingValue = h.quantity * currentPrice;
      const currentAlloc = totalValue > 0 ? (holdingValue / totalValue) * 100 : 0;
      const pnlPct = ((currentPrice - h.average_price) / h.average_price) * 100;

      if (currentAlloc > equalWeight * 1.5 && pnlPct > 20) {
        const reduceQty = Math.ceil(h.quantity * ((currentAlloc - equalWeight) / currentAlloc));
        result.push({
          symbol: h.stock_symbol, name: h.stock_name,
          action: "book_profit", quantityChange: -reduceQty,
          targetAllocation: Math.round(equalWeight * 10) / 10,
          currentAllocation: Math.round(currentAlloc * 10) / 10,
          reasoning: `Up ${pnlPct.toFixed(0)}% with ${currentAlloc.toFixed(0)}% allocation. Book partial profits to reduce concentration risk.`,
          priority: "high",
        });
      } else if (currentAlloc > equalWeight * 1.3) {
        const reduceQty = Math.ceil(h.quantity * 0.15);
        result.push({
          symbol: h.stock_symbol, name: h.stock_name,
          action: "reduce", quantityChange: -reduceQty,
          targetAllocation: Math.round(equalWeight * 10) / 10,
          currentAllocation: Math.round(currentAlloc * 10) / 10,
          reasoning: `Overweight at ${currentAlloc.toFixed(0)}%. Reduce to target ${equalWeight.toFixed(0)}% for balanced exposure.`,
          priority: "medium",
        });
      } else if (pnlPct < -15 && currentAlloc < equalWeight * 0.8) {
        const avgPrice = Math.round(currentPrice * 0.95);
        result.push({
          symbol: h.stock_symbol, name: h.stock_name,
          action: "average", quantityChange: Math.ceil(h.quantity * 0.2),
          targetAllocation: Math.round(equalWeight * 10) / 10,
          currentAllocation: Math.round(currentAlloc * 10) / 10,
          reasoning: `Down ${Math.abs(pnlPct).toFixed(0)}%. Average down at ₹${avgPrice} if fundamentals intact. Underweight at ${currentAlloc.toFixed(0)}%.`,
          priority: "medium",
        });
      } else if (currentAlloc < equalWeight * 0.7) {
        const addQty = Math.ceil(h.quantity * 0.25);
        result.push({
          symbol: h.stock_symbol, name: h.stock_name,
          action: "increase", quantityChange: addQty,
          targetAllocation: Math.round(equalWeight * 10) / 10,
          currentAllocation: Math.round(currentAlloc * 10) / 10,
          reasoning: `Underweight at ${currentAlloc.toFixed(0)}% vs target ${equalWeight.toFixed(0)}%. Increase position for balanced allocation.`,
          priority: "low",
        });
      }
    });

    return result.sort((a, b) => {
      const p = { high: 0, medium: 1, low: 2 };
      return p[a.priority] - p[b.priority];
    }).slice(0, 8);
  }, [holdings, totalValue]);

  const actionConfig = {
    reduce: { icon: Minus, color: "text-loss", bg: "bg-loss/10", label: "Reduce" },
    increase: { icon: Plus, color: "text-gain", bg: "bg-gain/10", label: "Increase" },
    average: { icon: TrendingDown, color: "text-accent", bg: "bg-accent/10", label: "Average Down" },
    book_profit: { icon: TrendingUp, color: "text-warning", bg: "bg-warning/10", label: "Book Profit" },
    hold: { icon: Minus, color: "text-muted-foreground", bg: "bg-secondary/30", label: "Hold" },
  };

  if (actions.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <RefreshCw className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Intelligent Rebalancing</h3>
        </div>
        <p className="text-sm text-muted-foreground">Portfolio is well-balanced. No rebalancing actions needed.</p>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <RefreshCw className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Intelligent Rebalancing</h3>
        <span className="ml-auto text-xs px-2 py-1 rounded-full bg-warning/10 text-warning font-medium">
          {actions.length} actions
        </span>
      </div>
      <div className="space-y-3">
        {actions.map((a, i) => {
          const config = actionConfig[a.action];
          const Icon = config.icon;
          return (
            <div key={`${a.symbol}-${i}`} className="p-4 rounded-xl bg-secondary/20 border border-border/50 hover:bg-secondary/30 transition-colors">
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 w-9 h-9 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm font-medium">{a.symbol}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${config.bg} ${config.color} font-medium`}>
                      {config.label}
                    </span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      a.priority === "high" ? "bg-loss/10 text-loss" :
                      a.priority === "medium" ? "bg-warning/10 text-warning" :
                      "bg-secondary text-muted-foreground"
                    }`}>
                      {a.priority}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{a.reasoning}</p>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="font-mono">
                      Qty: <span className={a.quantityChange > 0 ? "text-gain" : "text-loss"}>
                        {a.quantityChange > 0 ? "+" : ""}{a.quantityChange}
                      </span>
                    </span>
                    <span className="text-muted-foreground">
                      {a.currentAllocation}% <ArrowRight className="w-3 h-3 inline" /> {a.targetAllocation}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
