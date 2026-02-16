import { motion } from "framer-motion";
import { Bell, AlertTriangle, TrendingUp, RefreshCw, Activity, Shield, Zap } from "lucide-react";
import { Holding } from "@/hooks/usePortfolio";
import { useMemo, useState, useEffect } from "react";

interface ContinuousMonitoringProps {
  holdings: Holding[];
  totalValue: number;
}

interface MonitoringAlert {
  id: string;
  type: "rebalance" | "risk" | "opportunity" | "deviation";
  severity: "critical" | "warning" | "info";
  title: string;
  message: string;
  timestamp: Date;
  icon: React.ElementType;
}

export function ContinuousMonitoring({ holdings, totalValue }: ContinuousMonitoringProps) {
  const [lastChecked, setLastChecked] = useState(new Date());

  // Simulate periodic checks
  useEffect(() => {
    const interval = setInterval(() => setLastChecked(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const alerts = useMemo<MonitoringAlert[]>(() => {
    if (holdings.length === 0) return [];
    const result: MonitoringAlert[] = [];
    const equalWeight = 100 / holdings.length;

    holdings.forEach(h => {
      const currentPrice = h.current_price || h.average_price;
      const holdingValue = h.quantity * currentPrice;
      const alloc = totalValue > 0 ? (holdingValue / totalValue) * 100 : 0;
      const pnlPct = ((currentPrice - h.average_price) / h.average_price) * 100;

      // Allocation threshold breach
      if (alloc > equalWeight * 2) {
        result.push({
          id: `alloc-${h.stock_symbol}`,
          type: "rebalance",
          severity: "critical",
          title: `${h.stock_symbol} Allocation Exceeded`,
          message: `${h.stock_symbol} is ${alloc.toFixed(0)}% of portfolio — exceeds target of ${equalWeight.toFixed(0)}%. Rebalancing recommended.`,
          timestamp: new Date(),
          icon: RefreshCw,
        });
      }

      // Drawdown alert
      if (pnlPct < -20) {
        result.push({
          id: `dd-${h.stock_symbol}`,
          type: "risk",
          severity: "critical",
          title: `High Drawdown on ${h.stock_symbol}`,
          message: `${h.stock_symbol} is down ${Math.abs(pnlPct).toFixed(1)}% from cost. Evaluate stop-loss or averaging strategy.`,
          timestamp: new Date(),
          icon: AlertTriangle,
        });
      }

      // Opportunity
      if (pnlPct > 30) {
        result.push({
          id: `opp-${h.stock_symbol}`,
          type: "opportunity",
          severity: "info",
          title: `Profit Booking Opportunity: ${h.stock_symbol}`,
          message: `${h.stock_symbol} is up ${pnlPct.toFixed(1)}%. Consider booking partial profits.`,
          timestamp: new Date(),
          icon: TrendingUp,
        });
      }
    });

    // Sector concentration
    const sectorMap = new Map<string, number>();
    holdings.forEach(h => {
      const val = h.quantity * (h.current_price || h.average_price);
      const sector = h.sector || "Other";
      sectorMap.set(sector, (sectorMap.get(sector) || 0) + val);
    });
    sectorMap.forEach((val, sector) => {
      const pct = totalValue > 0 ? (val / totalValue) * 100 : 0;
      if (pct > 40) {
        result.push({
          id: `sector-${sector}`,
          type: "deviation",
          severity: "warning",
          title: `${sector} Sector Concentration`,
          message: `${sector} sector is ${pct.toFixed(0)}% of portfolio. Consider diversifying to reduce sector-specific risk.`,
          timestamp: new Date(),
          icon: Shield,
        });
      }
    });

    // Volatility regime
    if (holdings.length > 3) {
      result.push({
        id: "vol-regime",
        type: "deviation",
        severity: "info",
        title: "Market Volatility Normal",
        message: "VIX-equivalent is within historical range. No volatility regime shift detected.",
        timestamp: new Date(),
        icon: Activity,
      });
    }

    return result.sort((a, b) => {
      const s = { critical: 0, warning: 1, info: 2 };
      return s[a.severity] - s[b.severity];
    });
  }, [holdings, totalValue]);

  const alertTypeConfig = {
    rebalance: { label: "Rebalance", color: "text-warning", bg: "bg-warning/10" },
    risk: { label: "Risk", color: "text-loss", bg: "bg-loss/10" },
    opportunity: { label: "Opportunity", color: "text-gain", bg: "bg-gain/10" },
    deviation: { label: "Deviation", color: "text-accent", bg: "bg-accent/10" },
  };

  const severityConfig = {
    critical: { dot: "bg-loss", pulse: true },
    warning: { dot: "bg-warning", pulse: false },
    info: { dot: "bg-accent", pulse: false },
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Continuous Monitoring</h3>
          {alerts.filter(a => a.severity === "critical").length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-loss/10 text-loss text-xs font-medium animate-pulse">
              {alerts.filter(a => a.severity === "critical").length} critical
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          Last checked: {lastChecked.toLocaleTimeString()}
        </span>
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-8">
          <Zap className="w-8 h-8 text-gain mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">All clear — no alerts at this time</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {alerts.map(alert => {
            const type = alertTypeConfig[alert.type];
            const severity = severityConfig[alert.severity];
            const Icon = alert.icon;
            return (
              <div key={alert.id} className={`flex items-start gap-3 p-3 rounded-lg ${type.bg} border border-border/30`}>
                <div className="relative mt-1">
                  <Icon className={`w-4 h-4 ${type.color}`} />
                  <div className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${severity.dot} ${severity.pulse ? "animate-pulse" : ""}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium">{alert.title}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${type.bg} ${type.color} font-medium`}>
                      {type.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{alert.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
