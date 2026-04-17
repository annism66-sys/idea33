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
import { useAIChat } from "@/hooks/useAIChat";
import ReactMarkdown from "react-markdown";

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
    content: "👋 Hello! I'm your Investment Agent powered by advanced analytics. I can help you understand your portfolio, explain market movements, and provide personalized investment guidance for Indian markets. How can I assist you today?",
    timestamp: new Date(),
    suggestions: [
      "Why did my portfolio drop today?",
      "Analyze my risk exposure",
      "Suggest improvements to my strategy",
      "Explain the banking sector outlook"
    ]
  }
];

export default function Agent() {
  const { messages, isTyping, sendMessage } = useAIChat(initialMessages);
  const [input, setInput] = useState("");
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
    sendMessage(text);
    setInput("");
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
                <h2 className="font-semibold">Investment Agent</h2>
                <p className="text-xs text-muted-foreground">Powered by advanced analytics</p>
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
                        {message.role === "assistant" ? (
                          <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0.5">
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                          </div>
                        ) : (
                          <p className="text-sm">{message.content}</p>
                        )}
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
                  disabled={isTyping}
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
                  disabled={isTyping}
                  className="w-full p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 text-left text-sm transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <TrendingDown className="w-4 h-4 text-loss" />
                  Explain today's drop
                </button>
                <button
                  onClick={() => handleSend("Analyze my risk exposure in detail")}
                  disabled={isTyping}
                  className="w-full p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 text-left text-sm transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  Risk analysis
                </button>
                <button
                  onClick={() => handleSend("Suggest improvements to my investment strategy")}
                  disabled={isTyping}
                  className="w-full p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 text-left text-sm transition-colors flex items-center gap-2 disabled:opacity-50"
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
