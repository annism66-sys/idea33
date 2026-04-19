import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, TrendingDown, Activity, ArrowUpRight, 
  BarChart3, Target, Download, ArrowLeft, AlertTriangle
} from "lucide-react";
import { useStrategyStore } from "@/stores/useStrategyStore";
import { BacktestMetrics } from "@/components/backtest/BacktestMetrics";
import { BacktestCharts } from "@/components/backtest/BacktestCharts";
import { BacktestRiskContribution } from "@/components/backtest/BacktestRiskContribution";
import { MonthlyHeatmap } from "@/components/backtest/MonthlyHeatmap";
import { BacktestActions } from "@/components/backtest/BacktestActions";
import { ModeBadge } from "@/components/mode/ModeBadge";

// Generate mock data based on strategy
function generatePerformanceData(stockCount: number) {
  return Array.from({ length: 36 }, (_, i) => {
    const date = new Date(2022, i, 1);
    const strategyBase = 100 * Math.pow(1.015, i) + Math.sin(i * 0.5) * 10 + Math.random() * 5;
    const benchmarkBase = 100 * Math.pow(1.008, i) + Math.cos(i * 0.4) * 5 + Math.random() * 3;
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      strategy: Math.round(strategyBase * 100) / 100,
      benchmark: Math.round(benchmarkBase * 100) / 100,
    };
  });
}

const monthlyReturns = [
  { month: 'Jan', return: 4.2 }, { month: 'Feb', return: -2.1 },
  { month: 'Mar', return: 5.8 }, { month: 'Apr', return: 1.3 },
  { month: 'May', return: -1.5 }, { month: 'Jun', return: 3.2 },
  { month: 'Jul', return: 2.8 }, { month: 'Aug', return: -0.9 },
  { month: 'Sep', return: 4.1 }, { month: 'Oct', return: 1.7 },
  { month: 'Nov', return: 3.5 }, { month: 'Dec', return: 2.2 },
];

export default function Backtest() {
  const navigate = useNavigate();
  const { activeStrategy, riskBudget } = useStrategyStore();
  const [selectedPeriod, setSelectedPeriod] = useState("3Y");

  const strategyName = activeStrategy?.name || "Banking Sector Momentum Strategy";
  const stocks = activeStrategy?.stocks || [];

  const performanceData = useMemo(() => generatePerformanceData(stocks.length || 5), [stocks.length]);

  const drawdownData = useMemo(() => performanceData.map((d, i) => {
    const maxSoFar = Math.max(...performanceData.slice(0, i + 1).map(p => p.strategy));
    return { ...d, drawdown: Math.round(((d.strategy - maxSoFar) / maxSoFar) * 100 * 100) / 100 };
  }), [performanceData]);

  const rollingReturns = useMemo(() => performanceData.map((d, i) => {
    const rolling = i >= 12 ? ((d.strategy / performanceData[i - 12].strategy) - 1) * 100 : 0;
    return { date: d.date, rolling: Math.round(rolling * 10) / 10 };
  }).slice(12), [performanceData]);

  const riskContribution = useMemo(() => {
    const s = stocks.length > 0 ? stocks : [
      { symbol: "HDFCBANK", weight: 20 }, { symbol: "TCS", weight: 18 },
      { symbol: "RELIANCE", weight: 16 }, { symbol: "INFY", weight: 15 },
      { symbol: "ICICIBANK", weight: 12 }, { symbol: "ITC", weight: 10 },
    ];
    return s.map(st => ({
      symbol: st.symbol,
      contribution: Math.round((st.weight * (0.5 + Math.random() * 0.8)) * 10) / 10,
    })).sort((a, b) => b.contribution - a.contribution);
  }, [stocks]);

  const metrics = [
    { label: "Total Return", value: "+68.4%", change: "+vs 23.2% benchmark", positive: true, icon: TrendingUp },
    { label: "CAGR", value: "18.9%", change: "+vs 7.2% benchmark", positive: true, icon: ArrowUpRight },
    { label: "Max Drawdown", value: "-12.3%", change: "vs -18.5% benchmark", positive: true, icon: TrendingDown },
    { label: "Sharpe Ratio", value: "1.42", change: "+vs 0.68 benchmark", positive: true, icon: Target },
    { label: "Win Rate", value: "64.2%", change: "38 wins / 21 losses", positive: true, icon: Activity },
    { label: "Sortino Ratio", value: "1.87", change: "Downside deviation: 8.2%", positive: true, icon: BarChart3 },
  ];

  const trades = [
    { symbol: stocks[0]?.symbol || "HDFCBANK", entry: "₹1,542", exit: "₹1,698", return: "+10.1%", days: 45 },
    { symbol: stocks[1]?.symbol || "TCS", entry: "₹3,210", exit: "₹3,520", return: "+9.6%", days: 32 },
    { symbol: stocks[2]?.symbol || "RELIANCE", entry: "₹2,380", exit: "₹2,180", return: "-8.4%", days: 28 },
    { symbol: stocks[3]?.symbol || "INFY", entry: "₹1,420", exit: "₹1,580", return: "+11.2%", days: 51 },
    { symbol: stocks[4]?.symbol || "ICICIBANK", entry: "₹890", exit: "₹1,020", return: "+14.6%", days: 62 },
  ];

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">Backtest Results</h1>
              <ModeBadge source="backtest" />
            </div>
            <p className="text-muted-foreground">
              {strategyName} • Jan 2022 - Dec 2024
              {riskBudget.validated && <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-gain/10 text-gain">Risk Validated</span>}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {activeStrategy && (
              <Button variant="outline" size="sm" onClick={() => navigate("/risk-budget")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Risk Budget
              </Button>
            )}
            <div className="flex items-center bg-secondary/50 rounded-lg p-1">
              {["1Y", "2Y", "3Y", "5Y", "Max"].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    selectedPeriod === period ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </motion.div>

        {/* Strategy Stocks Info */}
        {activeStrategy && stocks.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex flex-wrap gap-2">
            {stocks.map(s => (
              <span key={s.symbol} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-mono font-medium">
                {s.symbol} ({s.weight}%)
              </span>
            ))}
          </motion.div>
        )}

        {/* Metrics */}
        <div className="mb-8">
          <BacktestMetrics metrics={metrics} />
        </div>

        {/* Charts */}
        <BacktestCharts
          performanceData={performanceData}
          drawdownData={drawdownData}
          monthlyReturns={monthlyReturns}
          rollingReturns={rollingReturns}
        />

        {/* Monthly Heatmap + Risk Contribution */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <MonthlyHeatmap />
          <BacktestRiskContribution data={riskContribution} />
        </div>

        {/* Recent Trades */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-6 mb-8">
          <h3 className="font-semibold mb-4">Recent Trades</h3>
          <div className="space-y-3">
            {trades.map((trade, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-mono font-bold text-primary">{trade.symbol.slice(0, 2)}</span>
                  </div>
                  <div>
                    <div className="font-medium font-mono">{trade.symbol}</div>
                    <div className="text-xs text-muted-foreground">{trade.entry} → {trade.exit}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-mono font-medium ${trade.return.startsWith('+') ? 'stat-gain' : 'stat-loss'}`}>{trade.return}</div>
                  <div className="text-xs text-muted-foreground">{trade.days} days</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Post-Backtest Actions */}
        <BacktestActions strategyName={strategyName} />
      </div>
    </DashboardLayout>
  );
}
