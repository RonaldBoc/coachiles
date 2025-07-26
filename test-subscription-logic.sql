-- Test subscription checking query
-- Run this to verify the subscription logic works correctly

-- Check current subscription status for all coaches
SELECT 
  c.id,
  c.first_name,
  c.email,
  c.subscription_type as coach_table_type,
  s.plan_type as subscription_table_type,
  s.status as subscription_status,
  s.is_active as subscription_is_active,
  s.current_period_end,
  CASE 
    WHEN s.id IS NOT NULL 
         AND s.is_active = true 
         AND s.status = 'active' 
         AND s.current_period_end > NOW() 
    THEN s.plan_type
    ELSE 'free'
  END as actual_subscription_type
FROM coaches c
LEFT JOIN (
  SELECT DISTINCT ON (coach_id) 
    *
  FROM subscriptions 
  WHERE is_active = true AND status = 'active'
  ORDER BY coach_id, created_at DESC
) s ON c.id = s.coach_id
WHERE c.is_active = true
ORDER BY c.first_name;

-- Check specifically for coaches with mismatched subscription data
SELECT 
  c.first_name,
  c.email,
  c.subscription_type as coach_table_says,
  CASE 
    WHEN s.id IS NOT NULL 
         AND s.is_active = true 
         AND s.status = 'active' 
         AND s.current_period_end > NOW() 
    THEN s.plan_type
    ELSE 'free'
  END as actual_subscription,
  s.current_period_end
FROM coaches c
LEFT JOIN (
  SELECT DISTINCT ON (coach_id) 
    *
  FROM subscriptions 
  WHERE is_active = true AND status = 'active'
  ORDER BY coach_id, created_at DESC
) s ON c.id = s.coach_id
WHERE c.is_active = true
  AND c.subscription_type != CASE 
    WHEN s.id IS NOT NULL 
         AND s.is_active = true 
         AND s.status = 'active' 
         AND s.current_period_end > NOW() 
    THEN s.plan_type
    ELSE 'free'
  END;
