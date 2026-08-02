CREATE TABLE public.broker_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  broker TEXT NOT NULL,
  client_id TEXT NOT NULL,
  api_key TEXT,
  access_token TEXT,
  refresh_token TEXT,
  feed_token TEXT,
  token_expiry TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, broker)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.broker_connections TO authenticated;
GRANT ALL ON public.broker_connections TO service_role;

ALTER TABLE public.broker_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own broker connections"
ON public.broker_connections FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own broker connections"
ON public.broker_connections FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own broker connections"
ON public.broker_connections FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own broker connections"
ON public.broker_connections FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_broker_connections_user_id ON public.broker_connections(user_id);

CREATE TRIGGER update_broker_connections_updated_at
BEFORE UPDATE ON public.broker_connections
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.angelone_instruments (
  token TEXT NOT NULL,
  symbol TEXT NOT NULL,
  name TEXT,
  exchange TEXT NOT NULL,
  lotsize INTEGER,
  instrumenttype TEXT,
  tick_size NUMERIC,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (exchange, token)
);

GRANT SELECT ON public.angelone_instruments TO authenticated;
GRANT ALL ON public.angelone_instruments TO service_role;

ALTER TABLE public.angelone_instruments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read instruments"
ON public.angelone_instruments FOR SELECT TO authenticated USING (true);

CREATE INDEX idx_angelone_instruments_symbol ON public.angelone_instruments(symbol);
CREATE INDEX idx_angelone_instruments_name ON public.angelone_instruments(name);