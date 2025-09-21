-- Fix session token security vulnerabilities in analysis_jobs table
-- Add explicit RESTRICTIVE policies to prevent any unauthorized access to session tokens

-- Create RESTRICTIVE policy to ensure session tokens are never exposed via SELECT
-- This prevents accidental exposure even if future SELECT policies are added
CREATE POLICY "Block all direct session token access" 
ON public.analysis_jobs
AS RESTRICTIVE
FOR SELECT 
TO public
USING (false); -- Explicitly deny all direct SELECT access

-- Allow service role to access jobs for management (needed for edge functions)
CREATE POLICY "Service role jobs management access" 
ON public.analysis_jobs
AS PERMISSIVE
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- Create a secure view that excludes session tokens for any future public access needs
CREATE VIEW public.analysis_jobs_public AS
SELECT 
  id,
  status,
  created_at,
  completed_at,
  estimated_completion_seconds,
  error_message
  -- Deliberately exclude: input_data, session_token, expires_at
FROM public.analysis_jobs;

-- Enable RLS on the view
ALTER VIEW public.analysis_jobs_public SET ROW SECURITY ON;

-- Create policy for the view (still restrictive - only allows access via secure function)
CREATE POLICY "Public job status via secure function only"
ON public.analysis_jobs_public
AS RESTRICTIVE
FOR SELECT
TO public
USING (false); -- All access must go through secure functions

-- Create a security definer function to safely check job existence without exposing tokens
CREATE OR REPLACE FUNCTION public.job_exists_secure(job_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.analysis_jobs
    WHERE id = job_id_param
    AND created_at > (now() - '1 hour'::interval)
    AND expires_at > now()
  );
END;
$$;

-- Log security improvements
INSERT INTO public.security_events (
  event_type,
  endpoint,
  details,
  severity
) VALUES (
  'session_token_hardening',
  'analysis_jobs',
  jsonb_build_object(
    'action', 'secured_session_tokens_with_restrictive_policies',
    'improvements', ARRAY[
      'blocked_direct_session_token_access',
      'created_public_view_without_sensitive_data', 
      'added_job_existence_check_function',
      'maintained_service_role_access_for_edge_functions'
    ],
    'security_level', 'maximum',
    'timestamp', now()
  ),
  'info'
);