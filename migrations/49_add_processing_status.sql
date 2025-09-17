-- Migration 49: Add PROCESSING status to notification_events
-- The worker sets status='PROCESSING' during handling; original constraint lacked this value causing 23514.

ALTER TABLE public.notification_events
  DROP CONSTRAINT IF EXISTS notification_events_status_check;

ALTER TABLE public.notification_events
  ADD CONSTRAINT notification_events_status_check
  CHECK (status IN ('PENDING','PROCESSING','SENT','ERROR','SKIP'));

COMMENT ON CONSTRAINT notification_events_status_check ON public.notification_events IS 'Allow PROCESSING transitional state for worker.';
