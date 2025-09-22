-- Critical Security Fix: Remove overly permissive RLS policy on analysis_jobs table
-- This fixes the vulnerability where anyone could read job data including session tokens

-- Drop the problematic policy that allows unrestricted access
DROP POLICY IF EXISTS "Service role jobs management access" ON public.analysis_jobs;

-- Log this security fix
INSERT INTO public.security_events (
  event_type,
  endpoint,
  details,
  severity
) VALUES (
  'security_fix',
  'rls_policy_fix',
  jsonb_build_object(
    'action', 'removed_permissive_policy',
    'table', 'analysis_jobs',
    'policy_name', 'Service role jobs management access',
    'reason', 'policy_allowed_unrestricted_access_with_using_true',
    'timestamp', now()
  ),
  'critical'
);

-- Verify our security by checking remaining policies on analysis_jobs
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual as using_condition
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'analysis_jobs' 
ORDER BY cmd, policyname;