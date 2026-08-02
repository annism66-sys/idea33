import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { useBrokerConnection } from "@/hooks/useBrokerConnection";
import { useAngelOneWebSocket } from "@/hooks/useAngelOneWebSocket";


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
  const { user } = useAuth();
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshingPrices, setRefreshingPrices] = useState(false);
  const { isConnected: angelConnected, refetch: refetchBroker } =
    useBrokerConnection("angelone");


  const fetchHoldings = async () => {
    if (!user) {
      setHoldings([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("portfolio_holdings")
        .select("*")
        .eq("user_id", user.id)
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
  }, [user]);

  const addHolding = async (holding: Omit<Holding, "id" | "created_at">) => {
    if (!user) return null;
    try {
      const { data, error } = await supabase
        .from("portfolio_holdings")
        .insert([{ ...holding, user_id: user.id }])
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

  /** Apply live LTP ticks to local state without a full refetch. */
  const applyLivePrices = useCallback((updates: { symbol: string; price: number }[]) => {
    setHoldings(prev =>
      prev.map(h => {
        const hit = updates.find(u => u.symbol === h.stock_symbol);
        return hit ? { ...h, current_price: hit.price } : h;
      })
    );
  }, []);

  const live = useAngelOneWebSocket({
    enabled: !!user && angelConnected,
    onPrices: applyLivePrices,
  });

  /**
   * Manual price refresh. Uses Angel One LTP when a broker connection exists,
   * otherwise falls back to the Yahoo-backed update-stock-prices function.
   */
  const refreshPrices = useCallback(async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Sign in to refresh live prices.",
        variant: "destructive",
      });
      return [];
    }

    setRefreshingPrices(true);
    try {
      const fn = angelConnected ? "angel-one-ltp" : "update-stock-prices";
      const { data, error } = await supabase.functions.invoke(fn, { body: {} });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const updates: { symbol: string; price: number }[] = data?.prices ?? [];
      if (updates.length > 0) applyLivePrices(updates);

      toast({
        title: updates.length > 0 ? "Prices updated" : "No updates",
        description:
          updates.length > 0
            ? `${updates.length} holdings refreshed from ${
                angelConnected ? "Angel One" : "market data"
              }.`
            : "No live prices were available for your holdings.",
      });
      return updates;
    } catch (error: any) {
      toast({
        title: "Price refresh failed",
        description: error?.message ?? "Could not fetch latest prices.",
        variant: "destructive",
      });
      return [];
    } finally {
      setRefreshingPrices(false);
    }
  }, [user, angelConnected, applyLivePrices]);

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
    refreshPrices,
    refreshingPrices,
    angelConnected,
    refetchBroker,
    marketOpen: live.marketOpen,
    isStreaming: live.isStreaming,
    lastTick: live.lastTick,
    totalValue,
    totalInvested,
    totalPnL,
    totalPnLPercent,
  };

}
