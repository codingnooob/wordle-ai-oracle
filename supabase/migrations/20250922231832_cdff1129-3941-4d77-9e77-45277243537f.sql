-- Remove the security definer view that caused the linter warning
DROP VIEW IF EXISTS public.job_status_secure_view;

-- The security definer function get_job_status_secure_view is fine to keep
-- as it's properly secured with service role check

-- Update any existing functions that might reference the old job_status_view
-- to use proper secure access patterns instead

-- Verify that our existing secure functions handle job status properly
-- The get_job_status_secure_v2 function already provides secure access

-- Log the security improvement
INSERT INTO public.security_events (
  event_type,
  endpoint,
  details,
  severity
) VALUES (
  'security_linter_issue_resolved',
  'job_status_view',
  jsonb_build_object(
    'action', 'removed_security_definer_view',
    'removed_view', 'job_status_secure_view',
    'reason', 'security_linter_warning_0010',
    'replacement', 'use_existing_secure_functions',
    'available_functions', ARRAY['get_job_status_secure_v2', 'get_job_status_secure_view'],
    'applied_at', now()
  ),
  'info'
);

-- Ensure the existing analysis system continues to work
-- All edge functions should use the secure database functions
-- instead of querying views directly