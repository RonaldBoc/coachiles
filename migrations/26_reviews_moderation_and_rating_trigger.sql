-- 26_reviews_moderation_and_rating_trigger.sql
-- Purpose: Enforce manual superadmin approval for reviews, compute coach average rating on approval,
--          restrict single coach response, and harden defaults.

-- 1. Ensure defaults reflect manual moderation workflow
ALTER TABLE public.reviews
  ALTER COLUMN is_published SET DEFAULT false;

-- Backfill existing rows: publish only approved reviews
UPDATE public.reviews
SET is_published = CASE WHEN moderation_status = 'approved' THEN true ELSE false END
WHERE is_published IS DISTINCT FROM (moderation_status = 'approved');

-- 2. Function: recalculate coach rating based ONLY on approved reviews
CREATE OR REPLACE FUNCTION public.recalculate_coach_rating(p_coach_id uuid)
RETURNS void AS $$
DECLARE
  v_avg numeric;
BEGIN
  SELECT AVG(rating)::numeric(3,2) INTO v_avg
  FROM public.reviews
  WHERE coach_id = p_coach_id AND moderation_status = 'approved';

  UPDATE public.coaches
  SET rating = COALESCE(v_avg, 0), updated_at = timezone('utc', now())
  WHERE id = p_coach_id;
END;$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Trigger: when a review becomes approved, update coach rating
CREATE OR REPLACE FUNCTION public.handle_review_approval()
RETURNS trigger AS $$
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.moderation_status = 'approved') OR
     (TG_OP = 'UPDATE' AND (OLD.moderation_status IS DISTINCT FROM NEW.moderation_status) AND NEW.moderation_status = 'approved') OR
     (TG_OP = 'UPDATE' AND NEW.moderation_status = 'approved' AND OLD.rating IS DISTINCT FROM NEW.rating) THEN
    PERFORM public.recalculate_coach_rating(NEW.coach_id);
  END IF;
  RETURN NEW;
END;$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_handle_review_approval ON public.reviews;
CREATE TRIGGER trg_handle_review_approval
AFTER INSERT OR UPDATE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.handle_review_approval();

-- 4. Enforce single coach response (cannot modify once set)
CREATE OR REPLACE FUNCTION public.enforce_single_coach_response()
RETURNS trigger AS $$
BEGIN
  IF OLD.coach_response IS NOT NULL AND NEW.coach_response IS DISTINCT FROM OLD.coach_response THEN
    RAISE EXCEPTION 'Coach response already set and cannot be modified';
  END IF;
  RETURN NEW;
END;$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_single_coach_response ON public.reviews;
CREATE TRIGGER trg_single_coach_response
BEFORE UPDATE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.enforce_single_coach_response();

-- 5. Approval / Rejection RPCs (superadmin only) -----------------------------
-- These use existing public.is_superadmin(email) to authorize.

CREATE OR REPLACE FUNCTION public.approve_review(p_review_id uuid, p_admin_email text, p_notes text DEFAULT NULL)
RETURNS public.reviews AS $$
DECLARE
  v_review public.reviews%ROWTYPE;
BEGIN
  IF NOT public.is_superadmin(p_admin_email) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE public.reviews
  SET moderation_status = 'approved',
      is_published = true,
      is_verified = true,
      moderation_notes = COALESCE(moderation_notes,'') || CASE WHEN p_notes IS NOT NULL THEN '\n[APPROVED NOTE] '||p_notes ELSE '' END,
      updated_at = timezone('utc', now())
  WHERE id = p_review_id
  RETURNING * INTO v_review;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Review not found';
  END IF;

  -- Rating recompute handled by trigger, but ensure consistency if trigger disabled
  PERFORM public.recalculate_coach_rating(v_review.coach_id);

  RETURN v_review;
END;$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.reject_review(p_review_id uuid, p_admin_email text, p_notes text DEFAULT NULL)
RETURNS public.reviews AS $$
DECLARE
  v_review public.reviews%ROWTYPE;
BEGIN
  IF NOT public.is_superadmin(p_admin_email) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE public.reviews
  SET moderation_status = 'rejected',
      is_published = false,
      is_verified = false,
      moderation_notes = COALESCE(moderation_notes,'') || CASE WHEN p_notes IS NOT NULL THEN '\n[REJECTED NOTE] '||p_notes ELSE '' END,
      updated_at = timezone('utc', now())
  WHERE id = p_review_id
  RETURNING * INTO v_review;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Review not found';
  END IF;

  RETURN v_review;
END;$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.recalculate_coach_rating(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.approve_review(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_review(uuid, text, text) TO authenticated;

COMMENT ON FUNCTION public.approve_review(uuid, text, text) IS 'Superadmin approves a review (publish + verify + rating recompute)';
COMMENT ON FUNCTION public.reject_review(uuid, text, text) IS 'Superadmin rejects a review (unpublish)';
COMMENT ON FUNCTION public.recalculate_coach_rating(uuid) IS 'Recompute a coach average rating from approved reviews';
