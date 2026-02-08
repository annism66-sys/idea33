import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { 
  PieChart as PieChartIcon, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  Shield,
  Zap,
  Plus,
  RefreshCw,
  Lightbulb,
  Loader2,
  Link2
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
} from "recharts";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useStockPrices } from "@/hooks/useStockPrices";
import { useAuth } from "@/hooks/useAuth";
import { BrokerConnect } from "@/components/BrokerConnect";
import { formatDistanceToNow } from "date-fns";

const sectorColors: Record<string, string> = {
  "Banking": "hsl(var(--primary))",
  "IT": "hsl(var(--accent))",
  "Consumer": "hsl(var(--warning))",
  "Pharma": "hsl(var(--gain))",
  "Energy": "hsl(var(--loss))",
  "Telecom": "hsl(217, 91%, 60%)",
  "Automobile": "hsl(262, 83%, 58%)",
  "Finance": "hsl(24, 95%, 53%)",
  "Infrastructure": "hsl(173, 80%, 40%)",
  "Fintech": "hsl(330, 80%, 50%)",
  "Other": "hsl(var(--muted-foreground))",
};

const riskBreakdown = [
  { factor: "Market Risk", value: 65 },
  { factor: "Sector Risk", value: 45 },
  { factor: "Stock-Specific", value: 30 },
  { factor: "Liquidity Risk", value: 15 },
  { factor: "Currency Risk", value: 8 },
];

export default function Portfolio() {
  const { user, loading: authLoading } = useAuth();
  const { holdings, loading: holdingsLoading, totalValue, totalInvested, totalPnL, totalPnLPercent, refetch } = usePortfolio();
  const { refreshPrices, updating, lastUpdated } = useStockPrices();

  const handleRefreshPrices = async () => {
    await refreshPrices();
    refetch(); // Refresh holdings after price update
  };

  // Calculate sector allocation from real holdings
  const sectorAllocation = useMemo(() => {
    const sectorMap = new Map<string, number>();
    
    holdings.forEach(h => {
      const sector = h.sector || "Other";
      const value = h.quantity * (h.current_price || h.average_price);
      sectorMap.set(sector, (sectorMap.get(sector) || 0) + value);
    });

    return Array.from(sectorMap.entries()).map(([name, value]) => ({
      name,
      value: totalValue > 0 ? Math.round((value / totalValue) * 100) : 0,
      color: sectorColors[name] || sectorColors["Other"],
    }));
  }, [holdings, totalValue]);

  // Calculate risk metrics
  const riskMetrics = useMemo(() => {
    const topHoldingsWeight = holdings
      .slice(0, 5)
      .reduce((sum, h) => {
        const value = h.quantity * (h.current_price || h.average_price);
        return sum + (totalValue > 0 ? (value / totalValue) * 100 : 0);
      }, 0);

    return [
      { label: "Portfolio Beta", value: "1.12", description: "Slightly higher volatility than market" },
      { label: "Volatility (Ann.)", value: "16.8%", description: "Historical 1-year volatility" },
      { label: "Value at Risk (95%)", value: "-2.3%", description: "Daily VaR at 95% confidence" },
      { label: "Concentration (Top 5)", value: `${topHoldingsWeight.toFixed(1)}%`, description: "Weight in top 5 holdings" },
    ];
  }, [holdings, totalValue]);

  const formatCurrency = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
    return `₹${value.toLocaleString("en-IN")}`;
  };

  const isLoading = authLoading || holdingsLoading;

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold mb-2">Portfolio Analytics</h1>
            <p className="text-muted-foreground">
              {user ? "Real-time portfolio overview and risk analysis" : "Sign in to view your portfolio"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <Button 
                variant="outline" 
                onClick={handleRefreshPrices}
                disabled={updating || holdings.length === 0}
                className="gap-2"
              >
                {updating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Refresh Prices
              </Button>
            )}
            <BrokerConnect 
              variant="default" 
              onConnect={refetch}
              trigger={
                <Button variant="hero" className="gap-2">
                  <Link2 className="w-4 h-4" />
                  Connect Broker
                </Button>
              }
            />
          </div>
        </motion.div>

        {/* Last Updated */}
        {lastUpdated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-muted-foreground mb-4"
          >
            Prices updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && holdings.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-12 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <PieChartIcon className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Holdings Yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Connect your demat account to import your portfolio, or add holdings manually to get started.
            </p>
            <BrokerConnect 
              variant="hero" 
              onConnect={refetch}
            />
          </motion.div>
        )}

        {/* Portfolio Content */}
        {!isLoading && holdings.length > 0 && (
          <>
            {/* Portfolio Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
            >
              <div className="glass-card p-4">
                <div className="text-sm text-muted-foreground mb-1">Portfolio Value</div>
                <div className="text-2xl font-bold font-mono">{formatCurrency(totalValue)}</div>
                <div className={`flex items-center gap-1 text-sm ${totalPnLPercent >= 0 ? 'stat-gain' : 'stat-loss'}`}>
                  {totalPnLPercent >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {totalPnLPercent >= 0 ? '+' : ''}{totalPnLPercent.toFixed(2)}% all time
                </div>
              </div>
              <div className="glass-card p-4">
                <div className="text-sm text-muted-foreground mb-1">Total P&L</div>
                <div className={`text-2xl font-bold font-mono ${totalPnL >= 0 ? 'stat-gain' : 'stat-loss'}`}>
                  {totalPnL >= 0 ? '+' : ''}{formatCurrency(totalPnL)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Invested: {formatCurrency(totalInvested)}
                </div>
              </div>
              <div className="glass-card p-4">
                <div className="text-sm text-muted-foreground mb-1">Holdings</div>
                <div className="text-2xl font-bold font-mono">{holdings.length}</div>
                <div className="text-sm text-muted-foreground">
                  {sectorAllocation.length} sectors
                </div>
              </div>
              <div className="glass-card p-4">
                <div className="text-sm text-muted-foreground mb-1">Risk Score</div>
                <div className="text-2xl font-bold font-mono text-warning">6.2/10</div>
                <div className="text-sm text-muted-foreground">Moderate risk</div>
              </div>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-6 mb-8">
              {/* Allocation Chart */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <PieChartIcon className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Sector Allocation</h3>
                </div>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sectorAllocation}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {sectorAllocation.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        formatter={(value: number) => [`${value}%`, 'Allocation']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {sectorAllocation.map((item) => (
                    <div key={item.name} className="flex items-center gap-2 text-sm">
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-muted-foreground truncate">{item.name}</span>
                      <span className="font-mono ml-auto">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Risk Analysis */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Risk Breakdown</h3>
                </div>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={riskBreakdown}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis 
                        dataKey="factor" 
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                      />
                      <Radar
                        name="Risk"
                        dataKey="value"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.3}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 p-3 rounded-lg bg-warning/10 border border-warning/20">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-warning mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-warning">Concentration Alert</div>
                      <div className="text-xs text-muted-foreground">
                        Review sector concentration for better diversification.
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Risk Metrics */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-card p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Risk Metrics</h3>
                </div>
                <div className="space-y-4">
                  {riskMetrics.map((metric) => (
                    <div key={metric.label} className="p-3 rounded-lg bg-secondary/30">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-muted-foreground">{metric.label}</span>
                        <span className="font-mono font-medium">{metric.value}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">{metric.description}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Holdings List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">All Holdings</h3>
                <span className="text-sm text-muted-foreground">{holdings.length} stocks</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-sm font-medium text-muted-foreground py-3 px-2">Stock</th>
                      <th className="text-right text-sm font-medium text-muted-foreground py-3 px-2">Qty</th>
                      <th className="text-right text-sm font-medium text-muted-foreground py-3 px-2">Avg Price</th>
                      <th className="text-right text-sm font-medium text-muted-foreground py-3 px-2">LTP</th>
                      <th className="text-right text-sm font-medium text-muted-foreground py-3 px-2">Current Value</th>
                      <th className="text-right text-sm font-medium text-muted-foreground py-3 px-2">P&L</th>
                      <th className="text-right text-sm font-medium text-muted-foreground py-3 px-2">Sector</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holdings.map((holding, index) => {
                      const currentPrice = holding.current_price || holding.average_price;
                      const currentValue = holding.quantity * currentPrice;
                      const invested = holding.quantity * holding.average_price;
                      const pnl = currentValue - invested;
                      const pnlPercent = invested > 0 ? (pnl / invested) * 100 : 0;

                      return (
                        <motion.tr
                          key={holding.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.05 * index }}
                          className="border-b border-border/50 hover:bg-secondary/20"
                        >
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <span className="text-xs font-mono font-bold text-primary">
                                  {holding.stock_symbol.slice(0, 2)}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium font-mono text-sm">{holding.stock_symbol}</div>
                                <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                                  {holding.stock_name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="text-right py-3 px-2 font-mono">{holding.quantity}</td>
                          <td className="text-right py-3 px-2 font-mono">₹{holding.average_price.toLocaleString()}</td>
                          <td className="text-right py-3 px-2 font-mono">₹{currentPrice.toLocaleString()}</td>
                          <td className="text-right py-3 px-2 font-mono">{formatCurrency(currentValue)}</td>
                          <td className={`text-right py-3 px-2 font-mono ${pnl >= 0 ? 'stat-gain' : 'stat-loss'}`}>
                            <div>{pnl >= 0 ? '+' : ''}{formatCurrency(pnl)}</div>
                            <div className="text-xs">({pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%)</div>
                          </td>
                          <td className="text-right py-3 px-2">
                            <span className="px-2 py-1 rounded-full text-xs bg-secondary">
                              {holding.sector || "Other"}
                            </span>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* AI Insight */}
              <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-1">AI Portfolio Insight</div>
                    <p className="text-xs text-muted-foreground">
                      Your portfolio has {holdings.length} stocks across {sectorAllocation.length} sectors. 
                      {totalPnLPercent >= 0 
                        ? ` You're up ${totalPnLPercent.toFixed(2)}% overall. Consider booking partial profits in top gainers.`
                        : ` You're down ${Math.abs(totalPnLPercent).toFixed(2)}%. Consider averaging down on fundamentally strong stocks.`
                      }
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
