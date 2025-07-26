-- Update subscription plans to new single €9/month plan
-- This aligns with the user's request for a single affordable plan
-- IMPORTANT: Run complete-subscription-migration.sql FIRST to clean up the schema

-- First, update the existing premium plan to €9/month
UPDATE subscription_plans 
SET 
  price = 9.00,
  name = 'Coachiles Pro',
  updated_at = NOW()
WHERE plan_type = 'premium';

-- Remove enterprise plan as we're going with single plan approach
DELETE FROM subscription_plans WHERE plan_type = 'enterprise';

-- Update free plan features to be more restrictive to encourage upgrade
UPDATE subscription_plans 
SET 
  name = 'Plan Gratuit',
  features = '{"lead_access": false, "priority_support": false, "verified_badge": false}',
  limits = '{"max_leads": 2, "max_services": 1}',
  updated_at = NOW()
WHERE plan_type = 'free';

-- Update premium plan with modern features for €9/month
UPDATE subscription_plans 
SET 
  features = '{"lead_access": true, "priority_support": true, "analytics": true, "verified_badge": true, "unlimited_services": true, "marketing_tools": true, "data_export": true, "max_visibility": true}',
  limits = '{"max_leads": -1, "max_services": -1}',
  updated_at = NOW()
WHERE plan_type = 'premium';

-- Verify the changes
SELECT plan_type, name, price, features, limits 
FROM subscription_plans 
ORDER BY price;

-- Log the changes
DO $$
BEGIN
    RAISE NOTICE 'Updated subscription plans to single €9/month model:';
    RAISE NOTICE '- Free plan: Limited to 2 leads, 1 service';
    RAISE NOTICE '- Premium plan: €9/month with unlimited access';
    RAISE NOTICE '- Removed enterprise plan for simplicity';
END $$;
