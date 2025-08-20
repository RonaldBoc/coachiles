-- Fix admin RPCs to match current schema
-- - coaches: drop subscription_type column reference (may be removed)
-- - coach_deletion_log: use deletion_reason instead of reason

-- Drop old versions first (return types changed)
DROP FUNCTION IF EXISTS public.admin_list_coaches(text);
DROP FUNCTION IF EXISTS public.admin_list_deletion_logs(text);

-- Recreate admin_list_coaches without subscription_type
CREATE FUNCTION public.admin_list_coaches(p_email text)
RETURNS TABLE (
  id uuid,
  email text,
  first_name text,
  last_name text,
  created_at timestamptz,
  is_active boolean
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
  SELECT c.id, c.email, c.first_name, c.last_name, c.created_at, c.is_active
  FROM public.coaches c
  ORDER BY c.created_at DESC
  LIMIT 1000;
END;
$$;

-- Recreate admin_list_deletion_logs with deletion_reason
CREATE FUNCTION public.admin_list_deletion_logs(p_email text)
RETURNS TABLE (
  id uuid,
  coach_id uuid,
  reason text,
  deletion_type text,
  deletion_requested_at timestamptz,
  reactivation_deadline timestamptz,
  reactivated_at timestamptz,
  coach_name text
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
  SELECT d.id,
         d.coach_id,
         d.deletion_reason AS reason,
         d.deletion_type,
         d.deletion_requested_at,
         d.reactivation_deadline,
         d.reactivated_at,
         coalesce(c.first_name,'') || ' ' || coalesce(c.last_name,'') AS coach_name
  FROM public.coach_deletion_log d
  LEFT JOIN public.coaches c ON c.id = d.coach_id
  ORDER BY d.deletion_requested_at DESC
  LIMIT 1000;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_list_coaches(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_deletion_logs(text) TO authenticated;
