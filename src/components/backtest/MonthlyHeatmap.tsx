import { motion } from "framer-motion";
import { Calendar } from "lucide-react";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const years = [2022, 2023, 2024];

// Generate sample heatmap data
const heatmapData: Record<number, number[]> = {
  2022: [2.1, -1.3, 4.5, 0.8, -2.9, 3.1, 1.5, -0.7, 2.8, -1.1, 3.9, 1.2],
  2023: [3.8, -0.5, 2.1, 4.2, -1.8, 1.9, 3.3, 2.1, -1.4, 2.6, 1.8, 4.1],
  2024: [4.2, -2.1, 5.8, 1.3, -1.5, 3.2, 2.8, -0.9, 4.1, 1.7, 3.5, 2.2],
};

function getHeatColor(value: number): string {
  if (value > 4) return "bg-[hsl(var(--gain))] text-[hsl(var(--gain))]";
  if (value > 2) return "bg-[hsl(var(--gain)/0.6)] text-[hsl(var(--gain))]";
  if (value > 0) return "bg-[hsl(var(--gain)/0.3)] text-[hsl(var(--gain))]";
  if (value > -2) return "bg-[hsl(var(--loss)/0.3)] text-[hsl(var(--loss))]";
  return "bg-[hsl(var(--loss)/0.6)] text-[hsl(var(--loss))]";
}

export function MonthlyHeatmap() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="glass-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Monthly Return Heatmap</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left text-xs text-muted-foreground py-2 px-1 w-12">Year</th>
              {months.map(m => (
                <th key={m} className="text-center text-xs text-muted-foreground py-2 px-1">{m}</th>
              ))}
              <th className="text-center text-xs text-muted-foreground py-2 px-1">Total</th>
            </tr>
          </thead>
          <tbody>
            {years.map(year => {
              const values = heatmapData[year];
              const total = values.reduce((s, v) => s + v, 0);
              return (
                <tr key={year}>
                  <td className="font-mono text-xs py-1 px-1">{year}</td>
                  {values.map((v, i) => (
                    <td key={i} className="py-1 px-0.5">
                      <div className={`text-center text-xs font-mono rounded px-1 py-1.5 ${getHeatColor(v)}`} style={{ opacity: 0.9 }}>
                        {v > 0 ? '+' : ''}{v.toFixed(1)}
                      </div>
                    </td>
                  ))}
                  <td className="py-1 px-0.5">
                    <div className={`text-center text-xs font-mono font-bold rounded px-1 py-1.5 ${getHeatColor(total / 12)}`}>
                      {total > 0 ? '+' : ''}{total.toFixed(1)}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
