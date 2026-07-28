import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gauge, Search, X, TrendingUp, TrendingDown } from "lucide-react";
import { ModeBadge } from "@/components/mode/ModeBadge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type OptType = "CE" | "PE";

interface Strike {
  strike: number;
  type: OptType;
  expiry: string;
  iv: number;
  ivRank: number;
  oi: number;
  oiChange: number;
  premium: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
}

const SPOT = 22050;
const EXPIRIES = ["2026-08-07", "2026-08-14", "2026-08-28"];

// Build a realistic full chain: 10 strikes each side, 100-pt spacing, per expiry
function buildChain(): Strike[] {
  const chain: Strike[] = [];
  const base = 21500;
  for (const expiry of EXPIRIES) {
    const dteMult = expiry === "2026-08-07" ? 1 : expiry === "2026-08-14" ? 1.3 : 1.8;
    for (let i = 0; i < 11; i++) {
      const strike = base + i * 100;
      const moneynessCE = strike - SPOT; // >0 OTM for CE
      const moneynessPE = SPOT - strike; // >0 OTM for PE

      const ceDelta = Math.max(0.02, Math.min(0.98, 0.5 - moneynessCE / 1200));
      const peDelta = -Math.max(0.02, Math.min(0.98, 0.5 - moneynessPE / 1200));

      const iv = 13 + Math.abs(strike - SPOT) / 90 + (dteMult - 1) * 2;
      const ivRank = Math.round(30 + Math.abs(strike - SPOT) / 40);

      chain.push({
        strike,
        type: "CE",
        expiry,
        iv: +iv.toFixed(1),
        ivRank: Math.min(95, ivRank),
        oi: Math.round((900_000 + Math.random() * 1_500_000) / 1000) * 1000,
        oiChange: Math.round((Math.random() - 0.4) * 200_000),
        premium: Math.max(2, Math.round(Math.max(0, SPOT - strike) + 80 * dteMult - Math.abs(moneynessCE) * 0.08)),
        delta: +ceDelta.toFixed(2),
        gamma: +(0.0015 - Math.abs(moneynessCE) / 1_200_000).toFixed(4),
        theta: +(-6 - dteMult * 1.5 - Math.random()).toFixed(1),
        vega: +(10 + Math.random() * 4).toFixed(1),
      });

      chain.push({
        strike,
        type: "PE",
        expiry,
        iv: +(iv + 0.4).toFixed(1),
        ivRank: Math.min(95, ivRank + 2),
        oi: Math.round((800_000 + Math.random() * 1_400_000) / 1000) * 1000,
        oiChange: Math.round((Math.random() - 0.4) * 200_000),
        premium: Math.max(2, Math.round(Math.max(0, strike - SPOT) + 75 * dteMult - Math.abs(moneynessPE) * 0.08)),
        delta: +peDelta.toFixed(2),
        gamma: +(0.0014 - Math.abs(moneynessPE) / 1_200_000).toFixed(4),
        theta: +(-6 - dteMult * 1.4 - Math.random()).toFixed(1),
        vega: +(10 + Math.random() * 4).toFixed(1),
      });
    }
  }
  return chain;
}

const FULL_CHAIN = buildChain();

function computeInsight(s: Strike) {
  const itmProb = Math.round(Math.abs(s.delta) * 100);
  const gainProb = Math.max(5, Math.round(itmProb * 0.55));
  const lossProb = Math.max(10, Math.round((100 - itmProb) * 0.7));
  const breakEven = s.type === "CE" ? s.strike + s.premium : s.strike - s.premium;
  const dte = Math.max(
    1,
    Math.round((new Date(s.expiry).getTime() - Date.parse("2026-08-01")) / 86_400_000)
  );
  const decayPct = Math.min(95, Math.round((Math.abs(s.theta) * dte) / s.premium * 100));
  return { itmProb, gainProb, lossProb, breakEven, dte, decayPct };
}

export function OptionProbabilityEngine() {
  const [expiry, setExpiry] = useState<string>(EXPIRIES[0]);
  const [typeFilter, setTypeFilter] = useState<"ALL" | OptType>("ALL");
  const [minStrike, setMinStrike] = useState<string>("");
  const [maxStrike, setMaxStrike] = useState<string>("");
  const [selectedKey, setSelectedKey] = useState<string>(`${EXPIRIES[0]}-22000-CE`);

  const filtered = useMemo(() => {
    return FULL_CHAIN.filter((s) => {
      if (s.expiry !== expiry) return false;
      if (typeFilter !== "ALL" && s.type !== typeFilter) return false;
      if (minStrike && s.strike < Number(minStrike)) return false;
      if (maxStrike && s.strike > Number(maxStrike)) return false;
      return true;
    }).sort((a, b) => a.strike - b.strike || a.type.localeCompare(b.type));
  }, [expiry, typeFilter, minStrike, maxStrike]);

  const selected =
    FULL_CHAIN.find((s) => `${s.expiry}-${s.strike}-${s.type}` === selectedKey) ?? filtered[0];

  const insight = selected ? computeInsight(selected) : null;

  const resultCards = insight && selected
    ? [
        { label: "Finish In-The-Money", probability: insight.itmProb, color: "bg-gain" },
        { label: "Gain 20%+", probability: insight.gainProb, color: "bg-primary" },
        { label: "Lose 50%+", probability: insight.lossProb, color: "bg-loss" },
        { label: "Time Decay by Expiry", probability: insight.decayPct, color: "bg-accent" },
      ]
    : [];

  return (
    <div className="glass-card-elevated p-6 rounded-2xl">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/20 border border-primary/30">
          <Gauge className="w-5 h-5 text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">Option Probability Engine</h3>
            <ModeBadge source="options-chain" />
          </div>
          <p className="text-xs text-muted-foreground">
            {selected
              ? `NIFTY ${selected.strike} ${selected.type} • Expiry ${selected.expiry} • Spot: ${SPOT.toLocaleString()}`
              : `NIFTY chain • Spot: ${SPOT.toLocaleString()}`}
          </p>
        </div>
      </div>

      {/* Probability Results — strike-specific */}
      {insight && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {resultCards.map((r) => (
            <div key={r.label} className="p-3 rounded-xl bg-secondary/30 border border-border/30">
              <div className="text-xs text-muted-foreground mb-1">{r.label}</div>
              <div className="text-xl font-bold font-mono">{r.probability}%</div>
              <div className="h-1.5 rounded-full bg-secondary/50 mt-2 overflow-hidden">
                <motion.div
                  key={`${selectedKey}-${r.label}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${r.probability}%` }}
                  transition={{ duration: 0.6 }}
                  className={`h-full rounded-full ${r.color}`}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Strike-specific plain-language insight */}
      {selected && insight && (
        <div className="p-4 rounded-xl bg-accent/5 border border-accent/20 mb-6">
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong className="text-accent">Insight:</strong> The <strong>{selected.strike} {selected.type}</strong>{" "}
            has an approximate <strong>{insight.itmProb}% chance</strong> of finishing in-the-money by{" "}
            {selected.expiry}. Break-even is at{" "}
            <strong>{insight.breakEven.toLocaleString()}</strong>. Implied volatility is{" "}
            <strong>{selected.iv}%</strong> (IV rank <strong>{selected.ivRank}</strong>) — time decay may
            erode roughly <strong>{insight.decayPct}%</strong> of premium if the underlying stays flat.
          </p>
        </div>
      )}

      {/* Filter / search bar */}
      <div className="flex flex-wrap items-end gap-3 mb-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Search className="w-3.5 h-3.5" />
          Filter chain
        </div>
        <div>
          <label className="block text-[10px] uppercase text-muted-foreground mb-1">Expiry</label>
          <select
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
            className="h-8 rounded-md bg-secondary/50 border border-border/40 text-xs px-2"
          >
            {EXPIRIES.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10px] uppercase text-muted-foreground mb-1">Type</label>
          <div className="inline-flex rounded-md overflow-hidden border border-border/40">
            {(["ALL", "CE", "PE"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-2.5 h-8 text-xs font-medium transition-colors ${
                  typeFilter === t
                    ? t === "CE"
                      ? "bg-gain/20 text-gain"
                      : t === "PE"
                      ? "bg-loss/20 text-loss"
                      : "bg-primary/20 text-primary"
                    : "bg-secondary/40 text-muted-foreground hover:bg-secondary/60"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-[10px] uppercase text-muted-foreground mb-1">Min strike</label>
          <Input
            type="number"
            value={minStrike}
            onChange={(e) => setMinStrike(e.target.value)}
            placeholder="21500"
            className="h-8 w-24 text-xs font-mono"
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase text-muted-foreground mb-1">Max strike</label>
          <Input
            type="number"
            value={maxStrike}
            onChange={(e) => setMaxStrike(e.target.value)}
            placeholder="22500"
            className="h-8 w-24 text-xs font-mono"
          />
        </div>
        {(minStrike || maxStrike || typeFilter !== "ALL") && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => { setMinStrike(""); setMaxStrike(""); setTypeFilter("ALL"); }}
            className="h-8 gap-1 text-xs"
          >
            <X className="w-3 h-3" /> Reset
          </Button>
        )}
        <span className="ml-auto text-[11px] text-muted-foreground font-mono">
          {filtered.length} contracts
        </span>
      </div>

      {/* Chain + detail panel */}
      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-4">
        <div className="overflow-x-auto max-h-96 overflow-y-auto rounded-lg border border-border/30">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-card z-10">
              <tr className="border-b border-border/50">
                <th className="text-left py-2 px-2 font-medium text-muted-foreground">Strike</th>
                <th className="text-left py-2 px-2 font-medium text-muted-foreground">Type</th>
                <th className="text-right py-2 px-2 font-medium text-muted-foreground">IV%</th>
                <th className="text-right py-2 px-2 font-medium text-muted-foreground">OI</th>
                <th className="text-right py-2 px-2 font-medium text-muted-foreground">Premium</th>
                <th className="text-right py-2 px-2 font-medium text-muted-foreground">Delta</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const key = `${s.expiry}-${s.strike}-${s.type}`;
                const isSelected = key === selectedKey;
                return (
                  <tr
                    key={key}
                    className={`border-b border-border/20 cursor-pointer transition-colors ${
                      isSelected ? "bg-primary/10" : "hover:bg-secondary/30"
                    }`}
                    onClick={() => setSelectedKey(key)}
                  >
                    <td className="py-2 px-2 font-mono">{s.strike}</td>
                    <td className="py-2 px-2">
                      <span className={s.type === "CE" ? "text-gain" : "text-loss"}>{s.type}</span>
                    </td>
                    <td className="text-right py-2 px-2 font-mono">{s.iv}</td>
                    <td className="text-right py-2 px-2 font-mono">{(s.oi / 1000).toFixed(0)}K</td>
                    <td className="text-right py-2 px-2 font-mono">₹{s.premium}</td>
                    <td className="text-right py-2 px-2 font-mono">{s.delta}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-muted-foreground text-xs">
                    No contracts match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Detail panel */}
        <AnimatePresence mode="wait">
          {selected && insight && (
            <motion.div
              key={selectedKey}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="p-4 rounded-xl bg-secondary/30 border border-border/40 space-y-3"
            >
              <div className="flex items-center gap-2">
                {selected.type === "CE" ? (
                  <TrendingUp className="w-4 h-4 text-gain" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-loss" />
                )}
                <div className="font-semibold text-sm">
                  {selected.strike} {selected.type}
                </div>
                <span className="ml-auto text-[10px] font-mono text-muted-foreground">
                  {selected.expiry} • {insight.dte}D
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <Metric label="Premium" value={`₹${selected.premium}`} />
                <Metric label="Break-even" value={insight.breakEven.toLocaleString()} />
                <Metric label="Delta" value={selected.delta.toFixed(2)} />
                <Metric label="Gamma" value={selected.gamma.toFixed(4)} />
                <Metric label="Theta" value={selected.theta.toFixed(1)} tone="loss" />
                <Metric label="Vega" value={selected.vega.toFixed(1)} />
                <Metric label="IV" value={`${selected.iv}%`} />
                <Metric label="IV Rank" value={`${selected.ivRank}`} />
                <Metric label="OI" value={`${(selected.oi / 1000).toFixed(0)}K`} />
                <Metric
                  label="OI Change"
                  value={`${selected.oiChange >= 0 ? "+" : ""}${(selected.oiChange / 1000).toFixed(0)}K`}
                  tone={selected.oiChange >= 0 ? "gain" : "loss"}
                />
              </div>

              <div className="pt-2 border-t border-border/30 text-[11px] text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Probability profile:</strong>{" "}
                {insight.itmProb}% ITM • {insight.gainProb}% gain 20%+ • {insight.lossProb}% lose 50%+.
                Simulated — for analysis only, not a trade recommendation.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: "gain" | "loss" }) {
  const toneCls = tone === "gain" ? "text-gain" : tone === "loss" ? "text-loss" : "text-foreground";
  return (
    <div className="p-2 rounded-md bg-card/40 border border-border/20">
      <div className="text-[10px] uppercase text-muted-foreground">{label}</div>
      <div className={`font-mono text-sm ${toneCls}`}>{value}</div>
    </div>
  );
}
