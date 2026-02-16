import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";

// Generate portfolio performance data
const generatePerformanceData = () => {
  const data = [];
  let portfolioValue = 100;
  let benchmarkValue = 100;
  for (let i = 0; i < 24; i++) {
    const date = new Date(2023, i, 1);
    portfolioValue *= 1 + (Math.random() * 0.06 - 0.02);
    benchmarkValue *= 1 + (Math.random() * 0.04 - 0.015);
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      portfolio: Math.round(portfolioValue * 100) / 100,
      benchmark: Math.round(benchmarkValue * 100) / 100,
    });
  }
  return data;
};

const performanceData = generatePerformanceData();

export function PortfolioPerformanceChart() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Portfolio Performance</h3>
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={performanceData}>
            <defs>
              <linearGradient id="perfPortfolio" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="perfBenchmark" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.15} />
                <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
            <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
            <Area type="monotone" dataKey="portfolio" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#perfPortfolio)" name="Portfolio" />
            <Area type="monotone" dataKey="benchmark" stroke="hsl(var(--muted-foreground))" strokeWidth={1.5} strokeDasharray="5 5" fill="url(#perfBenchmark)" name="NIFTY 50" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center gap-6 mt-3">
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-primary" /><span className="text-xs text-muted-foreground">Portfolio</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-muted-foreground" /><span className="text-xs text-muted-foreground">NIFTY 50</span></div>
      </div>
    </motion.div>
  );
}
