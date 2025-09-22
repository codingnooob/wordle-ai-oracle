-- Fix the SECURITY DEFINER view issue by removing it and using proper RLS
DROP VIEW IF EXISTS public.job_status_public;

-- Clean up duplicate policies and ensure proper access control
DROP POLICY IF EXISTS "Secure service role only access" ON public.analysis_jobs;

-- Ensure only service role can access the main table for management
-- Public users should only access through secure functions
CREATE POLICY "Restrict table access to service role only" 
ON public.analysis_jobs 
FOR ALL
USING (((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text) = 'service_role'::text)
WITH CHECK (((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text) = 'service_role'::text);

-- Allow public job creation (needed for the API)
CREATE POLICY "Allow public job creation secure" 
ON public.analysis_jobs 
FOR INSERT
WITH CHECK (
  input_data IS NOT NULL 
  AND jsonb_typeof(input_data) = 'object'::text 
  AND session_token IS NOT NULL 
  AND length(session_token) >= 32
);

-- Log the security enhancement
INSERT INTO public.security_events (
  event_type,
  endpoint,
  details,
  severity
) VALUES (
  'security_enhancement',
  'analysis_jobs_policies',
  jsonb_build_object(
    'action', 'removed_security_definer_view',
    'description', 'Replaced SECURITY DEFINER view with proper RLS policies',
    'timestamp', now()
  ),
  'info'
);