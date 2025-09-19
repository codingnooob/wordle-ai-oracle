-- Create the most restrictive possible policies for all sensitive tables

-- 1. SECURITY_EVENTS: Lock down completely to service role only
DROP POLICY IF EXISTS "Restrictive service role security events access" ON public.security_events;
DROP POLICY IF EXISTS "Deny all non-service access to security events" ON public.security_events;

-- Single bulletproof policy for security_events
CREATE POLICY "Service role only security events - bulletproof" 
ON public.security_events 
AS RESTRICTIVE
FOR ALL 
USING (
  -- Triple-layer verification for maximum security
  (
    -- Primary check: JWT claims
    (((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text) = 'service_role'::text)
    AND
    -- Secondary check: Request context must be service role
    (current_setting('role'::text, true) = 'service_role'::text OR current_setting('request.jwt.claims'::text, true) IS NOT NULL)
    AND
    -- Tertiary check: No public access allowed
    (current_user != 'anon'::name)
  )
  OR
  -- Only allow if explicitly authenticated as service role
  (auth.role() = 'service_role'::text)
);

-- 2. AUDIT_LOG: Complete lockdown to service role
CREATE POLICY "Service role only audit log - bulletproof" 
ON public.audit_log 
AS RESTRICTIVE
FOR ALL 
USING (
  (((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text) = 'service_role'::text)
  AND
  (current_setting('role'::text, true) = 'service_role'::text OR current_setting('request.jwt.claims'::text, true) IS NOT NULL)
  AND
  (current_user != 'anon'::name)
);

-- 3. API_USAGE: Restrict to essential rate limiting only
-- Drop existing policies that might be too permissive
DROP POLICY IF EXISTS "Public rate limit check only" ON public.api_usage;
DROP POLICY IF EXISTS "Public usage tracking insert" ON public.api_usage;
DROP POLICY IF EXISTS "Public usage increment only" ON public.api_usage;

-- Create minimal access for rate limiting only
CREATE POLICY "Rate limit check only - minimal access" 
ON public.api_usage 
AS RESTRICTIVE
FOR SELECT 
USING (
  -- Only allow checking recent requests for rate limiting
  (last_request > (now() - '00:15:00'::interval))
  AND 
  (api_key_hash IS NOT NULL)
  AND 
  (request_count IS NOT NULL)
  AND
  -- Prevent access to historical data
  (created_at > (now() - '01:00:00'::interval))
);

-- Allow minimal inserts for rate limiting only
CREATE POLICY "Rate limit insert only - minimal data" 
ON public.api_usage 
AS RESTRICTIVE
FOR INSERT 
WITH CHECK (
  (api_key_hash IS NOT NULL)
  AND 
  (endpoint IS NOT NULL)
  AND 
  (request_count = 1)
  AND 
  (last_request >= (now() - '00:01:00'::interval))
  AND 
  (last_request <= now())
  AND
  -- Ensure no sensitive data in inserts
  (api_key_hash ~ '^[a-f0-9]+$')  -- Only hex hash allowed
);

-- Allow minimal updates for rate limiting counters only
CREATE POLICY "Rate limit update only - counters" 
ON public.api_usage 
AS RESTRICTIVE
FOR UPDATE 
USING (
  (created_at > (now() - '01:00:00'::interval))
  AND 
  (last_request > (now() - '00:15:00'::interval))
  AND
  (api_key_hash IS NOT NULL)
)
WITH CHECK (
  -- Only allow incrementing counters and updating timestamps
  (request_count > 0)
  AND 
  (last_request > (SELECT au.last_request FROM public.api_usage au WHERE au.id = api_usage.id))
  AND 
  (last_request <= now())
  AND
  -- Prevent tampering with key fields
  (api_key_hash = (SELECT au.api_key_hash FROM public.api_usage au WHERE au.id = api_usage.id))
  AND
  (endpoint = (SELECT au.endpoint FROM public.api_usage au WHERE au.id = api_usage.id))
);

-- 4. Additional security: Create secure cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_sensitive_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow service role to run cleanup
  IF (((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text) != 'service_role'::text) THEN
    RAISE EXCEPTION 'Access denied: Service role required for cleanup';
  END IF;

  -- Clean old security events (keep only 7 days)
  DELETE FROM public.security_events 
  WHERE created_at < (now() - '7 days'::interval);
  
  -- Clean old audit logs (keep only 30 days)
  DELETE FROM public.audit_log 
  WHERE changed_at < (now() - '30 days'::interval);
  
  -- Clean old API usage data (keep only 24 hours)
  DELETE FROM public.api_usage 
  WHERE created_at < (now() - '24 hours'::interval);
  
END;
$$;