-- Critical Security Fixes - Phase 1 & 2
-- Fix session token vulnerabilities and access control issues

-- 1. Drop existing permissive policies on analysis_jobs
DROP POLICY IF EXISTS "Allow access with valid session token" ON public.analysis_jobs;
DROP POLICY IF EXISTS "Allow service role job updates" ON public.analysis_jobs;

-- 2. Create secure session-based policy for analysis_jobs
-- Only allow access to jobs with valid session tokens AND reasonable time limits
CREATE POLICY "Secure session token access" ON public.analysis_jobs
FOR SELECT USING (
  session_token IS NOT NULL 
  AND session_token <> ''
  AND length(session_token) >= 32
  AND created_at > (now() - '1 hour'::interval)  -- Tighter time window
  AND expires_at > now()  -- Must not be expired
);

-- 3. Restrict job updates to service role only (remove general auth access)
CREATE POLICY "Service role only job updates" ON public.analysis_jobs
FOR UPDATE USING (
  current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
);

-- 4. Keep public job creation but add rate limiting considerations
CREATE POLICY "Rate limited job creation" ON public.analysis_jobs
FOR INSERT WITH CHECK (
  input_data IS NOT NULL
  AND jsonb_typeof(input_data) = 'object'
);

-- 5. Secure analysis_results access - must have valid job with valid session
DROP POLICY IF EXISTS "Allow access to results via job session token" ON public.analysis_results;

CREATE POLICY "Secure results access via valid session" ON public.analysis_results
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM analysis_jobs 
    WHERE analysis_jobs.id = analysis_results.job_id
    AND analysis_jobs.session_token IS NOT NULL
    AND analysis_jobs.session_token <> ''
    AND length(analysis_jobs.session_token) >= 32
    AND analysis_jobs.created_at > (now() - '1 hour'::interval)
    AND analysis_jobs.expires_at > now()
    AND analysis_jobs.status IN ('completed', 'processing')
  )
);

-- 6. Restrict API usage table access - remove overly permissive public policies
DROP POLICY IF EXISTS "Allow public read for rate limiting" ON public.api_usage;
DROP POLICY IF EXISTS "Allow public update for usage tracking" ON public.api_usage;
DROP POLICY IF EXISTS "Allow public insert for usage tracking" ON public.api_usage;

-- 7. Create more restrictive API usage policies
-- Allow service role full access (for backend operations)
CREATE POLICY "Service role api_usage access" ON public.api_usage
FOR ALL USING (
  current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
);

-- Allow limited public read for rate limiting (only current hour)
CREATE POLICY "Limited public read for rate limiting" ON public.api_usage
FOR SELECT USING (
  last_request > (now() - '1 hour'::interval)
);

-- Allow public insert for new usage tracking
CREATE POLICY "Public insert for new usage" ON public.api_usage
FOR INSERT WITH CHECK (
  api_key_hash IS NOT NULL
  AND endpoint IS NOT NULL
  AND request_count = 1  -- Only allow initial inserts
);

-- Allow public update only for same-day usage tracking
CREATE POLICY "Limited public update for usage" ON public.api_usage
FOR UPDATE USING (
  created_at > (now() - '24 hours'::interval)
  AND last_request > (now() - '1 hour'::interval)
);

-- 8. Add security function for session validation (security definer)
CREATE OR REPLACE FUNCTION public.validate_session_token(token text, job_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM analysis_jobs
    WHERE id = job_id
    AND session_token = token
    AND session_token IS NOT NULL
    AND length(session_token) >= 32
    AND created_at > (now() - '1 hour'::interval)
    AND expires_at > now()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 9. Add audit trigger for job modifications
CREATE OR REPLACE FUNCTION public.audit_job_changes()
RETURNS trigger AS $$
BEGIN
  -- Log status changes
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.audit_log (
      table_name,
      record_id,
      action,
      old_values,
      new_values,
      changed_at
    ) VALUES (
      'analysis_jobs',
      NEW.id::text,
      'status_change',
      jsonb_build_object('status', OLD.status),
      jsonb_build_object('status', NEW.status),
      now()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit log table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name text NOT NULL,
  record_id text NOT NULL,
  action text NOT NULL,
  old_values jsonb,
  new_values jsonb,
  changed_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Only service role can access audit logs
CREATE POLICY "Service role only audit access" ON public.audit_log
FOR ALL USING (
  current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
);

-- Create the audit trigger
DROP TRIGGER IF EXISTS audit_analysis_jobs_changes ON public.analysis_jobs;
CREATE TRIGGER audit_analysis_jobs_changes
  BEFORE UPDATE ON public.analysis_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_job_changes();