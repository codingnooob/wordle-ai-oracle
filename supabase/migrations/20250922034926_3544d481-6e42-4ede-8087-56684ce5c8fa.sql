-- Add Row Level Security policies to job_status_view
ALTER TABLE public.job_status_view ENABLE ROW LEVEL SECURITY;

-- Allow public read access to job status (non-sensitive data only)
-- This view should only show basic status information, no session tokens or sensitive data
CREATE POLICY "Allow public job status viewing" 
ON public.job_status_view 
FOR SELECT 
USING (true);

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
    'Content-Security-Policy', 'default-src ''self''; script-src ''self'' ''unsafe-inline''; style-src ''self'' ''unsafe-inline''; img-src ''self'' data: https:;'
  );
END;
$$;