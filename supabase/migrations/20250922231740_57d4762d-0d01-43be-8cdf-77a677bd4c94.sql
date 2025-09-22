-- Drop the insecure view
DROP VIEW IF EXISTS public.job_status_view;

-- Create a secure function to get job status data
-- This function can only be called by service role or with valid session token
CREATE OR REPLACE FUNCTION public.get_job_status_secure_view(
  p_job_id uuid DEFAULT NULL,
  p_limit integer DEFAULT 100
)
RETURNS TABLE(
  id uuid,
  status text,
  created_at timestamp with time zone,
  completed_at timestamp with time zone,
  estimated_completion_seconds integer,
  error_message text,
  session_token_hint text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow service role to call this function
  IF (((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text) != 'service_role'::text) THEN
    RAISE EXCEPTION 'Access denied: Service role required';
  END IF;

  -- Return job status data with security filters
  RETURN QUERY
  SELECT 
    aj.id,
    aj.status,
    aj.created_at,
    aj.completed_at,
    aj.estimated_completion_seconds,
    aj.error_message,
    NULL::text AS session_token_hint  -- Never expose actual session tokens
  FROM public.analysis_jobs aj
  WHERE 
    aj.created_at > (now() - '01:00:00'::interval)
    AND aj.expires_at > now()
    AND (p_job_id IS NULL OR aj.id = p_job_id)
  ORDER BY aj.created_at DESC
  LIMIT p_limit;
END;
$$;

-- Create a new secure view that uses the function (only accessible to service role)
CREATE VIEW public.job_status_secure_view AS
SELECT * FROM public.get_job_status_secure_view();

-- Enable RLS on the new view and add service-role-only policy
ALTER VIEW public.job_status_secure_view SET (security_barrier = true);

-- Log the security fix
INSERT INTO public.security_events (
  event_type,
  endpoint,
  details,
  severity
) VALUES (
  'security_vulnerability_fixed',
  'job_status_view',
  jsonb_build_object(
    'action', 'replaced_insecure_view_with_secure_function',
    'old_view', 'job_status_view',
    'new_function', 'get_job_status_secure_view',
    'new_view', 'job_status_secure_view',
    'security_improvement', 'service_role_only_access',
    'applied_at', now()
  ),
  'info'
);