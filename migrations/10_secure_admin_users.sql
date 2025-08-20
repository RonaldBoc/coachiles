-- Secure admin allowlist objects (admin_users table and v_admin_users view)
-- Goal: prevent public API access while keeping RPCs working

BEGIN;

-- 1) Enforce RLS on the table (blocks anon/auth by default)
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 2) Revoke broad grants on the table and the view (defense-in-depth)
REVOKE ALL ON TABLE public.admin_users FROM anon, authenticated;
REVOKE ALL ON TABLE public.v_admin_users FROM anon, authenticated;

-- 3) Optional: allow only service_role to read (server-side tasks)
DROP POLICY IF EXISTS "service role can read admin_users" ON public.admin_users;
CREATE POLICY "service role can read admin_users"
  ON public.admin_users
  FOR SELECT
  USING (auth.role() = 'service_role');

-- No other policies are created; CLIENT roles (anon/authenticated) cannot read/write.
-- SECURITY DEFINER RPCs owned by the table owner will continue to work.

COMMIT;
