-- Function to get user auth info (last_sign_in_at) from auth.users
-- This is needed because direct access to auth schema is restricted

-- Drop the existing function first (required when changing return type)
DROP FUNCTION IF EXISTS get_user_auth_info(text);

CREATE OR REPLACE FUNCTION get_user_auth_info(user_email text)
RETURNS json
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT json_build_object(
    'id', auth.users.id,
    'email', auth.users.email,
    'last_sign_in_at', auth.users.last_sign_in_at,
    'created_at', auth.users.created_at,
    'email_confirmed_at', auth.users.email_confirmed_at
  )
  FROM auth.users 
  WHERE auth.users.email = user_email
  LIMIT 1;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_user_auth_info(text) TO authenticated;