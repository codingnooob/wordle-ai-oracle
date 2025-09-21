-- Fix critical security vulnerabilities in sensitive tables
-- Convert PERMISSIVE policies to RESTRICTIVE for security-critical tables

-- Fix system_config table security
DROP POLICY IF EXISTS "Service role only system config access" ON public.system_config;

CREATE POLICY "Restrictive service role only system config access" 
ON public.system_config
AS RESTRICTIVE
FOR ALL 
TO public
USING (((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text) = 'service_role'::text)
WITH CHECK (((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text) = 'service_role'::text);

-- Fix security_events table (convert to restrictive)
DROP POLICY IF EXISTS "Service role only security events - bulletproof" ON public.security_events;

CREATE POLICY "Restrictive service role only security events" 
ON public.security_events
AS RESTRICTIVE
FOR ALL 
TO public
USING (((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text) = 'service_role'::text)
WITH CHECK (((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text) = 'service_role'::text);

-- Fix audit_log table (convert to restrictive)
DROP POLICY IF EXISTS "Service role only audit log - bulletproof" ON public.audit_log;

CREATE POLICY "Restrictive service role only audit log" 
ON public.audit_log
AS RESTRICTIVE
FOR ALL 
TO public
USING (((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text) = 'service_role'::text)
WITH CHECK (((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text) = 'service_role'::text);

-- Improve api_usage table security (more restrictive anonymous access)
DROP POLICY IF EXISTS "Anonymous rate limit validation only" ON public.api_usage;

-- Only allow very specific read access for rate limiting
CREATE POLICY "Restrictive anonymous rate limit check only" 
ON public.api_usage
AS RESTRICTIVE
FOR SELECT 
TO anon
USING ((last_request > (now() - '00:05:00'::interval)) 
       AND (endpoint = 'wordle-solver'::text) 
       AND (created_at > (now() - '01:00:00'::interval))
       AND (request_count IS NOT NULL));

-- Ensure service role has full access to api_usage
CREATE POLICY "Service role full api_usage access" 
ON public.api_usage
AS PERMISSIVE
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- Log security improvements
INSERT INTO public.security_events (
  event_type,
  endpoint,
  details,
  severity
) VALUES (
  'security_hardening',
  'database_policies',
  jsonb_build_object(
    'action', 'converted_permissive_to_restrictive_policies',
    'tables_affected', ARRAY['system_config', 'security_events', 'audit_log', 'api_usage'],
    'security_improvement', 'critical_tables_now_use_restrictive_rls',
    'timestamp', now()
  ),
  'info'
);