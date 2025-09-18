-- Fix function search path security warnings

-- Update the validate_session_token function with proper search_path
CREATE OR REPLACE FUNCTION public.validate_session_token(token text, job_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.analysis_jobs
    WHERE id = job_id
    AND session_token = token
    AND session_token IS NOT NULL
    AND length(session_token) >= 32
    AND created_at > (now() - '1 hour'::interval)
    AND expires_at > now()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Update the audit_job_changes function with proper search_path
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;