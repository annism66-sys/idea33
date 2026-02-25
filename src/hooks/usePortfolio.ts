import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

import { toast } from "@/hooks/use-toast";

export interface Holding {
  id: string;
  stock_symbol: string;
  stock_name: string;
  quantity: number;
  average_price: number;
  current_price: number | null;
  sector: string | null;
  exchange: string | null;
  broker_source: string | null;
  created_at: string;
}

export function usePortfolio() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHoldings = async () => {
    try {
      const { data, error } = await supabase
        .from("portfolio_holdings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setHoldings(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching portfolio",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHoldings();
  }, []);

  const addHolding = async (holding: Omit<Holding, "id" | "created_at">) => {
    try {
      const { data, error } = await supabase
        .from("portfolio_holdings")
        .insert([{ ...holding, user_id: "anonymous" }])
        .select()
        .single();

      if (error) throw error;
      setHoldings(prev => [data, ...prev]);
      toast({ title: "Success", description: "Holding added to portfolio" });
      return data;
    } catch (error: any) {
      toast({
        title: "Error adding holding",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const updateHolding = async (id: string, updates: Partial<Holding>) => {
    try {
      const { data, error } = await supabase
        .from("portfolio_holdings")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      setHoldings(prev => prev.map(h => h.id === id ? data : h));
      toast({ title: "Success", description: "Holding updated" });
      return data;
    } catch (error: any) {
      toast({
        title: "Error updating holding",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteHolding = async (id: string) => {
    try {
      const { error } = await supabase
        .from("portfolio_holdings")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setHoldings(prev => prev.filter(h => h.id !== id));
      toast({ title: "Success", description: "Holding removed" });
      return true;
    } catch (error: any) {
      toast({
        title: "Error removing holding",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const totalValue = holdings.reduce(
    (sum, h) => sum + h.quantity * (h.current_price || h.average_price),
    0
  );

  const totalInvested = holdings.reduce(
    (sum, h) => sum + h.quantity * h.average_price,
    0
  );

  const totalPnL = totalValue - totalInvested;
  const totalPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

  return {
    holdings,
    loading,
    addHolding,
    updateHolding,
    deleteHolding,
    refetch: fetchHoldings,
    totalValue,
    totalInvested,
    totalPnL,
    totalPnLPercent,
  };
}
