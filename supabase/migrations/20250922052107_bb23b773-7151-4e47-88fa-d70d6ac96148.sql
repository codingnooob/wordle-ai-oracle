-- Critical Security Fix: Remove overly permissive RLS policy on analysis_jobs table
-- This fixes the vulnerability where anyone could read job data including session tokens

-- Drop the problematic policy that allows unrestricted access
DROP POLICY IF EXISTS "Service role jobs management access" ON public.analysis_jobs;

-- The remaining policies should provide proper security:
-- 1. "Restrict table access to service role only" - handles service role access
-- 2. "Allow public job creation secure" - handles secure job creation
-- 3. "Service role only job updates" and "Service role can update job status" - handle updates

-- Add RLS policies to job_status_view for additional security
ALTER TABLE public.job_status_view ENABLE ROW LEVEL SECURITY;

-- Only allow service role to access job status view data
CREATE POLICY "Service role only job status view access"
ON public.job_status_view
FOR SELECT
TO PUBLIC
USING (
  ((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text) = 'service_role'::text
);

-- Verify our security by ensuring no public SELECT policies exist on analysis_jobs
-- (This is just a verification query, not a change)
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual as using_condition,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'analysis_jobs' 
  AND cmd = 'SELECT'
  AND 'public' = ANY(roles);