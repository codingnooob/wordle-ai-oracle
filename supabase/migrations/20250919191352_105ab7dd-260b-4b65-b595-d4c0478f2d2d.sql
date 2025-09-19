-- Remove the problematic view completely to resolve security warning
DROP VIEW IF EXISTS public.security_events_summary;

-- Instead of a view, create a secure function to get sanitized security event summaries
CREATE OR REPLACE FUNCTION public.get_security_events_summary(
  hours_back integer DEFAULT 24
) RETURNS TABLE (
  id uuid,
  event_type text,
  severity text,
  created_at timestamptz,
  source_ip_status text,
  user_agent_status text,
  endpoint text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow service role to access this function
  IF (((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text) != 'service_role'::text) THEN
    RAISE EXCEPTION 'Access denied: Service role required';
  END IF;

  RETURN QUERY
  SELECT 
    se.id,
    se.event_type,
    se.severity,
    se.created_at,
    -- Anonymize sensitive data
    CASE 
      WHEN se.source_ip IS NOT NULL THEN 'REDACTED'::text
      ELSE NULL 
    END as source_ip_status,
    CASE 
      WHEN se.user_agent IS NOT NULL THEN 'PRESENT'::text
      ELSE 'ABSENT'::text
    END as user_agent_status,
    se.endpoint
  FROM public.security_events se
  WHERE se.created_at > NOW() - (hours_back || ' hours')::INTERVAL
  ORDER BY se.created_at DESC;
END;
$$;