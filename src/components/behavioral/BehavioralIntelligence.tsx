import { motion } from "framer-motion";
import { Brain, AlertTriangle, TrendingUp, Clock, Gauge, Target, Activity } from "lucide-react";

interface BehaviorAlert {
  type: "overtrading" | "revenge" | "fomo" | "panic" | "sizing" | "escalation";
  severity: "low" | "medium" | "high";
  message: string;
  detail: string;
}

const mockAlerts: BehaviorAlert[] = [
  {
    type: "overtrading",
    severity: "medium",
    message: "Trading frequency is elevated",
    detail: "You placed 9 trades in 2 hours. Historically, win rate drops after 5 trades in a session.",
  },
  {
    type: "sizing",
    severity: "high",
    message: "Position size increased after a loss",
    detail: "Position size increased by 40% following a losing trade — historically this raises drawdown risk.",
  },
  {
    type: "fomo",
    severity: "low",
    message: "Possible momentum-chasing pattern detected",
    detail: "Recent entries occurred after 3%+ up-moves. These entries historically show lower risk-adjusted returns.",
  },
  {
    type: "escalation",
    severity: "medium",
    message: "Risk escalation after consecutive losses",
    detail: "Exposure increased after 3 consecutive losing trades. Consider reviewing position sizing discipline.",
  },
];

const severityColors = {
  low: { bg: "bg-accent/10 border-accent/20", text: "text-accent", label: "Low" },
  medium: { bg: "bg-warning/10 border-warning/20", text: "text-warning", label: "Medium" },
  high: { bg: "bg-loss/10 border-loss/20", text: "text-loss", label: "High" },
};

const behavioralScore = 62;
const emotionalRiskScore = 45;
const disciplineRating = 71;

function ScoreGauge({ label, score, icon: Icon, color }: { label: string; score: number; icon: any; color: string }) {
  const getScoreColor = (s: number) => {
    if (s >= 70) return "text-gain";
    if (s >= 40) return "text-warning";
    return "text-loss";
  };
  const getBarColor = (s: number) => {
    if (s >= 70) return "bg-gain";
    if (s >= 40) return "bg-warning";
    return "bg-loss";
  };

  return (
    <div className="p-4 rounded-xl bg-secondary/30 border border-border/30">
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-sm font-medium">{label}</span>
        <span className={`ml-auto text-xl font-bold font-mono ${getScoreColor(score)}`}>{score}</span>
      </div>
      <div className="h-2 rounded-full bg-secondary/50 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1 }}
          className={`h-full rounded-full ${getBarColor(score)}`}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-muted-foreground">Poor</span>
        <span className="text-[10px] text-muted-foreground">Excellent</span>
      </div>
    </div>
  );
}

export function BehavioralIntelligence() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-accent/20 border border-accent/30">
          <Brain className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Behavioral Intelligence Engine</h3>
          <p className="text-sm text-muted-foreground">Data-driven trading psychology analysis</p>
        </div>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ScoreGauge label="Behavioral Score" score={behavioralScore} icon={Brain} color="text-accent" />
        <ScoreGauge label="Emotional Risk" score={emotionalRiskScore} icon={Activity} color="text-warning" />
        <ScoreGauge label="Trade Discipline" score={disciplineRating} icon={Target} color="text-primary" />
      </div>

      {/* Behavioral Alerts */}
      <div className="glass-card-elevated p-6 rounded-2xl">
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-warning" />
          Behavioral Alerts
          <span className="ml-auto text-xs font-mono text-muted-foreground">{mockAlerts.length} patterns detected</span>
        </h4>

        <div className="space-y-3">
          {mockAlerts.map((alert, i) => {
            const severity = severityColors[alert.severity];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`p-4 rounded-xl border ${severity.bg}`}
              >
                <div className="flex items-start gap-3">
                  <Brain className={`w-4 h-4 mt-0.5 flex-shrink-0 ${severity.text}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{alert.message}</span>
                      <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${severity.bg} ${severity.text}`}>
                        {severity.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{alert.detail}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Coaching Insight */}
      <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
        <div className="flex items-start gap-2">
          <TrendingUp className="w-4 h-4 text-primary mt-0.5" />
          <div>
            <p className="text-sm font-medium text-primary mb-1">Coaching Insight</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your trading discipline score improved from 65 to 71 this month. 
              The primary area for improvement is position sizing consistency after losing trades. 
              Consider implementing a fixed-percentage risk model per trade to reduce emotional decision-making.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
