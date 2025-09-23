-- Fix critical security vulnerabilities with targeted policy updates

-- First, let's check what policies might be allowing public access that shouldn't be there

-- 1. Ensure analysis_jobs only allows limited public access (INSERT only, not SELECT)
DROP POLICY IF EXISTS "Allow public job creation secure" ON public.analysis_jobs;
CREATE POLICY "Allow secure job creation" ON public.analysis_jobs
FOR INSERT WITH CHECK (
  input_data IS NOT NULL 
  AND jsonb_typeof(input_data) = 'object'::text 
  AND session_token IS NOT NULL 
  AND length(session_token) >= 32
);

-- 2. Make sure analysis_results only allows INSERT, not SELECT for public
DROP POLICY IF EXISTS "Allow public result creation" ON public.analysis_results;
CREATE POLICY "Allow secure result creation" ON public.analysis_results
FOR INSERT WITH CHECK (
  solutions IS NOT NULL
  AND job_id IS NOT NULL
);

-- 3. Remove any potential public SELECT policies that might exist
DROP POLICY IF EXISTS "Enable read access for all users" ON public.session_tokens;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.security_events;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.audit_log;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.system_config;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.analysis_jobs;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.analysis_results;

-- 4. Remove any broad "authenticated" policies that might be too permissive
DROP POLICY IF EXISTS "Users can view all data" ON public.session_tokens;
DROP POLICY IF EXISTS "Users can view all data" ON public.security_events;
DROP POLICY IF EXISTS "Users can view all data" ON public.audit_log;
DROP POLICY IF EXISTS "Users can view all data" ON public.system_config;
DROP POLICY IF EXISTS "Users can view all data" ON public.analysis_jobs;

-- 5. Ensure RLS is enabled on all sensitive tables
ALTER TABLE public.session_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY;