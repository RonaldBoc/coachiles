-- COMPLETE SUBSCRIPTION SYSTEM SETUP
-- Run this in Supabase SQL Editor to ensure everything is properly set up

-- Step 1: Ensure subscription_plans table exists with proper data
CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  plan_type text NOT NULL UNIQUE,
  price decimal(10,2) NOT NULL DEFAULT 0,
  currency text DEFAULT 'EUR',
  billing_interval text DEFAULT 'monthly',
  features jsonb DEFAULT '[]'::jsonb,
  limits jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Step 2: Ensure subscriptions table exists
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id uuid NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES subscription_plans(id),
  status text NOT NULL DEFAULT 'active',
  current_period_start timestamp with time zone DEFAULT now(),
  current_period_end timestamp with time zone,
  price decimal(10,2) NOT NULL,
  features text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  auto_renew boolean DEFAULT true,
  payment_method text,
  last_payment_at timestamp with time zone,
  next_payment_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Step 3: Insert the €9 premium plan if it doesn't exist
INSERT INTO subscription_plans (name, plan_type, price, features, limits)
VALUES (
  'Premium Coach',
  'premium', 
  9.00,
  '["Unlimited leads", "Priority support", "Advanced analytics", "Custom branding"]'::jsonb,
  '{"max_leads": -1, "priority_support": true, "analytics": true}'::jsonb
)
ON CONFLICT (plan_type) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  features = EXCLUDED.features,
  limits = EXCLUDED.limits,
  updated_at = now();

-- Step 4: Create/Recreate the coaches_current_subscription view
CREATE OR REPLACE VIEW coaches_current_subscription AS
SELECT 
  c.id,
  c.email,
  c.first_name,
  c.last_name,
  c.is_active AS coach_is_active,
  
  -- Get plan info from subscription_plans via plan_id
  COALESCE(sp.plan_type, 'free') AS subscription_type,
  COALESCE(sp.name, 'Free') AS plan_name,
  sp.limits AS plan_limits,
  sp.features AS plan_features,
  sp.price AS plan_price,
  
  -- Subscription status
  s.status AS subscription_status,
  s.current_period_start,
  s.current_period_end,
  s.is_active AS subscription_is_active,
  s.auto_renew,
  s.payment_method,
  s.last_payment_at,
  s.next_payment_at,
  
  -- Computed fields
  CASE
    WHEN s.id IS NOT NULL 
     AND s.is_active = true 
     AND s.status = 'active' 
     AND s.current_period_end > now() 
    THEN true
    ELSE false
  END AS has_active_subscription,
  
  CASE
    WHEN s.id IS NOT NULL 
     AND s.is_active = true 
     AND s.status = 'active' 
     AND s.current_period_end > now() 
    THEN COALESCE((sp.limits ->> 'max_leads')::integer, -1)
    ELSE 2
  END AS max_leads

FROM coaches c
LEFT JOIN (
  -- Get most recent active subscription per coach
  SELECT DISTINCT ON (coach_id) 
    coach_id,
    id,
    plan_id,
    status,
    current_period_start,
    current_period_end,
    is_active,
    auto_renew,
    payment_method,
    last_payment_at,
    next_payment_at
  FROM subscriptions 
  WHERE is_active = true
  ORDER BY coach_id, created_at DESC
) s ON c.id = s.coach_id
LEFT JOIN subscription_plans sp ON s.plan_id = sp.id;

-- Step 5: Grant permissions
GRANT SELECT ON coaches_current_subscription TO authenticated;
GRANT ALL ON subscription_plans TO authenticated;
GRANT ALL ON subscriptions TO authenticated;

-- Step 6: Create the RPC functions (same as before)
CREATE OR REPLACE FUNCTION create_coach_subscription(
  coach_id_param uuid,
  plan_type_param text DEFAULT 'premium'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
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
    result := json_build_object(
      'success', false,
      'error', SQLERRM,
      'error_code', SQLSTATE
    );
    RETURN result;
END;
$$;

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
  UPDATE subscriptions 
  SET 
    status = 'cancelled',
    is_active = false,
    updated_at = NOW()
  WHERE coach_id = coach_id_param 
    AND is_active = true
    AND status = 'active';
  
  GET DIAGNOSTICS cancelled_count = ROW_COUNT;

  RETURN json_build_object(
    'success', true,
    'cancelled_subscriptions', cancelled_count,
    'coach_id', coach_id_param
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'error_code', SQLSTATE
    );
END;
$$;

-- Step 7: Grant RPC permissions
GRANT EXECUTE ON FUNCTION create_coach_subscription(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION cancel_coach_subscription(uuid) TO authenticated;

-- Step 8: Test everything
SELECT 'Setup completed successfully! Testing view...' as status;
SELECT count(*) as coach_count FROM coaches_current_subscription;
SELECT 'Functions created successfully!' as function_status;
