import { motion } from "framer-motion";
import { Activity, BarChart3, TrendingDown } from "lucide-react";
import { Holding } from "@/hooks/usePortfolio";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ScatterChart, Scatter, ReferenceLine,
  LineChart, Line, Cell, ZAxis,
} from "recharts";
import { useMemo } from "react";

interface PortfolioAdvancedChartsProps {
  holdings: Holding[];
  totalValue: number;
}

export function PortfolioAdvancedCharts({ holdings, totalValue }: PortfolioAdvancedChartsProps) {
  // Drawdown data
  const drawdownData = useMemo(() => {
    const data = [];
    let peak = 100;
    let value = 100;
    for (let i = 0; i < 24; i++) {
      const date = new Date(2023, i, 1);
      value *= 1 + (Math.random() * 0.06 - 0.02);
      if (value > peak) peak = value;
      const dd = ((value - peak) / peak) * 100;
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        drawdown: Math.round(dd * 100) / 100,
      });
    }
    return data;
  }, []);

  // Risk-return scatter data
  const scatterData = useMemo(() => {
    return holdings.map(h => {
      const currentPrice = h.current_price || h.average_price;
      const ret = ((currentPrice - h.average_price) / h.average_price) * 100;
      const vol = 10 + Math.random() * 25;
      const value = h.quantity * currentPrice;
      return {
        symbol: h.stock_symbol,
        return: Math.round(ret * 10) / 10,
        volatility: Math.round(vol * 10) / 10,
        size: totalValue > 0 ? (value / totalValue) * 100 : 10,
      };
    });
  }, [holdings, totalValue]);

  // Rolling returns
  const rollingData = useMemo(() => {
    const data = [];
    for (let i = 0; i < 24; i++) {
      const date = new Date(2023, i, 1);
      const rolling = 8 + Math.sin(i * 0.5) * 12 + (Math.random() - 0.5) * 6;
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        rolling: Math.round(rolling * 10) / 10,
      });
    }
    return data;
  }, []);

  // Correlation matrix
  const correlationStocks = holdings.slice(0, 6).map(h => h.stock_symbol);
  const correlationMatrix = useMemo(() => {
    const data: { stock1: string; stock2: string; correlation: number }[] = [];
    correlationStocks.forEach((s1, i) => {
      correlationStocks.forEach((s2, j) => {
        const corr = i === j ? 1.0 : 0.2 + Math.random() * 0.6;
        data.push({ stock1: s1, stock2: s2, correlation: Math.round(corr * 100) / 100 });
      });
    });
    return data;
  }, [holdings]);

  return (
    <>
      {/* Drawdown + Rolling Returns */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="w-5 h-5 text-loss" />
            <h3 className="font-semibold">Drawdown Chart</h3>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={drawdownData}>
                <defs>
                  <linearGradient id="portfolioDDGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--loss))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--loss))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} domain={['auto', 0]} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} formatter={(v: number) => [`${v.toFixed(2)}%`, 'Drawdown']} />
                <ReferenceLine y={0} stroke="hsl(var(--border))" />
                <Area type="monotone" dataKey="drawdown" stroke="hsl(var(--loss))" strokeWidth={2} fill="url(#portfolioDDGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-accent" />
            <h3 className="font-semibold">Rolling 12M Returns</h3>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={rollingData}>
                <defs>
                  <linearGradient id="rollingPortGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} formatter={(v: number) => [`${v.toFixed(1)}%`, 'Rolling 12M']} />
                <ReferenceLine y={0} stroke="hsl(var(--border))" />
                <Area type="monotone" dataKey="rolling" stroke="hsl(var(--accent))" strokeWidth={2} fill="url(#rollingPortGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Risk-Return Scatter + Correlation Matrix */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Risk-Return Scatter</h3>
          </div>
          {scatterData.length > 0 ? (
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis type="number" dataKey="volatility" name="Volatility" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} tickLine={false} axisLine={false} label={{ value: 'Volatility %', position: 'bottom', fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <YAxis type="number" dataKey="return" name="Return" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} tickLine={false} axisLine={false} label={{ value: 'Return %', angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <ZAxis type="number" dataKey="size" range={[50, 300]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                    formatter={(value: number, name: string) => [`${value}%`, name]}
                    labelFormatter={() => ''}
                    content={({ active, payload }) => {
                      if (active && payload?.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-card border border-border rounded-lg p-2 text-xs">
                            <div className="font-mono font-bold">{d.symbol}</div>
                            <div>Return: {d.return}%</div>
                            <div>Volatility: {d.volatility}%</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter data={scatterData} fill="hsl(var(--primary))">
                    {scatterData.map((entry, i) => (
                      <Cell key={i} fill={entry.return >= 0 ? "hsl(var(--gain))" : "hsl(var(--loss))"} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Add holdings to see risk-return scatter</p>
          )}
        </motion.div>

        {/* Correlation Matrix */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-accent" />
            <h3 className="font-semibold">Correlation Matrix</h3>
          </div>
          {correlationStocks.length > 1 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th className="py-1 px-1"></th>
                    {correlationStocks.map(s => (
                      <th key={s} className="py-1 px-1 font-mono text-muted-foreground">{s.slice(0, 5)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {correlationStocks.map((s1, i) => (
                    <tr key={s1}>
                      <td className="py-1 px-1 font-mono text-muted-foreground">{s1.slice(0, 5)}</td>
                      {correlationStocks.map((s2, j) => {
                        const entry = correlationMatrix.find(c => c.stock1 === s1 && c.stock2 === s2);
                        const corr = entry?.correlation || 0;
                        const intensity = Math.abs(corr);
                        const isHigh = corr > 0.7 && i !== j;
                        return (
                          <td key={s2} className="py-1 px-0.5">
                            <div
                              className={`text-center font-mono rounded px-1 py-1.5 ${
                                i === j ? "bg-primary/20 text-primary" :
                                isHigh ? "bg-warning/20 text-warning" :
                                "bg-secondary/50"
                              }`}
                            >
                              {corr.toFixed(2)}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Need 2+ holdings for correlation</p>
          )}
        </motion.div>
      </div>
    </>
  );
}
