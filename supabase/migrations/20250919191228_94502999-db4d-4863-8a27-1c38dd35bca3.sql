-- Remove the problematic security definer view configuration
DROP VIEW IF EXISTS public.security_events_summary;

-- Create a safer summary view without security definer properties
CREATE VIEW public.security_events_summary AS
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

-- Create RLS policy for the summary view (service role only)
CREATE POLICY "Service role only security summary access" 
ON public.security_events_summary
FOR ALL 
TO authenticated, anon
USING (
  (((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text) = 'service_role'::text)
);