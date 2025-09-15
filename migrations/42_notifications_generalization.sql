-- Migration 42: Generalize notification system for non-coach recipients & lead client confirmation
-- Adds recipient abstraction and new event type LEAD_CLIENT_CONFIRMATION
-- Keeps backwards compatibility for existing rows.

BEGIN;

-- 1. Add new recipient columns (nullable)
ALTER TABLE public.notification_events
  ADD COLUMN IF NOT EXISTS recipient_type text CHECK (recipient_type IN ('COACH','USER','EXTERNAL')),
  ADD COLUMN IF NOT EXISTS recipient_coach_id uuid REFERENCES public.coaches(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS recipient_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS recipient_email text;

-- 2. Backfill existing rows (assume all previous target_user_id values are coach IDs)
UPDATE public.notification_events
SET recipient_type = 'COACH', recipient_coach_id = target_user_id
WHERE recipient_type IS NULL;

-- 3. Add a CHECK enforcing at least one recipient target (skip if constraint already exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'notification_events_recipient_presence_ck'
  ) THEN
    ALTER TABLE public.notification_events
      ADD CONSTRAINT notification_events_recipient_presence_ck
      CHECK (
        (recipient_coach_id IS NOT NULL)::int +
        (recipient_user_id IS NOT NULL)::int +
        (recipient_email IS NOT NULL)::int >= 1
      );
  END IF;
END$$;

-- 4. Extend allowed event types
ALTER TABLE public.notification_events
  DROP CONSTRAINT IF EXISTS notification_events_type_check;
ALTER TABLE public.notification_events
  ADD CONSTRAINT notification_events_type_check
  CHECK (type IN ('NEW_LEAD','NEW_REVIEW','LEAD_CLIENT_CONFIRMATION'));

-- 5. New enqueue function (replaces old) supporting multiple recipient kinds
DROP FUNCTION IF EXISTS public.enqueue_notification(text, text, uuid, uuid, text, uuid, text, jsonb); -- previous signature attempt (safe)
-- New ordered signature: all required params first, then defaults.
CREATE OR REPLACE FUNCTION public.enqueue_notification(
  p_type text,
  p_recipient_type text,
  p_entity_type text,
  p_entity_id uuid,
  p_unique_hash text,
  p_payload jsonb,
  p_recipient_coach_id uuid DEFAULT NULL,
  p_recipient_user_id uuid DEFAULT NULL,
  p_recipient_email text DEFAULT NULL,
  p_actor_user_id uuid DEFAULT NULL
) RETURNS void AS $$
DECLARE
  pref record;
BEGIN
  -- Preferences only for COACH or USER
  IF p_recipient_type IN ('COACH','USER') THEN
    SELECT * INTO pref FROM public.notification_preferences WHERE user_id = COALESCE(p_recipient_user_id, p_recipient_coach_id);

    IF p_type = 'NEW_LEAD' AND pref.user_id IS NOT NULL AND COALESCE(pref.email_new_lead,false) = false THEN
      RETURN; -- skip
    ELSIF p_type = 'NEW_REVIEW' AND pref.user_id IS NOT NULL AND COALESCE(pref.email_new_review,false) = false THEN
      RETURN; -- skip
    END IF;
  END IF;

  INSERT INTO public.notification_events(
    type, target_user_id, actor_user_id, entity_type, entity_id, unique_hash, payload,
    recipient_type, recipient_coach_id, recipient_user_id, recipient_email
  ) VALUES (
  p_type,
  COALESCE(p_recipient_coach_id, p_recipient_user_id),
  p_actor_user_id,
  p_entity_type,
  p_entity_id,
  p_unique_hash,
  p_payload,
  p_recipient_type,
  p_recipient_coach_id,
  p_recipient_user_id,
  p_recipient_email
  ) ON CONFLICT (unique_hash) DO NOTHING;
END;$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Update triggers (review publish + lead assignment) to use new signature
CREATE OR REPLACE FUNCTION public.trg_review_insert_notify()
RETURNS TRIGGER AS $$
DECLARE
  v_unique text;
BEGIN
  -- fire on insert published or update publish transition
  IF (TG_OP='INSERT' AND NEW.is_published IS DISTINCT FROM false) OR
     (TG_OP='UPDATE' AND (OLD.is_published IS DISTINCT FROM NEW.is_published) AND NEW.is_published = true) THEN
    v_unique := 'review_'|| NEW.id;
    PERFORM public.enqueue_notification(
      'NEW_REVIEW', 'COACH',
      'review', NEW.id, v_unique,
      jsonb_build_object(
        'review_id', NEW.id,
        'rating', NEW.rating,
        'title', NEW.title,
        'comment', NEW.comment
      ),
      NEW.coach_id, NULL, NULL, NULL
    );
  END IF;
  RETURN NEW;
END;$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_review_insert_notify ON public.reviews;
CREATE TRIGGER trg_review_insert_notify
  AFTER INSERT OR UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.trg_review_insert_notify();

-- Lead assignment trigger (coach notification) unchanged logic but new signature
CREATE OR REPLACE FUNCTION public.trg_lead_assignment_notify()
RETURNS TRIGGER AS $$
DECLARE
  v_unique text;
BEGIN
  IF NEW.coach_id IS NOT NULL AND (OLD.coach_id IS DISTINCT FROM NEW.coach_id) THEN
    v_unique := 'lead_assign_'|| NEW.id || '_' || NEW.coach_id;
    PERFORM public.enqueue_notification(
      'NEW_LEAD','COACH',
      'lead', NEW.id, v_unique,
      jsonb_build_object(
        'lead_id', NEW.id,
        'client_name', NEW.client_name,
        'goals', NEW.goals,
        'status', NEW.status
      ),
      NEW.coach_id, NULL, NULL, NULL
    );
  END IF;
  RETURN NEW;
END;$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_lead_assignment_notify ON public.leads;
CREATE TRIGGER trg_lead_assignment_notify
  AFTER INSERT OR UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.trg_lead_assignment_notify();

-- 7. Lead client confirmation trigger (fires once on INSERT)
CREATE OR REPLACE FUNCTION public.trg_lead_client_confirmation()
RETURNS TRIGGER AS $$
DECLARE
  v_unique text;
BEGIN
  v_unique := 'lead_confirm_'|| NEW.id || '_' || NEW.client_email;
  PERFORM public.enqueue_notification(
    'LEAD_CLIENT_CONFIRMATION','EXTERNAL',
    'lead', NEW.id, v_unique,
    jsonb_build_object(
      'lead_id', NEW.id,
      'client_name', NEW.client_name,
      'coach_assigned', NEW.coach_id,
      'goals', NEW.goals
    ),
    NULL, NULL, NEW.client_email, NULL
  );
  RETURN NEW;
END;$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_lead_client_confirmation ON public.leads;
CREATE TRIGGER trg_lead_client_confirmation
  AFTER INSERT ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.trg_lead_client_confirmation();

COMMIT;

COMMENT ON FUNCTION public.trg_lead_client_confirmation() IS 'Enqueue confirmation email to client after lead submission.';
