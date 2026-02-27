import { create } from "zustand";

export interface InvestmentIdea {
  id: number;
  title: string;
  theme: string;
  description: string;
  rationale: string;
  risks: string[];
  expectedReturn: string;
  confidence: number;
  stocks: string[];
  riskScore: number;
  timeHorizon: string;
  entryLogic: string;
  exitLogic: string;
}

export interface StrategyStock {
  symbol: string;
  weight: number;
}

export interface Strategy {
  id: string;
  name: string;
  sourceIdea: InvestmentIdea | null;
  sourceTemplate: string | null;
  stocks: StrategyStock[];
  riskLevel: "Conservative" | "Balanced" | "Aggressive";
  timeHorizon: string;
  capitalAllocation: number;
  rebalancingFrequency: string;
  entryLogic: string;
  exitLogic: string;
}

export interface RiskBudget {
  maxDrawdown: number;
  maxSingleStockAllocation: number;
  sectorExposureLimit: number;
  volatilityTolerance: number;
  targetSharpe: number | null;
  validated: boolean;
  violations: string[];
}

interface StrategyStore {
  // Ideas
  convertedIdea: InvestmentIdea | null;
  setConvertedIdea: (idea: InvestmentIdea | null) => void;
  
  // Generated ideas list (persisted across navigation)
  generatedIdeas: InvestmentIdea[];
  setGeneratedIdeas: (ideas: InvestmentIdea[]) => void;

  // Active strategy
  activeStrategy: Strategy | null;
  setActiveStrategy: (strategy: Strategy | null) => void;

  // Risk budget
  riskBudget: RiskBudget;
  setRiskBudget: (budget: Partial<RiskBudget>) => void;
  
  // Flow state
  flowStep: "strategy" | "risk" | "backtest";
  setFlowStep: (step: "strategy" | "risk" | "backtest") => void;
  
  // Custom backtest stocks
  backtestStocks: string[];
  setBacktestStocks: (stocks: string[]) => void;
}

export const useStrategyStore = create<StrategyStore>((set) => ({
  convertedIdea: null,
  setConvertedIdea: (idea) => set({ convertedIdea: idea }),

  generatedIdeas: [],
  setGeneratedIdeas: (ideas) => set({ generatedIdeas: ideas }),

  activeStrategy: null,
  setActiveStrategy: (strategy) => set({ activeStrategy: strategy }),

  riskBudget: {
    maxDrawdown: 15,
    maxSingleStockAllocation: 25,
    sectorExposureLimit: 35,
    volatilityTolerance: 20,
    targetSharpe: null,
    validated: false,
    violations: [],
  },
  setRiskBudget: (budget) =>
    set((state) => ({ riskBudget: { ...state.riskBudget, ...budget } })),

  flowStep: "strategy",
  setFlowStep: (step) => set({ flowStep: step }),

  backtestStocks: [],
  setBacktestStocks: (stocks) => set({ backtestStocks: stocks }),
}));
