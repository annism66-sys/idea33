import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Target, RefreshCw, Sparkles } from "lucide-react";

const riskLevels = ["Conservative", "Moderate", "Aggressive"];
const horizons = ["Short-term (1-3 months)", "Medium-term (6-12 months)", "Long-term (1-3 years)"];
const styles = ["Value", "Growth", "Momentum", "Dividend", "Quality"];
const sectors = ["Technology", "Banking", "Healthcare", "Consumer", "Energy", "Manufacturing"];

interface PreferencesPanelProps {
  selectedRisk: string;
  setSelectedRisk: (risk: string) => void;
  selectedHorizon: string;
  setSelectedHorizon: (horizon: string) => void;
  selectedStyles: string[];
  toggleStyle: (style: string) => void;
  selectedSectors: string[];
  toggleSector: (sector: string) => void;
  isGenerating: boolean;
  onGenerate: () => void;
}

export function PreferencesPanel({
  selectedRisk, setSelectedRisk,
  selectedHorizon, setSelectedHorizon,
  selectedStyles, toggleStyle,
  selectedSectors, toggleSector,
  isGenerating, onGenerate,
}: PreferencesPanelProps) {
  return (
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
          onClick={onGenerate}
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
              Generate Ideas
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}
