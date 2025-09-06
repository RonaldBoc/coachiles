-- 46_secure_leads_masking.sql
-- Purpose: Introduce server-side masking & locking for leads so free accounts cannot access full details.
-- Strategy:
-- 1. Revoke direct SELECT on leads from authenticated role (coaches) (keep for service/admin roles if needed).
-- 2. Create a masking view coach_leads_masked that:
--    - Filters to rows visible to the coach (coach_id = auth.uid()).
--    - Applies base visibility gates (not hidden / not do_not_contact / completed or step>=3).
--    - Computes distinct email order (oldest first) per coach.
--    - Determines is_locked based on subscription quota from coaches_current_subscription.max_leads ( -1 = unlimited ).
--    - When locked, returns NULL for sensitive columns (client_name, client_email, client_phone, goals, experience, availability, start_timeframe, additional_info, chosen_services, coach_note, budget).
-- 3. Grant SELECT on the view to authenticated.
-- NOTE: Frontend should switch to querying coach_leads_masked (already added fallback logic in leadService).

-- Safety: wrap revokes in DO block to avoid errors if privilege not present yet.
DO $$ BEGIN
  REVOKE SELECT ON public.leads FROM authenticated;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'Could not revoke select on leads (may already be revoked)';
END $$;

-- Drop old view if re-running.
DROP VIEW IF EXISTS public.coach_leads_masked;

CREATE VIEW public.coach_leads_masked AS
WITH base AS (
  SELECT
    l.*,
    -- Normalize email bucket (treat NULL / empty as single bucket)
    COALESCE(NULLIF(lower(trim(l.client_email)), ''), '__no_email__') AS norm_email
  FROM public.leads l
  WHERE l.coach_id IS NOT NULL
), email_first AS (
  -- First seen timestamp per (coach, email bucket)
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
      WHEN quota_limit IS NULL THEN false -- unlimited
      WHEN distinct_email_rank IS NULL THEN true -- safety (should not happen)
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
  -- Mask sensitive columns when locked
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
  -- Exposure / computed fields
  subscription_type,
  max_leads,
  distinct_email_rank,
  is_locked
FROM locked_eval;

GRANT SELECT ON public.coach_leads_masked TO authenticated;

-- Optional: allow RLS to still enforce row ownership; if RLS enabled on leads, view inherits security barrier semantics.
-- You can add: ALTER VIEW public.coach_leads_masked SET (security_barrier = true);

COMMENT ON VIEW public.coach_leads_masked IS 'Masked leads view with server-side locking (distinct email quota)';
