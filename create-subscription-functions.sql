-- Create a secure function for subscription management
-- This bypasses RLS by running with elevated permissions

CREATE OR REPLACE FUNCTION create_coach_subscription(
  coach_id_param uuid,
  plan_type_param text DEFAULT 'premium'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER -- This runs with the permissions of the function owner
AS $$
DECLARE
  target_plan subscription_plans%ROWTYPE;
  new_subscription subscriptions%ROWTYPE;
  result json;
BEGIN
  -- Validate coach exists
  IF NOT EXISTS (SELECT 1 FROM coaches WHERE id = coach_id_param) THEN
    RAISE EXCEPTION 'Coach not found: %', coach_id_param;
  END IF;

  -- Get the target plan
  SELECT * INTO target_plan 
  FROM subscription_plans 
  WHERE plan_type = plan_type_param AND is_active = true;
  
  IF target_plan.id IS NULL THEN
    RAISE EXCEPTION 'Plan not found: %', plan_type_param;
  END IF;

  -- Cancel any existing active subscriptions for this coach
  UPDATE subscriptions 
  SET 
    status = 'cancelled',
    is_active = false,
    updated_at = NOW()
  WHERE coach_id = coach_id_param 
    AND is_active = true;

  -- Create new subscription
  INSERT INTO subscriptions (
    coach_id,
    plan_id,
    status,
    current_period_start,
    current_period_end,
    price,
    features,
    is_active,
    auto_renew,
    next_payment_at
  ) VALUES (
    coach_id_param,
    target_plan.id,
    'active',
    NOW(),
    NOW() + INTERVAL '30 days',
    target_plan.price,
    CASE 
      WHEN jsonb_typeof(target_plan.features) = 'array' 
      THEN array(SELECT jsonb_array_elements_text(target_plan.features))
      ELSE '{}'::text[]
    END,
    true,
    true,
    NOW() + INTERVAL '30 days'
  ) RETURNING * INTO new_subscription;

  -- Return success result
  result := json_build_object(
    'success', true,
    'subscription_id', new_subscription.id,
    'plan_name', target_plan.name,
    'plan_type', target_plan.plan_type,
    'price', target_plan.price,
    'status', new_subscription.status,
    'current_period_end', new_subscription.current_period_end
  );

  RETURN result;

EXCEPTION
  WHEN OTHERS THEN
    -- Return error result
    result := json_build_object(
      'success', false,
      'error', SQLERRM,
      'error_code', SQLSTATE
    );
    RETURN result;
END;
$$;

-- Create function to cancel subscription
CREATE OR REPLACE FUNCTION cancel_coach_subscription(
  coach_id_param uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cancelled_count integer;
  result json;
BEGIN
  -- Cancel all active subscriptions for this coach
  UPDATE subscriptions 
  SET 
    status = 'cancelled',
    is_active = false,
    updated_at = NOW()
  WHERE coach_id = coach_id_param 
    AND is_active = true
    AND status = 'active';
  
  GET DIAGNOSTICS cancelled_count = ROW_COUNT;

  -- Return result
  result := json_build_object(
    'success', true,
    'cancelled_subscriptions', cancelled_count,
    'coach_id', coach_id_param
  );

  RETURN result;

EXCEPTION
  WHEN OTHERS THEN
    result := json_build_object(
      'success', false,
      'error', SQLERRM,
      'error_code', SQLSTATE
    );
    RETURN result;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION create_coach_subscription(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION cancel_coach_subscription(uuid) TO authenticated;

-- Test the functions
SELECT 'Functions created successfully' as status;
