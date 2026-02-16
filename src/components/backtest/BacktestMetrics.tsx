import { motion } from "framer-motion";
import { TrendingUp, ArrowUpRight, TrendingDown, Target, Activity, BarChart3 } from "lucide-react";

interface BacktestMetricsProps {
  metrics: {
    label: string;
    value: string;
    change: string;
    positive: boolean;
    icon: React.ElementType;
  }[];
}

export function BacktestMetrics({ metrics }: BacktestMetricsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
    </div>
  );
}
