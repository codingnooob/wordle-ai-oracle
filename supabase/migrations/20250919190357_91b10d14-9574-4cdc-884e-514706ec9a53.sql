-- Create a secure view for rate limiting that excludes sensitive data
CREATE OR REPLACE VIEW public.api_usage_rate_limit AS
SELECT 
  endpoint,
  request_count,
  last_request,
  created_at
FROM public.api_usage
WHERE last_request > (now() - '1 hour'::interval);

-- Update RLS policies to restrict access to sensitive api_usage data
DROP POLICY IF EXISTS "Limited public read for rate limiting" ON public.api_usage;
DROP POLICY IF EXISTS "Limited public update for usage" ON public.api_usage;
DROP POLICY IF EXISTS "Public insert for new usage" ON public.api_usage;

-- Create more restrictive policies
CREATE POLICY "Service role full access to api_usage" 
ON public.api_usage 
FOR ALL 
USING (((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text) = 'service_role'::text);

-- Allow very limited public access only for active rate limiting
CREATE POLICY "Public rate limit check only" 
ON public.api_usage 
FOR SELECT 
USING (
  last_request > (now() - '1 hour'::interval) 
  AND api_key_hash IS NOT NULL
);

-- Allow public insert for usage tracking but restrict what can be inserted
CREATE POLICY "Public usage tracking insert" 
ON public.api_usage 
FOR INSERT 
WITH CHECK (
  api_key_hash IS NOT NULL 
  AND endpoint IS NOT NULL 
  AND request_count = 1
  AND last_request >= (now() - '5 minutes'::interval)
  AND last_request <= now()
);

-- Allow limited updates for usage tracking
CREATE POLICY "Public usage increment only" 
ON public.api_usage 
FOR UPDATE 
USING (
  created_at > (now() - '24 hours'::interval)
  AND last_request > (now() - '1 hour'::interval)
) 
WITH CHECK (
  request_count > (SELECT request_count FROM api_usage WHERE id = api_usage.id)
  AND last_request > (SELECT last_request FROM api_usage WHERE id = api_usage.id)
  AND last_request <= now()
);

-- Create audit table for security events
CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  source_ip TEXT,
  user_agent TEXT,
  api_key_hash TEXT,
  endpoint TEXT,
  details JSONB,
  severity TEXT DEFAULT 'info',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on security events
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Only service role can access security events
CREATE POLICY "Service role only security events" 
ON public.security_events 
FOR ALL 
USING (((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text) = 'service_role'::text);