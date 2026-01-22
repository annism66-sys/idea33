import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Target,
  AlertTriangle,
  Download
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceLine,
  ComposedChart,
  Bar,
} from "recharts";

// Mock performance data
const performanceData = Array.from({ length: 36 }, (_, i) => {
  const date = new Date(2022, i, 1);
  const strategyBase = 100 * Math.pow(1.015, i) + Math.sin(i * 0.5) * 10 + Math.random() * 5;
  const benchmarkBase = 100 * Math.pow(1.008, i) + Math.cos(i * 0.4) * 5 + Math.random() * 3;
  return {
    date: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    strategy: Math.round(strategyBase * 100) / 100,
    benchmark: Math.round(benchmarkBase * 100) / 100,
  };
});

const drawdownData = performanceData.map((d, i) => {
  const maxSoFar = Math.max(...performanceData.slice(0, i + 1).map(p => p.strategy));
  const drawdown = ((d.strategy - maxSoFar) / maxSoFar) * 100;
  return {
    ...d,
    drawdown: Math.round(drawdown * 100) / 100,
  };
});

const monthlyReturns = [
  { month: 'Jan', return: 4.2 },
  { month: 'Feb', return: -2.1 },
  { month: 'Mar', return: 5.8 },
  { month: 'Apr', return: 1.3 },
  { month: 'May', return: -1.5 },
  { month: 'Jun', return: 3.2 },
  { month: 'Jul', return: 2.8 },
  { month: 'Aug', return: -0.9 },
  { month: 'Sep', return: 4.1 },
  { month: 'Oct', return: 1.7 },
  { month: 'Nov', return: 3.5 },
  { month: 'Dec', return: 2.2 },
];

const metrics = [
  { label: "Total Return", value: "+68.4%", change: "+vs 23.2% benchmark", positive: true, icon: TrendingUp },
  { label: "CAGR", value: "18.9%", change: "+vs 7.2% benchmark", positive: true, icon: ArrowUpRight },
  { label: "Max Drawdown", value: "-12.3%", change: "vs -18.5% benchmark", positive: true, icon: TrendingDown },
  { label: "Sharpe Ratio", value: "1.42", change: "+vs 0.68 benchmark", positive: true, icon: Target },
  { label: "Win Rate", value: "64.2%", change: "38 wins / 21 losses", positive: true, icon: Activity },
  { label: "Sortino Ratio", value: "1.87", change: "Downside deviation: 8.2%", positive: true, icon: BarChart3 },
];

const trades = [
  { symbol: "HDFCBANK", entry: "₹1,542", exit: "₹1,698", return: "+10.1%", days: 45 },
  { symbol: "TCS", entry: "₹3,210", exit: "₹3,520", return: "+9.6%", days: 32 },
  { symbol: "RELIANCE", entry: "₹2,380", exit: "₹2,180", return: "-8.4%", days: 28 },
  { symbol: "INFY", entry: "₹1,420", exit: "₹1,580", return: "+11.2%", days: 51 },
  { symbol: "ICICIBANK", entry: "₹890", exit: "₹1,020", return: "+14.6%", days: 62 },
];

export default function Backtest() {
  const [selectedPeriod, setSelectedPeriod] = useState("3Y");

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
            <h1 className="text-3xl font-bold mb-2">Backtest Results</h1>
            <p className="text-muted-foreground">
              Banking Sector Momentum Strategy • Jan 2022 - Dec 2024
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-secondary/50 rounded-lg p-1">
              {["1Y", "2Y", "3Y", "5Y", "Max"].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    selectedPeriod === period
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
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

        {/* Metrics Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8"
        >
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="glass-card p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <metric.icon className={`w-4 h-4 ${metric.positive ? "text-gain" : "text-loss"}`} />
                <span className="text-xs text-muted-foreground">{metric.label}</span>
              </div>
              <div className={`text-2xl font-bold font-mono ${metric.positive ? "stat-gain" : "stat-loss"}`}>
                {metric.value}
              </div>
              <div className="text-xs text-muted-foreground mt-1">{metric.change}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Performance Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <h3 className="font-semibold mb-4">Portfolio Performance</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="strategyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="benchmarkGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="strategy"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#strategyGradient)"
                    name="Strategy"
                  />
                  <Area
                    type="monotone"
                    dataKey="benchmark"
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    fill="url(#benchmarkGradient)"
                    name="NIFTY 50"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-sm text-muted-foreground">Strategy</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-muted-foreground" />
                <span className="text-sm text-muted-foreground">NIFTY 50</span>
              </div>
            </div>
          </motion.div>

          {/* Drawdown Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6"
          >
            <h3 className="font-semibold mb-4">Drawdown Analysis</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={drawdownData}>
                  <defs>
                    <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--loss))" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="hsl(var(--loss))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}%`}
                    domain={[-20, 0]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`${value.toFixed(2)}%`, 'Drawdown']}
                  />
                  <ReferenceLine y={0} stroke="hsl(var(--border))" />
                  <Area
                    type="monotone"
                    dataKey="drawdown"
                    stroke="hsl(var(--loss))"
                    strokeWidth={2}
                    fill="url(#drawdownGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-loss" />
                <span className="text-sm text-muted-foreground">Max Drawdown: -12.3%</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Monthly Returns & Trade History */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Monthly Returns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-6"
          >
            <h3 className="font-semibold mb-4">Monthly Returns (2024)</h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={monthlyReturns}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`${value}%`, 'Return']}
                  />
                  <ReferenceLine y={0} stroke="hsl(var(--border))" />
                  <Bar
                    dataKey="return"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Recent Trades */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card p-6"
          >
            <h3 className="font-semibold mb-4">Recent Trades</h3>
            <div className="space-y-3">
              {trades.map((trade, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-mono font-bold text-primary">
                        {trade.symbol.slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium font-mono">{trade.symbol}</div>
                      <div className="text-xs text-muted-foreground">
                        {trade.entry} → {trade.exit}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-mono font-medium ${
                      trade.return.startsWith('+') ? 'stat-gain' : 'stat-loss'
                    }`}>
                      {trade.return}
                    </div>
                    <div className="text-xs text-muted-foreground">{trade.days} days</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
