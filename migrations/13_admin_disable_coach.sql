-- Admin: disable/enable coach accounts safely
-- Adds columns and RPC to toggle coach is_active with optional reason

BEGIN;

-- Add optional columns to track disable reason and time
ALTER TABLE public.coaches
  ADD COLUMN IF NOT EXISTS disabled_reason text,
  ADD COLUMN IF NOT EXISTS disabled_at timestamptz;

-- Secure function to set active flag
CREATE OR REPLACE FUNCTION public.admin_set_coach_active(
  p_email text,
  p_coach_id uuid,
  p_active boolean,
  p_reason text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  IF NOT public.is_superadmin(p_email) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  IF p_active IS TRUE THEN
    UPDATE public.coaches
      SET is_active = TRUE,
          disabled_reason = NULL,
          disabled_at = NULL,
          updated_at = now()
    WHERE id = p_coach_id;
  ELSE
    UPDATE public.coaches
      SET is_active = FALSE,
          disabled_reason = p_reason,
          disabled_at = now(),
          updated_at = now()
    WHERE id = p_coach_id;
  END IF;

  result := json_build_object('success', true, 'coach_id', p_coach_id, 'active', p_active);
  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_set_coach_active(text, uuid, boolean, text) TO authenticated;

COMMIT;
