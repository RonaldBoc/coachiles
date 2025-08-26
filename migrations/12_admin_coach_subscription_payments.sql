-- Admin RPCs for coach subscription management and payments overview
-- Provides:
--  - admin_get_coach_details(p_email, p_coach_id)
--  - admin_set_coach_subscription(p_email, p_coach_id, p_plan_type, p_period_end, p_period_start)
--  - admin_list_payments_for_coach(p_email, p_coach_id)

BEGIN;

-- Ensure helper exists and is executable
GRANT EXECUTE ON FUNCTION public.is_superadmin(text) TO authenticated;

-- 1) Get coach details (coach + subscription summary + recent payments)
CREATE OR REPLACE FUNCTION public.admin_get_coach_details(
  p_email text,
  p_coach_id uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  coach_row record;
  sub_row record;
  payments_json json;
  result json;
BEGIN
  IF NOT public.is_superadmin(p_email) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  -- Coach basic
  SELECT c.* INTO coach_row FROM public.coaches c WHERE c.id = p_coach_id;
  -- Current subscription summary from the view
  SELECT v.* INTO sub_row FROM public.coaches_current_subscription v WHERE v.id = p_coach_id;

  -- Recent payments (last 50) using subquery to allow ORDER BY + LIMIT
  SELECT coalesce(json_agg(json_build_object(
    'id', t.id,
    'created_at', t.created_at,
    'amount', t.amount,
    'currency', t.currency,
    'status', t.status,
    'payment_type', t.payment_type,
    'transaction_id', t.transaction_id,
    'description', t.description,
    'coach_earnings', t.coach_earnings
  ) ORDER BY t.created_at DESC), '[]'::json)
  INTO payments_json
  FROM (
    SELECT p.id, p.created_at, p.amount, p.currency, p.status, p.payment_type,
           p.transaction_id, p.description, p.coach_earnings
    FROM public.payments p
    WHERE p.coach_id = p_coach_id
    ORDER BY p.created_at DESC
    LIMIT 50
  ) t;

  result := json_build_object(
    'coach', CASE WHEN coach_row IS NULL THEN NULL ELSE to_json(coach_row) END,
    'subscription', CASE WHEN sub_row IS NULL THEN NULL ELSE to_json(sub_row) END,
    'payments', payments_json
  );

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_get_coach_details(text, uuid) TO authenticated;

-- 2) Set coach subscription (free/premium) with optional period
-- If plan_type = 'free': cancel active subscriptions
-- If 'premium': create a new premium subscription and set period end
CREATE OR REPLACE FUNCTION public.admin_set_coach_subscription(
  p_email text,
  p_coach_id uuid,
  p_plan_type text,
  p_period_end timestamptz DEFAULT NULL,
  p_period_start timestamptz DEFAULT now()
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_plan record;
  new_sub record;
  result json;
BEGIN
  IF NOT public.is_superadmin(p_email) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  IF p_plan_type = 'free' THEN
    UPDATE public.subscriptions
    SET status = 'cancelled', is_active = false, updated_at = now()
    WHERE coach_id = p_coach_id AND is_active = true;

    RETURN json_build_object('success', true, 'action', 'cancelled', 'coach_id', p_coach_id);
  END IF;

  -- Find the plan in subscription_plans
  SELECT * INTO target_plan FROM public.subscription_plans sp
  WHERE sp.plan_type = p_plan_type AND sp.is_active = true;

  IF target_plan.id IS NULL THEN
    RAISE EXCEPTION 'plan_not_found';
  END IF;

  -- Cancel any existing active subs
  UPDATE public.subscriptions
  SET status = 'cancelled', is_active = false, updated_at = now()
  WHERE coach_id = p_coach_id AND is_active = true;

  -- Create new subscription
  INSERT INTO public.subscriptions (
    coach_id, plan_id, status, current_period_start, current_period_end,
    price, features, is_active, auto_renew, next_payment_at
  ) VALUES (
    p_coach_id,
    target_plan.id,
    'active',
    coalesce(p_period_start, now()),
    coalesce(p_period_end, now() + interval '30 days'),
    target_plan.price,
    CASE 
      WHEN jsonb_typeof(target_plan.features) = 'array' THEN array(SELECT jsonb_array_elements_text(target_plan.features))
      ELSE '{}'::text[]
    END,
    true,
    true,
    coalesce(p_period_end, now() + interval '30 days')
  ) RETURNING * INTO new_sub;

  result := json_build_object(
    'success', true,
    'action', 'created',
    'subscription_id', new_sub.id,
    'plan_type', p_plan_type,
    'current_period_end', new_sub.current_period_end
  );
  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_set_coach_subscription(text, uuid, text, timestamptz, timestamptz) TO authenticated;

-- 3) List payments for a coach (detailed)
CREATE OR REPLACE FUNCTION public.admin_list_payments_for_coach(
  p_email text,
  p_coach_id uuid
)
RETURNS TABLE (
  id uuid,
  created_at timestamptz,
  amount numeric,
  currency text,
  status text,
  payment_type text,
  transaction_id text,
  description text,
  coach_earnings numeric
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
  SELECT p.id, p.created_at, p.amount, p.currency, p.status, p.payment_type,
         p.transaction_id, p.description, p.coach_earnings
  FROM public.payments p
  WHERE p.coach_id = p_coach_id
  ORDER BY p.created_at DESC
  LIMIT 200;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_list_payments_for_coach(text, uuid) TO authenticated;

COMMIT;
