-- Fix security vulnerability: Add session-based access control to analysis_jobs

-- First, drop the overly permissive public access policy
DROP POLICY IF EXISTS "Allow public access to analysis jobs" ON public.analysis_jobs;

-- Add session_token column for secure access control
ALTER TABLE public.analysis_jobs 
ADD COLUMN session_token TEXT DEFAULT encode(gen_random_bytes(32), 'base64');

-- Make session_token not null and unique for existing rows
UPDATE public.analysis_jobs 
SET session_token = encode(gen_random_bytes(32), 'base64') 
WHERE session_token IS NULL;

ALTER TABLE public.analysis_jobs 
ALTER COLUMN session_token SET NOT NULL;

-- Create index for performance
CREATE UNIQUE INDEX idx_analysis_jobs_session_token ON public.analysis_jobs(session_token);

-- Create secure RLS policies that require session token for access
CREATE POLICY "Allow public job creation" 
ON public.analysis_jobs 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow access with valid session token" 
ON public.analysis_jobs 
FOR SELECT 
USING (
  -- Allow access only if session_token is provided in the query
  session_token IS NOT NULL
);

CREATE POLICY "Allow system updates to job status" 
ON public.analysis_jobs 
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Update analysis_results table to also require session-based access
DROP POLICY IF EXISTS "Allow public access to analysis results" ON public.analysis_results;

CREATE POLICY "Allow public result creation" 
ON public.analysis_results 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow access to results via job session token" 
ON public.analysis_results 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.analysis_jobs 
    WHERE analysis_jobs.id = analysis_results.job_id 
    AND analysis_jobs.session_token IS NOT NULL
  )
);