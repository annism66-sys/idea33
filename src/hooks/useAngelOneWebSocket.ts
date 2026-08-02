import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { isMarketOpen } from "@/lib/marketHours";

export interface LivePrice {
  symbol: string;
  price: number;
}

const POLL_MS = 15_000;

/**
 * Live LTP feed for Angel One holdings.
 *
 * Angel One's `wss://smartapisocket.angelone.in/smart-stream` feed pushes
 * binary frames that require a custom decoder plus a browser-side feed token.
 * Rather than exposing the feed token to the client, this hook polls the
 * server-side `angel-one-ltp` edge function every 15s, which calls Angel One's
 * LTP quote REST endpoint and writes `current_price` back to the portfolio.
 *
 * Polling automatically pauses outside NSE market hours (09:15–15:30 IST,
 * Mon–Fri) and while the browser tab is hidden.
 */
export function useAngelOneWebSocket(opts: {
  enabled: boolean;
  onPrices?: (prices: LivePrice[]) => void;
}) {
  const { enabled, onPrices } = opts;
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [lastTick, setLastTick] = useState<Date | null>(null);
  const [marketOpen, setMarketOpen] = useState(isMarketOpen());
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);
  const onPricesRef = useRef(onPrices);
  onPricesRef.current = onPrices;

  const tick = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const { data, error: fnError } = await supabase.functions.invoke(
        "angel-one-ltp",
        { body: {} },
      );
      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);

      const list: LivePrice[] = data?.prices ?? [];
      if (list.length > 0) {
        setPrices((prev) => {
          const next = { ...prev };
          for (const p of list) next[p.symbol] = p.price;
          return next;
        });
        onPricesRef.current?.(list);
      }
      setLastTick(new Date());
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? "Live price feed unavailable");
    } finally {
      inFlight.current = false;
    }
  }, []);

  useEffect(() => {
    const clock = setInterval(() => setMarketOpen(isMarketOpen()), 30_000);
    return () => clearInterval(clock);
  }, []);

  useEffect(() => {
    if (!enabled || !marketOpen) return;

    let timer: number | undefined;
    const start = () => {
      tick();
      timer = window.setInterval(() => {
        if (document.visibilityState === "visible") tick();
      }, POLL_MS);
    };
    start();

    return () => {
      if (timer) window.clearInterval(timer);
    };
  }, [enabled, marketOpen, tick]);

  return {
    prices,
    lastTick,
    marketOpen,
    isStreaming: enabled && marketOpen,
    error,
    refreshNow: tick,
  };
}
