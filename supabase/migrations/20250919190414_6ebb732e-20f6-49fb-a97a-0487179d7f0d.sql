-- Fix the security definer view issue by removing the view and using direct table access with proper policies
DROP VIEW IF EXISTS public.api_usage_rate_limit;

-- Instead, we'll rely on the restrictive RLS policies we already created
-- The policies already limit access to only recent data and non-sensitive fields