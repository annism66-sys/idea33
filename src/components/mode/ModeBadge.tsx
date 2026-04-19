import { Radio, Beaker, AlertCircle } from "lucide-react";
import { useDataMode, type DataSourceKey } from "@/stores/useModeStore";
import { cn } from "@/lib/utils";

interface ModeBadgeProps {
  source: DataSourceKey;
  className?: string;
  /** If true, only render when in Live mode (hide in Prototype). */
  liveOnly?: boolean;
}

/**
 * Small inline indicator that tells the user whether the data they're
 * looking at is genuinely live or simulated.
 *
 * - Prototype mode → "Simulated" (neutral) chip
 * - Live mode + wired source → "Live" (gain) chip with pulse
 * - Live mode + unwired source → "Simulated — live feed not connected" (warning) chip
 */
export function ModeBadge({ source, className, liveOnly = false }: ModeBadgeProps) {
  const { isPrototype, isLiveData, isLiveFallback } = useDataMode(source);

  if (liveOnly && isPrototype) return null;

  if (isPrototype) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary/60 border border-border/40 text-[10px] font-medium text-muted-foreground",
          className
        )}
        title="Prototype mode — using mock/demo data"
      >
        <Beaker className="w-3 h-3" />
        Simulated
      </span>
    );
  }

  if (isLiveData) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gain/15 border border-gain/30 text-[10px] font-medium text-gain",
          className
        )}
        title="Live data feed connected"
      >
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inset-0 rounded-full bg-gain animate-ping opacity-75" />
          <span className="relative rounded-full h-1.5 w-1.5 bg-gain" />
        </span>
        Live
      </span>
    );
  }

  // Live mode but no real feed wired — be honest
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-warning/15 border border-warning/30 text-[10px] font-medium text-warning",
        className
      )}
      title="Live mode active but no real data feed is connected for this module yet"
    >
      <AlertCircle className="w-3 h-3" />
      Simulated · feed pending
    </span>
  );
}
