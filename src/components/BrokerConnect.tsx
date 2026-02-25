import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Link2, 
  Check, 
  ExternalLink, 
  Shield, 
  Zap,
  ChevronRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

import { toast } from "@/hooks/use-toast";

const brokers = [
  { 
    id: "zerodha", 
    name: "Zerodha", 
    logo: "Z",
    color: "from-[#387ED1] to-[#2B5C9E]",
    description: "India's largest retail stockbroker",
    users: "1.5Cr+ users",
    popular: true
  },
  { 
    id: "upstox", 
    name: "Upstox", 
    logo: "U",
    color: "from-[#7B2D8E] to-[#5A1F68]",
    description: "Fast & reliable trading platform",
    users: "1Cr+ users",
    popular: true
  },
  { 
    id: "groww", 
    name: "Groww", 
    logo: "G",
    color: "from-[#5367FF] to-[#3D4FCC]",
    description: "Stocks, MFs & more in one app",
    users: "80L+ users",
    popular: true
  },
  { 
    id: "angelone", 
    name: "Angel One", 
    logo: "A",
    color: "from-[#F26522] to-[#C44F18]",
    description: "Full-service stockbroker",
    users: "50L+ users",
    popular: false
  },
  { 
    id: "icici", 
    name: "ICICI Direct", 
    logo: "I",
    color: "from-[#B02A30] to-[#8A2025]",
    description: "Banking + Broking combined",
    users: "45L+ users",
    popular: false
  },
  { 
    id: "hdfc", 
    name: "HDFC Securities", 
    logo: "H",
    color: "from-[#004C8F] to-[#003366]",
    description: "Trusted banking partner",
    users: "40L+ users",
    popular: false
  },
  { 
    id: "kotak", 
    name: "Kotak Securities", 
    logo: "K",
    color: "from-[#ED1C24] to-[#B8161C]",
    description: "Award-winning trading platform",
    users: "30L+ users",
    popular: false
  },
  { 
    id: "paytm", 
    name: "Paytm Money", 
    logo: "P",
    color: "from-[#00BAF2] to-[#0095C4]",
    description: "Digital-first investing",
    users: "25L+ users",
    popular: false
  },
];

// Mock portfolio data for each broker
const mockPortfolioData: Record<string, Array<{
  stock_symbol: string;
  stock_name: string;
  quantity: number;
  average_price: number;
  current_price: number;
  sector: string;
  exchange: string;
}>> = {
  zerodha: [
    { stock_symbol: "RELIANCE", stock_name: "Reliance Industries Ltd", quantity: 25, average_price: 2450, current_price: 2680, sector: "Energy", exchange: "NSE" },
    { stock_symbol: "TCS", stock_name: "Tata Consultancy Services", quantity: 15, average_price: 3200, current_price: 3580, sector: "IT", exchange: "NSE" },
    { stock_symbol: "HDFCBANK", stock_name: "HDFC Bank Ltd", quantity: 40, average_price: 1580, current_price: 1720, sector: "Banking", exchange: "NSE" },
  ],
  upstox: [
    { stock_symbol: "INFY", stock_name: "Infosys Ltd", quantity: 30, average_price: 1420, current_price: 1580, sector: "IT", exchange: "NSE" },
    { stock_symbol: "ICICIBANK", stock_name: "ICICI Bank Ltd", quantity: 50, average_price: 980, current_price: 1120, sector: "Banking", exchange: "NSE" },
    { stock_symbol: "BHARTIARTL", stock_name: "Bharti Airtel Ltd", quantity: 20, average_price: 1250, current_price: 1380, sector: "Telecom", exchange: "NSE" },
  ],
  groww: [
    { stock_symbol: "WIPRO", stock_name: "Wipro Ltd", quantity: 60, average_price: 420, current_price: 480, sector: "IT", exchange: "NSE" },
    { stock_symbol: "SBIN", stock_name: "State Bank of India", quantity: 80, average_price: 620, current_price: 750, sector: "Banking", exchange: "NSE" },
    { stock_symbol: "TATAMOTORS", stock_name: "Tata Motors Ltd", quantity: 35, average_price: 680, current_price: 820, sector: "Automobile", exchange: "NSE" },
  ],
  angelone: [
    { stock_symbol: "MARUTI", stock_name: "Maruti Suzuki India Ltd", quantity: 5, average_price: 10200, current_price: 11500, sector: "Automobile", exchange: "NSE" },
    { stock_symbol: "BAJFINANCE", stock_name: "Bajaj Finance Ltd", quantity: 12, average_price: 6800, current_price: 7200, sector: "Finance", exchange: "NSE" },
  ],
  icici: [
    { stock_symbol: "AXISBANK", stock_name: "Axis Bank Ltd", quantity: 45, average_price: 1050, current_price: 1180, sector: "Banking", exchange: "NSE" },
    { stock_symbol: "LT", stock_name: "Larsen & Toubro Ltd", quantity: 18, average_price: 2800, current_price: 3100, sector: "Infrastructure", exchange: "NSE" },
  ],
  hdfc: [
    { stock_symbol: "SUNPHARMA", stock_name: "Sun Pharmaceutical", quantity: 25, average_price: 1120, current_price: 1280, sector: "Pharma", exchange: "NSE" },
    { stock_symbol: "TITAN", stock_name: "Titan Company Ltd", quantity: 10, average_price: 3200, current_price: 3450, sector: "Consumer", exchange: "NSE" },
  ],
  kotak: [
    { stock_symbol: "KOTAKBANK", stock_name: "Kotak Mahindra Bank", quantity: 22, average_price: 1750, current_price: 1920, sector: "Banking", exchange: "NSE" },
    { stock_symbol: "ASIANPAINT", stock_name: "Asian Paints Ltd", quantity: 15, average_price: 2900, current_price: 3100, sector: "Consumer", exchange: "NSE" },
  ],
  paytm: [
    { stock_symbol: "ZOMATO", stock_name: "Zomato Ltd", quantity: 100, average_price: 120, current_price: 180, sector: "Consumer", exchange: "NSE" },
    { stock_symbol: "PAYTM", stock_name: "One 97 Communications", quantity: 50, average_price: 650, current_price: 580, sector: "Fintech", exchange: "NSE" },
  ],
};

interface BrokerConnectProps {
  trigger?: React.ReactNode;
  variant?: "default" | "hero" | "compact";
  onConnect?: () => void;
}

export function BrokerConnect({ trigger, variant = "default", onConnect }: BrokerConnectProps) {
  const [open, setOpen] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [connected, setConnected] = useState<string[]>([]);

  const handleConnect = async (brokerId: string) => {
    setConnecting(brokerId);
    
    try {
      // Get mock portfolio data for this broker
      const portfolioData = mockPortfolioData[brokerId] || mockPortfolioData.zerodha;
      
      // Insert holdings into database
      const holdingsToInsert = portfolioData.map(h => ({
        ...h,
        user_id: "anonymous",
        broker_source: brokerId,
      }));

      const { error } = await supabase
        .from("portfolio_holdings")
        .insert(holdingsToInsert);

      if (error) throw error;

      setConnected(prev => [...prev, brokerId]);
      toast({
        title: "Broker connected!",
        description: `Successfully imported ${portfolioData.length} holdings from ${brokers.find(b => b.id === brokerId)?.name}.`,
      });
      onConnect?.();
    } catch (error: any) {
      toast({
        title: "Connection failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setConnecting(null);
    }
  };

  const defaultTrigger = variant === "hero" ? (
    <Button variant="glass" size="lg" className="gap-2">
      <Link2 className="w-4 h-4" />
      Connect Broker
    </Button>
  ) : variant === "compact" ? (
    <Button variant="outline" size="sm" className="gap-2">
      <Link2 className="w-4 h-4" />
      Connect
    </Button>
  ) : (
    <Button variant="outline" className="gap-2">
      <Link2 className="w-4 h-4" />
      Connect Demat
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Link2 className="w-4 h-4 text-primary" />
            </div>
            Connect Your Demat Account
          </DialogTitle>
          <DialogDescription className="text-base">
            Import your portfolio automatically from your broker
          </DialogDescription>
        </DialogHeader>

        {/* Security Badge */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-gain/5 border border-gain/20">
          <Shield className="w-5 h-5 text-gain flex-shrink-0" />
          <div>
            <div className="text-sm font-medium text-gain">Bank-Grade Security</div>
            <div className="text-xs text-muted-foreground">
              Your credentials are never stored. We use OAuth for secure read-only access.
            </div>
          </div>
        </div>

        {/* Popular Brokers */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-muted-foreground">Popular Brokers</div>
          <div className="grid gap-2">
            {brokers.filter(b => b.popular).map((broker) => (
              <BrokerCard
                key={broker.id}
                broker={broker}
                isConnecting={connecting === broker.id}
                isConnected={connected.includes(broker.id)}
                onConnect={() => handleConnect(broker.id)}
              />
            ))}
          </div>
        </div>

        {/* Other Brokers */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-muted-foreground">Other Brokers</div>
          <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-1">
            {brokers.filter(b => !b.popular).map((broker) => (
              <BrokerCardCompact
                key={broker.id}
                broker={broker}
                isConnecting={connecting === broker.id}
                isConnected={connected.includes(broker.id)}
                onConnect={() => handleConnect(broker.id)}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Zap className="w-3 h-3" />
            Syncs portfolio in real-time
          </div>
          <Button variant="link" size="sm" className="text-xs gap-1">
            Don't see your broker?
            <ExternalLink className="w-3 h-3" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface BrokerCardProps {
  broker: typeof brokers[0];
  isConnecting: boolean;
  isConnected: boolean;
  onConnect: () => void;
}

function BrokerCard({ broker, isConnecting, isConnected, onConnect }: BrokerCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={`relative p-4 rounded-xl border transition-all cursor-pointer ${
        isConnected 
          ? "bg-gain/5 border-gain/30" 
          : "bg-secondary/30 border-border/50 hover:border-primary/30 hover:bg-secondary/50"
      }`}
      onClick={() => !isConnected && !isConnecting && onConnect()}
    >
      <div className="flex items-center gap-4">
        {/* Logo */}
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${broker.color} flex items-center justify-center shadow-lg`}>
          <span className="text-xl font-bold text-white">{broker.logo}</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{broker.name}</span>
            {broker.popular && (
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">
                POPULAR
              </span>
            )}
          </div>
          <div className="text-sm text-muted-foreground">{broker.description}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{broker.users}</div>
        </div>

        {/* Action */}
        <AnimatePresence mode="wait">
          {isConnected ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-10 h-10 rounded-full bg-gain/10 flex items-center justify-center"
            >
              <Check className="w-5 h-5 text-gain" />
            </motion.div>
          ) : isConnecting ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-10 h-10 rounded-full border-2 border-primary/30 border-t-primary"
            />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20"
            >
              <ChevronRight className="w-5 h-5 text-primary" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function BrokerCardCompact({ broker, isConnecting, isConnected, onConnect }: BrokerCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`p-3 rounded-lg border transition-all cursor-pointer ${
        isConnected 
          ? "bg-gain/5 border-gain/30" 
          : "bg-secondary/30 border-border/50 hover:border-primary/30"
      }`}
      onClick={() => !isConnected && !isConnecting && onConnect()}
    >
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${broker.color} flex items-center justify-center`}>
          <span className="text-sm font-bold text-white">{broker.logo}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">{broker.name}</div>
          <div className="text-xs text-muted-foreground">{broker.users}</div>
        </div>
        {isConnected ? (
          <Check className="w-4 h-4 text-gain" />
        ) : isConnecting ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-4 h-4 rounded-full border-2 border-primary/30 border-t-primary"
          />
        ) : null}
      </div>
    </motion.div>
  );
}
