import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  ArrowRight,
  Zap,
  Shield,
  Target,
  RefreshCw
} from "lucide-react";

const riskLevels = ["Conservative", "Moderate", "Aggressive"];
const horizons = ["Short-term (1-3 months)", "Medium-term (6-12 months)", "Long-term (1-3 years)"];
const styles = ["Value", "Growth", "Momentum", "Dividend", "Quality"];
const sectors = ["Technology", "Banking", "Healthcare", "Consumer", "Energy", "Manufacturing"];

const mockIdeas = [
  {
    id: 1,
    title: "Banking Sector Momentum Play",
    theme: "Sector Rotation",
    description: "Capitalize on the ongoing credit growth in Indian banks with strong NIMs and improving asset quality.",
    rationale: "RBI's accommodative stance, rising credit demand, and improved NPA ratios create favorable conditions for large-cap private banks.",
    risks: ["Interest rate volatility", "Asset quality deterioration", "Regulatory changes"],
    expectedReturn: "+18-24%",
    confidence: 82,
    stocks: ["HDFCBANK", "ICICIBANK", "KOTAKBANK"],
  },
  {
    id: 2,
    title: "IT Services Value Opportunity",
    theme: "Contrarian Value",
    description: "Large-cap IT stocks trading at multi-year low valuations despite resilient deal pipelines and margin improvements.",
    rationale: "AI-driven efficiency gains, cost optimization, and strong USD hedge provide downside protection with recovery potential.",
    risks: ["US recession risk", "Delayed tech spending", "Visa policy changes"],
    expectedReturn: "+15-20%",
    confidence: 74,
    stocks: ["TCS", "INFY", "WIPRO"],
  },
  {
    id: 3,
    title: "EV & Green Energy Basket",
    theme: "Thematic Growth",
    description: "Long-term play on India's electric vehicle transition and renewable energy infrastructure buildout.",
    rationale: "Government subsidies, falling battery costs, and ESG mandates driving structural shift in automotive and power sectors.",
    risks: ["Execution risk", "Supply chain constraints", "High valuations"],
    expectedReturn: "+25-35%",
    confidence: 68,
    stocks: ["TATAMOTORS", "M&M", "TATAPOWER"],
  },
];

export default function Ideas() {
  const [selectedRisk, setSelectedRisk] = useState<string>("Moderate");
  const [selectedHorizon, setSelectedHorizon] = useState<string>("Medium-term (6-12 months)");
  const [selectedStyles, setSelectedStyles] = useState<string[]>(["Momentum", "Value"]);
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [ideas, setIdeas] = useState(mockIdeas);

  const handleGenerateIdeas = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 2000);
  };

  const toggleStyle = (style: string) => {
    setSelectedStyles(prev => 
      prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style]
    );
  };

  const toggleSector = (sector: string) => {
    setSelectedSectors(prev => 
      prev.includes(sector) ? prev.filter(s => s !== sector) : [...prev, sector]
    );
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">AI Investment Ideas</h1>
          <p className="text-muted-foreground">
            Discover personalized investment opportunities powered by AI analysis of Indian markets
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Preferences Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="glass-card p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <Target className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Your Preferences</h2>
              </div>

              {/* Risk Level */}
              <div className="mb-6">
                <label className="text-sm font-medium mb-3 block">Risk Tolerance</label>
                <div className="flex flex-wrap gap-2">
                  {riskLevels.map((risk) => (
                    <button
                      key={risk}
                      onClick={() => setSelectedRisk(risk)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedRisk === risk
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {risk}
                    </button>
                  ))}
                </div>
              </div>

              {/* Investment Horizon */}
              <div className="mb-6">
                <label className="text-sm font-medium mb-3 block">Investment Horizon</label>
                <div className="flex flex-col gap-2">
                  {horizons.map((horizon) => (
                    <button
                      key={horizon}
                      onClick={() => setSelectedHorizon(horizon)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium text-left transition-all ${
                        selectedHorizon === horizon
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {horizon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Investment Style */}
              <div className="mb-6">
                <label className="text-sm font-medium mb-3 block">Investment Style</label>
                <div className="flex flex-wrap gap-2">
                  {styles.map((style) => (
                    <button
                      key={style}
                      onClick={() => toggleStyle(style)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        selectedStyles.includes(style)
                          ? "bg-accent text-accent-foreground"
                          : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sectors */}
              <div className="mb-6">
                <label className="text-sm font-medium mb-3 block">Focus Sectors (optional)</label>
                <div className="flex flex-wrap gap-2">
                  {sectors.map((sector) => (
                    <button
                      key={sector}
                      onClick={() => toggleSector(sector)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        selectedSectors.includes(sector)
                          ? "bg-accent text-accent-foreground"
                          : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                      }`}
                    >
                      {sector}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                variant="hero"
                className="w-full"
                onClick={handleGenerateIdeas}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Generating Ideas...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate AI Ideas
                  </>
                )}
              </Button>
            </div>
          </motion.div>

          {/* Ideas Grid */}
          <div className="lg:col-span-2 space-y-6">
            {ideas.map((idea, index) => (
              <motion.div
                key={idea.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="glass-card p-6 hover-lift"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        {idea.theme}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Zap className="w-3 h-3" />
                        {idea.confidence}% Confidence
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold mb-1">{idea.title}</h3>
                    <p className="text-muted-foreground text-sm">{idea.description}</p>
                  </div>
                  <div className="text-right">
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
                    <span className="text-sm font-medium">AI Rationale</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{idea.rationale}</p>
                </div>

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

                {/* Stocks */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Suggested stocks:</span>
                    <div className="flex gap-1">
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
                  <Button variant="default" size="sm" className="group">
                    Convert to Strategy
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
