-- Ensure is_superadmin works with RLS by running as owner
-- Makes function SECURITY DEFINER and pins search_path

BEGIN;

-- Run is_superadmin with definer privileges so it can read admin_users despite RLS
ALTER FUNCTION public.is_superadmin(text) SECURITY DEFINER;
ALTER FUNCTION public.is_superadmin(text) SET search_path = public;

-- Ensure clients can execute the function
GRANT EXECUTE ON FUNCTION public.is_superadmin(text) TO authenticated;

COMMIT;
