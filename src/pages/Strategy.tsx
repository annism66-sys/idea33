import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Sparkles, Play, Plus, Trash2, GripVertical, Check, Wand2,
  TrendingUp, TrendingDown, Target, RefreshCw, Lightbulb, Zap,
  Shield, ArrowRight, Info, Star, AlertTriangle, Package
} from "lucide-react";
import { useStrategyStore, StrategyStock } from "@/stores/useStrategyStore";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

interface Rule {
  id: string;
  type: "entry" | "exit" | "position" | "rebalance";
  condition: string;
  enabled: boolean;
}

const ruleTypes = [
  { value: "entry", label: "Entry Signal", icon: TrendingUp, gradient: "from-gain/20 to-gain/5", border: "border-gain/30", text: "text-gain", glow: "shadow-gain/20" },
  { value: "exit", label: "Exit Signal", icon: TrendingDown, gradient: "from-loss/20 to-loss/5", border: "border-loss/30", text: "text-loss", glow: "shadow-loss/20" },
  { value: "position", label: "Position Size", icon: Target, gradient: "from-accent/20 to-accent/5", border: "border-accent/30", text: "text-accent", glow: "shadow-accent/20" },
  { value: "rebalance", label: "Rebalancing", icon: RefreshCw, gradient: "from-warning/20 to-warning/5", border: "border-warning/30", text: "text-warning", glow: "shadow-warning/20" },
];

const tips = [
  { icon: Lightbulb, text: "Specify clear entry conditions (e.g., \"buy when RSI is below 30\")" },
  { icon: Shield, text: "Define exit rules for profit-taking and stop-loss" },
  { icon: Target, text: "Set position sizing limits to manage risk" },
  { icon: RefreshCw, text: "Include rebalancing frequency for systematic approach" },
];

const readyMadeStrategies = [
  {
    name: "Nifty Momentum Alpha",
    badge: "Popular",
    description: "A momentum-based strategy tracking top Nifty 50 stocks with strong relative strength.",
    performance: { oneYear: "+32.45%", inception: "+156.8%" },
    riskScore: 3.8,
    methodology: "Ranks Nifty 50 by 6-month momentum, holds top 10, rebalances monthly",
    stocks: ["RELIANCE", "TCS", "HDFCBANK", "INFY", "ICICIBANK", "BHARTIARTL", "ITC", "KOTAKBANK", "SBIN", "AXISBANK"],
  },
  {
    name: "Banking Sector Rotation",
    badge: "Partner Fund",
    description: "Rotates between PSU and private banks based on relative value and momentum signals.",
    performance: { oneYear: "+28.12%", inception: "+89.2%" },
    riskScore: 4.1,
    methodology: "RSI-based entry, tracks Bank Nifty constituents with sector rotation",
    stocks: ["HDFCBANK", "ICICIBANK", "KOTAKBANK", "SBIN", "AXISBANK", "BANKBARODA"],
  },
  {
    name: "Dividend Yield Compounder",
    badge: "Low Risk",
    description: "Focuses on high dividend yield stocks with consistent payout history and low volatility.",
    performance: { oneYear: "+18.76%", inception: "+67.4%" },
    riskScore: 2.4,
    methodology: "Selects top 15 dividend yield stocks, minimum 5-year payout history",
    stocks: ["ITC", "COALINDIA", "HINDUNILVR", "POWERGRID", "ONGC", "NTPC"],
  },
  {
    name: "Small Cap Growth Hunter",
    badge: "High Risk",
    description: "Aggressive strategy targeting small-cap stocks with strong earnings growth momentum.",
    performance: { oneYear: "+45.23%", inception: "+210.5%" },
    riskScore: 4.8,
    methodology: "EPS growth > 20%, market cap < 5000 Cr, quarterly rebalancing",
    stocks: ["TATAELXSI", "PERSISTENT", "COFORGE", "MPHASIS", "LTTS"],
  },
];

const rebalancingOptions = ["Weekly", "Monthly", "Quarterly", "Semi-Annually", "Annually"];

export default function Strategy() {
  const navigate = useNavigate();
  const { convertedIdea, setConvertedIdea, setActiveStrategy, setFlowStep, backtestStocks, setBacktestStocks } = useStrategyStore();

  const [strategyInput, setStrategyInput] = useState(
    "I want to buy large-cap Indian stocks that are showing momentum with strong fundamentals. Enter when RSI is oversold and price is above the 200-day moving average. Exit when RSI becomes overbought or if the stock drops more than 15%. Limit each position to 10% of the portfolio with a maximum of 5 stocks."
  );
  const [rules, setRules] = useState<Rule[]>([]);
  const [isConverting, setIsConverting] = useState(false);

  // Strategy config state
  const [strategyStocks, setStrategyStocks] = useState<StrategyStock[]>([]);
  const [riskLevel, setRiskLevel] = useState<"Conservative" | "Balanced" | "Aggressive">("Balanced");
  const [capitalAllocation, setCapitalAllocation] = useState(500000);
  const [rebalancingFreq, setRebalancingFreq] = useState("Monthly");
  const [strategyName, setStrategyName] = useState("");
  const [sourceTemplate, setSourceTemplate] = useState<string | null>(null);
  const [customStockInput, setCustomStockInput] = useState("");

  // Import from converted idea
  useEffect(() => {
    if (convertedIdea) {
      setStrategyName(convertedIdea.title);
      const equalWeight = Math.floor(100 / convertedIdea.stocks.length);
      setStrategyStocks(
        convertedIdea.stocks.map((s, i) => ({
          symbol: s,
          weight: i === 0 ? 100 - equalWeight * (convertedIdea.stocks.length - 1) : equalWeight,
        }))
      );

      const newRules: Rule[] = [];
      if (convertedIdea.entryLogic) {
        newRules.push({ id: "entry-1", type: "entry", condition: convertedIdea.entryLogic, enabled: true });
      }
      if (convertedIdea.exitLogic) {
        newRules.push({ id: "exit-1", type: "exit", condition: convertedIdea.exitLogic, enabled: true });
      }
      newRules.push({ id: "pos-1", type: "position", condition: `Equal weight across ${convertedIdea.stocks.length} stocks`, enabled: true });
      setRules(newRules);

      setStrategyInput(convertedIdea.description + " " + convertedIdea.rationale);
      setSourceTemplate(null);

      toast({
        title: "Idea Imported",
        description: `"${convertedIdea.title}" with ${convertedIdea.stocks.length} stocks loaded into Strategy Builder`,
      });
    }
  }, [convertedIdea]);

  const handleSelectTemplate = (template: typeof readyMadeStrategies[0]) => {
    setStrategyName(template.name);
    setConvertedIdea(null);
    setSourceTemplate(template.name);
    const equalWeight = Math.floor(100 / template.stocks.length);
    setStrategyStocks(
      template.stocks.map((s, i) => ({
        symbol: s,
        weight: i === 0 ? 100 - equalWeight * (template.stocks.length - 1) : equalWeight,
      }))
    );
    setRules([
      { id: "t-1", type: "entry", condition: template.methodology, enabled: true },
      { id: "t-2", type: "position", condition: `Equal weight across ${template.stocks.length} stocks`, enabled: true },
      { id: "t-3", type: "rebalance", condition: "Monthly rebalancing", enabled: true },
    ]);
    setStrategyInput(template.description + " " + template.methodology);
    toast({ title: "Template Applied", description: `${template.name} loaded into Strategy Builder` });
  };

  const handleConvertToRules = () => {
    setIsConverting(true);
    setTimeout(() => setIsConverting(false), 2000);
  };

  const toggleRule = (id: string) => {
    setRules(rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const deleteRule = (id: string) => {
    setRules(rules.filter(r => r.id !== id));
  };

  const addRule = (type: Rule["type"]) => {
    setRules([...rules, { id: Date.now().toString(), type, condition: "New condition - click to edit", enabled: true }]);
  };

  const updateStockWeight = (index: number, weight: number) => {
    setStrategyStocks(prev => prev.map((s, i) => i === index ? { ...s, weight } : s));
  };

  const removeStock = (index: number) => {
    setStrategyStocks(prev => prev.filter((_, i) => i !== index));
  };

  const addCustomStock = () => {
    const symbol = customStockInput.trim().toUpperCase();
    if (!symbol) return;
    if (strategyStocks.some(s => s.symbol === symbol)) {
      toast({ title: "Stock already added", description: `${symbol} is already in the allocation`, variant: "destructive" });
      return;
    }
    const newWeight = Math.max(1, Math.floor(100 / (strategyStocks.length + 1)));
    setStrategyStocks(prev => [...prev, { symbol, weight: newWeight }]);
    setCustomStockInput("");
    toast({ title: "Stock Added", description: `${symbol} added to strategy` });
  };

  const totalWeight = strategyStocks.reduce((sum, s) => sum + s.weight, 0);

  const handleProceedToRisk = () => {
    if (strategyStocks.length === 0) {
      toast({ title: "No stocks selected", description: "Import an idea or select a template first", variant: "destructive" });
      return;
    }
    if (Math.abs(totalWeight - 100) > 1) {
      toast({ title: "Weights must sum to 100%", description: `Current total: ${totalWeight}%`, variant: "destructive" });
      return;
    }

    setActiveStrategy({
      id: Date.now().toString(),
      name: strategyName || "Custom Strategy",
      sourceIdea: convertedIdea,
      sourceTemplate,
      stocks: strategyStocks,
      riskLevel,
      timeHorizon: convertedIdea?.timeHorizon || "Medium-term",
      capitalAllocation,
      rebalancingFrequency: rebalancingFreq,
      entryLogic: rules.filter(r => r.type === "entry" && r.enabled).map(r => r.condition).join("; "),
      exitLogic: rules.filter(r => r.type === "exit" && r.enabled).map(r => r.condition).join("; "),
    });
    setFlowStep("risk");
    navigate("/risk-budget");
  };

  const getRuleType = (type: string) => ruleTypes.find(t => t.value === type);

  const groupedRules = rules.reduce((acc, rule) => {
    if (!acc[rule.type]) acc[rule.type] = [];
    acc[rule.type].push(rule);
    return acc;
  }, {} as Record<string, Rule[]>);

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Intelligent Strategy Builder</span>
          </div>
          <h1 className="text-4xl font-bold mb-3">Build Your Strategy</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {convertedIdea
              ? `Building strategy from: "${convertedIdea.title}"`
              : "Describe your strategy in plain English or select a template"
            }
          </p>
        </motion.div>

        {/* Imported Idea Banner */}
        {convertedIdea && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-primary" />
              <div>
                <span className="font-medium text-sm">Imported from Ideas:</span>
                <span className="text-sm text-muted-foreground ml-2">{convertedIdea.title} • {convertedIdea.theme} • {convertedIdea.confidence}% confidence</span>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setConvertedIdea(null)}>
              Clear
            </Button>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Input & Config */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {/* Stock Allocation */}
            {strategyStocks.length > 0 && (
              <div className="glass-card-elevated p-6 rounded-2xl">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  Stock Allocation
                  <span className={`ml-auto text-sm font-mono ${Math.abs(totalWeight - 100) <= 1 ? 'text-gain' : 'text-loss'}`}>
                    {totalWeight}% / 100%
                  </span>
                </h3>
                <div className="space-y-3">
                  {strategyStocks.map((stock, idx) => (
                    <div key={stock.symbol} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                      <span className="font-mono text-sm font-medium w-24">{stock.symbol}</span>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={stock.weight}
                        onChange={(e) => updateStockWeight(idx, Number(e.target.value))}
                        className="flex-1 accent-primary"
                      />
                      <span className="font-mono text-sm w-12 text-right">{stock.weight}%</span>
                      <button onClick={() => removeStock(idx)} className="text-muted-foreground hover:text-loss transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Custom Stocks */}
            <div className="glass-card-elevated p-6 rounded-2xl">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4 text-primary" />
                Add Stocks for Backtesting
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                Enter NSE stock symbols to include in your strategy and backtest
              </p>
              <div className="flex gap-2 mb-3">
                <Input
                  value={customStockInput}
                  onChange={(e) => setCustomStockInput(e.target.value.toUpperCase())}
                  placeholder="e.g. RELIANCE, TCS, INFY"
                  className="font-mono text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addCustomStock();
                  }}
                />
                <Button variant="outline" size="sm" onClick={addCustomStock} className="shrink-0">
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </div>
              {strategyStocks.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {strategyStocks.map((s, idx) => (
                    <Badge key={s.symbol} variant="secondary" className="font-mono text-xs gap-1 cursor-pointer hover:bg-loss/20 transition-colors" onClick={() => removeStock(idx)}>
                      {s.symbol}
                      <Trash2 className="w-3 h-3" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Strategy Config */}
            <div className="glass-card-elevated p-6 rounded-2xl">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                Strategy Configuration
              </h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm">Strategy Name</Label>
                  <Input
                    value={strategyName}
                    onChange={(e) => setStrategyName(e.target.value)}
                    placeholder="My Investment Strategy"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm">Risk Level</Label>
                  <div className="flex gap-2 mt-1">
                    {(["Conservative", "Balanced", "Aggressive"] as const).map((level) => (
                      <button
                        key={level}
                        onClick={() => setRiskLevel(level)}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          riskLevel === level
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm">Capital Allocation (₹)</Label>
                  <Input
                    type="number"
                    value={capitalAllocation}
                    onChange={(e) => setCapitalAllocation(Number(e.target.value))}
                    className="mt-1 font-mono"
                  />
                </div>
                <div>
                  <Label className="text-sm">Rebalancing Frequency</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {rebalancingOptions.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setRebalancingFreq(opt)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          rebalancingFreq === opt
                            ? "bg-accent text-accent-foreground"
                            : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Natural Language Input */}
            <div className="relative group">
              <div className="absolute -inset-[1px] bg-gradient-to-r from-primary/50 via-accent/50 to-primary/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
              <div className="relative glass-card-elevated p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                    <Wand2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Describe Your Strategy</h2>
                    <p className="text-xs text-muted-foreground">Use natural language to define your rules</p>
                  </div>
                </div>
                <Textarea
                  value={strategyInput}
                  onChange={(e) => setStrategyInput(e.target.value)}
                  placeholder="Describe your investment strategy in plain English..."
                  className="min-h-[120px] bg-secondary/50 border-border/50 resize-none text-sm leading-relaxed focus:border-primary/50 transition-colors rounded-xl"
                />
                <motion.div className="mt-4" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                  <Button variant="hero" onClick={handleConvertToRules} disabled={isConverting} className="w-full h-11 text-sm">
                    {isConverting ? (
                      <><Sparkles className="w-4 h-4 animate-spin" /> Converting...</>
                    ) : (
                      <><Sparkles className="w-4 h-4" /> Convert to Rules</>
                    )}
                  </Button>
                </motion.div>
              </div>
            </div>

            {/* Tips */}
            <div className="glass-card p-5 rounded-2xl">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-warning" />
                Strategy Building Tips
              </h3>
              <div className="space-y-3">
                {tips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-xl bg-secondary/30">
                    <div className="p-1.5 rounded-lg bg-gain/10">
                      <tip.icon className="w-3.5 h-3.5 text-gain" />
                    </div>
                    <span className="text-sm text-muted-foreground">{tip.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ready-Made Strategies */}
            <div className="glass-card p-5 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Star className="w-4 h-4 text-primary" />
                  Ready-Made Strategies
                </h3>
                <span className="text-xs text-muted-foreground">Click to apply</span>
              </div>
              <div className="space-y-3">
                {readyMadeStrategies.map((strategy) => (
                  <div
                    key={strategy.name}
                    onClick={() => handleSelectTemplate(strategy)}
                    className="group p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 border border-border/50 hover:border-primary/30 transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">{strategy.name}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            strategy.badge === 'Popular' ? 'bg-primary/10 text-primary' :
                            strategy.badge === 'Partner Fund' ? 'bg-accent/10 text-accent' :
                            strategy.badge === 'Low Risk' ? 'bg-gain/10 text-gain' :
                            'bg-loss/10 text-loss'
                          }`}>
                            {strategy.badge}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{strategy.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="text-[10px] text-muted-foreground">1-Year</div>
                          <div className="text-sm font-mono font-medium text-gain">{strategy.performance.oneYear}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-muted-foreground">Risk Score</div>
                          <div className="text-sm font-mono font-medium">
                            <span className={strategy.riskScore < 3 ? 'text-gain' : strategy.riskScore < 4 ? 'text-warning' : 'text-loss'}>{strategy.riskScore}</span>
                            <span className="text-muted-foreground">/5</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>Apply</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Column - Rules Editor */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="glass-card-elevated p-6 rounded-2xl sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold">Strategy Rules</h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    {rules.filter(r => r.enabled).length} of {rules.length} rules active
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  {ruleTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <motion.button
                        key={type.value}
                        onClick={() => addRule(type.value as Rule["type"])}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className={`p-2 rounded-lg bg-gradient-to-br ${type.gradient} border ${type.border} ${type.text} hover:shadow-lg ${type.glow} transition-all`}
                        title={`Add ${type.label}`}
                      >
                        <Plus className="w-4 h-4" />
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-5 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {rules.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Info className="w-8 h-8 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No rules yet. Import an idea, select a template, or add rules manually.</p>
                  </div>
                )}
                <AnimatePresence mode="popLayout">
                  {Object.entries(groupedRules).map(([type, typeRules]) => {
                    const ruleType = getRuleType(type);
                    if (!ruleType) return null;
                    const Icon = ruleType.icon;
                    return (
                      <motion.div key={type} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        <div className="flex items-center gap-2 mb-3">
                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r ${ruleType.gradient} border ${ruleType.border}`}>
                            <Icon className={`w-3.5 h-3.5 ${ruleType.text}`} />
                            <span className={`text-xs font-semibold ${ruleType.text}`}>{ruleType.label}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{typeRules.length} rule{typeRules.length !== 1 ? "s" : ""}</span>
                        </div>
                        <div className="space-y-2 ml-1">
                          <AnimatePresence mode="popLayout">
                            {typeRules.map((rule, index) => (
                              <motion.div
                                key={rule.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95, x: -20 }}
                                className={`group flex items-center gap-3 p-3.5 rounded-xl bg-secondary/40 border border-border/50 hover:bg-secondary/60 transition-all ${!rule.enabled ? "opacity-40" : ""}`}
                              >
                                <GripVertical className="w-4 h-4 text-muted-foreground/50 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" />
                                <motion.button
                                  onClick={() => toggleRule(rule.id)}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                                    rule.enabled ? `bg-gradient-to-br ${ruleType.gradient} ${ruleType.border}` : "border-border hover:border-muted-foreground"
                                  }`}
                                >
                                  {rule.enabled && <Check className={`w-3 h-3 ${ruleType.text}`} />}
                                </motion.button>
                                <span className="flex-1 text-sm font-mono text-foreground/90">{rule.condition}</span>
                                <motion.button
                                  onClick={() => deleteRule(rule.id)}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-loss/20 text-muted-foreground hover:text-loss transition-all"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </motion.button>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Proceed Button */}
              <div className="mt-6 pt-6 border-t border-border/50 space-y-3">
                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                  <Button
                    variant="hero"
                    className="w-full h-12 text-base group relative overflow-hidden"
                    onClick={handleProceedToRisk}
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <Shield className="w-5 h-5" />
                    <span>Proceed to Risk Validation</span>
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </motion.div>
                {strategyStocks.length > 0 && Math.abs(totalWeight - 100) > 1 && (
                  <div className="flex items-center gap-2 text-xs text-loss">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Weights must sum to 100% (currently {totalWeight}%)
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: hsl(var(--border)); border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: hsl(var(--muted-foreground)); }
      `}</style>
    </DashboardLayout>
  );
}
