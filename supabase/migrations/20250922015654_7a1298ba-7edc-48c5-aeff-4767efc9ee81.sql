-- Fix the overly restrictive RLS policy on analysis_jobs table
-- Remove the policy that blocks all SELECT operations
DROP POLICY IF EXISTS "Block all direct session token access" ON public.analysis_jobs;

-- Create a proper session-based access policy that allows users to check their job status
-- Users can only access jobs they created using the correct session token
-- This policy prevents exposure of sensitive data while allowing legitimate status checks
CREATE POLICY "Allow session-based job status access" ON public.analysis_jobs
FOR SELECT USING (
  -- Allow access if the user has the correct session token for this job
  session_token = current_setting('request.headers')::json->>'x-session-token'
  OR 
  -- Allow service role access for system operations
  ((current_setting('request.jwt.claims', true))::json ->> 'role') = 'service_role'
);

-- Also create a policy for updating job status (service role only)
CREATE POLICY "Service role can update job status" ON public.analysis_jobs  
FOR UPDATE USING (
  ((current_setting('request.jwt.claims', true))::json ->> 'role') = 'service_role'
) WITH CHECK (
  ((current_setting('request.jwt.claims', true))::json ->> 'role') = 'service_role'
);

-- Create a view that excludes sensitive session token data for public access
CREATE OR REPLACE VIEW public.job_status_view AS
SELECT 
  id,
  status,
  created_at,
  completed_at,
  estimated_completion_seconds,
  error_message,
  -- Never expose session_token or input_data in public view
  NULL::text as session_token_hint
FROM public.analysis_jobs
WHERE 
  created_at > (now() - '1 hour'::interval)
  AND expires_at > now();

-- Grant access to the view
GRANT SELECT ON public.job_status_view TO anon, authenticated;

-- Create RLS policy for the view (allows public read access to non-sensitive data)
ALTER VIEW public.job_status_view SET (security_invoker = on);

-- Update the existing security definer function to be more robust
CREATE OR REPLACE FUNCTION public.get_job_status_with_token(job_id_param uuid, session_token_param text)
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
    AND created_at > (now() - '1 hour'::interval)
    AND expires_at > now()
  ) THEN
    RAISE EXCEPTION 'Invalid job ID or session token';
  END IF;
  
  -- Return job status with results (including sensitive data for authorized access)
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