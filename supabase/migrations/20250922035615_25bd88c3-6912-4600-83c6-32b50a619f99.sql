-- CRITICAL SECURITY FIX: Remove ALL public access to session tokens

-- Drop the dangerous SELECT policy that exposes session tokens
DROP POLICY IF EXISTS "Block access to expired analysis jobs" ON public.analysis_jobs;

-- Clean up duplicate INSERT policies - keep only the most secure one
DROP POLICY IF EXISTS "Allow public job creation" ON public.analysis_jobs;
DROP POLICY IF EXISTS "Allow public job creation only" ON public.analysis_jobs; 
DROP POLICY IF EXISTS "Rate limited job creation" ON public.analysis_jobs;

-- Keep only the secure job creation policy and the service role access
-- The "Allow public job creation secure" and "Restrict table access to service role only" policies remain

-- Verify no public SELECT access exists by testing current permissions
-- Create a test function to verify security
CREATE OR REPLACE FUNCTION public.verify_token_security()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  test_result jsonb;
BEGIN
  -- Only service role should be able to call this
  IF (((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text) != 'service_role'::text) THEN
    RETURN jsonb_build_object('error', 'Access denied');
  END IF;
  
  -- Check if any policies allow public SELECT access
  SELECT jsonb_agg(
    jsonb_build_object(
      'policy_name', policyname,
      'command', cmd,
      'roles', roles,
      'permissive', permissive
    )
  ) INTO test_result
  FROM pg_policies 
  WHERE schemaname = 'public' 
    AND tablename = 'analysis_jobs' 
    AND cmd = 'SELECT'
    AND 'public' = ANY(roles);
  
  RETURN jsonb_build_object(
    'dangerous_select_policies', COALESCE(test_result, '[]'::jsonb),
    'timestamp', now(),
    'security_status', CASE 
      WHEN test_result IS NULL THEN 'SECURE - No public SELECT policies found'
      ELSE 'VULNERABLE - Public SELECT policies still exist'
    END
  );
END;
$$;

-- Log the critical security fix
INSERT INTO public.security_events (
  event_type,
  endpoint,
  details,
  severity
) VALUES (
  'critical_security_fix',
  'analysis_jobs_table',
  jsonb_build_object(
    'issue', 'session_token_exposure_final_fix',
    'action', 'removed_all_public_select_access',
    'description', 'Eliminated all public SELECT access to prevent token theft',
    'policies_removed', jsonb_build_array(
      'Block access to expired analysis jobs',
      'Duplicate INSERT policies'
    ),
    'timestamp', now()
  ),
  'critical'
);