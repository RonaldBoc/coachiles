-- Sync subscription data from subscriptions table to coaches table
-- This script fixes the data inconsistency issue

-- Option 1: Update all coaches to have correct subscription_type based on subscriptions table
UPDATE coaches 
SET subscription_type = CASE 
  WHEN EXISTS (
    SELECT 1 FROM subscriptions s 
    WHERE s.coach_id = coaches.id 
    AND s.is_active = true 
    AND s.status = 'active'
    AND s.current_period_end > NOW()
  ) THEN (
    SELECT s.plan_type 
    FROM subscriptions s 
    WHERE s.coach_id = coaches.id 
    AND s.is_active = true 
    AND s.status = 'active'
    AND s.current_period_end > NOW()
    ORDER BY s.created_at DESC 
    LIMIT 1
  )
  ELSE 'free'
END,
updated_at = NOW();

-- Option 2: Create a trigger to automatically sync subscription_type when subscriptions change
CREATE OR REPLACE FUNCTION sync_coach_subscription_type()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the coach's subscription_type based on their active subscription
  UPDATE coaches 
  SET 
    subscription_type = CASE 
      WHEN EXISTS (
        SELECT 1 FROM subscriptions s 
        WHERE s.coach_id = NEW.coach_id 
        AND s.is_active = true 
        AND s.status = 'active'
        AND s.current_period_end > NOW()
      ) THEN (
        SELECT s.plan_type 
        FROM subscriptions s 
        WHERE s.coach_id = NEW.coach_id 
        AND s.is_active = true 
        AND s.status = 'active'
        AND s.current_period_end > NOW()
        ORDER BY s.created_at DESC 
        LIMIT 1
      )
      ELSE 'free'
    END,
    updated_at = NOW()
  WHERE id = NEW.coach_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for INSERT/UPDATE on subscriptions
DROP TRIGGER IF EXISTS trigger_sync_coach_subscription ON subscriptions;
CREATE TRIGGER trigger_sync_coach_subscription
  AFTER INSERT OR UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION sync_coach_subscription_type();

-- Option 3: Create a view that always shows the correct subscription info
CREATE OR REPLACE VIEW coaches_with_subscription AS
SELECT 
  c.*,
  CASE 
    WHEN s.id IS NOT NULL AND s.current_period_end > NOW() THEN s.plan_type
    ELSE 'free'
  END as actual_subscription_type,
  s.status as subscription_status,
  s.current_period_end as subscription_period_end,
  s.is_active as subscription_is_active
FROM coaches c
LEFT JOIN (
  SELECT DISTINCT ON (coach_id) 
    coach_id, id, plan_type, status, current_period_end, is_active
  FROM subscriptions 
  WHERE is_active = true AND status = 'active'
  ORDER BY coach_id, created_at DESC
) s ON c.id = s.coach_id;

-- Grant permissions
GRANT SELECT ON coaches_with_subscription TO authenticated;

-- Test the sync with a specific coach (replace coach-id with actual ID)
-- SELECT 
--   c.id,
--   c.first_name,
--   c.subscription_type as current_type,
--   s.plan_type as actual_type,
--   s.status,
--   s.current_period_end
-- FROM coaches c
-- LEFT JOIN subscriptions s ON c.id = s.coach_id AND s.is_active = true AND s.status = 'active'
-- WHERE c.email = 'marine@example.com';
