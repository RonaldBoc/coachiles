-- Migration 42: Ensure jsonb leads_finalize_public exists (repair)
BEGIN;

-- 1. Create jsonb version (idempotent via CREATE OR REPLACE)
CREATE OR REPLACE FUNCTION public.leads_finalize_public(
  p_lead_id uuid,
  p_preferred_coaching jsonb DEFAULT NULL,
  p_experience text DEFAULT NULL,
  p_goals text DEFAULT NULL,
  p_availability text DEFAULT NULL,
  p_start_timeframe text DEFAULT NULL,
  p_additional_info text DEFAULT NULL,
  p_coach_id uuid DEFAULT NULL
)
RETURNS public.leads
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public AS $$
DECLARE
  v_lead public.leads;
BEGIN
  UPDATE public.leads
  SET
    chosen_services = COALESCE(p_preferred_coaching, chosen_services),
    experience = COALESCE(p_experience, experience),
    goals = COALESCE(p_goals, goals),
    availability = COALESCE(p_availability, availability),
    start_timeframe = COALESCE(p_start_timeframe, start_timeframe),
    additional_info = COALESCE(p_additional_info, additional_info),
    coach_id = COALESCE(p_coach_id, coach_id),
    current_step = 3,
    completed_steps = ARRAY[1,2,3],
    is_completed = true,
    updated_at = timezone('utc'::text, now())
  WHERE id = p_lead_id
  RETURNING * INTO v_lead;

  IF v_lead.id IS NULL THEN
    RAISE EXCEPTION 'Lead not found or not eligible for finalize';
  END IF;

  UPDATE public.leads
  SET lead_score = public.compute_lead_score(p_lead_id),
      updated_at = timezone('utc'::text, now())
  WHERE id = p_lead_id
  RETURNING * INTO v_lead;

  RETURN v_lead;
END;$$;

GRANT EXECUTE ON FUNCTION public.leads_finalize_public(
  uuid, jsonb, text, text, text, text, text, uuid
) TO anon, authenticated;

-- 2. Drop legacy text[] version if still present (safe even if absent)
DROP FUNCTION IF EXISTS public.leads_finalize_public(
  uuid,
  text[],
  text,
  text,
  text,
  text,
  text,
  uuid
);

COMMIT;
