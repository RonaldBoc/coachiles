-- Migration 44: Allow NULL target_user_id for EXTERNAL notifications
-- Reason: LEAD_CLIENT_CONFIRMATION events have no internal user/coach recipient; previous NOT NULL constraint caused failure.

BEGIN;
ALTER TABLE public.notification_events
  ALTER COLUMN target_user_id DROP NOT NULL;

COMMENT ON COLUMN public.notification_events.target_user_id IS 'Legacy recipient (coach/user). Nullable for EXTERNAL recipient_type rows.';
COMMIT;
