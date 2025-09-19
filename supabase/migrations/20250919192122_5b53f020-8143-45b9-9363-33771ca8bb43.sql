-- Enhanced security policies for API usage data protection
-- Remove existing overly permissive policies for api_usage
DROP POLICY IF EXISTS "Rate limit check only - minimal access" ON public.api_usage;
DROP POLICY IF EXISTS "Rate limit insert only - minimal data" ON public.api_usage;
DROP POLICY IF EXISTS "Rate limit update only - counters" ON public.api_usage;

-- Create new restrictive policies that only allow service role access for sensitive data
CREATE POLICY "Service role only api_usage read" 
ON public.api_usage FOR SELECT 
TO service_role 
USING (true);

CREATE POLICY "Service role only api_usage insert" 
ON public.api_usage FOR INSERT 
TO service_role 
WITH CHECK (true);

CREATE POLICY "Service role only api_usage update" 
ON public.api_usage FOR UPDATE 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Allow minimal anonymous access only for active rate limiting checks
CREATE POLICY "Anonymous rate limit validation only" 
ON public.api_usage FOR SELECT 
TO anon 
USING (
  last_request > (now() - '00:05:00'::interval) AND 
  endpoint = 'wordle-solver' AND 
  created_at > (now() - '01:00:00'::interval)
);

-- Create function for safe API usage statistics (anonymized)
CREATE OR REPLACE FUNCTION public.get_api_usage_stats()
RETURNS TABLE(
  endpoint text,
  total_requests bigint,
  unique_keys bigint,
  avg_requests_per_key numeric,
  time_period text
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only allow service role to access this function
  IF (((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text) != 'service_role'::text) THEN
    RAISE EXCEPTION 'Access denied: Service role required';
  END IF;

  RETURN QUERY
  SELECT 
    au.endpoint,
    SUM(au.request_count) as total_requests,
    COUNT(DISTINCT au.api_key_hash) as unique_keys,
    ROUND(AVG(au.request_count), 2) as avg_requests_per_key,
    'Last 24 hours'::text as time_period
  FROM public.api_usage au
  WHERE au.created_at > (now() - '24 hours'::interval)
  GROUP BY au.endpoint;
END;
$$;

-- Create automated cleanup job for old API usage data (enhanced)
CREATE OR REPLACE FUNCTION public.cleanup_api_usage_data()
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

  -- Clean old API usage data (keep only 2 hours for active rate limiting)
  DELETE FROM public.api_usage 
  WHERE last_request < (now() - '2 hours'::interval);
  
  -- Log cleanup action
  INSERT INTO public.security_events (
    event_type,
    endpoint,
    details,
    severity
  ) VALUES (
    'automated_cleanup',
    'api_usage_cleanup',
    jsonb_build_object(
      'action', 'cleanup_old_api_usage_data',
      'retention_period', '2 hours',
      'timestamp', now()
    ),
    'info'
  );
END;
$$;