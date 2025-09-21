-- Fix security issue: Move extensions out of public schema
-- Drop and recreate extensions in proper schemas

-- First, drop the extensions from public schema if they exist
DROP EXTENSION IF EXISTS pg_cron CASCADE;
DROP EXTENSION IF EXISTS pg_net CASCADE;

-- Create extensions in the extensions schema (Supabase best practice)
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS pg_cron SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net SCHEMA extensions;

-- Re-create the cron job using the extensions schema
SELECT extensions.cron.schedule(
  'security-cleanup-job',
  '0 */2 * * *', -- Every 2 hours at minute 0
  $$
  SELECT
    extensions.net.http_post(
        url:='https://tctpfuqvpvkcdidyiowu.supabase.co/functions/v1/security-cleanup',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.cleanup_secret_key', true) || '"}'::jsonb,
        body:='{"scheduled": true, "timestamp": "' || now() || '"}'::jsonb
    ) as request_id;
  $$
);