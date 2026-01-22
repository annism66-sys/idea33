import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { 
  Bot, 
  Send, 
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  RefreshCw,
  User,
  Zap
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content: "👋 Hello! I'm your AI Investment Agent. I'm here to help you understand your portfolio, explain market movements, and provide personalized investment guidance. How can I assist you today?",
    timestamp: new Date(),
    suggestions: [
      "Why did my portfolio drop today?",
      "Analyze my risk exposure",
      "Suggest improvements to my strategy",
      "Explain the banking sector outlook"
    ]
  }
];

const mockResponses: Record<string, { content: string; suggestions?: string[] }> = {
  "Why did my portfolio drop today?": {
    content: `📉 **Today's Performance Analysis**

Your portfolio declined by **-0.82%** today, primarily due to:

1. **Banking sector weakness** (-1.4%): RBI's hawkish commentary on inflation spooked banking stocks. HDFCBANK and ICICIBANK, which form 24% of your portfolio, were the main drags.

2. **IT sector pressure** (-0.9%): Concerns about delayed US Fed rate cuts affected IT stocks. Your holdings in TCS and Infosys contributed to the decline.

**Key Insight**: This appears to be a sector-wide rotation rather than company-specific issues. Your fundamentally strong picks should recover as sentiment stabilizes.

**Recommended Action**: No immediate action required. This is normal market volatility within your risk parameters.`,
    suggestions: [
      "Should I rebalance my banking exposure?",
      "What's my portfolio's volatility trend?",
      "Compare my returns to NIFTY 50"
    ]
  },
  "Analyze my risk exposure": {
    content: `🎯 **Risk Exposure Analysis**

**Overall Risk Score: 6.2/10** (Moderate)

📊 **Risk Breakdown:**

| Factor | Exposure | Status |
|--------|----------|--------|
| Market Beta | 1.12 | ⚠️ Slightly elevated |
| Sector Concentration | 35% Banking | ⚠️ High |
| Single Stock Risk | 12.5% (HDFCBANK) | ✅ Acceptable |
| Liquidity | 98% Large-cap | ✅ Excellent |

**⚠️ Areas of Concern:**

1. **Sector concentration**: 35% in banking sector exposes you to regulatory and rate cycle risks.

2. **Correlation risk**: Banking and IT (60% combined) tend to move together in risk-off scenarios.

**💡 Recommendations:**

- Add defensive sectors (FMCG, Pharma) to reduce beta
- Consider 5-10% allocation to gold ETF as a hedge
- Your current position sizing is prudent`,
    suggestions: [
      "How can I reduce my banking exposure?",
      "What defensive stocks do you recommend?",
      "Show me my portfolio's VaR"
    ]
  },
  "Suggest improvements to my strategy": {
    content: `💡 **Strategy Improvement Suggestions**

Based on analysis of your current strategies and market conditions:

**1. Banking Momentum Strategy** ✅
- **Current Performance**: +28.5%
- **Suggestion**: Tighten stop-loss to 10% from 15% given extended rally
- **Risk**: Strategy may be over-fitted to recent bull market conditions

**2. IT Value Play** ⚠️
- **Current Performance**: +12.3%
- **Suggestion**: Add AI/cloud services exposure (e.g., LTIM, PERSISTENT)
- **Opportunity**: Sector rotation could favor IT in H2 2025

**3. Dividend Yield Strategy** ✅
- **Current Performance**: +8.7%
- **Suggestion**: Continue as-is, provides good downside protection

**4. Small Cap Growth** ⚠️
- **Current Performance**: -3.2%
- **Suggestion**: Consider pausing or adding stricter entry criteria
- **Issue**: Small-cap valuations are stretched

**Overall Recommendation**: 
Your strategies are well-constructed. Focus on risk management rather than return chasing. Consider adding a momentum filter to your small-cap strategy.`,
    suggestions: [
      "Backtest the tighter stop-loss",
      "Which AI stocks should I consider?",
      "Pause the small-cap strategy"
    ]
  },
  default: {
    content: `I understand you're asking about investment-related topics. Let me analyze this for you...

Based on your current portfolio and market conditions, here are my thoughts:

1. **Market Context**: Indian markets are showing mixed signals with sectoral rotation underway
2. **Your Portfolio**: Currently well-positioned but could benefit from some tactical adjustments
3. **Key Risks**: Monitor RBI policy decisions and global tech spending trends

Would you like me to dive deeper into any specific aspect of your portfolio or the markets?`,
    suggestions: [
      "Analyze my current holdings",
      "What's the market outlook?",
      "Review my strategy performance"
    ]
  }
};

export default function Agent() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (messageText?: string) => {
    const text = messageText || input;
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const response = mockResponses[text] || mockResponses.default;
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.content,
        timestamp: new Date(),
        suggestions: response.suggestions,
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 h-[calc(100vh-4rem)]">
        <div className="grid lg:grid-cols-4 gap-6 h-full">
          {/* Chat Panel */}
          <div className="lg:col-span-3 flex flex-col glass-card overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 border-b border-border/50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-semibold">Investment AI Agent</h2>
                <p className="text-xs text-muted-foreground">Your personal portfolio analyst</p>
              </div>
              <div className="ml-auto flex items-center gap-2 px-3 py-1 rounded-full bg-gain/10 text-gain text-xs">
                <div className="w-2 h-2 rounded-full bg-gain animate-pulse" />
                Online
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`flex gap-3 ${message.role === "user" ? "justify-end" : ""}`}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-primary" />
                      </div>
                    )}
                    <div className={`max-w-[80%] ${message.role === "user" ? "order-first" : ""}`}>
                      <div
                        className={`p-4 rounded-2xl ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-secondary/50 rounded-bl-md"
                        }`}
                      >
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          {message.content.split('\n').map((line, i) => (
                            <p key={i} className="mb-2 last:mb-0 text-sm">
                              {line}
                            </p>
                          ))}
                        </div>
                      </div>
                      {message.suggestions && message.suggestions.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {message.suggestions.map((suggestion) => (
                            <button
                              key={suggestion}
                              onClick={() => handleSend(suggestion)}
                              className="px-3 py-1.5 rounded-lg bg-secondary/50 hover:bg-secondary text-sm text-muted-foreground hover:text-foreground transition-colors border border-border/50"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {message.role === "user" && (
                      <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="p-4 rounded-2xl bg-secondary/50 rounded-bl-md">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border/50">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask about your portfolio, market trends, or investment strategies..."
                  className="flex-1 px-4 py-3 rounded-xl bg-secondary/30 border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <Button
                  variant="hero"
                  size="icon"
                  className="h-12 w-12 rounded-xl"
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isTyping}
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Actions Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="hidden lg:block space-y-4"
          >
            <div className="glass-card p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                Quick Actions
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleSend("Why did my portfolio drop today?")}
                  className="w-full p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 text-left text-sm transition-colors flex items-center gap-2"
                >
                  <TrendingDown className="w-4 h-4 text-loss" />
                  Explain today's drop
                </button>
                <button
                  onClick={() => handleSend("Analyze my risk exposure")}
                  className="w-full p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 text-left text-sm transition-colors flex items-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  Risk analysis
                </button>
                <button
                  onClick={() => handleSend("Suggest improvements to my strategy")}
                  className="w-full p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 text-left text-sm transition-colors flex items-center gap-2"
                >
                  <Lightbulb className="w-4 h-4 text-accent" />
                  Get suggestions
                </button>
              </div>
            </div>

            <div className="glass-card p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Agent Capabilities
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 mt-0.5 text-gain" />
                  <span>Explain performance changes</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 text-warning" />
                  <span>Flag risks & over-optimization</span>
                </li>
                <li className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 mt-0.5 text-accent" />
                  <span>Suggest improvements</span>
                </li>
                <li className="flex items-start gap-2">
                  <RefreshCw className="w-4 h-4 mt-0.5 text-primary" />
                  <span>Behavioral guardrails</span>
                </li>
              </ul>
            </div>

            <div className="glass-card p-4">
              <h3 className="font-semibold mb-2">Today's Alerts</h3>
              <div className="space-y-2">
                <div className="p-2 rounded-lg bg-warning/10 border border-warning/20 text-xs">
                  <div className="font-medium text-warning">Concentration Alert</div>
                  <div className="text-muted-foreground">Banking sector at 35%</div>
                </div>
                <div className="p-2 rounded-lg bg-gain/10 border border-gain/20 text-xs">
                  <div className="font-medium text-gain">Strategy Update</div>
                  <div className="text-muted-foreground">Banking momentum +28.5%</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
