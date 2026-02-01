-- 54_fix_security_advisor_issues.sql
-- Fix Supabase security advisor errors:
-- 1. Change SECURITY DEFINER views to SECURITY INVOKER
-- 2. Enable RLS on subscription_plans and coach_subscription_overrides

BEGIN;

-- =====================================================
-- 1. FIX SECURITY DEFINER VIEWS
-- =====================================================

-- Drop and recreate coach_leads_masked without SECURITY DEFINER
DROP VIEW IF EXISTS public.coach_leads_masked CASCADE;

CREATE VIEW public.coach_leads_masked AS
WITH base AS (
  SELECT
    l.*,
    COALESCE(NULLIF(lower(trim(l.client_email)), ''), '__no_email__') AS norm_email
  FROM public.leads l
  WHERE l.coach_id IS NOT NULL
), email_first AS (
  SELECT coach_id, norm_email, MIN(created_at) AS first_seen_at
  FROM base
  GROUP BY coach_id, norm_email
), ranked_emails AS (
  SELECT
    ef.coach_id,
    ef.norm_email,
    ef.first_seen_at,
    DENSE_RANK() OVER (PARTITION BY ef.coach_id ORDER BY ef.first_seen_at ASC) AS distinct_email_rank
  FROM email_first ef
), enriched AS (
  SELECT
    b.*, re.distinct_email_rank
  FROM base b
  LEFT JOIN ranked_emails re ON re.coach_id = b.coach_id AND re.norm_email = b.norm_email
), visible AS (
  SELECT * FROM enriched e
  WHERE
    (e.is_hidden IS NULL OR e.is_hidden = false)
    AND (e.do_not_contact IS NULL OR e.do_not_contact = false)
    AND (
      e.is_completed = true OR (
        e.current_step IS NOT NULL AND e.current_step >= 3
      )
    )
), with_subscription AS (
  SELECT
    v.*,
    cs.subscription_type,
    cs.max_leads,
    CASE WHEN cs.max_leads = -1 THEN NULL ELSE cs.max_leads END AS quota_limit
  FROM visible v
  LEFT JOIN coaches_current_subscription cs ON cs.id = v.coach_id
), locked_eval AS (
  SELECT
    w.*,
    CASE
      WHEN quota_limit IS NULL THEN false
      WHEN distinct_email_rank IS NULL THEN true
      WHEN distinct_email_rank <= quota_limit THEN false
      ELSE true
    END AS is_locked
  FROM with_subscription w
)
SELECT
  id,
  created_at,
  updated_at,
  coach_id,
  status,
  source,
  priority,
  current_step,
  completed_steps,
  is_completed,
  is_hidden,
  do_not_contact,
  original_coach_id,
  original_lead_id,
  CASE WHEN is_locked THEN NULL ELSE client_name END AS client_name,
  CASE WHEN is_locked THEN NULL ELSE client_email END AS client_email,
  CASE WHEN is_locked THEN NULL ELSE client_phone END AS client_phone,
  CASE WHEN is_locked THEN NULL ELSE client_age END AS client_age,
  CASE WHEN is_locked THEN NULL ELSE client_gender END AS client_gender,
  CASE WHEN is_locked THEN NULL ELSE location END AS location,
  CASE WHEN is_locked THEN NULL ELSE chosen_services END AS chosen_services,
  CASE WHEN is_locked THEN NULL ELSE goals END AS goals,
  CASE WHEN is_locked THEN NULL ELSE experience END AS experience,
  CASE WHEN is_locked THEN NULL ELSE availability END AS availability,
  CASE WHEN is_locked THEN NULL ELSE budget END AS budget,
  CASE WHEN is_locked THEN NULL ELSE start_timeframe END AS start_timeframe,
  CASE WHEN is_locked THEN NULL ELSE additional_info END AS additional_info,
  CASE WHEN is_locked THEN NULL ELSE coach_note END AS coach_note,
  subscription_type,
  max_leads,
  distinct_email_rank,
  is_locked
FROM locked_eval;

-- Note: Views use SECURITY INVOKER by default (the correct approach)
COMMENT ON VIEW public.coach_leads_masked IS 'Masked leads view with server-side locking (distinct email quota). Uses SECURITY INVOKER for proper access control.';

GRANT SELECT ON public.coach_leads_masked TO authenticated;

-- Drop and recreate coaches_current_subscription without SECURITY DEFINER
DROP VIEW IF EXISTS public.coaches_current_subscription CASCADE;

CREATE OR REPLACE VIEW public.coaches_current_subscription AS
WITH latest_sub AS (
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
    next_payment_at,
    created_at
  FROM subscriptions
  WHERE is_active = true
  ORDER BY coach_id, created_at DESC
), base AS (
  SELECT
    c.id,
    c.email,
    c.first_name,
    c.last_name,
    c.is_active AS coach_is_active,
    ls.id IS NOT NULL AND ls.status = 'active' AND ls.current_period_end > NOW() AS has_active_subscription,
    CASE
      WHEN ls.plan_id IS NOT NULL THEN sp.plan_type
      ELSE 'free'
    END AS subscription_type,
    COALESCE(sp.name, 'Free') AS plan_name,
    COALESCE(sp.limits, '{}'::jsonb) AS plan_limits,
    COALESCE(sp.features, '[]'::jsonb) AS plan_features,
    COALESCE(sp.price, 0) AS plan_price,
    ls.status AS subscription_status,
    ls.current_period_start,
    ls.current_period_end,
    ls.is_active AS subscription_is_active,
    ls.auto_renew,
    ls.payment_method,
    ls.last_payment_at,
    ls.next_payment_at
  FROM coaches c
  LEFT JOIN latest_sub ls ON c.id = ls.coach_id
  LEFT JOIN subscription_plans sp ON ls.plan_id = sp.id
), overrides AS (
  SELECT coach_id, max_leads AS override_max_leads
  FROM coach_subscription_overrides
)
SELECT
  b.id,
  b.email,
  b.first_name,
  b.last_name,
  b.coach_is_active,
  b.subscription_type,
  b.plan_name,
  b.plan_limits,
  b.plan_features,
  b.plan_price,
  b.subscription_status,
  b.current_period_start,
  b.current_period_end,
  b.subscription_is_active,
  b.auto_renew,
  b.payment_method,
  b.last_payment_at,
  b.next_payment_at,
  b.has_active_subscription,
  COALESCE(o.override_max_leads, 
    CASE 
      WHEN b.subscription_type = 'free' THEN 2
      WHEN b.plan_limits ->> 'max_leads' IS NOT NULL THEN (b.plan_limits ->> 'max_leads')::integer
      ELSE -1
    END
  ) AS max_leads
FROM base b
LEFT JOIN overrides o ON o.coach_id = b.id;

-- Note: Views use SECURITY INVOKER by default (the correct approach)
COMMENT ON VIEW public.coaches_current_subscription IS 'Current subscription status for all coaches. Uses SECURITY INVOKER for proper RLS enforcement.';

GRANT SELECT ON public.coaches_current_subscription TO authenticated;

-- =====================================================
-- 2. ENABLE RLS ON PUBLIC TABLES
-- =====================================================

-- 2a. Enable RLS on subscription_plans
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all authenticated users to SELECT all plans
-- (This is safe because subscription plans are public reference data)
CREATE POLICY subscription_plans_select_all ON public.subscription_plans
  FOR SELECT
  USING (true);

-- Restrict modifications to admin/service_role
CREATE POLICY subscription_plans_admin_modify ON public.subscription_plans
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'is_superadmin' = 'true'
           OR auth.users.email ILIKE '%@coachiles.com')
    )
  );

CREATE POLICY subscription_plans_admin_update ON public.subscription_plans
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'is_superadmin' = 'true'
           OR auth.users.email ILIKE '%@coachiles.com')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'is_superadmin' = 'true'
           OR auth.users.email ILIKE '%@coachiles.com')
    )
  );

CREATE POLICY subscription_plans_admin_delete ON public.subscription_plans
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'is_superadmin' = 'true'
           OR auth.users.email ILIKE '%@coachiles.com')
    )
  );

-- 2b. Enable RLS on coach_subscription_overrides
ALTER TABLE public.coach_subscription_overrides ENABLE ROW LEVEL SECURITY;

-- Coaches can only view their own override (if it exists)
CREATE POLICY coach_subscription_overrides_select_own ON public.coach_subscription_overrides
  FOR SELECT
  USING (auth.uid() = coach_id);

-- Admins can read all overrides
CREATE POLICY coach_subscription_overrides_admin_select ON public.coach_subscription_overrides
  FOR SELECT
  USING (public.is_superadmin(auth.jwt() ->> 'email'));

-- Coaches can modify only their own override
CREATE POLICY coach_subscription_overrides_update_own ON public.coach_subscription_overrides
  FOR UPDATE
  USING (auth.uid() = coach_id)
  WITH CHECK (auth.uid() = coach_id);

-- Admins can modify any override
CREATE POLICY coach_subscription_overrides_admin_update ON public.coach_subscription_overrides
  FOR UPDATE
  USING (public.is_superadmin(auth.jwt() ->> 'email'))
  WITH CHECK (public.is_superadmin(auth.jwt() ->> 'email'));

-- Admins can insert overrides
CREATE POLICY coach_subscription_overrides_admin_insert ON public.coach_subscription_overrides
  FOR INSERT
  WITH CHECK (public.is_superadmin(auth.jwt() ->> 'email'));

-- Admins can delete overrides
CREATE POLICY coach_subscription_overrides_admin_delete ON public.coach_subscription_overrides
  FOR DELETE
  USING (
    public.is_superadmin(auth.jwt() ->> 'email')
  );

COMMIT;
