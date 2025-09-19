-- Create a simple summary view without RLS (inherits from base table)
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

-- Grant permissions on the view only to service role
REVOKE ALL ON public.security_events_summary FROM PUBLIC;
REVOKE ALL ON public.security_events_summary FROM authenticated;
REVOKE ALL ON public.security_events_summary FROM anon;