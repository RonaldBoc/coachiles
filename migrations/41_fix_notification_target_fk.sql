-- Migration 41: Fix notification_events target_user_id foreign key
-- Problem: notification_events.target_user_id referenced auth.users(id) but we enqueue with NEW.coach_id
-- from reviews/leads triggers. In current schema coaches.id are not necessarily auth.users.id, causing
-- FK violations when approving/publishing a review.
-- Solution: repoint FK to public.coaches(id). Edge worker already resolves email via coaches table.
-- Idempotent: drop existing constraint (if any) then add the new one.

BEGIN;

-- Drop old FK (auth.users)
ALTER TABLE public.notification_events
  DROP CONSTRAINT IF EXISTS notification_events_target_user_id_fkey;

-- Recreate FK referencing coaches
ALTER TABLE public.notification_events
  ADD CONSTRAINT notification_events_target_user_id_fkey
  FOREIGN KEY (target_user_id) REFERENCES public.coaches(id) ON DELETE CASCADE;

COMMIT;

COMMENT ON CONSTRAINT notification_events_target_user_id_fkey ON public.notification_events
  IS 'Targets a coach (public.coaches.id). Adjust if future generic user notifications needed.';
