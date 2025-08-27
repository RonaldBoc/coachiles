-- 35_admin_set_diploma_status.sql
-- Adds secure superadmin function to update a single diploma status (approved/rejected) inside profile_activity JSONB
-- Rationale: direct client updates were blocked by RLS (coach can only update own row) so superadmin moderation failed silently.

BEGIN;

-- Safety: only create or replace function; no schema change.
CREATE OR REPLACE FUNCTION public.admin_set_diploma_status(
  p_email text,
  p_coach_id uuid,
  p_diploma_id text,
  p_status text,
  p_note text DEFAULT NULL
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_admin boolean;
  diplomas jsonb;
  updated jsonb;
  found boolean := false;
BEGIN
  -- Validate status
  IF p_status NOT IN ('approved','rejected') THEN
    RAISE EXCEPTION 'invalid status';
  END IF;

  -- Check superadmin
  is_admin := public.is_superadmin(p_email);
  IF NOT is_admin THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  -- Lock row for update to avoid race conditions
  SELECT profile_activity->'diplomas'
    INTO diplomas
  FROM public.coaches
  WHERE id = p_coach_id
  FOR UPDATE;

  IF diplomas IS NULL THEN
    RAISE EXCEPTION 'no diplomas array';
  END IF;

  -- Rebuild diplomas array with updated status
  SELECT jsonb_agg(
    CASE
      WHEN (d->>'id') = p_diploma_id THEN
        (d - 'rejectionNote')
        || jsonb_build_object('status', p_status)
        || CASE WHEN p_status = 'rejected' THEN jsonb_build_object('rejectionNote', coalesce(p_note,'')) ELSE '{}'::jsonb END
      ELSE d
    END
  )
  INTO updated
  FROM jsonb_array_elements(diplomas) AS d;

  -- Detect if target existed
  IF NOT EXISTS (
    SELECT 1 FROM jsonb_array_elements(diplomas) AS d2 WHERE (d2->>'id') = p_diploma_id
  ) THEN
    RAISE EXCEPTION 'diploma not found';
  END IF;

  UPDATE public.coaches
  SET profile_activity = jsonb_set(coalesce(profile_activity,'{}'::jsonb), '{diplomas}', updated),
      updated_at = now()
  WHERE id = p_coach_id;

  RETURN json_build_object('success', true, 'coach_id', p_coach_id, 'diploma_id', p_diploma_id, 'status', p_status);
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_set_diploma_status(text, uuid, text, text, text) TO authenticated;

COMMIT;
