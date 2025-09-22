-- Fix Extension in Public Schema Security Issue
-- Move extensions from public schema to appropriate system schemas

-- Check which extensions are in public schema and move them
-- This addresses the security warning about extensions in public schema

-- The pgcrypto extension should be in a system schema, not public
-- Move it to the extensions schema if it exists in public
DO $$
BEGIN
  -- Check if pgcrypto exists in public schema
  IF EXISTS (
    SELECT 1 FROM pg_extension e 
    JOIN pg_namespace n ON e.extnamespace = n.oid 
    WHERE e.extname = 'pgcrypto' AND n.nspname = 'public'
  ) THEN
    -- Create extensions schema if it doesn't exist
    CREATE SCHEMA IF NOT EXISTS extensions;
    
    -- Move pgcrypto from public to extensions schema
    ALTER EXTENSION pgcrypto SET SCHEMA extensions;
  END IF;
  
  -- Check for other extensions in public schema and move them
  PERFORM 1 FROM pg_extension e 
  JOIN pg_namespace n ON e.extnamespace = n.oid 
  WHERE n.nspname = 'public' AND e.extname NOT IN ('plpgsql');
  
  IF FOUND THEN
    -- Log which extensions were found in public schema
    RAISE NOTICE 'Extensions found in public schema that should be moved to system schemas';
  END IF;
END $$;

-- Grant necessary permissions to use extensions from the extensions schema
GRANT USAGE ON SCHEMA extensions TO public, authenticated, anon;