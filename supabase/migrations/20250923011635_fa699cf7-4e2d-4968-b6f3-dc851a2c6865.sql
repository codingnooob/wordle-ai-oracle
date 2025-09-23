-- Critical Security Fix: Proper RLS Policy Role Assignment and Anonymous Access Denial
-- This migration fixes the critical vulnerability where RLS policies were applied to 'public' role (includes anonymous users)

-- 1. Fix session_tokens table - Service role only with explicit anonymous denial
DROP POLICY IF EXISTS "Service role only session tokens access" ON public.session_tokens;
CREATE POLICY "Service role only session tokens access" ON public.session_tokens
FOR ALL TO authenticated
USING (((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text) = 'service_role'::text)
WITH CHECK (((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text) = 'service_role'::text);

CREATE POLICY "Deny anonymous session tokens access" ON public.session_tokens
FOR ALL TO anon
USING (false);

-- 2. Fix security_events table - Service role only with explicit anonymous denial
DROP POLICY IF EXISTS "Service role only security events access" ON public.security_events;
CREATE POLICY "Service role only security events access" ON public.security_events
FOR ALL TO authenticated
USING (((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text) = 'service_role'::text)
WITH CHECK (((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text) = 'service_role'::text);

CREATE POLICY "Deny anonymous security events access" ON public.security_events
FOR ALL TO anon
USING (false);

-- 3. Fix audit_log table - Service role only with explicit anonymous denial
DROP POLICY IF EXISTS "Service role comprehensive audit log access" ON public.audit_log;
DROP POLICY IF EXISTS "Restrictive service role only audit log" ON public.audit_log;
CREATE POLICY "Service role only audit log access" ON public.audit_log
FOR ALL TO authenticated
USING (((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text) = 'service_role'::text)
WITH CHECK (((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text) = 'service_role'::text);

CREATE POLICY "Deny anonymous audit log access" ON public.audit_log
FOR ALL TO anon
USING (false);

-- 4. Fix system_config table - Service role only with explicit anonymous denial
DROP POLICY IF EXISTS "Service role only system config access" ON public.system_config;
CREATE POLICY "Service role only system config access" ON public.system_config
FOR ALL TO authenticated
USING (((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text) = 'service_role'::text)
WITH CHECK (((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text) = 'service_role'::text);

CREATE POLICY "Deny anonymous system config access" ON public.system_config
FOR ALL TO anon
USING (false);

-- 5. Fix analysis_jobs table - Allow public INSERT but restrict SELECT to service role
DROP POLICY IF EXISTS "Service role job management" ON public.analysis_jobs;
DROP POLICY IF EXISTS "Service role only analysis jobs access" ON public.analysis_jobs;
DROP POLICY IF EXISTS "Allow secure job creation" ON public.analysis_jobs;

-- Service role can do everything
CREATE POLICY "Service role comprehensive analysis jobs access" ON public.analysis_jobs
FOR ALL TO authenticated
USING (((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text) = 'service_role'::text)
WITH CHECK (((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text) = 'service_role'::text);

-- Public can only INSERT (for API functionality)
CREATE POLICY "Allow public job creation only" ON public.analysis_jobs
FOR INSERT TO public
WITH CHECK (
  input_data IS NOT NULL 
  AND jsonb_typeof(input_data) = 'object'::text 
  AND session_token IS NOT NULL 
  AND length(session_token) >= 32
);

-- Explicitly deny public SELECT/UPDATE/DELETE
CREATE POLICY "Deny public read access to analysis jobs" ON public.analysis_jobs
FOR SELECT TO public
USING (false);

CREATE POLICY "Deny public update access to analysis jobs" ON public.analysis_jobs
FOR UPDATE TO public
USING (false);

CREATE POLICY "Deny public delete access to analysis jobs" ON public.analysis_jobs
FOR DELETE TO public
USING (false);

-- 6. Fix analysis_results table - Allow public INSERT but restrict SELECT to service role
DROP POLICY IF EXISTS "Secure results access via function only" ON public.analysis_results;
DROP POLICY IF EXISTS "Allow secure result creation" ON public.analysis_results;

-- Service role can do everything
CREATE POLICY "Service role comprehensive analysis results access" ON public.analysis_results
FOR ALL TO authenticated
USING (((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text) = 'service_role'::text)
WITH CHECK (((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text) = 'service_role'::text);

-- Public can only INSERT (for API functionality)
CREATE POLICY "Allow public result creation only" ON public.analysis_results
FOR INSERT TO public
WITH CHECK (
  solutions IS NOT NULL
  AND job_id IS NOT NULL
);

-- Explicitly deny public SELECT/UPDATE/DELETE
CREATE POLICY "Deny public read access to analysis results" ON public.analysis_results
FOR SELECT TO public
USING (false);

CREATE POLICY "Deny public update access to analysis results" ON public.analysis_results
FOR UPDATE TO public
USING (false);

CREATE POLICY "Deny public delete access to analysis results" ON public.analysis_results
FOR DELETE TO public
USING (false);

-- 7. Fix api_usage table - Maintain existing restrictive policies but ensure anonymous denial
DROP POLICY IF EXISTS "Service role comprehensive api_usage access" ON public.api_usage;
CREATE POLICY "Service role comprehensive api_usage access" ON public.api_usage
FOR ALL TO authenticated
USING (((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text) = 'service_role'::text)
WITH CHECK (((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text) = 'service_role'::text);

-- Keep the existing restrictive anonymous rate limit check (it's already secure)
-- This policy allows very limited SELECT access for rate limiting purposes only

-- Add explicit denial for anonymous INSERT/UPDATE/DELETE on api_usage
CREATE POLICY "Deny anonymous api_usage modifications" ON public.api_usage
FOR INSERT TO anon
WITH CHECK (false);

CREATE POLICY "Deny anonymous api_usage updates" ON public.api_usage
FOR UPDATE TO anon
USING (false);

CREATE POLICY "Deny anonymous api_usage deletions" ON public.api_usage
FOR DELETE TO anon
USING (false);