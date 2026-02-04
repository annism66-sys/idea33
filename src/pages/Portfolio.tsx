import { useState } from "react";
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
  Info,
  Plus,
  Newspaper,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  RefreshCw,
  Lightbulb
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

const allocationData = [
  { name: "Banking", value: 35, color: "hsl(var(--primary))" },
  { name: "IT Services", value: 25, color: "hsl(var(--accent))" },
  { name: "Consumer", value: 15, color: "hsl(var(--warning))" },
  { name: "Pharma", value: 12, color: "hsl(var(--gain))" },
  { name: "Energy", value: 8, color: "hsl(var(--loss))" },
  { name: "Cash", value: 5, color: "hsl(var(--muted-foreground))" },
];

const holdings = [
  { symbol: "HDFCBANK", name: "HDFC Bank", weight: 12.5, return: "+24.3%", risk: "Low", news: "Q3 results beat estimates, NIM expansion continues" },
  { symbol: "ICICIBANK", name: "ICICI Bank", weight: 11.2, return: "+18.7%", risk: "Low", news: null },
  { symbol: "TCS", name: "Tata Consultancy", weight: 10.8, return: "+12.1%", risk: "Medium", news: "New $500M deal signed with US retailer" },
  { symbol: "INFY", name: "Infosys", weight: 9.4, return: "+8.5%", risk: "Medium", news: null },
  { symbol: "KOTAKBANK", name: "Kotak Bank", weight: 8.3, return: "+15.2%", risk: "Low", news: null },
  { symbol: "RELIANCE", name: "Reliance Industries", weight: 7.5, return: "-2.4%", risk: "Medium", news: "RIL Q3 profit falls 4.8%, refining margins weak" },
  { symbol: "HINDUNILVR", name: "Hindustan Unilever", weight: 6.8, return: "+5.8%", risk: "Low", news: null },
  { symbol: "SUNPHARMA", name: "Sun Pharma", weight: 5.2, return: "+11.3%", risk: "Medium", news: "FDA approves new generic drug application" },
];

const rebalancingIdeas = [
  { type: "reduce", symbol: "HDFCBANK", reason: "High concentration at 12.5%, consider trimming 2-3% to diversify", urgency: "medium" },
  { type: "add", symbol: "BHARTIARTL", reason: "Strong 5G rollout momentum, defensive telecom exposure lacking in portfolio", urgency: "high" },
  { type: "reduce", symbol: "RELIANCE", reason: "Underperforming at -2.4%, weak refining outlook persists", urgency: "low" },
  { type: "add", symbol: "ITC", reason: "Defensive FMCG play with improving cigarette volumes and hotel recovery", urgency: "medium" },
  { type: "remove", symbol: "KOTAKBANK", reason: "Consolidate banking exposure - already have HDFC and ICICI", urgency: "low" },
];

const riskMetrics = [
  { label: "Portfolio Beta", value: "1.12", description: "Slightly higher volatility than market" },
  { label: "Volatility (Ann.)", value: "16.8%", description: "Historical 1-year volatility" },
  { label: "Value at Risk (95%)", value: "-2.3%", description: "Daily VaR at 95% confidence" },
  { label: "Concentration (Top 5)", value: "52.2%", description: "Weight in top 5 holdings" },
];

const riskBreakdown = [
  { factor: "Market Risk", value: 65 },
  { factor: "Sector Risk", value: 45 },
  { factor: "Stock-Specific", value: 30 },
  { factor: "Liquidity Risk", value: 15 },
  { factor: "Currency Risk", value: 8 },
];

const strategies = [
  { name: "Banking Momentum", allocation: 40, return: "+28.5%", status: "active" },
  { name: "IT Value Play", allocation: 30, return: "+12.3%", status: "active" },
  { name: "Dividend Yield", allocation: 20, return: "+8.7%", status: "active" },
  { name: "Small Cap Growth", allocation: 10, return: "-3.2%", status: "paused" },
];

export default function Portfolio() {
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
              Multi-strategy portfolio overview and risk analysis
            </p>
          </div>
          <Button variant="hero">
            <Plus className="w-4 h-4 mr-2" />
            Add Strategy
          </Button>
        </motion.div>

        {/* Portfolio Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="glass-card p-4">
            <div className="text-sm text-muted-foreground mb-1">Portfolio Value</div>
            <div className="text-2xl font-bold font-mono">₹24,56,780</div>
            <div className="flex items-center gap-1 text-sm stat-gain">
              <TrendingUp className="w-4 h-4" />
              +18.4% all time
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="text-sm text-muted-foreground mb-1">Today's P&L</div>
            <div className="text-2xl font-bold font-mono stat-gain">+₹12,340</div>
            <div className="flex items-center gap-1 text-sm stat-gain">
              <TrendingUp className="w-4 h-4" />
              +0.52%
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="text-sm text-muted-foreground mb-1">Active Strategies</div>
            <div className="text-2xl font-bold font-mono">4</div>
            <div className="text-sm text-muted-foreground">3 profitable</div>
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
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {allocationData.map((entry, index) => (
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
              {allocationData.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-muted-foreground">{item.name}</span>
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
                    Top 5 holdings represent 52% of portfolio. Consider diversifying.
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

        {/* Holdings & Strategies */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Holdings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Top Holdings</h3>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Newspaper className="w-3 h-3" />
                <span>News enabled</span>
              </div>
            </div>
            <div className="space-y-3">
              {holdings.map((holding, index) => (
                <div key={holding.symbol}>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-mono font-bold text-primary">
                          {holding.symbol.slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium font-mono text-sm">{holding.symbol}</div>
                        <div className="text-xs text-muted-foreground">{holding.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-mono text-sm ${
                        holding.return.startsWith('+') ? 'stat-gain' : 'stat-loss'
                      }`}>
                        {holding.return}
                      </div>
                      <div className="text-xs text-muted-foreground">{holding.weight}% weight</div>
                    </div>
                  </div>
                  {holding.news && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="ml-4 mt-1 p-2 rounded-lg bg-accent/5 border-l-2 border-accent/50"
                    >
                      <div className="flex items-start gap-2">
                        <Newspaper className="w-3 h-3 text-accent mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-muted-foreground leading-relaxed">{holding.news}</p>
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Strategies */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-card p-6"
          >
            <h3 className="font-semibold mb-4">Active Strategies</h3>
            <div className="space-y-4">
              {strategies.map((strategy) => (
                <div
                  key={strategy.name}
                  className="p-4 rounded-lg bg-secondary/30 border border-border/50"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{strategy.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        strategy.status === 'active' 
                          ? 'bg-gain/10 text-gain' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {strategy.status}
                      </span>
                    </div>
                    <span className={`font-mono font-medium ${
                      strategy.return.startsWith('+') ? 'stat-gain' : 'stat-loss'
                    }`}>
                      {strategy.return}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${strategy.allocation}%` }}
                      />
                    </div>
                    <span className="text-sm font-mono text-muted-foreground">
                      {strategy.allocation}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Insight */}
            <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium mb-1">AI Portfolio Insight</div>
                  <p className="text-xs text-muted-foreground">
                    Your portfolio is well-diversified across sectors but has elevated concentration 
                    in banking. Consider adding defensive sectors like FMCG or utilities to reduce 
                    beta and improve risk-adjusted returns.
                  </p>
                </div>
              </div>
            </div>

            {/* Rebalancing Ideas */}
            <div className="mt-4 p-4 rounded-lg bg-accent/5 border border-accent/20">
              <div className="flex items-center gap-2 mb-3">
                <RefreshCw className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium">Rebalancing Suggestions</span>
              </div>
              <div className="space-y-2">
                {rebalancingIdeas.map((idea, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-start gap-2 p-2 rounded-lg bg-secondary/30"
                  >
                    <div className={`p-1 rounded-md flex-shrink-0 ${
                      idea.type === 'add' ? 'bg-gain/10' :
                      idea.type === 'reduce' ? 'bg-warning/10' :
                      'bg-loss/10'
                    }`}>
                      {idea.type === 'add' ? (
                        <ArrowUpRight className="w-3 h-3 text-gain" />
                      ) : idea.type === 'reduce' ? (
                        <Minus className="w-3 h-3 text-warning" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3 text-loss" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold uppercase ${
                          idea.type === 'add' ? 'text-gain' :
                          idea.type === 'reduce' ? 'text-warning' :
                          'text-loss'
                        }`}>
                          {idea.type}
                        </span>
                        <span className="text-xs font-mono font-medium">{idea.symbol}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                          idea.urgency === 'high' ? 'bg-loss/10 text-loss' :
                          idea.urgency === 'medium' ? 'bg-warning/10 text-warning' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {idea.urgency}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{idea.reason}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* News-Based Insights */}
            <div className="mt-4 p-4 rounded-lg bg-warning/5 border border-warning/20">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-warning" />
                <span className="text-sm font-medium">News-Based Risk Alert</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Based on recent news, <span className="font-mono text-foreground">RELIANCE</span> shows 
                continued weakness in refining margins. Given your moderate risk appetite, consider 
                reducing exposure by 2-3% and reallocating to <span className="font-mono text-foreground">BHARTIARTL</span> 
                which has strong 5G tailwinds.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
