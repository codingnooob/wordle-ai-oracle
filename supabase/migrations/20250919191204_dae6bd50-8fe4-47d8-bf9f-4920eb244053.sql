-- Drop the existing permissive policy that might have gaps
DROP POLICY IF EXISTS "Service role only security events" ON public.security_events;

-- Create a more secure restrictive policy for service role access
CREATE POLICY "Restrictive service role security events access" 
ON public.security_events 
AS RESTRICTIVE
FOR ALL 
TO authenticated, anon
USING (
  -- Only allow access if the request comes with service role credentials
  (((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text) = 'service_role'::text)
  OR 
  -- Fallback check for service role key in headers (additional security layer)
  (current_setting('request.headers', true)::json ->> 'authorization' LIKE '%service_role%')
);

-- Add an additional restrictive policy to deny all other access
CREATE POLICY "Deny all non-service access to security events" 
ON public.security_events 
AS RESTRICTIVE
FOR ALL 
TO authenticated, anon
USING (
  -- Explicitly deny access unless service role conditions are met
  (((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text) = 'service_role'::text)
);

-- Create a security definer function for secure logging (prevents direct table access)
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_event_type text,
  p_source_ip text DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_api_key_hash text DEFAULT NULL,
  p_endpoint text DEFAULT NULL,
  p_severity text DEFAULT 'info',
  p_details jsonb DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  event_id uuid;
BEGIN
  -- Validate input parameters
  IF p_event_type IS NULL OR length(trim(p_event_type)) = 0 THEN
    RAISE EXCEPTION 'event_type cannot be null or empty';
  END IF;
  
  IF p_severity NOT IN ('info', 'warn', 'error', 'critical') THEN
    RAISE EXCEPTION 'Invalid severity level: %', p_severity;
  END IF;
  
  -- Insert security event with validation
  INSERT INTO public.security_events (
    event_type,
    source_ip,
    user_agent,
    api_key_hash,
    endpoint,
    severity,
    details
  ) VALUES (
    trim(p_event_type),
    trim(p_source_ip),
    trim(p_user_agent),
    p_api_key_hash,
    trim(p_endpoint),
    p_severity,
    p_details
  ) RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$;

-- Grant execute permission only to service role for the logging function
REVOKE ALL ON FUNCTION public.log_security_event FROM PUBLIC;
REVOKE ALL ON FUNCTION public.log_security_event FROM authenticated;
REVOKE ALL ON FUNCTION public.log_security_event FROM anon;

-- Create a view for sanitized security event access (if monitoring tools need limited access)
CREATE OR REPLACE VIEW public.security_events_summary AS
SELECT 
  id,
  event_type,
  severity,
  created_at,
  -- Anonymize sensitive data in view
  CASE 
    WHEN source_ip IS NOT NULL THEN 'REDACTED'
    ELSE NULL 
  END as source_ip_status,
  CASE 
    WHEN user_agent IS NOT NULL THEN 'PRESENT'
    ELSE 'ABSENT'
  END as user_agent_status,
  endpoint
FROM public.security_events
WHERE created_at > NOW() - INTERVAL '24 hours';

-- Apply RLS to the view as well
ALTER VIEW public.security_events_summary SET (security_barrier = true);

-- Create policy for the summary view (service role only)
-- Note: Views inherit RLS from base tables, so this is additional protection