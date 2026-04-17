import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Zap,
  Shield,
  Target,
  LogIn,
  LogOut,
} from "lucide-react";
import { InvestmentIdea } from "@/stores/useStrategyStore";

interface IdeaCardProps {
  idea: InvestmentIdea;
  index: number;
  onConvertToStrategy: (idea: InvestmentIdea) => void;
}

export function IdeaCard({ idea, index, onConvertToStrategy }: IdeaCardProps) {
  return (
    <motion.div
      key={idea.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + index * 0.1 }}
      className="glass-card p-6 hover-lift"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
              {idea.theme}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Zap className="w-3 h-3" />
              {idea.confidence}% Confidence
            </span>
            {idea.riskScore && (
              <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                idea.riskScore <= 3 ? "bg-gain/10 text-gain" :
                idea.riskScore <= 6 ? "bg-warning/10 text-warning" :
                "bg-loss/10 text-loss"
              }`}>
                <Shield className="w-3 h-3" />
                Risk: {idea.riskScore}/10
              </span>
            )}
          </div>
          <h3 className="text-xl font-semibold mb-1">{idea.title}</h3>
          <p className="text-muted-foreground text-sm">{idea.description}</p>
        </div>
        <div className="text-right flex-shrink-0 ml-4">
          <div className="text-2xl font-bold font-mono stat-gain">
            {idea.expectedReturn}
          </div>
          <div className="text-xs text-muted-foreground">Expected Return</div>
        </div>
      </div>

      {/* Rationale */}
      <div className="mb-4 p-4 rounded-lg bg-secondary/30">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Rationale</span>
        </div>
        <p className="text-sm text-muted-foreground">{idea.rationale}</p>
      </div>

      {/* Entry/Exit Logic */}
      {(idea.entryLogic || idea.exitLogic) && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          {idea.entryLogic && (
            <div className="p-3 rounded-lg bg-gain/5 border border-gain/20">
              <div className="flex items-center gap-1.5 mb-1">
                <LogIn className="w-3.5 h-3.5 text-gain" />
                <span className="text-xs font-medium text-gain">Entry Logic</span>
              </div>
              <p className="text-xs text-muted-foreground">{idea.entryLogic}</p>
            </div>
          )}
          {idea.exitLogic && (
            <div className="p-3 rounded-lg bg-loss/5 border border-loss/20">
              <div className="flex items-center gap-1.5 mb-1">
                <LogOut className="w-3.5 h-3.5 text-loss" />
                <span className="text-xs font-medium text-loss">Exit Logic</span>
              </div>
              <p className="text-xs text-muted-foreground">{idea.exitLogic}</p>
            </div>
          )}
        </div>
      )}

      {/* Risks */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-warning" />
          <span className="text-sm font-medium">Key Risks</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {idea.risks.map((risk) => (
            <span
              key={risk}
              className="px-2 py-1 rounded-md bg-loss/10 text-loss text-xs"
            >
              {risk}
            </span>
          ))}
        </div>
      </div>

      {/* Stocks & CTA */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Suggested stocks:</span>
          <div className="flex gap-1 flex-wrap">
            {idea.stocks.map((stock) => (
              <span
                key={stock}
                className="px-2 py-0.5 rounded bg-secondary text-xs font-mono"
              >
                {stock}
              </span>
            ))}
          </div>
        </div>
        <Button
          variant="default"
          size="sm"
          className="group flex-shrink-0"
          onClick={() => onConvertToStrategy(idea)}
        >
          Convert to Strategy
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </motion.div>
  );
}
