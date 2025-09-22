-- Fix the ambiguous created_at column reference in get_job_status_secure function
CREATE OR REPLACE FUNCTION public.get_job_status_secure(job_id_param uuid, session_token_param text)
 RETURNS TABLE(job_id uuid, status text, created_at timestamp with time zone, completed_at timestamp with time zone, estimated_completion_seconds integer, solutions jsonb, confidence_score numeric, processing_status text, error_message text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    AND analysis_jobs.created_at > (now() - '1 hour'::interval)
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
$function$;