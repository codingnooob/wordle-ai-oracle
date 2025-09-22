-- Fix Critical Security Issue: Prevent public access to session tokens
-- Remove dangerous policies that expose session tokens publicly

-- First, drop the problematic policy that allows public SELECT access
DROP POLICY IF EXISTS "Allow session-based job status access" ON public.analysis_jobs;

-- Create a secure view that excludes sensitive data for public access
CREATE OR REPLACE VIEW public.job_status_public AS
SELECT 
  id,
  status,
  created_at,
  completed_at,
  estimated_completion_seconds,
  error_message
FROM public.analysis_jobs
WHERE expires_at > now() AND created_at > (now() - '2 hours'::interval);

-- Enable RLS on the secure view
ALTER VIEW public.job_status_public SET (security_barrier = true);

-- Create a secure policy for the main table that only allows service role access
CREATE POLICY "Secure service role only access" 
ON public.analysis_jobs 
FOR ALL
USING (((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text) = 'service_role'::text)
WITH CHECK (((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text) = 'service_role'::text);

-- Create a function for secure job status checking with session token
CREATE OR REPLACE FUNCTION public.get_job_status_secure_v2(job_id_param uuid, session_token_param text)
RETURNS TABLE(
  job_id uuid, 
  status text, 
  created_at timestamp with time zone, 
  completed_at timestamp with time zone, 
  estimated_completion_seconds integer,
  error_message text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Validate inputs
  IF job_id_param IS NULL OR session_token_param IS NULL THEN
    RAISE EXCEPTION 'Job ID and session token are required';
  END IF;
  
  IF length(session_token_param) < 32 THEN
    RAISE EXCEPTION 'Invalid session token format';
  END IF;
  
  -- Validate job exists and session token matches (without exposing token)
  IF NOT EXISTS (
    SELECT 1 FROM public.analysis_jobs 
    WHERE id = job_id_param 
    AND session_token = session_token_param
    AND created_at > (now() - '2 hours'::interval)
    AND expires_at > now()
  ) THEN
    RAISE EXCEPTION 'Invalid job ID or session token';
  END IF;
  
  -- Return job status WITHOUT session token
  RETURN QUERY
  SELECT 
    aj.id,
    aj.status,
    aj.created_at,
    aj.completed_at,
    aj.estimated_completion_seconds,
    aj.error_message
  FROM public.analysis_jobs aj
  WHERE aj.id = job_id_param;
  
  -- Log access for security monitoring
  INSERT INTO public.security_events (
    event_type,
    endpoint,
    details,
    severity
  ) VALUES (
    'secure_job_access',
    'job_status_check',
    jsonb_build_object(
      'job_id', job_id_param,
      'access_time', now(),
      'method', 'secure_function'
    ),
    'info'
  );
END;
$$;

-- Log the security fix
INSERT INTO public.security_events (
  event_type,
  endpoint,
  details,
  severity
) VALUES (
  'security_fix',
  'analysis_jobs_table',
  jsonb_build_object(
    'issue', 'session_token_exposure',
    'action', 'removed_public_access_to_tokens',
    'description', 'Implemented secure access patterns to prevent token theft',
    'timestamp', now()
  ),
  'critical'
);