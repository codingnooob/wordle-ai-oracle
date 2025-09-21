-- Security Fix: Remove public access to sensitive data in analysis_jobs
-- Drop existing insecure policies
DROP POLICY IF EXISTS "Secure session token access" ON public.analysis_jobs;
DROP POLICY IF EXISTS "Secure results access via valid session" ON public.analysis_results;

-- Create secure policies for analysis_jobs
-- Only allow public job creation, but no public reading of sensitive data
CREATE POLICY "Allow public job creation only" 
ON public.analysis_jobs 
FOR INSERT 
WITH CHECK (
  input_data IS NOT NULL 
  AND jsonb_typeof(input_data) = 'object'
  AND session_token IS NOT NULL
  AND length(session_token) >= 32
);

-- Create secure function for job status checking without exposing tokens
CREATE OR REPLACE FUNCTION public.get_job_status_secure(job_id_param uuid, session_token_param text)
RETURNS TABLE(
  job_id uuid,
  status text,
  created_at timestamp with time zone,
  completed_at timestamp with time zone,
  estimated_completion_seconds integer,
  solutions jsonb,
  confidence_score numeric,
  processing_status text,
  error_message text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate session token format
  IF session_token_param IS NULL OR length(session_token_param) < 32 THEN
    RAISE EXCEPTION 'Invalid session token format';
  END IF;
  
  -- Validate job exists and session token matches
  IF NOT EXISTS (
    SELECT 1 FROM public.analysis_jobs 
    WHERE id = job_id_param 
    AND session_token = session_token_param
    AND created_at > (now() - '1 hour'::interval)
    AND expires_at > now()
  ) THEN
    RAISE EXCEPTION 'Invalid job ID or session token';
  END IF;
  
  -- Return job status with results
  RETURN QUERY
  SELECT 
    aj.id,
    aj.status,
    aj.created_at,
    aj.completed_at,
    aj.estimated_completion_seconds,
    COALESCE(ar.solutions, '[]'::jsonb) as solutions,
    COALESCE(ar.confidence_score, 0.0) as confidence_score,
    COALESCE(ar.processing_status, 'initializing'::text) as processing_status,
    aj.error_message
  FROM public.analysis_jobs aj
  LEFT JOIN public.analysis_results ar ON aj.id = ar.job_id
  WHERE aj.id = job_id_param
  AND aj.session_token = session_token_param;
END;
$$;

-- Create policy for results access via the secure function
CREATE POLICY "Secure results access via function only" 
ON public.analysis_results 
FOR SELECT 
USING (
  -- Only allow access through the secure function or service role
  (((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text) = 'service_role'::text)
);

-- Add session cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow service role to run cleanup
  IF (((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text) != 'service_role'::text) THEN
    RAISE EXCEPTION 'Access denied: Service role required for cleanup';
  END IF;

  -- Delete expired jobs and their results
  DELETE FROM public.analysis_results 
  WHERE job_id IN (
    SELECT id FROM public.analysis_jobs 
    WHERE expires_at < now() OR created_at < (now() - '2 hours'::interval)
  );
  
  DELETE FROM public.analysis_jobs 
  WHERE expires_at < now() OR created_at < (now() - '2 hours'::interval);
  
  -- Log cleanup action
  INSERT INTO public.security_events (
    event_type,
    endpoint,
    details,
    severity
  ) VALUES (
    'automated_cleanup',
    'session_cleanup',
    jsonb_build_object(
      'action', 'cleanup_expired_sessions',
      'retention_period', '2 hours',
      'timestamp', now()
    ),
    'info'
  );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_job_status_secure(uuid, text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_job_status_secure(uuid, text) TO authenticated;