import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PreferencesPanel } from "@/components/ideas/PreferencesPanel";
import { IdeaCard } from "@/components/ideas/IdeaCard";
import { useStrategyStore, InvestmentIdea } from "@/stores/useStrategyStore";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Sparkles, Loader2 } from "lucide-react";

export default function Ideas() {
  const navigate = useNavigate();
  const { setConvertedIdea, setFlowStep, generatedIdeas, setGeneratedIdeas } = useStrategyStore();

  const [selectedRisk, setSelectedRisk] = useState<string>("Moderate");
  const [selectedHorizon, setSelectedHorizon] = useState<string>("Medium-term (6-12 months)");
  const [selectedStyles, setSelectedStyles] = useState<string[]>(["Momentum", "Value"]);
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [ideas, setIdeas] = useState<InvestmentIdea[]>(generatedIdeas);
  const [hasGenerated, setHasGenerated] = useState(generatedIdeas.length > 0);

  const handleGenerateIdeas = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-ideas", {
        body: {
          riskTolerance: selectedRisk,
          horizon: selectedHorizon,
          styles: selectedStyles,
          sectors: selectedSectors,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setIdeas(data.ideas || []);
      setGeneratedIdeas(data.ideas || []);
      setHasGenerated(true);
    } catch (error: any) {
      console.error("Error generating ideas:", error);
      toast({
        title: "Error generating ideas",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConvertToStrategy = (idea: InvestmentIdea) => {
    setConvertedIdea(idea);
    setFlowStep("strategy");
    toast({
      title: "Idea converted!",
      description: `"${idea.title}" has been sent to the Strategy Builder`,
    });
    navigate("/strategy");
  };

  const toggleStyle = (style: string) => {
    setSelectedStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    );
  };

  const toggleSector = (sector: string) => {
    setSelectedSectors((prev) =>
      prev.includes(sector) ? prev.filter((s) => s !== sector) : [...prev, sector]
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
          <h1 className="text-3xl font-bold mb-2">Intelligent Investment Ideas</h1>
          <p className="text-muted-foreground">
            Discover personalized investment opportunities powered by advanced analysis of Indian markets
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          <PreferencesPanel
            selectedRisk={selectedRisk}
            setSelectedRisk={setSelectedRisk}
            selectedHorizon={selectedHorizon}
            setSelectedHorizon={setSelectedHorizon}
            selectedStyles={selectedStyles}
            toggleStyle={toggleStyle}
            selectedSectors={selectedSectors}
            toggleSector={toggleSector}
            isGenerating={isGenerating}
            onGenerate={handleGenerateIdeas}
          />

          {/* Ideas Grid */}
          <div className="lg:col-span-2 space-y-6">
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card p-12 text-center"
              >
                <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Analyzing Indian Markets...</h3>
                <p className="text-muted-foreground text-sm">
                  Running sentiment analysis, earnings evaluation, technical screening, and macro assessment
                </p>
              </motion.div>
            )}

            {!isGenerating && !hasGenerated && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-12 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Ready to Generate Ideas</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Set your preferences on the left and click "Generate Ideas" to get personalized investment opportunities
                </p>
              </motion.div>
            )}

            {!isGenerating &&
              ideas.map((idea, index) => (
                <IdeaCard
                  key={idea.id}
                  idea={idea}
                  index={index}
                  onConvertToStrategy={handleConvertToStrategy}
                />
              ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
