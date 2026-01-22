import { motion } from "framer-motion";
import { 
  Brain, 
  LineChart, 
  Wallet, 
  Bot, 
  Shield, 
  Zap,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Brain,
    title: "AI Idea Generation",
    description: "Get personalized investment ideas based on your risk profile, market conditions, and investment goals. Our AI analyzes patterns across NSE/BSE to surface opportunities.",
    gradient: "from-primary to-primary/60",
  },
  {
    icon: LineChart,
    title: "Strategy Builder",
    description: "Convert your investment thesis into rule-based strategies using plain English. Our AI translates your ideas into entry/exit rules, position sizing, and rebalancing logic.",
    gradient: "from-accent to-accent/60",
  },
  {
    icon: Zap,
    title: "Backtesting Engine",
    description: "Test your strategies against years of historical data. Visualize performance, drawdowns, and risk-adjusted returns before risking real capital.",
    gradient: "from-warning to-warning/60",
  },
  {
    icon: Wallet,
    title: "Portfolio Analytics",
    description: "Combine multiple strategies into a cohesive portfolio. Monitor concentration risk, volatility, and get AI-powered explanations of your portfolio dynamics.",
    gradient: "from-gain to-gain/60",
  },
  {
    icon: Bot,
    title: "AI Investing Agent",
    description: "Your personal AI analyst that explains performance changes, flags risks, suggests improvements, and acts as a behavioral guardrail for your investments.",
    gradient: "from-primary to-accent",
  },
  {
    icon: Shield,
    title: "Risk Management",
    description: "Advanced risk analytics including VaR, maximum drawdown, Sharpe ratio, and more. Get alerts when your portfolio drifts from your target allocation.",
    gradient: "from-loss to-loss/60",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need to Invest
            <span className="gradient-text"> Intelligently</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A complete suite of AI-powered tools designed for the Indian markets, 
            from idea generation to portfolio optimization.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group glass-card p-6 hover-lift cursor-pointer"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                {feature.description}
              </p>
              <div className="flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Learn more <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
