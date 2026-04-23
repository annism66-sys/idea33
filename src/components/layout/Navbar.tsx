import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Lightbulb, 
  FlaskConical, 
  BarChart3, 
  PieChart, 
  Bot,
  Menu,
  X,
  Link2,
  Shield,
  LogOut,
  User,
  Crown,
  Gauge,
} from "lucide-react";
import { useState } from "react";
import { BrokerConnect } from "@/components/BrokerConnect";
import { useAuth } from "@/hooks/useAuth";
import { ModeToggle } from "@/components/mode/ModeToggle";

const navItems = [
  { path: "/ideas", label: "Ideas", icon: Lightbulb },
  { path: "/strategy", label: "Strategy", icon: FlaskConical },
  { path: "/risk-budget", label: "Risk", icon: Shield },
  { path: "/backtest", label: "Backtest", icon: BarChart3 },
  { path: "/options-intelligence", label: "Options", icon: Gauge },
  { path: "/portfolio", label: "Portfolio", icon: PieChart },
  { path: "/agent", label: "Agent", icon: Bot },
  { path: "/plans", label: "Plans", icon: Crown },
];

export function Navbar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, loading, signOut } = useAuth();

  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "User";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg group-hover:shadow-primary/30 transition-shadow">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold tracking-tight">Arken</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <motion.div
                    className={`relative px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors ${
                      isActive 
                        ? "text-primary" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                    {isActive && (
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute inset-0 bg-primary/10 rounded-lg -z-10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            <ModeToggle size="sm" />
            <BrokerConnect 
              variant="compact"
              trigger={
                <Button variant="outline" size="sm" className="gap-2 rounded-full">
                  <Link2 className="w-4 h-4" />
                  Connect Broker
                </Button>
              }
            />
            {!loading && (
              user ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/60 border border-border/40">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{displayName}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={signOut} className="gap-2">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Link to="/auth">
                  <Button variant="outline" size="sm" className="gap-2 rounded-full">
                    Sign In
                  </Button>
                </Link>
              )
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-accent/50 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t border-border/30"
          >
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
              {!loading && (
                user ? (
                  <button
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors text-left"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out ({displayName})
                  </button>
                ) : (
                  <Link
                    to="/auth"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                  >
                    <User className="w-5 h-5" />
                    Sign In
                  </Link>
                )
              )}
            </nav>
          </motion.div>
        )}
      </div>
    </header>
  );
}
