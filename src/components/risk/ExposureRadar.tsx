import { motion } from "framer-motion";
import { Radar } from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar as RechartsRadar,
  ResponsiveContainer,
} from "recharts";

const exposureData = [
  { axis: "Large Cap", value: 72 },
  { axis: "Mid Cap", value: 35 },
  { axis: "Small Cap", value: 18 },
  { axis: "Cyclical", value: 55 },
  { axis: "Defensive", value: 40 },
  { axis: "High Beta", value: 48 },
  { axis: "Low Vol", value: 30 },
  { axis: "Momentum", value: 62 },
];

const insights = [
  "Portfolio shows heavy large-cap tilt with moderate cyclical exposure.",
  "High beta allocation is elevated — portfolio may amplify market moves.",
  "Momentum factor exposure is above median — typically correlates with trending regimes.",
];

export function ExposureRadar() {
  return (
    <div className="glass-card-elevated p-6 rounded-2xl">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/20 border border-primary/30">
          <Radar className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">Exposure Radar</h3>
          <p className="text-xs text-muted-foreground">Multi-factor exposure map</p>
        </div>
      </div>

      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={exposureData}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis
              dataKey="axis"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            />
            <RechartsRadar
              name="Exposure"
              dataKey="value"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.25}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2 mt-4">
        {insights.map((insight, i) => (
          <p key={i} className="text-xs text-muted-foreground leading-relaxed">
            • {insight}
          </p>
        ))}
      </div>
    </div>
  );
}
