-- Enable required extensions for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule automated security cleanup to run every 2 hours
SELECT cron.schedule(
  'security-cleanup-job',
  '0 */2 * * *', -- Every 2 hours at minute 0
  $$
  SELECT
    net.http_post(
        url:='https://tctpfuqvpvkcdidyiowu.supabase.co/functions/v1/security-cleanup',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.cleanup_secret_key', true) || '"}'::jsonb,
        body:='{"scheduled": true, "timestamp": "' || now() || '"}'::jsonb
    ) as request_id;
  $$
);

-- Create configuration table for system settings
CREATE TABLE IF NOT EXISTS public.system_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on system_config (service role only)
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only system config access" 
ON public.system_config 
FOR ALL 
USING (((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text) = 'service_role'::text);

-- Add security monitoring configuration
INSERT INTO public.system_config (key, value, description) VALUES
('security.rate_limit_threshold', '{"api_requests_per_hour": 100, "job_creation_per_ip_hour": 10}', 'Rate limiting thresholds for security'),
('security.session_timeout_hours', '1', 'Session timeout in hours'),
('security.data_retention_hours', '{"sessions": 2, "api_usage": 2, "security_events": 168}', 'Data retention periods in hours')
ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = now();

-- Create function to get system configuration
CREATE OR REPLACE FUNCTION public.get_system_config(config_key text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  config_value jsonb;
BEGIN
  -- Only allow service role to access system config
  IF (((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text) != 'service_role'::text) THEN
    RAISE EXCEPTION 'Access denied: Service role required';
  END IF;

  SELECT value INTO config_value 
  FROM public.system_config 
  WHERE key = config_key;
  
  RETURN COALESCE(config_value, '{}'::jsonb);
END;
$$;