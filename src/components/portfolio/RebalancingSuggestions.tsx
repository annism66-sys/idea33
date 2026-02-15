import { motion } from "framer-motion";
import { RefreshCw, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { Holding } from "@/hooks/usePortfolio";
import { useMemo } from "react";

interface RebalancingSuggestionsProps {
  holdings: Holding[];
  totalValue: number;
}

export function RebalancingSuggestions({ holdings, totalValue }: RebalancingSuggestionsProps) {
  const suggestions = useMemo(() => {
    if (holdings.length === 0) return [];

    const result: { type: "overweight" | "underweight" | "rebalance"; symbol: string; name: string; message: string; action: string }[] = [];

    // Check sector concentration
    const sectorMap = new Map<string, { value: number; holdings: Holding[] }>();
    holdings.forEach(h => {
      const sector = h.sector || "Other";
      const value = h.quantity * (h.current_price || h.average_price);
      const existing = sectorMap.get(sector) || { value: 0, holdings: [] };
      existing.value += value;
      existing.holdings.push(h);
      sectorMap.set(sector, existing);
    });

    // Overweight sectors (>30%)
    sectorMap.forEach((data, sector) => {
      const weight = totalValue > 0 ? (data.value / totalValue) * 100 : 0;
      if (weight > 30) {
        const topHolding = data.holdings.sort((a, b) => 
          (b.quantity * (b.current_price || b.average_price)) - (a.quantity * (a.current_price || a.average_price))
        )[0];
        result.push({
          type: "overweight",
          symbol: topHolding.stock_symbol,
          name: topHolding.stock_name,
          message: `${sector} sector is ${weight.toFixed(0)}% of portfolio — consider trimming`,
          action: `Reduce ${topHolding.stock_symbol} position`,
        });
      }
    });

    // Stocks with high P&L — book profits
    holdings.forEach(h => {
      const currentPrice = h.current_price || h.average_price;
      const pnlPercent = ((currentPrice - h.average_price) / h.average_price) * 100;
      if (pnlPercent > 25) {
        result.push({
          type: "rebalance",
          symbol: h.stock_symbol,
          name: h.stock_name,
          message: `Up ${pnlPercent.toFixed(1)}% — consider booking partial profits`,
          action: "Book partial profits",
        });
      }
      if (pnlPercent < -15) {
        result.push({
          type: "underweight",
          symbol: h.stock_symbol,
          name: h.stock_name,
          message: `Down ${Math.abs(pnlPercent).toFixed(1)}% — evaluate fundamentals before averaging`,
          action: "Review or average down",
        });
      }
    });

    return result.slice(0, 5);
  }, [holdings, totalValue]);

  if (suggestions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <RefreshCw className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Rebalancing Suggestions</h3>
        </div>
        <p className="text-sm text-muted-foreground">Your portfolio looks well-balanced. No rebalancing needed at this time.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <RefreshCw className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Rebalancing Suggestions</h3>
      </div>
      <div className="space-y-3">
        {suggestions.map((s, i) => (
          <div
            key={`${s.symbol}-${i}`}
            className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
          >
            <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
              s.type === "overweight" ? "bg-loss/10" : s.type === "underweight" ? "bg-warning/10" : "bg-gain/10"
            }`}>
              {s.type === "overweight" ? (
                <TrendingDown className="w-4 h-4 text-loss" />
              ) : s.type === "underweight" ? (
                <TrendingDown className="w-4 h-4 text-warning" />
              ) : (
                <TrendingUp className="w-4 h-4 text-gain" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-mono text-sm font-medium">{s.symbol}</span>
                <span className="text-xs text-muted-foreground truncate">{s.name}</span>
              </div>
              <p className="text-xs text-muted-foreground">{s.message}</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-primary font-medium flex-shrink-0">
              {s.action}
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
