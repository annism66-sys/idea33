import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Merge, TestTube, CheckCircle2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface BacktestActionsProps {
  strategyName: string;
  onMerge?: () => void;
}

export function BacktestActions({ strategyName, onMerge }: BacktestActionsProps) {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState<"merge" | "independent" | null>(null);

  const handleMerge = () => {
    setSelectedOption("merge");
    toast({
      title: "Execution Feasibility Check Required",
      description: "Redirecting to evaluate feasibility before merging...",
    });
    navigate("/execution-feasibility");
  };

  const handleIndependent = () => {
    setSelectedOption("independent");
    toast({
      title: "Independent Test Complete",
      description: `"${strategyName}" tested standalone. Portfolio not affected.`,
    });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-card p-6">
      <h3 className="font-semibold mb-4">Post-Backtest Actions</h3>
      <div className="grid md:grid-cols-2 gap-4">
        <button
          onClick={handleMerge}
          className={`p-5 rounded-xl border-2 text-left transition-all ${
            selectedOption === "merge"
              ? "border-primary bg-primary/10"
              : "border-border hover:border-primary/50 hover:bg-primary/5"
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Merge className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium">Merge With Portfolio</h4>
              <p className="text-xs text-muted-foreground">Add to existing portfolio</p>
            </div>
          </div>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-gain" /> Runs execution feasibility check</li>
            <li className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-gain" /> Recalculates portfolio metrics</li>
            <li className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-gain" /> Updates risk metrics</li>
          </ul>
        </button>

        <button
          onClick={handleIndependent}
          className={`p-5 rounded-xl border-2 text-left transition-all ${
            selectedOption === "independent"
              ? "border-accent bg-accent/10"
              : "border-border hover:border-accent/50 hover:bg-accent/5"
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <TestTube className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h4 className="font-medium">Test Independently</h4>
              <p className="text-xs text-muted-foreground">Standalone analysis only</p>
            </div>
          </div>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-gain" /> No portfolio impact</li>
            <li className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-gain" /> Compare with benchmarks</li>
            <li className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-gain" /> Save results for later</li>
          </ul>
        </button>
      </div>
    </motion.div>
  );
}
