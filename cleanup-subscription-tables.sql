-- COMPREHENSIVE CLEANUP: Remove unnecessary subscription views and columns
-- Run this AFTER applying clean-subscription-architecture.sql and verifying it works

-- 1. SAFE: Drop the unused coaches_with_subscription view
DROP VIEW IF EXISTS coaches_with_subscription;

-- 2. SAFE: Drop old sync trigger and function (replaced by clean architecture)
DROP TRIGGER IF EXISTS trigger_sync_coach_subscription ON subscriptions;
DROP FUNCTION IF EXISTS sync_coach_subscription_type();

-- 3. SAFE: Remove redundant columns from coaches table
-- (Only do this AFTER confirming the app works with coaches_current_subscription view)
ALTER TABLE coaches 
DROP COLUMN IF EXISTS subscription_type,
DROP COLUMN IF EXISTS subscription_expires_at;

-- 4. SAFE: Drop old indexes that are no longer needed
DROP INDEX IF EXISTS idx_coaches_subscription_type;

-- 5. VERIFY: Check that no data is lost
-- This query should return the same data as before, but from the clean architecture
SELECT 
  coach_id,
  email,
  first_name,
  subscription_type,
  max_leads,
  has_active_subscription
FROM coaches_current_subscription
WHERE coach_is_active = true
LIMIT 5;

-- 6. PERFORMANCE: Verify the new view is efficient
EXPLAIN (ANALYZE, BUFFERS) 
SELECT subscription_type, max_leads 
FROM coaches_current_subscription 
WHERE coach_id = (SELECT id FROM coaches LIMIT 1);

-- 7. BACKUP: Create a backup of current subscription states before cleanup
-- (Uncomment if you want a safety backup)
-- CREATE TABLE coaches_subscription_backup AS
-- SELECT id, email, subscription_type, subscription_expires_at
-- FROM coaches;

COMMENT ON VIEW coaches_current_subscription IS 
'Single source of truth for coach subscription status. Replaces coaches.subscription_type column.';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Cleanup completed successfully! The following have been removed:';
  RAISE NOTICE '- coaches_with_subscription view (unused)';
  RAISE NOTICE '- subscription_type column from coaches table';
  RAISE NOTICE '- subscription_expires_at column from coaches table';
  RAISE NOTICE '- Related triggers and indexes';
  RAISE NOTICE '';
  RAISE NOTICE 'coaches_current_subscription view is now the single source of truth.';
END $$;
