import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useBrokerConnection } from "@/hooks/useBrokerConnection";

interface PriceUpdate {
  symbol: string;
  price: number;
  change?: number;
  changePercent?: number;
}

/**
 * Manual price refresh.
 * Routes to Angel One's live LTP feed when the user has an active Angel One
 * connection, otherwise falls back to the market-data function.
 */
export function useStockPrices() {
  const [updating, setUpdating] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { isConnected: angelConnected } = useBrokerConnection("angelone");

  const refreshPrices = useCallback(async (): Promise<PriceUpdate[]> => {
    setUpdating(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("Please sign in to refresh prices");
      }

      const fn = angelConnected ? "angel-one-ltp" : "update-stock-prices";
      const { data, error } = await supabase.functions.invoke(fn, { body: {} });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setLastUpdated(new Date());

      const updated: number = data?.updated ?? 0;
      if (updated > 0) {
        toast({
          title: "Prices updated",
          description: `Updated ${updated} stock price${updated === 1 ? "" : "s"} from ${
            angelConnected ? "Angel One" : "NSE"
          }.`,
        });
      } else {
        toast({
          title: "No updates",
          description: "No holdings found to update.",
        });
      }

      return data?.prices ?? [];
    } catch (error: any) {
      console.error("Price update error:", error);
      toast({
        title: "Update failed",
        description: error?.message || "Could not fetch latest prices.",
        variant: "destructive",
      });
      return [];
    } finally {
      setUpdating(false);
    }
  }, [angelConnected]);

  return {
    refreshPrices,
    updating,
    lastUpdated,
    angelConnected,
  };
}
