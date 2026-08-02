import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface BrokerConnection {
  id: string;
  broker: string;
  client_id: string;
  is_active: boolean;
  token_expiry: string | null;
  created_at: string;
}

export function useBrokerConnection(broker = "angelone") {
  const { user } = useAuth();
  const [connection, setConnection] = useState<BrokerConnection | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchConnection = useCallback(async () => {
    if (!user) {
      setConnection(null);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("broker_connections")
      .select("id, broker, client_id, is_active, token_expiry, created_at")
      .eq("user_id", user.id)
      .eq("broker", broker)
      .eq("is_active", true)
      .maybeSingle();
    setConnection((data as BrokerConnection) ?? null);
    setLoading(false);
  }, [user, broker]);

  useEffect(() => {
    fetchConnection();
  }, [fetchConnection]);

  const disconnect = useCallback(async () => {
    if (!connection) return;
    await supabase.from("broker_connections").delete().eq("id", connection.id);
    setConnection(null);
  }, [connection]);

  return {
    connection,
    isConnected: !!connection,
    loading,
    refetch: fetchConnection,
    disconnect,
  };
}
