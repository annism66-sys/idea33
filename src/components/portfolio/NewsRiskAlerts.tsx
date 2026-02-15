import { motion } from "framer-motion";
import { AlertTriangle, Newspaper, ExternalLink } from "lucide-react";
import { Holding } from "@/hooks/usePortfolio";
import { useMemo } from "react";

interface NewsRiskAlertsProps {
  holdings: Holding[];
}

// Simulated news alerts based on holdings
const newsDatabase: Record<string, { headline: string; impact: "positive" | "negative" | "neutral"; summary: string }[]> = {
  RELIANCE: [
    { headline: "Reliance Jio announces 5G expansion to 100 cities", impact: "positive", summary: "Jio's 5G rollout could boost ARPU and strengthen market position." },
    { headline: "OPEC+ supply cuts may impact refining margins", impact: "negative", summary: "Crude oil price volatility could affect Reliance's O2C segment." },
  ],
  TCS: [
    { headline: "TCS wins $2B deal with European banking client", impact: "positive", summary: "Major deal win signals strong demand in BFSI vertical." },
  ],
  INFY: [
    { headline: "Infosys revises guidance downward for Q4", impact: "negative", summary: "Weaker discretionary spending in key markets impacting growth." },
  ],
  HDFCBANK: [
    { headline: "RBI keeps repo rate unchanged at 6.5%", impact: "neutral", summary: "Stable rates maintain current NIM outlook for banking sector." },
  ],
  ICICIBANK: [
    { headline: "ICICI Bank asset quality improves for 5th quarter", impact: "positive", summary: "Declining NPAs and strong retail growth drive earnings." },
  ],
  BHARTIARTL: [
    { headline: "Airtel raises tariffs by 10-15% across plans", impact: "positive", summary: "Tariff hikes expected to improve ARPU and margins." },
  ],
  ITC: [
    { headline: "ITC demerger of hotels business approved", impact: "positive", summary: "Demerger could unlock value for shareholders." },
  ],
  SBIN: [
    { headline: "SBI plans to raise ₹20,000 Cr via bonds", impact: "neutral", summary: "Capital raise to support growing loan book." },
  ],
  WIPRO: [
    { headline: "Wipro announces strategic restructuring", impact: "neutral", summary: "New operating model may improve efficiency in medium term." },
  ],
  TATAMOTORS: [
    { headline: "Tata Motors EV sales surge 40% YoY", impact: "positive", summary: "Strong EV adoption driving growth in domestic market." },
  ],
};

export function NewsRiskAlerts({ holdings }: NewsRiskAlertsProps) {
  const alerts = useMemo(() => {
    const result: { symbol: string; headline: string; impact: "positive" | "negative" | "neutral"; summary: string }[] = [];

    holdings.forEach(h => {
      const news = newsDatabase[h.stock_symbol];
      if (news) {
        news.forEach(n => {
          result.push({ symbol: h.stock_symbol, ...n });
        });
      }
    });

    // Sort: negatives first, then neutral, then positive
    return result
      .sort((a, b) => {
        const order = { negative: 0, neutral: 1, positive: 2 };
        return order[a.impact] - order[b.impact];
      })
      .slice(0, 6);
  }, [holdings]);

  if (alerts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Newspaper className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">News-Based Risk Alerts</h3>
        </div>
        <p className="text-sm text-muted-foreground">No relevant news alerts for your holdings at this time.</p>
      </motion.div>
    );
  }

  const impactStyles = {
    negative: { bg: "bg-loss/10", border: "border-loss/20", text: "text-loss", label: "Risk" },
    neutral: { bg: "bg-muted/30", border: "border-border", text: "text-muted-foreground", label: "Info" },
    positive: { bg: "bg-gain/10", border: "border-gain/20", text: "text-gain", label: "Positive" },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Newspaper className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">News-Based Risk Alerts</h3>
      </div>
      <div className="space-y-3">
        {alerts.map((alert, i) => {
          const style = impactStyles[alert.impact];
          return (
            <div
              key={`${alert.symbol}-${i}`}
              className={`p-3 rounded-lg ${style.bg} border ${style.border}`}
            >
              <div className="flex items-start gap-2">
                {alert.impact === "negative" ? (
                  <AlertTriangle className={`w-4 h-4 ${style.text} mt-0.5 flex-shrink-0`} />
                ) : (
                  <Newspaper className={`w-4 h-4 ${style.text} mt-0.5 flex-shrink-0`} />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-medium">{alert.symbol}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${style.bg} ${style.text} font-medium`}>
                      {style.label}
                    </span>
                  </div>
                  <p className="text-sm font-medium mb-0.5">{alert.headline}</p>
                  <p className="text-xs text-muted-foreground">{alert.summary}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
