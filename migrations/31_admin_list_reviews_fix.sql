-- 31_admin_list_reviews_fix.sql
-- Purpose: Recreate admin_list_reviews without default parameters to satisfy PostgREST schema cache.
-- Some environments occasionally fail to expose functions with defaults; this version removes defaults.
-- Optional filters should be passed explicitly as null when unused.

DROP FUNCTION IF EXISTS public.admin_list_reviews(text, text, uuid, integer);

CREATE OR REPLACE FUNCTION public.admin_list_reviews(
  p_email text,
  p_status text,
  p_coach_id uuid,
  p_limit integer
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

COMMENT ON FUNCTION public.admin_list_reviews(text, text, uuid, integer) IS 'Superadmin-only: list reviews (recreated without defaults to ensure exposure).';
GRANT EXECUTE ON FUNCTION public.admin_list_reviews(text, text, uuid, integer) TO authenticated;
