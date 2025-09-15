-- Migration 40: Fire NEW_REVIEW notification when a review becomes published (moderation approval)
-- Reason: Migration 39 only enqueued on INSERT and only if is_published != false. Since reviews default to is_published=false
-- (manual moderation workflow from migration 26), no notification row appears on initial create.
-- This migration updates the trigger function to also run AFTER UPDATE and detect transition to published.

-- Replace trigger function (idempotent)
CREATE OR REPLACE FUNCTION public.trg_review_insert_notify()
RETURNS TRIGGER AS $$
DECLARE
  v_unique text;
  should_enqueue boolean := false;
BEGIN
  -- CASE 1: Insert already published (rare; e.g., system import) -> enqueue
  IF TG_OP = 'INSERT' AND NEW.is_published IS DISTINCT FROM false THEN
    should_enqueue := true;
  END IF;

  -- CASE 2: Update transitions from not published to published
  IF TG_OP = 'UPDATE' AND (OLD.is_published IS DISTINCT FROM NEW.is_published) AND NEW.is_published = true THEN
    should_enqueue := true;
  END IF;

  IF should_enqueue THEN
    v_unique := 'review_' || NEW.id; -- idempotency key (unique_hash)
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

-- Recreate trigger to include UPDATE events
DROP TRIGGER IF EXISTS trg_review_insert_notify ON public.reviews;
CREATE TRIGGER trg_review_insert_notify
  AFTER INSERT OR UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.trg_review_insert_notify();

-- Verification helper comment:
-- After applying, approving a review (which sets is_published true) should enqueue a notification_events row.
