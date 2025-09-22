-- Add security headers function for enhanced protection
CREATE OR REPLACE FUNCTION public.get_security_headers()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN jsonb_build_object(
    'X-Content-Type-Options', 'nosniff',
    'X-Frame-Options', 'DENY',
    'X-XSS-Protection', '1; mode=block',
    'Referrer-Policy', 'strict-origin-when-cross-origin',
    'Content-Security-Policy', 'default-src ''self''; script-src ''self'' ''unsafe-inline''; style-src ''self'' ''unsafe-inline''; img-src ''self'' data: https:; font-src ''self'' data:;'
  );
END;
$$;

-- Enhance existing RLS policies with stricter time-based validation
-- Add policy to prevent access to expired jobs in analysis_jobs table
CREATE POLICY "Block access to expired analysis jobs" 
ON public.analysis_jobs 
FOR SELECT 
USING (expires_at > now() AND created_at > (now() - '2 hours'::interval));

-- Log security enhancement
INSERT INTO public.security_events (
  event_type,
  endpoint,
  details,
  severity
) VALUES (
  'security_enhancement',
  'database_policies',
  jsonb_build_object(
    'action', 'enhanced_rls_policies',
    'description', 'Added stricter time-based validation and security headers',
    'timestamp', now()
  ),
  'info'
);