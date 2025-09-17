-- 54_enhance_review_notification_payload.sql
-- Purpose: Enrich NEW_REVIEW notification payload with reviewer_name (respecting anonymity)
--          and review_created_at for better email templates. Keeps existing keys.

-- Recreate review trigger function with extended payload
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
        'comment', NEW.comment,
        'reviewer_name', CASE WHEN COALESCE(NEW.is_anonymous,false) THEN 'Anonymous' ELSE NEW.client_name END,
        'created_at', NEW.created_at
      ),
      NEW.coach_id, NULL, NULL, NULL
    );
  END IF;
  RETURN NEW;
END;$$ LANGUAGE plpgsql;

-- Recreate trigger (idempotent)
DROP TRIGGER IF EXISTS trg_review_insert_notify ON public.reviews;
CREATE TRIGGER trg_review_insert_notify
  AFTER INSERT OR UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.trg_review_insert_notify();
