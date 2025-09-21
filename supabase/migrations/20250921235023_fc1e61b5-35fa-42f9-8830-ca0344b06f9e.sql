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

-- Create a secure function for public job status (without sensitive data)
CREATE OR REPLACE FUNCTION public.get_job_status_public(job_id_param uuid)
RETURNS TABLE(
  job_id uuid,
  status text,
  created_at timestamp with time zone,
  completed_at timestamp with time zone,
  estimated_completion_seconds integer,
  error_message text
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only return non-sensitive data, never session tokens or input data
  RETURN QUERY
  SELECT 
    aj.id,
    aj.status,
    aj.created_at,
    aj.completed_at,
    aj.estimated_completion_seconds,
    aj.error_message
  FROM public.analysis_jobs aj
  WHERE aj.id = job_id_param
    AND aj.created_at > (now() - '1 hour'::interval)
    AND aj.expires_at > now();
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
      'blocked_direct_session_token_access_with_restrictive_policy',
      'maintained_service_role_access_for_edge_functions',
      'created_secure_job_existence_check_function',
      'created_public_status_function_without_sensitive_data'
    ],
    'security_level', 'maximum_protection_against_token_exposure',
    'timestamp', now()
  ),
  'info'
);