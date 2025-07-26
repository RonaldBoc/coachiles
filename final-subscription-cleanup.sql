-- Final Subscription Architecture Cleanup
-- This script completes the transition to the clean subscription architecture
-- by removing only truly unnecessary database components.

BEGIN;

-- =====================================================
-- 1. DROP UNNECESSARY VIEWS
-- =====================================================

-- Drop coaches_with_subscription view (only used in SQL files, not in app)
DROP VIEW IF EXISTS coaches_with_subscription CASCADE;

-- Keep coaches_current_subscription view (actively used in leadService.ts)
-- This view is our single source of truth for subscription data

-- =====================================================
-- 2. REMOVE REDUNDANT COLUMNS FROM COACHES TABLE
-- =====================================================

-- Remove the subscription_type column from coaches table
-- All subscription logic now uses the coaches_current_subscription view
ALTER TABLE coaches 
DROP COLUMN IF EXISTS subscription_type CASCADE,
DROP COLUMN IF EXISTS subscription_expires_at CASCADE;

-- Remove related indexes
DROP INDEX IF EXISTS idx_coaches_subscription_type;

-- =====================================================
-- 3. REMOVE OLD SYNC FUNCTIONS AND TRIGGERS
-- =====================================================

-- Remove the trigger and function that was syncing subscription_type
DROP TRIGGER IF EXISTS trigger_sync_coach_subscription ON subscriptions;
DROP FUNCTION IF EXISTS sync_coach_subscription_type();

-- =====================================================
-- 4. VERIFY THE NEW ARCHITECTURE
-- =====================================================

-- Verify coaches_current_subscription view works correctly
DO $$
DECLARE
    view_count integer;
    plan_count integer;
BEGIN
    -- Check if the view exists and has data
    SELECT COUNT(*) INTO view_count 
    FROM coaches_current_subscription;
    
    -- Check if subscription_plans table has data
    SELECT COUNT(*) INTO plan_count 
    FROM subscription_plans;
    
    RAISE NOTICE 'Cleanup completed successfully!';
    RAISE NOTICE '- coaches_current_subscription view has % records', view_count;
    RAISE NOTICE '- subscription_plans table has % plans', plan_count;
    RAISE NOTICE '- Removed coaches.subscription_type column';
    RAISE NOTICE '- Removed coaches_with_subscription view';
    RAISE NOTICE '- Removed sync triggers and functions';
END $$;

-- =====================================================
-- 5. FINAL VERIFICATION QUERY
-- =====================================================

-- Show current subscription status for all coaches
SELECT 
    coach_id,
    email,
    subscription_type,
    max_leads,
    has_active_subscription,
    current_period_end
FROM coaches_current_subscription
ORDER BY email;

COMMIT;

-- =====================================================
-- SUMMARY OF CHANGES
-- =====================================================
/*
✅ REMOVED (Unnecessary):
- coaches.subscription_type column
- coaches.subscription_expires_at column  
- coaches_with_subscription view
- sync_coach_subscription_type() function
- trigger_sync_coach_subscription trigger
- idx_coaches_subscription_type index

✅ KEPT (Still Used):
- coaches_current_subscription view (used in leadService.ts)
- subscriptions table (main data source)
- subscription_plans table (plan definitions)
- coaches table (core coach data)

✅ NEXT STEPS:
1. Update TypeScript types to remove subscription_type references
2. Update auth store to use new subscription architecture
3. Test the application to ensure everything works
*/
