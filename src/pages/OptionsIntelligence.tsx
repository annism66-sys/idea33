import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BarChart3 } from "lucide-react";
import { OptionProbabilityEngine } from "@/components/options/OptionProbabilityEngine";
import { PLDistributionSimulator } from "@/components/options/PLDistributionSimulator";
import { IVRankIntelligence } from "@/components/options/IVRankIntelligence";
import { ThetaDecayCountdown } from "@/components/options/ThetaDecayCountdown";
import { RegimeDetection } from "@/components/intelligence/RegimeDetection";
import { AdvancedIntelligenceModules } from "@/components/intelligence/AdvancedIntelligenceModules";
import { UpgradeGate } from "@/components/UpgradeGate";

export default function OptionsIntelligence() {
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-4">
            <BarChart3 className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent">Options & Intelligence Suite</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Smart Intelligence Engine</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Probabilistic options analytics, regime detection, and advanced decision intelligence — powered by AI.
          </p>
        </motion.div>

        {/* Option Intelligence — Pro */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="text-2xl font-bold mb-6">Option Intelligence</h2>
          <UpgradeGate requiredPlan="pro" featureName="Option Intelligence Engine">
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              <OptionProbabilityEngine />
              <PLDistributionSimulator />
            </div>
            <div className="grid lg:grid-cols-2 gap-6">
              <IVRankIntelligence />
              <ThetaDecayCountdown />
            </div>
          </UpgradeGate>
        </motion.div>

        {/* Regime Detection — Pro */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-12">
          <UpgradeGate requiredPlan="pro" featureName="Regime Detection System">
            <RegimeDetection />
          </UpgradeGate>
        </motion.div>

        {/* Advanced Intelligence — Institutional */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Advanced Intelligence</h2>
          <UpgradeGate requiredPlan="institutional" featureName="Advanced Intelligence Suite">
            <AdvancedIntelligenceModules />
          </UpgradeGate>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
