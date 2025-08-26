-- Admin cancel subscription with modes: at_period_end, at_date, immediate
BEGIN;

CREATE OR REPLACE FUNCTION public.admin_cancel_subscription(
  p_email text,
  p_coach_id uuid,
  p_mode text,
  p_end_date timestamptz DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sub_row record;
  updated_sub record;
  result json;
BEGIN
  IF NOT public.is_superadmin(p_email) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  SELECT * INTO sub_row
  FROM public.subscriptions
  WHERE coach_id = p_coach_id AND is_active = true
  ORDER BY created_at DESC
  LIMIT 1;

  IF sub_row.id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'no_active_subscription');
  END IF;

  IF lower(p_mode) = 'at_period_end' THEN
    UPDATE public.subscriptions
      SET auto_renew = false, updated_at = now()
      WHERE id = sub_row.id
      RETURNING * INTO updated_sub;
  ELSIF lower(p_mode) = 'at_date' THEN
    IF p_end_date IS NULL OR p_end_date <= now() THEN
      RAISE EXCEPTION 'invalid_end_date';
    END IF;
    -- Only allow shortening the period (cannot extend beyond already set end date)
    IF sub_row.current_period_end IS NOT NULL AND p_end_date > sub_row.current_period_end THEN
      RAISE EXCEPTION 'end_date_after_current_period_end';
    END IF;
    UPDATE public.subscriptions
      SET current_period_end = p_end_date,
          auto_renew = false,
          next_payment_at = NULL,
          updated_at = now()
      WHERE id = sub_row.id
      RETURNING * INTO updated_sub;
  ELSIF lower(p_mode) = 'immediate' THEN
    UPDATE public.subscriptions
      SET status = 'cancelled',
          is_active = false,
          current_period_end = now(),
          auto_renew = false,
          next_payment_at = NULL,
          updated_at = now()
      WHERE id = sub_row.id
      RETURNING * INTO updated_sub;
  ELSE
    RAISE EXCEPTION 'invalid_mode';
  END IF;

  result := json_build_object(
    'success', true,
    'mode', lower(p_mode),
    'subscription_id', updated_sub.id,
    'current_period_end', updated_sub.current_period_end,
    'auto_renew', updated_sub.auto_renew,
    'status', updated_sub.status
  );
  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_cancel_subscription(text, uuid, text, timestamptz) TO authenticated;

COMMIT;
