import { motion } from "framer-motion";
import { Clock, AlertTriangle } from "lucide-react";

export function ThetaDecayCountdown() {
  const daysToExpiry = 7;
  const currentTheta = -8.2;
  const tomorrowTheta = -11.5;
  const thetaAcceleration = ((Math.abs(tomorrowTheta) - Math.abs(currentTheta)) / Math.abs(currentTheta) * 100);

  const dailyDecay = [
    { day: "Today", theta: -8.2, cumulative: 0 },
    { day: "Day 2", theta: -11.5, cumulative: -8.2 },
    { day: "Day 3", theta: -14.8, cumulative: -19.7 },
    { day: "Day 4", theta: -19.2, cumulative: -34.5 },
    { day: "Day 5", theta: -25.1, cumulative: -53.7 },
    { day: "Day 6", theta: -33.8, cumulative: -78.8 },
    { day: "Expiry", theta: -45.0, cumulative: -112.6 },
  ];

  return (
    <div className="glass-card-elevated p-6 rounded-2xl">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-loss/20 border border-loss/30">
          <Clock className="w-5 h-5 text-loss" />
        </div>
        <div>
          <h3 className="font-semibold">Theta Decay Countdown</h3>
          <p className="text-xs text-muted-foreground">{daysToExpiry} days to expiry • NIFTY 22000 CE</p>
        </div>
      </div>

      {/* Warning Banner */}
      <div className="p-3 rounded-xl bg-loss/10 border border-loss/20 mb-6 flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-loss mt-0.5 flex-shrink-0" />
        <p className="text-sm text-muted-foreground">
          Theta decay accelerates by <strong className="text-loss">{thetaAcceleration.toFixed(0)}%</strong> after tomorrow. 
          Premium erosion increases significantly in final days.
        </p>
      </div>

      {/* Decay Timeline */}
      <div className="space-y-2">
        {dailyDecay.map((d, i) => {
          const intensity = (i / (dailyDecay.length - 1)) * 100;
          return (
            <div key={d.day} className="flex items-center gap-3">
              <span className="text-xs w-14 text-muted-foreground">{d.day}</span>
              <div className="flex-1 h-6 rounded-md bg-secondary/30 overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(Math.abs(d.theta) / 45 * 100, 100)}%` }}
                  transition={{ duration: 0.6, delay: i * 0.08 }}
                  className="h-full rounded-md bg-loss"
                  style={{ opacity: 0.3 + intensity * 0.007 }}
                />
              </div>
              <div className="w-20 text-right">
                <span className="font-mono text-xs text-loss">₹{d.theta.toFixed(1)}</span>
              </div>
              <div className="w-20 text-right">
                <span className="font-mono text-xs text-muted-foreground">Σ ₹{d.cumulative.toFixed(1)}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 rounded-lg bg-secondary/20">
        <p className="text-xs text-muted-foreground">
          <strong>Key takeaway:</strong> If the underlying remains flat, total time decay over {daysToExpiry} days 
          is estimated at <strong>₹{Math.abs(dailyDecay[dailyDecay.length - 1].cumulative).toFixed(0)}</strong> — 
          approximately <strong>{((Math.abs(dailyDecay[dailyDecay.length - 1].cumulative) / 285) * 100).toFixed(0)}%</strong> of current premium.
        </p>
      </div>
    </div>
  );
}
