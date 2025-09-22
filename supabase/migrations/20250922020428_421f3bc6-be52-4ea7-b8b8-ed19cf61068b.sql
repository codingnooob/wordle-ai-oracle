-- Security Hardening: Fix Critical RLS Policy Gaps and Database Security Issues

-- Phase 1: Fix RLS Policy Gaps
-- Remove overly permissive policies and ensure proper access control

-- Fix security_events table - ensure only service role access
DROP POLICY IF EXISTS "Restrictive service role only security events" ON public.security_events;

CREATE POLICY "Service role only security events access" ON public.security_events
FOR ALL USING (
  ((current_setting('request.jwt.claims', true))::json ->> 'role') = 'service_role'
) WITH CHECK (
  ((current_setting('request.jwt.claims', true))::json ->> 'role') = 'service_role'
);

-- Fix api_usage table - remove redundant policies and ensure proper access
DROP POLICY IF EXISTS "Allow service role access to api_usage" ON public.api_usage;
DROP POLICY IF EXISTS "Service role full access to api_usage" ON public.api_usage;
DROP POLICY IF EXISTS "Service role api_usage access" ON public.api_usage;
DROP POLICY IF EXISTS "Service role full api_usage access" ON public.api_usage;
DROP POLICY IF EXISTS "Service role only api_usage read" ON public.api_usage;
DROP POLICY IF EXISTS "Service role only api_usage insert" ON public.api_usage;
DROP POLICY IF EXISTS "Service role only api_usage update" ON public.api_usage;

-- Create single comprehensive policy for api_usage
CREATE POLICY "Service role comprehensive api_usage access" ON public.api_usage
FOR ALL USING (
  ((current_setting('request.jwt.claims', true))::json ->> 'role') = 'service_role'
) WITH CHECK (
  ((current_setting('request.jwt.claims', true))::json ->> 'role') = 'service_role'
);

-- Keep the restrictive anonymous rate limit check policy for legitimate rate limiting
-- (This is already properly restrictive)

-- Fix audit_log table - remove redundant policies
DROP POLICY IF EXISTS "Service role only audit access" ON public.audit_log;

-- audit_log already has proper restrictive policy, but let's ensure it's comprehensive
CREATE POLICY "Service role comprehensive audit log access" ON public.audit_log
FOR ALL USING (
  ((current_setting('request.jwt.claims', true))::json ->> 'role') = 'service_role'
) WITH CHECK (
  ((current_setting('request.jwt.claims', true))::json ->> 'role') = 'service_role'
);

-- Fix system_config table - already has proper policy but ensure it's named clearly
DROP POLICY IF EXISTS "Restrictive service role only system config access" ON public.system_config;

CREATE POLICY "Service role only system config access" ON public.system_config
FOR ALL USING (
  ((current_setting('request.jwt.claims', true))::json ->> 'role') = 'service_role'
) WITH CHECK (
  ((current_setting('request.jwt.claims', true))::json ->> 'role') = 'service_role'
);

-- Phase 2: Enhance Session Token Security
-- Create table for hashed session tokens
CREATE TABLE IF NOT EXISTS public.session_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash text NOT NULL,
  job_id uuid NOT NULL REFERENCES public.analysis_jobs(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + '1 hour'::interval),
  is_revoked boolean NOT NULL DEFAULT false,
  
  UNIQUE(token_hash, job_id)
);

-- Enable RLS on session_tokens table
ALTER TABLE public.session_tokens ENABLE ROW LEVEL SECURITY;

-- Only service role can manage session tokens
CREATE POLICY "Service role only session tokens access" ON public.session_tokens
FOR ALL USING (
  ((current_setting('request.jwt.claims', true))::json ->> 'role') = 'service_role'
) WITH CHECK (
  ((current_setting('request.jwt.claims', true))::json ->> 'role') = 'service_role'
);

-- Create function to validate hashed session tokens
CREATE OR REPLACE FUNCTION public.validate_hashed_session_token(
  token_param text, 
  job_id_param uuid
) RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  token_hash_param text;
BEGIN
  -- Generate hash of the provided token
  token_hash_param := encode(digest(token_param, 'sha256'), 'hex');
  
  -- Check if token exists, is not revoked, and not expired
  RETURN EXISTS (
    SELECT 1 FROM public.session_tokens st
    JOIN public.analysis_jobs aj ON st.job_id = aj.id
    WHERE st.token_hash = token_hash_param
    AND st.job_id = job_id_param
    AND st.is_revoked = false
    AND st.expires_at > now()
    AND aj.expires_at > now()
  );
END;
$$;

-- Create function to create hashed session token
CREATE OR REPLACE FUNCTION public.create_hashed_session_token(
  token_param text,
  job_id_param uuid
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  token_hash_param text;
  token_id uuid;
BEGIN
  -- Generate hash of the provided token
  token_hash_param := encode(digest(token_param, 'sha256'), 'hex');
  
  -- Insert hashed token
  INSERT INTO public.session_tokens (token_hash, job_id)
  VALUES (token_hash_param, job_id_param)
  RETURNING id INTO token_id;
  
  RETURN token_id;
END;
$$;

-- Create function to revoke session token
CREATE OR REPLACE FUNCTION public.revoke_session_token(
  token_param text,
  job_id_param uuid
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  token_hash_param text;
BEGIN
  -- Generate hash of the provided token
  token_hash_param := encode(digest(token_param, 'sha256'), 'hex');
  
  -- Revoke the token
  UPDATE public.session_tokens
  SET is_revoked = true
  WHERE token_hash = token_hash_param
  AND job_id = job_id_param;
  
  RETURN FOUND;
END;
$$;

-- Phase 3: Enhanced Security Event Logging
-- Add index for better performance on security_events queries
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON public.security_events(created_at);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON public.security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON public.security_events(event_type);

-- Add index for session_tokens performance
CREATE INDEX IF NOT EXISTS idx_session_tokens_hash_job ON public.session_tokens(token_hash, job_id);
CREATE INDEX IF NOT EXISTS idx_session_tokens_expires_at ON public.session_tokens(expires_at);

-- Create function for automated security cleanup
CREATE OR REPLACE FUNCTION public.cleanup_expired_tokens()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only allow service role to run cleanup
  IF (((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text) != 'service_role'::text) THEN
    RAISE EXCEPTION 'Access denied: Service role required for cleanup';
  END IF;

  -- Delete expired session tokens
  DELETE FROM public.session_tokens 
  WHERE expires_at < now() OR is_revoked = true;
  
  -- Log cleanup action
  INSERT INTO public.security_events (
    event_type,
    endpoint,
    details,
    severity
  ) VALUES (
    'automated_cleanup',
    'token_cleanup',
    jsonb_build_object(
      'action', 'cleanup_expired_tokens',
      'timestamp', now()
    ),
    'info'
  );
END;
$$;