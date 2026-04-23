import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Ideas from "./pages/Ideas";
import Strategy from "./pages/Strategy";
import RiskBudget from "./pages/RiskBudget";
import Backtest from "./pages/Backtest";
import ExecutionFeasibility from "./pages/ExecutionFeasibility";
import Portfolio from "./pages/Portfolio";
import Agent from "./pages/Agent";
import NotFound from "./pages/NotFound";
import Plans from "./pages/Plans";
import OptionsIntelligence from "./pages/OptionsIntelligence";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Navigate to="/portfolio" replace />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/ideas" element={<ProtectedRoute><Ideas /></ProtectedRoute>} />
          <Route path="/strategy" element={<ProtectedRoute><Strategy /></ProtectedRoute>} />
          <Route path="/risk-budget" element={<ProtectedRoute><RiskBudget /></ProtectedRoute>} />
          <Route path="/backtest" element={<ProtectedRoute><Backtest /></ProtectedRoute>} />
          <Route path="/execution-feasibility" element={<ProtectedRoute><ExecutionFeasibility /></ProtectedRoute>} />
          <Route path="/portfolio" element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
          <Route path="/agent" element={<ProtectedRoute><Agent /></ProtectedRoute>} />
          <Route path="/options-intelligence" element={<ProtectedRoute><OptionsIntelligence /></ProtectedRoute>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
