import { motion } from "framer-motion";
import { Beaker, Radio } from "lucide-react";
import { useModeStore, type AppMode } from "@/stores/useModeStore";
import { cn } from "@/lib/utils";

interface ModeToggleProps {
  /** "lg" = homepage hero. "sm" = navbar pill. */
  size?: "sm" | "lg";
  className?: string;
}

const OPTIONS: { value: AppMode; label: string; icon: typeof Beaker; hint: string }[] = [
  { value: "prototype", label: "Prototype", icon: Beaker, hint: "Simulated demo data" },
  { value: "live", label: "Live", icon: Radio, hint: "Real data where available" },
];

export function ModeToggle({ size = "sm", className }: ModeToggleProps) {
  const mode = useModeStore((s) => s.mode);
  const setMode = useModeStore((s) => s.setMode);

  const isLg = size === "lg";

  return (
    <div
      role="radiogroup"
      aria-label="Application mode"
      className={cn(
        "relative inline-flex items-center rounded-full border border-border/60 bg-card/60 backdrop-blur-md p-1 shadow-sm",
        isLg ? "gap-1" : "gap-0.5",
        className
      )}
    >
      {OPTIONS.map((opt) => {
        const active = mode === opt.value;
        const Icon = opt.icon;
        return (
          <button
            key={opt.value}
            role="radio"
            aria-checked={active}
            onClick={() => setMode(opt.value)}
            title={opt.hint}
            className={cn(
              "relative z-10 flex items-center gap-1.5 rounded-full font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
              isLg ? "px-4 py-2 text-sm" : "px-3 py-1.5 text-xs",
              active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {active && (
              <motion.span
                layoutId={`mode-indicator-${size}`}
                className="absolute inset-0 -z-10 rounded-full bg-primary shadow-lg shadow-primary/20"
                transition={{ type: "spring", bounce: 0.18, duration: 0.5 }}
              />
            )}
            <Icon className={cn(isLg ? "w-4 h-4" : "w-3.5 h-3.5")} />
            {opt.label}
            {opt.value === "live" && active && (
              <span className="relative flex h-1.5 w-1.5 ml-0.5">
                <span className="absolute inset-0 rounded-full bg-gain animate-ping opacity-75" />
                <span className="relative rounded-full h-1.5 w-1.5 bg-gain" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
