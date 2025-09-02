-- Migration 41: Remove legacy leads_finalize_public overload (text[] version) to fix PostgREST ambiguity
BEGIN;

-- Drop old function signature that used text[] so only jsonb version remains
DROP FUNCTION IF EXISTS public.leads_finalize_public(
  uuid,            -- p_lead_id
  text[],          -- p_preferred_coaching (legacy text[])
  text,            -- p_experience
  text,            -- p_goals
  text,            -- p_availability
  text,            -- p_start_timeframe
  text,            -- p_additional_info
  uuid             -- p_coach_id
);

-- (Jsonb version retained)
-- Optional sanity check: raise notice if jsonb version missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'leads_finalize_public'
      AND pg_get_function_identity_arguments(p.oid) LIKE 'uuid, jsonb%'
  ) THEN
    RAISE EXCEPTION 'Expected jsonb leads_finalize_public function not found';
  END IF;
END$$;

COMMIT;
