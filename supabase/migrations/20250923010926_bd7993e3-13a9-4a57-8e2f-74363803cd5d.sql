-- Fix critical security vulnerabilities by implementing proper RLS policies

-- 1. Fix session_tokens table - Remove any public access
DROP POLICY IF EXISTS "Allow public session token access" ON public.session_tokens;
DROP POLICY IF EXISTS "Public session token access" ON public.session_tokens;

-- Ensure only service role can access session tokens
CREATE POLICY "Service role only session tokens access" ON public.session_tokens
FOR ALL USING (
  ((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text) = 'service_role'::text
)
WITH CHECK (
  ((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text) = 'service_role'::text
);

-- 2. Fix security_events table - Remove any public access
DROP POLICY IF EXISTS "Allow public security events access" ON public.security_events;
DROP POLICY IF EXISTS "Public security events access" ON public.security_events;

-- Ensure only service role can access security events
CREATE POLICY "Service role only security events access" ON public.security_events
FOR ALL USING (
  ((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text) = 'service_role'::text
)
WITH CHECK (
  ((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text) = 'service_role'::text
);

-- 3. Fix audit_log table - Remove any public access
DROP POLICY IF EXISTS "Allow public audit log access" ON public.audit_log;
DROP POLICY IF EXISTS "Public audit log access" ON public.audit_log;

-- Remove duplicate policies and ensure only service role access
DROP POLICY IF EXISTS "Restrictive service role only audit log" ON public.audit_log;
CREATE POLICY "Service role only audit log access" ON public.audit_log
FOR ALL USING (
  ((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text) = 'service_role'::text
)
WITH CHECK (
  ((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text) = 'service_role'::text
);

-- 4. Fix system_config table - Remove any public access
DROP POLICY IF EXISTS "Allow public system config access" ON public.system_config;
DROP POLICY IF EXISTS "Public system config access" ON public.system_config;

-- Ensure only service role can access system config
CREATE POLICY "Service role only system config access" ON public.system_config
FOR ALL USING (
  ((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text) = 'service_role'::text
)
WITH CHECK (
  ((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text) = 'service_role'::text
);

-- 5. Fix analysis_jobs table - Implement proper access controls
DROP POLICY IF EXISTS "Allow public analysis jobs access" ON public.analysis_jobs;
DROP POLICY IF EXISTS "Public analysis jobs access" ON public.analysis_jobs;
DROP POLICY IF EXISTS "Service role only analysis jobs access" ON public.analysis_jobs;

-- Allow service role full access
CREATE POLICY "Service role analysis jobs management" ON public.analysis_jobs
FOR ALL USING (
  ((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text) = 'service_role'::text
)
WITH CHECK (
  ((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text) = 'service_role'::text
);

-- Allow public to create jobs (needed for API functionality)
CREATE POLICY "Allow public job creation" ON public.analysis_jobs
FOR INSERT WITH CHECK (
  input_data IS NOT NULL 
  AND jsonb_typeof(input_data) = 'object'::text 
  AND session_token IS NOT NULL 
  AND length(session_token) >= 32
);

-- 6. Fix analysis_results table - Ensure proper access
DROP POLICY IF EXISTS "Allow public analysis results access" ON public.analysis_results;
DROP POLICY IF EXISTS "Public analysis results access" ON public.analysis_results;

-- Keep existing secure policies but ensure no public SELECT access
CREATE POLICY "Service role only results access" ON public.analysis_results
FOR SELECT USING (
  ((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text) = 'service_role'::text
);

-- Allow public INSERT for API functionality (results creation)
-- This is secure because users can only insert, not read others' results
CREATE POLICY "Allow public result creation" ON public.analysis_results
FOR INSERT WITH CHECK (true);