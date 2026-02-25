import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { riskTolerance, horizon, styles, sectors } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const serviceClient = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    let portfolioContext = "";
    try {
      const { data: holdings } = await serviceClient
        .from("portfolio_holdings")
        .select("stock_symbol, stock_name, sector, quantity, average_price, current_price")
        .limit(50);
      if (holdings && holdings.length > 0) {
        portfolioContext = `\n\nCurrent holdings: ${holdings.map(h => `${h.stock_symbol} (${h.sector || 'Unknown'})`).join(', ')}. Avoid suggesting stocks already held heavily. Consider complementary positions.`;
      }
    } catch (e) {
      console.error("Error fetching portfolio:", e);
    }

    const systemPrompt = `You are an expert Indian equity market analyst. Generate investment ideas based on user preferences. You must respond ONLY with a valid JSON array (no markdown, no code blocks).

User Preferences:
- Risk Tolerance: ${riskTolerance}
- Investment Horizon: ${horizon}
- Investment Styles: ${styles?.join(', ') || 'Any'}
- Focus Sectors: ${sectors?.length > 0 ? sectors.join(', ') : 'All sectors'}
${portfolioContext}

ANALYSIS FRAMEWORK for each idea:
1. Filter by market cap, liquidity, sector based on risk tolerance
2. Analyze news sentiment for relevant stocks
3. Evaluate earnings trends and valuation vs historical averages  
4. Assess technical strength (momentum, RSI, moving averages)
5. Consider sector momentum and macro factors (RBI rate cycle, inflation, FII flows)
6. Factor in institutional activity signals

Generate exactly 3 investment ideas. Each must be a JSON object with these exact fields:
- id: number (1, 2, 3)
- title: string (compelling idea name)
- theme: string (e.g., "Sector Rotation", "Contrarian Value", "Thematic Growth", "Momentum Play", "Mean Reversion", "Dividend Yield", "News-driven Tactical")
- description: string (2-3 sentences about the opportunity)
- rationale: string (detailed analysis covering fundamental + technical + macro + news factors, 3-4 sentences)
- risks: string[] (3-4 specific risks)
- expectedReturn: string (e.g., "+18-24%")
- confidence: number (50-95, based on conviction level)
- stocks: string[] (3-4 NSE stock symbols)
- riskScore: number (1-10, where 10 is highest risk)
- timeHorizon: string (matching user's selection)
- entryLogic: string (when to enter, e.g., "Buy on pullback to 200-DMA support")
- exitLogic: string (when to exit, e.g., "Exit at 20% profit or 10% stop loss")

Use REAL NSE stock symbols (e.g., RELIANCE, TCS, HDFCBANK, INFY, ICICIBANK, TATAMOTORS, WIPRO, KOTAKBANK, SBIN, AXISBANK, BHARTIARTL, ITC, HINDUNILVR, BAJFINANCE, MARUTI, SUNPHARMA, TITAN, NESTLEIND, LTIM, TECHM, M&M, TATAPOWER, ADANIENT, HCLTECH, DRREDDY).

Map risk tolerance:
- Conservative: Large-cap blue chips, low beta, high dividend yield stocks
- Moderate: Mix of large and mid-cap, balanced beta
- Aggressive: Mid and small-cap, high beta, high growth stocks

Map investment horizon:
- Short-term: Momentum and tactical plays, technical setups
- Medium-term: Value and growth opportunities, sector rotation
- Long-term: Structural themes, compounding stories

Return ONLY a JSON array of 3 objects. No explanation, no markdown.`;

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
          { role: "user", content: `Generate 3 investment ideas for the Indian equity market based on my preferences. Return only valid JSON array.` },
        ],
        stream: false,
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

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content || "[]";
    
    // Parse the AI response - handle potential markdown wrapping
    let ideas;
    try {
      let cleanContent = content.trim();
      // Remove markdown code blocks if present
      if (cleanContent.startsWith("```")) {
        cleanContent = cleanContent.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
      }
      // Extract just the JSON array using bracket matching
      const firstBracket = cleanContent.indexOf("[");
      if (firstBracket !== -1) {
        let depth = 0;
        let lastBracket = -1;
        for (let i = firstBracket; i < cleanContent.length; i++) {
          if (cleanContent[i] === "[") depth++;
          else if (cleanContent[i] === "]") { depth--; if (depth === 0) { lastBracket = i; break; } }
        }
        if (lastBracket !== -1) cleanContent = cleanContent.substring(firstBracket, lastBracket + 1);
      }
      ideas = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      return new Response(JSON.stringify({ error: "Failed to parse AI response. Please try again." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ideas }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Generate ideas error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
