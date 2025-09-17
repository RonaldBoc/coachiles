-- Reset all notification_events rows to PENDING for testing purposes
-- NOTE: Run with a privileged role (table owner or service role) because RLS is enabled on this table.

BEGIN;

UPDATE public.notification_events
SET
  status = 'PENDING',
  next_attempt_at = timezone('utc'::text, now()),
  processed_at = NULL,
  error_message = NULL,
  retry_count = 0;

-- Optional: example to only reset specific statuses instead of all rows
-- UPDATE public.notification_events
-- SET
--   status = 'PENDING',
--   next_attempt_at = timezone('utc'::text, now()),
--   processed_at = NULL,
--   error_message = NULL,
--   retry_count = 0
-- WHERE status IN ('ERROR','SKIP','SENT','PROCESSING');

COMMIT;
