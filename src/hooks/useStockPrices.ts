import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface PriceUpdate {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

export function useStockPrices() {
  const [updating, setUpdating] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const refreshPrices = useCallback(async (): Promise<PriceUpdate[]> => {
    setUpdating(true);
    
    try {
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession();
      const authToken = session?.access_token;

      if (!authToken) {
        throw new Error("Please sign in to refresh prices");
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-stock-prices`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update prices");
      }

      const result = await response.json();
      
      setLastUpdated(new Date());
      
      if (result.updated > 0) {
        toast({
          title: "Prices updated",
          description: `Updated ${result.updated} stock prices from NSE.`,
        });
      } else {
        toast({
          title: "No updates",
          description: "No holdings found to update.",
        });
      }

      return result.prices || [];
    } catch (error: any) {
      console.error("Price update error:", error);
      toast({
        title: "Update failed",
        description: error.message || "Could not fetch latest prices.",
        variant: "destructive",
      });
      return [];
    } finally {
      setUpdating(false);
    }
  }, []);

  return {
    refreshPrices,
    updating,
    lastUpdated,
  };
}
