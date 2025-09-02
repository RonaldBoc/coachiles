-- Migration 39: Notification events + preferences for email system (Postmark integration layer)
-- Idempotent creation of core tables, indexes, RLS, and triggers to enqueue notification events
-- This sets up an internal queue table that Edge Functions / background worker will process

-- 1. notification_preferences table (per user/coach)
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email_new_lead boolean DEFAULT true,
  email_new_review boolean DEFAULT true,
  email_system boolean DEFAULT true, -- generic platform announcements
  email_marketing boolean DEFAULT false, -- future
  updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure updated_at auto-maintained
CREATE OR REPLACE FUNCTION public.handle_notification_prefs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notification_prefs_updated_at ON public.notification_preferences;
CREATE TRIGGER trg_notification_prefs_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION public.handle_notification_prefs_updated_at();

-- Basic RLS (allow owner to see/update their prefs)
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Owner can view notification prefs" ON public.notification_preferences;
CREATE POLICY "Owner can view notification prefs" ON public.notification_preferences
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Owner can modify notification prefs" ON public.notification_preferences;
CREATE POLICY "Owner can modify notification prefs" ON public.notification_preferences
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Owner can insert own notification prefs" ON public.notification_preferences;
CREATE POLICY "Owner can insert own notification prefs" ON public.notification_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 2. notification_events queue table
-- status lifecycle: PENDING -> SENT | ERROR | SKIP
-- next_attempt_at supports retry with backoff
CREATE TABLE IF NOT EXISTS public.notification_events (
  id bigserial PRIMARY KEY,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  processed_at timestamptz,
  next_attempt_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  retry_count int DEFAULT 0 NOT NULL,
  status text DEFAULT 'PENDING' CHECK (status IN ('PENDING','SENT','ERROR','SKIP')),
  type text NOT NULL CHECK (type IN ('NEW_LEAD','NEW_REVIEW')),
  target_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  actor_user_id uuid REFERENCES auth.users(id), -- user who triggered
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  unique_hash text, -- for idempotency
  payload jsonb DEFAULT '{}'::jsonb NOT NULL,
  error_message text
);

CREATE INDEX IF NOT EXISTS idx_notification_events_status_next_attempt
  ON public.notification_events (status, next_attempt_at);
CREATE INDEX IF NOT EXISTS idx_notification_events_target_user
  ON public.notification_events (target_user_id);
CREATE INDEX IF NOT EXISTS idx_notification_events_entity
  ON public.notification_events (entity_type, entity_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_notification_events_unique_hash
  ON public.notification_events (unique_hash) WHERE unique_hash IS NOT NULL;

ALTER TABLE public.notification_events ENABLE ROW LEVEL SECURITY;
-- Only service role / privileged function should read. Lock down broadly.
DROP POLICY IF EXISTS "No direct access" ON public.notification_events;
CREATE POLICY "No direct access" ON public.notification_events
  FOR ALL USING (false) WITH CHECK (false);

-- Helper function to enqueue a notification (to be called from triggers) - SECURITY DEFINER so it can bypass RLS
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
  -- Check prefs quickly (skip insert if user disabled this type) - optional optimization
  SELECT * INTO pref FROM public.notification_preferences WHERE user_id = p_target_user_id;
  IF p_type = 'NEW_LEAD' THEN
    IF pref.user_id IS NOT NULL AND COALESCE(pref.email_new_lead,false) = false THEN
      RETURN; -- skip
    END IF;
  ELSIF p_type = 'NEW_REVIEW' THEN
    IF pref.user_id IS NOT NULL AND COALESCE(pref.email_new_review,false) = false THEN
      RETURN;
    END IF;
  END IF;

  INSERT INTO public.notification_events(type, target_user_id, actor_user_id, entity_type, entity_id, unique_hash, payload)
  VALUES (p_type, p_target_user_id, p_actor_user_id, p_entity_type, p_entity_id, p_unique_hash, p_payload)
  ON CONFLICT (unique_hash) DO NOTHING; -- idempotent
END;$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Restrict execute to service role later (manually via dashboard) if desired

-- 3. Triggers for leads & reviews
-- Need to map lead.coach_id -> target user; assume coaches table has id matching auth.users.id (adjust if different)
-- For NEW_LEAD: when a lead is assigned to a coach (coach_id not null and changed from null) enqueue
CREATE OR REPLACE FUNCTION public.trg_lead_assignment_notify()
RETURNS TRIGGER AS $$
DECLARE
  v_unique text;
BEGIN
  IF NEW.coach_id IS NOT NULL AND (OLD.coach_id IS DISTINCT FROM NEW.coach_id) THEN
    v_unique := 'lead_assign_'|| NEW.id || '_' || NEW.coach_id; -- unique per coach assignment
    PERFORM public.enqueue_notification(
      'NEW_LEAD',
      NEW.coach_id,
      NULL, -- actor unknown at pure DB trigger layer
      'lead',
      NEW.id,
      v_unique,
      jsonb_build_object(
        'lead_id', NEW.id,
        'client_name', NEW.client_name,
        'goals', NEW.goals,
        'status', NEW.status
      )
    );
  END IF;
  RETURN NEW;
END;$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_lead_assignment_notify ON public.leads;
CREATE TRIGGER trg_lead_assignment_notify
  AFTER INSERT OR UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.trg_lead_assignment_notify();

-- For NEW_REVIEW: after insert on reviews (only published) enqueue
CREATE OR REPLACE FUNCTION public.trg_review_insert_notify()
RETURNS TRIGGER AS $$
DECLARE
  v_unique text;
BEGIN
  IF NEW.is_published IS DISTINCT FROM false THEN
    v_unique := 'review_'|| NEW.id;
    PERFORM public.enqueue_notification(
      'NEW_REVIEW',
      NEW.coach_id,
      NULL,
      'review',
      NEW.id,
      v_unique,
      jsonb_build_object(
        'review_id', NEW.id,
        'rating', NEW.rating,
        'title', NEW.title,
        'comment', NEW.comment
      )
    );
  END IF;
  RETURN NEW;
END;$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_review_insert_notify ON public.reviews;
CREATE TRIGGER trg_review_insert_notify
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.trg_review_insert_notify();

-- Done
