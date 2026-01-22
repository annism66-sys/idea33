import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Sparkles, 
  ArrowRight,
  Play,
  Plus,
  Trash2,
  GripVertical,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Wand2
} from "lucide-react";

interface Rule {
  id: string;
  type: "entry" | "exit" | "position" | "rebalance";
  condition: string;
  enabled: boolean;
}

const initialRules: Rule[] = [
  { id: "1", type: "entry", condition: "RSI(14) < 30 AND Price > 200-day SMA", enabled: true },
  { id: "2", type: "entry", condition: "Volume > 2x Average AND Price breaks 52-week high", enabled: true },
  { id: "3", type: "exit", condition: "RSI(14) > 70 OR Price drops 15% from entry", enabled: true },
  { id: "4", type: "exit", condition: "Stop loss at 8% below entry price", enabled: true },
  { id: "5", type: "position", condition: "Maximum 10% per stock, Maximum 5 stocks", enabled: true },
  { id: "6", type: "rebalance", condition: "Monthly rebalancing on first trading day", enabled: true },
];

const ruleTypes = [
  { value: "entry", label: "Entry Signal", color: "bg-gain/10 text-gain border-gain/20" },
  { value: "exit", label: "Exit Signal", color: "bg-loss/10 text-loss border-loss/20" },
  { value: "position", label: "Position Size", color: "bg-accent/10 text-accent border-accent/20" },
  { value: "rebalance", label: "Rebalancing", color: "bg-warning/10 text-warning border-warning/20" },
];

export default function Strategy() {
  const [strategyInput, setStrategyInput] = useState(
    "I want to buy large-cap Indian stocks that are showing momentum with strong fundamentals. Enter when RSI is oversold and price is above the 200-day moving average. Exit when RSI becomes overbought or if the stock drops more than 15%. Limit each position to 10% of the portfolio with a maximum of 5 stocks."
  );
  const [rules, setRules] = useState<Rule[]>(initialRules);
  const [isConverting, setIsConverting] = useState(false);
  const [expandedRules, setExpandedRules] = useState<Record<string, boolean>>({});

  const handleConvertToRules = () => {
    setIsConverting(true);
    setTimeout(() => {
      setIsConverting(false);
    }, 2000);
  };

  const toggleRule = (id: string) => {
    setRules(rules.map(rule => 
      rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };

  const deleteRule = (id: string) => {
    setRules(rules.filter(rule => rule.id !== id));
  };

  const addRule = (type: Rule["type"]) => {
    const newRule: Rule = {
      id: Date.now().toString(),
      type,
      condition: "New condition - click to edit",
      enabled: true,
    };
    setRules([...rules, newRule]);
  };

  const getRuleTypeStyle = (type: string) => {
    return ruleTypes.find(t => t.value === type)?.color || "";
  };

  const getRuleTypeLabel = (type: string) => {
    return ruleTypes.find(t => t.value === type)?.label || type;
  };

  const groupedRules = rules.reduce((acc, rule) => {
    if (!acc[rule.type]) acc[rule.type] = [];
    acc[rule.type].push(rule);
    return acc;
  }, {} as Record<string, Rule[]>);

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Strategy Builder</h1>
          <p className="text-muted-foreground">
            Describe your investment strategy in plain English and let AI convert it to executable rules
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Natural Language Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Wand2 className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Describe Your Strategy</h2>
              </div>
              <Textarea
                value={strategyInput}
                onChange={(e) => setStrategyInput(e.target.value)}
                placeholder="Describe your investment strategy in plain English..."
                className="min-h-[200px] bg-secondary/30 border-border/50 resize-none"
              />
              <div className="flex items-center gap-3 mt-4">
                <Button
                  variant="hero"
                  onClick={handleConvertToRules}
                  disabled={isConverting}
                  className="flex-1"
                >
                  {isConverting ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-pulse" />
                      Converting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Convert to Rules
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="glass-card p-6">
              <h3 className="font-semibold mb-3">Strategy Building Tips</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-gain mt-0.5" />
                  <span>Specify clear entry conditions (e.g., "buy when RSI is below 30")</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-gain mt-0.5" />
                  <span>Define exit rules for profit-taking and stop-loss</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-gain mt-0.5" />
                  <span>Set position sizing limits to manage risk</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-gain mt-0.5" />
                  <span>Include rebalancing frequency for systematic approach</span>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Rules Editor */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Strategy Rules</h2>
                <div className="flex items-center gap-2">
                  {ruleTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => addRule(type.value as Rule["type"])}
                      className="p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                      title={`Add ${type.label}`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                {Object.entries(groupedRules).map(([type, typeRules]) => (
                  <div key={type}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2 py-1 rounded-md border text-xs font-medium ${getRuleTypeStyle(type)}`}>
                        {getRuleTypeLabel(type)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {typeRules.length} rule{typeRules.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {typeRules.map((rule, index) => (
                        <motion.div
                          key={rule.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border/50 ${
                            !rule.enabled ? "opacity-50" : ""
                          }`}
                        >
                          <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                          <button
                            onClick={() => toggleRule(rule.id)}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                              rule.enabled
                                ? "bg-primary border-primary"
                                : "border-border"
                            }`}
                          >
                            {rule.enabled && <Check className="w-3 h-3 text-primary-foreground" />}
                          </button>
                          <span className="flex-1 text-sm font-mono">{rule.condition}</span>
                          <button
                            onClick={() => deleteRule(rule.id)}
                            className="p-1 rounded hover:bg-loss/20 text-muted-foreground hover:text-loss transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-border/50 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {rules.filter(r => r.enabled).length} of {rules.length} rules active
                </div>
                <Button variant="hero" className="group">
                  Run Backtest
                  <Play className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
