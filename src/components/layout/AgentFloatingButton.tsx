import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Bot } from "lucide-react";

export function AgentFloatingButton() {
  const location = useLocation();

  // Hide on the agent page itself and on the auth page
  if (location.pathname === "/agent" || location.pathname === "/auth") return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 }}
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50"
    >
      <Link
        to="/agent"
        aria-label="Open Agent"
        title="Agent"
        className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-105 active:scale-95 transition-all"
      >
        <Bot className="w-6 h-6" />
      </Link>
    </motion.div>
  );
}
