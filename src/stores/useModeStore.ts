import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type AppMode = "prototype" | "live";

interface ModeStore {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  toggleMode: () => void;
}

/**
 * Global Prototype/Live mode toggle.
 * - prototype: original simulated/mock data + simulated backend behavior
 * - live: same UI/workflow, real data wherever wired (Portfolio prices via Yahoo);
 *         other modules clearly badge "Simulated — live feed not connected" so
 *         users are never misled.
 *
 * Persisted to localStorage so the choice survives page reloads & navigation.
 */
export const useModeStore = create<ModeStore>()(
  persist(
    (set, get) => ({
      mode: "live", // Default per product spec
      setMode: (mode) => set({ mode }),
      toggleMode: () => set({ mode: get().mode === "live" ? "prototype" : "live" }),
    }),
    {
      name: "arken-app-mode",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

/**
 * Convenience hook: returns whether a given module currently has a real
 * data source wired in the active mode.
 *
 * Today only `portfolio-prices` is genuinely live (Yahoo Finance via
 * update-stock-prices edge function). Everything else is simulated in both
 * modes — but in Live mode we surface that fact via a badge.
 */
export const LIVE_DATA_SOURCES = {
  "portfolio-prices": true,   // Yahoo Finance
  "ideas": false,              // LLM-generated (semi-live, but no market screener)
  "options-chain": false,
  "iv-rank": false,
  "regime": false,
  "behavioral": false,
  "backtest": false,
  "risk-heat": false,
  "advanced-intel": false,
} as const;

export type DataSourceKey = keyof typeof LIVE_DATA_SOURCES;

export function useDataMode(source: DataSourceKey) {
  const mode = useModeStore((s) => s.mode);
  const hasLive = LIVE_DATA_SOURCES[source];
  return {
    mode,
    isLive: mode === "live",
    isPrototype: mode === "prototype",
    /** True when we're in Live mode AND a real data source is wired for this module. */
    isLiveData: mode === "live" && hasLive,
    /** True when Live mode is selected but the module is still simulated (badge case). */
    isLiveFallback: mode === "live" && !hasLive,
  };
}
