-- 30_admin_list_reviews.sql
-- Purpose: Provide a SECURITY DEFINER RPC for superadmins to list ALL reviews (including pending / rejected)
-- bypassing RLS limitations that otherwise restrict visibility to published or own-coach reviews.
-- Enables Superadmin UI moderation table.

-- Safety: function checks public.is_superadmin(p_email) before returning any data.
-- Returns rows ordered newest first with optional filters.

CREATE OR REPLACE FUNCTION public.admin_list_reviews(
  p_email text,
  p_status text DEFAULT NULL,
  p_coach_id uuid DEFAULT NULL,
  p_limit integer DEFAULT 500
) RETURNS SETOF public.reviews
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_superadmin(p_email) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  RETURN QUERY
  SELECT *
  FROM public.reviews r
  WHERE (p_status IS NULL OR r.moderation_status = p_status)
    AND (p_coach_id IS NULL OR r.coach_id = p_coach_id)
  ORDER BY r.created_at DESC
  LIMIT COALESCE(p_limit, 500);
END;$$;

COMMENT ON FUNCTION public.admin_list_reviews(text, text, uuid, integer) IS 'Superadmin-only: list reviews with optional status/coach filters. Bypasses RLS via SECURITY DEFINER.';

GRANT EXECUTE ON FUNCTION public.admin_list_reviews(text, text, uuid, integer) TO authenticated;
