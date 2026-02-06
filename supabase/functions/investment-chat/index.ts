import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function buildSystemPrompt(portfolio: any[] | null, profile: any | null) {
  let portfolioContext = "";
  
  if (portfolio && portfolio.length > 0) {
    const totalValue = portfolio.reduce((sum, h) => sum + (h.quantity * (h.current_price || h.average_price)), 0);
    const holdings = portfolio.map(h => {
      const currentValue = h.quantity * (h.current_price || h.average_price);
      const investedValue = h.quantity * h.average_price;
      const pnl = currentValue - investedValue;
      const pnlPercent = ((pnl / investedValue) * 100).toFixed(2);
      const weight = ((currentValue / totalValue) * 100).toFixed(1);
      return `- ${h.stock_symbol} (${h.stock_name}): ${h.quantity} shares @ ₹${h.average_price} avg, current ₹${h.current_price || h.average_price}, P&L: ${pnl >= 0 ? '+' : ''}₹${pnl.toFixed(0)} (${pnlPercent}%), weight: ${weight}%, sector: ${h.sector || 'Unknown'}`;
    }).join('\n');
    
    const sectorBreakdown: Record<string, number> = {};
    portfolio.forEach(h => {
      const sector = h.sector || 'Unknown';
      const value = h.quantity * (h.current_price || h.average_price);
      sectorBreakdown[sector] = (sectorBreakdown[sector] || 0) + value;
    });
    
    const sectorInfo = Object.entries(sectorBreakdown)
      .map(([sector, value]) => `${sector}: ${((value / totalValue) * 100).toFixed(1)}%`)
      .join(', ');

    portfolioContext = `

USER'S ACTUAL PORTFOLIO DATA:
Total Portfolio Value: ₹${totalValue.toLocaleString('en-IN')}
Number of Holdings: ${portfolio.length}
Risk Appetite: ${profile?.risk_appetite || 'moderate'}

Holdings:
${holdings}

Sector Allocation: ${sectorInfo}

Use this real portfolio data when the user asks about their holdings, performance, risk, or rebalancing.`;
  } else {
    portfolioContext = `

The user has not added any holdings to their portfolio yet. Encourage them to add their stocks or connect their broker account to get personalized advice.`;
  }

  return `You are an expert AI Investment Agent for InvestIQ, a sophisticated investment platform focused on Indian markets (NSE/BSE). You help users understand their portfolio, explain market movements, and provide personalized investment guidance.
${portfolioContext}

Your capabilities:
- Explain daily portfolio performance changes with specific stock and sector analysis
- Analyze risk exposure including beta, sector concentration, and single stock risk
- Suggest strategy improvements based on current market conditions
- Provide behavioral guardrails to prevent emotional trading decisions
- Explain market trends and sector outlooks (Banking, IT, FMCG, Pharma, etc.)

When responding:
- Use markdown formatting with headers, bullet points, and tables for clarity
- Include specific percentages, metrics, and data points when discussing performance
- Always provide actionable insights, not just observations
- Reference Indian market specifics (NIFTY 50, SENSEX, RBI policies, etc.)
- Be concise but comprehensive
- Use emojis sparingly for visual hierarchy (📉 📊 💡 ⚠️ ✅)
- When discussing the user's portfolio, use their ACTUAL holdings data provided above

If asked about specific holdings or strategies, provide detailed analysis covering:
1. Current performance and attribution
2. Key risks and concerns
3. Recommended actions (or confirmation that no action is needed)
4. Market context and outlook`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Get the user's JWT from the authorization header
    const authHeader = req.headers.get("authorization");
    let portfolio: any[] | null = null;
    let profile: any | null = null;

    if (authHeader && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      try {
        // Create a client with the user's JWT to get their user ID
        const userClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        const token = authHeader.replace("Bearer ", "");
        const { data: { user } } = await userClient.auth.getUser(token);

        if (user) {
          // Fetch user's portfolio using service role (bypasses RLS for AI context)
          const { data: holdings } = await userClient
            .from("portfolio_holdings")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

          const { data: profileData } = await userClient
            .from("profiles")
            .select("*")
            .eq("user_id", user.id)
            .single();

          portfolio = holdings;
          profile = profileData;
        }
      } catch (e) {
        console.error("Error fetching portfolio:", e);
        // Continue without portfolio data
      }
    }

    const systemPrompt = buildSystemPrompt(portfolio, profile);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted. Please add funds to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Investment chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
