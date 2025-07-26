-- Test the new clean subscription architecture
-- Run this after applying clean-subscription-architecture.sql

-- 1. Test the coaches_current_subscription view
SELECT 
  coach_id,
  email,
  first_name,
  subscription_type,
  plan_name,
  max_leads,
  has_active_subscription,
  subscription_status,
  current_period_end
FROM coaches_current_subscription
WHERE email = 'marine@example.com' -- Replace with actual email
OR first_name ILIKE '%marine%'
LIMIT 5;

-- 2. Test subscription plans
SELECT * FROM subscription_plans ORDER BY price;

-- 3. Verify data consistency 
SELECT 
  COUNT(*) as total_coaches,
  COUNT(CASE WHEN subscription_type = 'free' THEN 1 END) as free_coaches,
  COUNT(CASE WHEN subscription_type = 'premium' THEN 1 END) as premium_coaches,
  COUNT(CASE WHEN has_active_subscription = true THEN 1 END) as active_subscriptions
FROM coaches_current_subscription
WHERE coach_is_active = true;

-- 4. Check for any missing plan_id references in subscriptions
SELECT 
  COUNT(*) as subscriptions_without_plan_id
FROM subscriptions 
WHERE plan_id IS NULL AND is_active = true;

-- 5. Performance test - this should be fast
EXPLAIN (ANALYZE, BUFFERS) 
SELECT subscription_type, max_leads 
FROM coaches_current_subscription 
WHERE coach_id = 'test-coach-id'; -- Replace with actual coach ID
