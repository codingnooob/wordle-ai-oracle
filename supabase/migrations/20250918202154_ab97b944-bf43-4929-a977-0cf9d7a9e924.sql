-- Fix RLS policy missing for api_usage table

-- Add RLS policy for api_usage table to allow service role access
CREATE POLICY "Allow service role access to api_usage" ON public.api_usage
FOR ALL USING (
  current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
);

-- Allow public read access for rate limiting checks (needed for anonymous usage tracking)
CREATE POLICY "Allow public read for rate limiting" ON public.api_usage
FOR SELECT USING (true);

-- Allow public insert for usage tracking
CREATE POLICY "Allow public insert for usage tracking" ON public.api_usage
FOR INSERT WITH CHECK (true);

-- Allow public update for usage tracking
CREATE POLICY "Allow public update for usage tracking" ON public.api_usage
FOR UPDATE USING (true);