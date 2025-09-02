-- Migration 43: Make notification enqueue idempotent without requiring existing unique index inference
-- Problem: Functions leads_set_coach_public / leads_finalize_public trigger enqueue_notification()
-- which did: INSERT ... ON CONFLICT (unique_hash) DO NOTHING
-- Error 42P10 occurs if the partial unique index on (unique_hash) is missing, because the
-- inference specification cannot match a constraint. This migration updates the function to
-- use a generic ON CONFLICT DO NOTHING (no target), which is safe even if the unique index
-- temporarily doesn't exist. We also (re)create the unique index defensively.

BEGIN;

-- Ensure unique index still exists (partial to ignore NULLs)
CREATE UNIQUE INDEX IF NOT EXISTS uq_notification_events_unique_hash
  ON public.notification_events (unique_hash) WHERE unique_hash IS NOT NULL;

-- Replace enqueue function with safer conflict handling
CREATE OR REPLACE FUNCTION public.enqueue_notification(
  p_type text,
  p_target_user_id uuid,
  p_actor_user_id uuid,
  p_entity_type text,
  p_entity_id uuid,
  p_unique_hash text,
  p_payload jsonb
) RETURNS void AS $$
DECLARE
  pref record;
BEGIN
  -- Preference check (optional short‑circuit)
  SELECT * INTO pref FROM public.notification_preferences WHERE user_id = p_target_user_id;
  IF p_type = 'NEW_LEAD' THEN
    IF pref.user_id IS NOT NULL AND COALESCE(pref.email_new_lead,false) = false THEN
      RETURN;
    END IF;
  ELSIF p_type = 'NEW_REVIEW' THEN
    IF pref.user_id IS NOT NULL AND COALESCE(pref.email_new_review,false) = false THEN
      RETURN;
    END IF;
  END IF;

  INSERT INTO public.notification_events(
    type, target_user_id, actor_user_id, entity_type, entity_id, unique_hash, payload
  ) VALUES (
    p_type, p_target_user_id, p_actor_user_id, p_entity_type, p_entity_id, p_unique_hash, p_payload
  )
  ON CONFLICT DO NOTHING; -- generic, avoids missing constraint error
END;$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
