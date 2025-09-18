-- Remove the overly permissive public access policy from api_usage table
-- This table contains sensitive business data like API usage patterns and should not be publicly accessible

DROP POLICY IF EXISTS "Allow public access to api usage" ON public.api_usage;

-- No new policies needed - edge functions use service role key which bypasses RLS
-- This ensures only authorized backend services can access usage data