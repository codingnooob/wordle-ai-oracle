-- Remove conflicting RLS policies on analysis_jobs table
DROP POLICY IF EXISTS "Service role only job updates" ON public.analysis_jobs;
DROP POLICY IF EXISTS "Service role can update job status" ON public.analysis_jobs;

-- Keep only the essential policies
-- Allow public job creation with proper validation (already exists)
-- Allow service role comprehensive access (already exists)

-- Add a more permissive update policy for service role
CREATE POLICY "Service role job management" 
ON public.analysis_jobs 
FOR ALL
USING (
  ((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text) = 'service_role'::text
)
WITH CHECK (
  ((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text) = 'service_role'::text
);