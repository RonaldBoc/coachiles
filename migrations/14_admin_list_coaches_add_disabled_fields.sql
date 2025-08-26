-- Include disabled metadata in admin list coaches RPC for UI

BEGIN;

DROP FUNCTION IF EXISTS public.admin_list_coaches(text);

CREATE FUNCTION public.admin_list_coaches(p_email text)
RETURNS TABLE (
  id uuid,
  email text,
  first_name text,
  last_name text,
  created_at timestamptz,
  is_active boolean,
  disabled_reason text,
  disabled_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_superadmin(p_email) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  RETURN QUERY
  SELECT c.id, c.email, c.first_name, c.last_name, c.created_at, c.is_active, c.disabled_reason, c.disabled_at
  FROM public.coaches c
  ORDER BY c.created_at DESC
  LIMIT 1000;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_list_coaches(text) TO authenticated;

COMMIT;
