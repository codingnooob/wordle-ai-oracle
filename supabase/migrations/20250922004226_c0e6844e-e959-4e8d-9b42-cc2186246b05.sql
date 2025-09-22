-- Clean up stuck jobs that are older than 5 minutes
DELETE FROM analysis_results WHERE job_id IN (
  SELECT id FROM analysis_jobs 
  WHERE status = 'processing' AND created_at < now() - interval '5 minutes'
);

DELETE FROM analysis_jobs 
WHERE status = 'processing' AND created_at < now() - interval '5 minutes';

-- Log the cleanup
INSERT INTO security_events (event_type, endpoint, details, severity)
VALUES (
  'manual_cleanup',
  'stuck_jobs_cleanup', 
  jsonb_build_object(
    'action', 'cleanup_stuck_processing_jobs',
    'retention_period', '5 minutes',
    'timestamp', now()
  ),
  'info'
);