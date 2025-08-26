-- 32_review_response_hide_and_delete.sql
-- Purpose: Allow superadmin to (a) hide/unhide a coach response without removing the review
--          (b) delete any review after approval (or in any state) while ensuring coach rating
--              is recomputed excluding the deleted review.
-- Strategy:
--   * Add column coach_response_hidden boolean DEFAULT false
--   * Hard delete approach: removed rows are excluded automatically. Rating recompute unaffected.
--   * Provide SECURITY DEFINER RPC admin_delete_review(review_id, admin_email, notes?)
--     which hard deletes the row then recomputes rating for that coach.
--   * Provide SECURITY DEFINER RPC admin_hide_coach_response(review_id, admin_email, hide, notes?)
--     which toggles coach_response_hidden flag and appends optional moderation note.

ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS coach_response_hidden boolean DEFAULT false;

-- Hide/unhide coach response
CREATE OR REPLACE FUNCTION public.admin_hide_coach_response(
  p_review_id uuid,
  p_admin_email text,
  p_hide boolean,
  p_notes text DEFAULT NULL
) RETURNS public.reviews AS $$
DECLARE
  v_review public.reviews%ROWTYPE;
BEGIN
  IF NOT public.is_superadmin(p_admin_email) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE public.reviews
  SET coach_response_hidden = p_hide,
      moderation_notes = COALESCE(moderation_notes,'') || CASE WHEN p_notes IS NOT NULL THEN '\n[RESPONSE ' || (CASE WHEN p_hide THEN 'HIDDEN' ELSE 'VISIBLE' END) || ' NOTE] ' || p_notes ELSE '' END,
      updated_at = timezone('utc', now())
  WHERE id = p_review_id
  RETURNING * INTO v_review;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Review not found';
  END IF;

  RETURN v_review;
END;$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Delete a review (hard delete)
CREATE OR REPLACE FUNCTION public.admin_delete_review(
  p_review_id uuid,
  p_admin_email text,
  p_notes text DEFAULT NULL
) RETURNS boolean AS $$
DECLARE
  v_coach_id uuid;
BEGIN
  IF NOT public.is_superadmin(p_admin_email) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT coach_id INTO v_coach_id FROM public.reviews WHERE id = p_review_id;
  IF v_coach_id IS NULL THEN
    RAISE EXCEPTION 'Review not found';
  END IF;

  IF p_notes IS NOT NULL THEN
    UPDATE public.reviews
    SET moderation_notes = COALESCE(moderation_notes,'') || '\n[DELETED NOTE] ' || p_notes
    WHERE id = p_review_id;
  END IF;

  DELETE FROM public.reviews WHERE id = p_review_id;

  PERFORM public.recalculate_coach_rating(v_coach_id);

  RETURN true;
END;$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.admin_hide_coach_response(uuid, text, boolean, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_review(uuid, text, text) TO authenticated;

COMMENT ON FUNCTION public.admin_hide_coach_response(uuid, text, boolean, text) IS 'Superadmin toggles visibility of a coach response';
COMMENT ON FUNCTION public.admin_delete_review(uuid, text, text) IS 'Superadmin hard deletes a review then recomputes coach rating';
