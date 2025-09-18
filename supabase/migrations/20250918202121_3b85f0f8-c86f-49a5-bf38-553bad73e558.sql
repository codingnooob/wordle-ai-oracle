-- Fix critical security vulnerabilities in analysis jobs system

-- Drop existing insecure policies
DROP POLICY IF EXISTS "Allow access with valid session token" ON public.analysis_jobs;
DROP POLICY IF EXISTS "Allow system updates to job status" ON public.analysis_jobs;

-- Create secure session token validation policy
CREATE POLICY "Allow access with valid session token" ON public.analysis_jobs
FOR SELECT USING (
  session_token IS NOT NULL 
  AND session_token != '' 
  AND length(session_token) >= 20
  AND created_at > now() - interval '24 hours'
);

-- Restrict job updates to service role only
CREATE POLICY "Allow service role job updates" ON public.analysis_jobs
FOR UPDATE USING (
  current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  OR auth.uid() IS NOT NULL
);

-- Add session token expiration for security
ALTER TABLE public.analysis_jobs 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE 
DEFAULT (now() + interval '24 hours');

-- Create index for better performance on session lookups
CREATE INDEX IF NOT EXISTS idx_analysis_jobs_session_token 
ON public.analysis_jobs(session_token) 
WHERE session_token IS NOT NULL;

-- Create index for expiration cleanup
CREATE INDEX IF NOT EXISTS idx_analysis_jobs_expires_at 
ON public.analysis_jobs(expires_at);

-- Add constraint to ensure session tokens are properly generated
ALTER TABLE public.analysis_jobs 
ADD CONSTRAINT check_session_token_length 
CHECK (length(session_token) >= 20);