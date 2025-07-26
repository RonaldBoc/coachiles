-- Fix the coaches_current_subscription view column issue
-- The view exists but has wrong column names

-- Drop and recreate the view with correct column names
DROP VIEW IF EXISTS coaches_current_subscription;

CREATE VIEW coaches_current_subscription AS
SELECT 
  c.id AS id,  -- This should be the coach ID
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

-- Grant permissions
GRANT SELECT ON coaches_current_subscription TO authenticated;

-- Test the fix
SELECT 'View fixed! Testing...' as status;
SELECT id, subscription_type, has_active_subscription 
FROM coaches_current_subscription 
LIMIT 1;
