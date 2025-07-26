-- Complete Subscription Architecture Migration
-- Remove redundant plan_type field and ensure all data uses plan_id foreign key

BEGIN;

-- 1. FIRST: Ensure all subscriptions have plan_id populated
-- Update any subscriptions that have plan_type but no plan_id
UPDATE subscriptions 
SET plan_id = (
  SELECT id 
  FROM subscription_plans 
  WHERE plan_type = subscriptions.plan_type
)
WHERE plan_id IS NULL 
  AND plan_type IS NOT NULL;

-- 2. Handle any subscriptions without valid plan_type (set to free)
UPDATE subscriptions 
SET plan_id = (
  SELECT id 
  FROM subscription_plans 
  WHERE plan_type = 'free'
)
WHERE plan_id IS NULL;

-- 3. Make plan_id NOT NULL (since every subscription must have a plan)
ALTER TABLE subscriptions 
ALTER COLUMN plan_id SET NOT NULL;

-- 4. Remove the redundant plan_type column
ALTER TABLE subscriptions 
DROP COLUMN plan_type CASCADE;

-- 5. Update the coaches_current_subscription view to use plan_id only
CREATE OR REPLACE VIEW coaches_current_subscription AS
SELECT 
  c.id AS coach_id,
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
  ORDER BY coach_id, created_at DESC
) s ON c.id = s.coach_id 
LEFT JOIN subscription_plans sp ON s.plan_id = sp.id;

-- 6. Add helpful indexes for the new structure
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id 
  ON subscriptions(plan_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_coach_status 
  ON subscriptions(coach_id, status, is_active, current_period_end);

-- 7. Verify the migration
SELECT 
  'Migration Complete' as status,
  COUNT(*) as total_subscriptions,
  COUNT(CASE WHEN plan_id IS NOT NULL THEN 1 END) as subscriptions_with_plan_id,
  COUNT(DISTINCT plan_id) as unique_plans_in_use
FROM subscriptions;

-- 8. Show current subscription distribution
SELECT 
  sp.name as plan_name,
  sp.plan_type,
  sp.price,
  COUNT(s.id) as active_subscriptions
FROM subscription_plans sp
LEFT JOIN subscriptions s ON sp.id = s.plan_id AND s.is_active = true
GROUP BY sp.id, sp.name, sp.plan_type, sp.price
ORDER BY sp.price;

COMMIT;

-- Log success
DO $$
BEGIN
    RAISE NOTICE '✅ Subscription architecture migration completed successfully!';
    RAISE NOTICE '- Removed redundant plan_type column from subscriptions table';
    RAISE NOTICE '- All subscriptions now use plan_id foreign key';
    RAISE NOTICE '- Updated coaches_current_subscription view';
    RAISE NOTICE '- Added optimized indexes';
    RAISE NOTICE '🎉 Database now follows proper normalization principles!';
END $$;
