-- Fix: Remove anonymous SELECT policy that exposes business intelligence
-- This policy allowed anonymous users to query api_usage data, exposing request patterns
DROP POLICY IF EXISTS "Restrictive anonymous rate limit check only" ON public.api_usage;

-- Rate limiting is already enforced server-side in edge functions
-- No client-side access to api_usage data is needed