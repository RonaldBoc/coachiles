-- Create a function to test the current authentication context
-- This helps debug RLS policy issues

CREATE OR REPLACE FUNCTION get_current_user_info()
RETURNS json
LANGUAGE sql
SECURITY definer
AS $$
  SELECT json_build_object(
    'auth_uid', auth.uid(),
    'auth_email', auth.email(),
    'auth_role', auth.role(),
    'session_user', session_user,
    'current_user', current_user
  );
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_current_user_info() TO authenticated;
