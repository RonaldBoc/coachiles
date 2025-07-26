-- Diagnostic script to check subscription system status
-- Run this in Supabase SQL Editor to see what's missing

-- 1. Check if tables exist
SELECT 'subscription_plans table' as check_name, 
       EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'subscription_plans') as exists;

SELECT 'subscriptions table' as check_name, 
       EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'subscriptions') as exists;

-- 2. Check if view exists
SELECT 'coaches_current_subscription view' as check_name, 
       EXISTS(SELECT 1 FROM information_schema.views WHERE table_name = 'coaches_current_subscription') as exists;

-- 3. Check subscription_plans data
SELECT 'subscription_plans data' as check_name, count(*) as count FROM subscription_plans;

-- 4. Check subscriptions data  
SELECT 'subscriptions data' as check_name, count(*) as count FROM subscriptions;

-- 5. Try to query the view (this might fail and show the error)
SELECT 'coaches_current_subscription query test' as check_name;
SELECT id, subscription_type, has_active_subscription 
FROM coaches_current_subscription 
LIMIT 1;

-- 6. Check if RPC functions exist
SELECT 'create_coach_subscription function' as check_name,
       EXISTS(SELECT 1 FROM information_schema.routines WHERE routine_name = 'create_coach_subscription') as exists;

SELECT 'cancel_coach_subscription function' as check_name,
       EXISTS(SELECT 1 FROM information_schema.routines WHERE routine_name = 'cancel_coach_subscription') as exists;
