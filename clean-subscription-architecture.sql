-- Clean Subscription Architecture for Coachiles
-- Based on industry best practices from Stripe, Shopify, etc.

-- 1. FIRST: Drop dependent views before removing columns
DROP VIEW IF EXISTS coaches_with_subscription;

-- 2. ENHANCED: Make subscriptions table the single source of truth
-- (Keep existing subscriptions table as-is, it's well designed)

-- 3. CREATE: Subscription plans table (like Stripe's products/prices)
CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  
  -- Plan details
  name text NOT NULL, -- 'Free', 'Pro', 'Enterprise'
  plan_type text NOT NULL, -- 'free', 'premium', 'enterprise'
  price numeric(10, 2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'EUR',
  billing_interval text NOT NULL DEFAULT 'month', -- 'month', 'year'
  
  -- Features (JSON for flexibility)
  features jsonb NOT NULL DEFAULT '{}',
  limits jsonb NOT NULL DEFAULT '{}', -- max_leads, max_services, etc.
  
  -- Status
  is_active boolean NOT NULL DEFAULT true,
  is_public boolean NOT NULL DEFAULT true, -- Can users see/subscribe to this plan?
  
  CONSTRAINT subscription_plans_pkey PRIMARY KEY (id),
  CONSTRAINT subscription_plans_plan_type_unique UNIQUE (plan_type),
  CONSTRAINT subscription_plans_billing_interval_check 
    CHECK (billing_interval = ANY (ARRAY['month'::text, 'year'::text]))
);

-- Insert default plans
INSERT INTO subscription_plans (name, plan_type, price, features, limits) VALUES
('Free', 'free', 0, 
 '{"lead_access": false, "priority_support": false}',
 '{"max_leads": 2, "max_services": 3}'
),
('Premium', 'premium', 29.99,
 '{"lead_access": true, "priority_support": true, "analytics": true}',
 '{"max_leads": -1, "max_services": -1}'
),
('Enterprise', 'enterprise', 99.99,
 '{"lead_access": true, "priority_support": true, "analytics": true, "white_label": true}',
 '{"max_leads": -1, "max_services": -1, "api_access": true}'
);

-- 4. UPDATE: Add plan reference to subscriptions table
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS plan_id uuid REFERENCES subscription_plans(id);

-- Migrate existing data
UPDATE subscriptions 
SET plan_id = (
  SELECT id FROM subscription_plans 
  WHERE plan_type = subscriptions.plan_type
);

-- 5. CREATE: Efficient view for coach subscription status
CREATE OR REPLACE VIEW coaches_current_subscription AS
SELECT 
  c.id as coach_id,
  c.email,
  c.first_name,
  c.last_name,
  c.is_active as coach_is_active,
  
  -- Subscription info
  COALESCE(sp.plan_type, 'free') as subscription_type,
  COALESCE(sp.name, 'Free') as plan_name,
  sp.limits as plan_limits,
  sp.features as plan_features,
  
  -- Subscription status
  s.status as subscription_status,
  s.current_period_end,
  s.is_active as subscription_is_active,
  
  -- Computed status
  CASE 
    WHEN s.id IS NOT NULL 
         AND s.is_active = true 
         AND s.status = 'active' 
         AND s.current_period_end > NOW() 
    THEN true
    ELSE false
  END as has_active_subscription,
  
  -- Lead limits
  CASE 
    WHEN s.id IS NOT NULL 
         AND s.is_active = true 
         AND s.status = 'active' 
         AND s.current_period_end > NOW() 
    THEN COALESCE((sp.limits->>'max_leads')::int, -1)
    ELSE 2  -- Free tier limit
  END as max_leads
  
FROM coaches c
LEFT JOIN (
  -- Get most recent active subscription per coach
  SELECT DISTINCT ON (coach_id) 
    coach_id, id, plan_type, status, current_period_end, is_active, plan_id
  FROM subscriptions 
  ORDER BY coach_id, created_at DESC
) s ON c.id = s.coach_id AND s.is_active = true AND s.status = 'active'
LEFT JOIN subscription_plans sp ON s.plan_id = sp.id;

-- Grant permissions
GRANT SELECT ON coaches_current_subscription TO authenticated;
GRANT SELECT ON subscription_plans TO authenticated;

-- 6. CLEAN UP: Now safely remove redundant subscription columns from coaches table
ALTER TABLE coaches 
DROP COLUMN IF EXISTS subscription_type,
DROP COLUMN IF EXISTS subscription_expires_at;

-- 7. CREATE: Indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_coach_plan 
  ON subscriptions(coach_id, plan_id, is_active, status);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_type 
  ON subscription_plans(plan_type, is_active);
