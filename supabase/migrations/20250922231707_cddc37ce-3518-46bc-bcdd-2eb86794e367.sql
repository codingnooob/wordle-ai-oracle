-- Enable Row Level Security on job_status_view
ALTER TABLE public.job_status_view ENABLE ROW LEVEL SECURITY;

-- Policy 1: Only service role can access the view
-- This ensures that only the backend edge functions can query job status data
CREATE POLICY "Service role only job status view access" 
ON public.job_status_view 
FOR ALL 
USING (
  ((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text) = 'service_role'::text
);

-- Log the security fix
INSERT INTO public.security_events (
  event_type,
  endpoint,
  details,
  severity
) VALUES (
  'security_policy_added',
  'job_status_view',
  jsonb_build_object(
    'action', 'added_rls_policies',
    'policies_added', 1,
    'reason', 'prevent_unauthorized_job_data_access',
    'applied_at', now()
  ),
  'info'
);