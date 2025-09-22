-- Fix RLS policy conflicts and database issues
-- First, enable pgcrypto extension for digest function
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Remove the conflicting "Restrict table access to service role only" policy
-- This policy conflicts with the public INSERT policy and causes job creation failures
DROP POLICY IF EXISTS "Restrict table access to service role only" ON public.analysis_jobs;

-- Keep the "Service role job management" policy for comprehensive service role access
-- Keep the "Allow public job creation secure" policy for public INSERTs
-- These two policies together should provide the right access without conflicts

-- Verify the remaining policies are correct
-- "Service role job management" - allows service role full access
-- "Allow public job creation secure" - allows public to insert jobs with proper validation

-- Add a comment to document the policy structure
COMMENT ON TABLE public.analysis_jobs IS 'Table with two RLS policies: public INSERT access and service role comprehensive access';