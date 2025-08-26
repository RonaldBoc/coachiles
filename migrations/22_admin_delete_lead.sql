-- Migration 22: Add admin_delete_lead RPC
-- Permanently deletes a lead (and any dependent rows if cascading FKs are set)

CREATE OR REPLACE FUNCTION public.admin_delete_lead(
  p_email text,
  p_lead_id uuid
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  existed boolean;
BEGIN
  IF NOT public.is_superadmin(p_email) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  -- Delete the lead. If foreign keys are defined with ON DELETE CASCADE this will remove dependencies.
  DELETE FROM public.leads WHERE id = p_lead_id RETURNING true INTO existed;

  IF NOT existed THEN
    RETURN json_build_object('success', false, 'error', 'not_found');
  END IF;

  RETURN json_build_object('success', true, 'lead_id', p_lead_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_delete_lead(text, uuid) TO authenticated;
