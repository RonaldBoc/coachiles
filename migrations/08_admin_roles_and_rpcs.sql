-- Admin roles & RPC scaffolding for Coachiles
-- Safe to run multiple times; uses IF NOT EXISTS where possible

-- 1) Create a simple admin allowlist table (email-based)
CREATE TABLE IF NOT EXISTS public.admin_users (
  email text primary key,
  created_at timestamptz NOT NULL DEFAULT now(),
  note text
);

COMMENT ON TABLE public.admin_users IS 'Email allowlist for superadmin access (temporary until full RBAC)';

-- 2) View: convenience wrapper over admin_users for joins (optional)
CREATE OR REPLACE VIEW public.v_admin_users AS
SELECT email, created_at FROM public.admin_users;

-- 3) Function: is_superadmin(email) -> boolean
CREATE OR REPLACE FUNCTION public.is_superadmin(p_email text)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users a WHERE lower(a.email) = lower(p_email)
  );
$$;

COMMENT ON FUNCTION public.is_superadmin(text) IS 'Checks if email is in admin_users allowlist';

-- 4) Admin list RPCs (SECURITY DEFINER) for read-only dashboards
-- Coaches
CREATE OR REPLACE FUNCTION public.admin_list_coaches(p_email text)
RETURNS TABLE (
  id uuid,
  email text,
  first_name text,
  last_name text,
  created_at timestamptz,
  is_active boolean,
  subscription_type text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT public.is_superadmin(p_email) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  RETURN QUERY
  SELECT c.id, c.email, c.first_name, c.last_name, c.created_at, c.is_active, c.subscription_type
  FROM public.coaches c
  ORDER BY c.created_at DESC
  LIMIT 1000;
END;
$$;

-- Leads
CREATE OR REPLACE FUNCTION public.admin_list_leads(p_email text)
RETURNS TABLE (
  id uuid,
  client_name text,
  client_email text,
  status text,
  coach_id uuid,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT public.is_superadmin(p_email) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  RETURN QUERY
  SELECT l.id, l.client_name, l.client_email, l.status, l.coach_id, l.created_at
  FROM public.leads l
  ORDER BY l.created_at DESC
  LIMIT 1000;
END;
$$;

-- Deletion logs
CREATE OR REPLACE FUNCTION public.admin_list_deletion_logs(p_email text)
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
AS $$
BEGIN
  IF NOT public.is_superadmin(p_email) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  RETURN QUERY
  SELECT d.id,
         d.coach_id,
         d.reason,
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

-- 5) Grants: allow authenticated to execute RPCs; access enforced inside via is_superadmin
GRANT EXECUTE ON FUNCTION public.is_superadmin(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_coaches(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_leads(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_deletion_logs(text) TO authenticated;
