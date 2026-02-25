import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/investment-chat`;

const QUICK_SUGGESTIONS: Record<string, string[]> = {
  portfolio: [
    "What's my current risk exposure?",
    "Should I rebalance my portfolio?",
    "Which stocks are underperforming?"
  ],
  risk: [
    "How can I reduce sector concentration?",
    "What defensive stocks should I add?",
    "Show me my portfolio's volatility"
  ],
  strategy: [
    "Suggest improvements to my strategies",
    "When should I take profits?",
    "How do I hedge against market downturns?"
  ],
  default: [
    "Analyze my portfolio performance",
    "What's the market outlook today?",
    "Suggest rebalancing ideas"
  ]
};

function getSuggestions(content: string): string[] {
  const lowerContent = content.toLowerCase();
  if (lowerContent.includes("risk") || lowerContent.includes("volatility")) {
    return QUICK_SUGGESTIONS.risk;
  }
  if (lowerContent.includes("strategy") || lowerContent.includes("improve")) {
    return QUICK_SUGGESTIONS.strategy;
  }
  if (lowerContent.includes("portfolio") || lowerContent.includes("holding")) {
    return QUICK_SUGGESTIONS.portfolio;
  }
  return QUICK_SUGGESTIONS.default;
}

export function useAIChat(initialMessages: Message[]) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    let assistantContent = "";

    const updateAssistantMessage = (nextChunk: string) => {
      assistantContent += nextChunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => 
            i === prev.length - 1 ? { ...m, content: assistantContent } : m
          );
        }
        return [...prev, { 
          role: "assistant" as const, 
          id: (Date.now() + 1).toString(),
          content: assistantContent,
          timestamp: new Date()
        }];
      });
    };

    try {
      const conversationHistory = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content
      }));

      // Get the current session token for authenticated requests
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("Please sign in to use the AI chat feature");
      }
      const authToken = session.access_token;

      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ messages: conversationHistory }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) updateAssistantMessage(content);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Add suggestions after streaming completes
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => 
            i === prev.length - 1 
              ? { ...m, suggestions: getSuggestions(m.content) } 
              : m
          );
        }
        return prev;
      });

    } catch (error) {
      console.error("AI chat error:", error);
      toast({
        title: "AI Error",
        description: error instanceof Error ? error.message : "Failed to get AI response",
        variant: "destructive",
      });
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && !last.content) {
          return prev.slice(0, -1);
        }
        return prev;
      });
    } finally {
      setIsTyping(false);
    }
  }, [messages, isTyping]);

  return { messages, isTyping, sendMessage };
}
