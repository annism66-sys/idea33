import { create } from "zustand";

export type PlanTier = "basic" | "pro" | "institutional";

export interface PlanFeature {
  name: string;
  basic: boolean;
  pro: boolean;
  institutional: boolean;
}

export const planFeatures: PlanFeature[] = [
  { name: "Portfolio Sync (Read-only)", basic: true, pro: true, institutional: true },
  { name: "Core Risk Dashboard", basic: true, pro: true, institutional: true },
  { name: "Intelligent Idea Generation", basic: true, pro: true, institutional: true },
  { name: "Strategy Simulation", basic: true, pro: true, institutional: true },
  { name: "Basic Option Probability", basic: true, pro: true, institutional: true },
  { name: "Limited Behavioral Alerts", basic: true, pro: true, institutional: true },
  { name: "Standard Explanations", basic: true, pro: true, institutional: true },
  { name: "Live Risk Radar", basic: false, pro: true, institutional: true },
  { name: "Continuous Portfolio Monitoring", basic: false, pro: true, institutional: true },
  { name: "Behavioral Intelligence Engine", basic: false, pro: true, institutional: true },
  { name: "Advanced Strategy Builder", basic: false, pro: true, institutional: true },
  { name: "Option Probability Engine", basic: false, pro: true, institutional: true },
  { name: "P/L Distribution Simulator", basic: false, pro: true, institutional: true },
  { name: "IV Rank Intelligence", basic: false, pro: true, institutional: true },
  { name: "Regime Detection", basic: false, pro: true, institutional: true },
  { name: "Risk Budget System", basic: false, pro: true, institutional: true },
  { name: "Emotional Risk Meter", basic: false, pro: true, institutional: true },
  { name: "Edge Tracker", basic: false, pro: true, institutional: true },
  { name: "Advanced Alerts", basic: false, pro: true, institutional: true },
  { name: "Multi-Portfolio Monitoring", basic: false, pro: false, institutional: true },
  { name: "Client-Level Dashboard", basic: false, pro: false, institutional: true },
  { name: "Drawdown Probability Modeling", basic: false, pro: false, institutional: true },
  { name: "Strategy Quality Score Engine", basic: false, pro: false, institutional: true },
  { name: "Capital Survival Probability", basic: false, pro: false, institutional: true },
  { name: "Trade Replay Analytics", basic: false, pro: false, institutional: true },
  { name: "Exportable Compliance Logs", basic: false, pro: false, institutional: true },
  { name: "Volatility Shock Simulations", basic: false, pro: false, institutional: true },
  { name: "API Access", basic: false, pro: false, institutional: true },
];

export const planDetails = {
  basic: {
    name: "Basic",
    tagline: "For Retail Investors",
    price: "Free",
    period: "/month",
    color: "primary" as const,
    description: "Perfect for beginner and intermediate investors starting their intelligent investing journey.",
    featureCount: planFeatures.filter((f) => f.basic).length,
  },
  pro: {
    name: "Pro",
    tagline: "For Active Traders",
    price: "₹4,999",
    period: "/month",
    color: "accent" as const,
    description: "Full-suite analytics for active traders who demand institutional-grade intelligence.",
    featureCount: planFeatures.filter((f) => f.pro).length,
    popular: true,
  },
  institutional: {
    name: "Institutional",
    tagline: "PMS / Professional",
    price: "₹24,999",
    period: "/month",
    color: "warning" as const,
    description: "Enterprise-grade platform for portfolio managers, PMS operators, and professional firms.",
    featureCount: planFeatures.filter((f) => f.institutional).length,
  },
};

interface PlanStore {
  currentPlan: PlanTier;
  setCurrentPlan: (plan: PlanTier) => void;
  hasAccess: (requiredPlan: PlanTier) => boolean;
}

const planHierarchy: Record<PlanTier, number> = {
  basic: 0,
  pro: 1,
  institutional: 2,
};

export const usePlanStore = create<PlanStore>((set, get) => ({
  currentPlan: "basic",
  setCurrentPlan: (plan) => set({ currentPlan: plan }),
  hasAccess: (requiredPlan) => {
    return planHierarchy[get().currentPlan] >= planHierarchy[requiredPlan];
  },
}));
