-- Fix Database Function: Make Security Logging Optional to Prevent Read-Only Transaction Errors
-- Update get_job_status_secure_v2 to handle security event INSERT failures gracefully

DROP FUNCTION IF EXISTS public.get_job_status_secure_v2(uuid, text);

-- Recreate function with exception handling for security logging
CREATE OR REPLACE FUNCTION public.get_job_status_secure_v2(job_id_param uuid, session_token_param text)
RETURNS TABLE(
  job_id uuid, 
  status text, 
  created_at timestamp with time zone, 
  completed_at timestamp with time zone, 
  estimated_completion_seconds integer, 
  error_message text,
  solutions jsonb,
  confidence_score numeric,
  processing_status text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Ensure we're running with service role privileges for RLS bypass
  IF (((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text) != 'service_role'::text) THEN
    RAISE EXCEPTION 'Access denied: Service role required';
  END IF;

  -- Validate inputs
  IF job_id_param IS NULL OR session_token_param IS NULL THEN
    RAISE EXCEPTION 'Job ID and session token are required';
  END IF;
  
  IF length(session_token_param) < 32 THEN
    RAISE EXCEPTION 'Invalid session token format';
  END IF;
  
  -- Validate job exists and session token matches
  IF NOT EXISTS (
    SELECT 1 FROM public.analysis_jobs 
    WHERE id = job_id_param 
    AND session_token = session_token_param
    AND analysis_jobs.created_at > (now() - '2 hours'::interval)
    AND expires_at > now()
  ) THEN
    RAISE EXCEPTION 'Invalid job ID or session token';
  END IF;
  
  -- Return job status WITH analysis results
  RETURN QUERY
  SELECT 
    aj.id,
    aj.status,
    aj.created_at,
    aj.completed_at,
    aj.estimated_completion_seconds,
    aj.error_message,
    COALESCE(ar.solutions, '[]'::jsonb) as solutions,
    COALESCE(ar.confidence_score, 0.0) as confidence_score,
    COALESCE(ar.processing_status, 'initializing'::text) as processing_status
  FROM public.analysis_jobs aj
  LEFT JOIN public.analysis_results ar ON aj.id = ar.job_id
  WHERE aj.id = job_id_param;
  
  -- Optional security logging - don't fail if INSERT doesn't work
  BEGIN
    INSERT INTO public.security_events (
      event_type,
      endpoint,
      details,
      severity
    ) VALUES (
      'secure_job_access',
      'job_status_check_v2',
      jsonb_build_object(
        'job_id', job_id_param,
        'access_time', now(),
        'method', 'secure_function_v2'
      ),
      'info'
    );
  EXCEPTION WHEN OTHERS THEN
    -- Security logging failed, but continue execution
    -- This prevents read-only transaction errors from breaking the function
    NULL;
  END;
END;
$function$;