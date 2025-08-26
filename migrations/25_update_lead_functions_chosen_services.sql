-- Migration 25: Update lead public flow functions to use chosen_services instead of preferred_coaching
-- Keeps the original function signatures (parameter p_preferred_coaching) for backward compatibility
-- after column rename performed in migration 24.

BEGIN;

-- Update finalize function: write to chosen_services column
CREATE OR REPLACE FUNCTION public.leads_finalize_public(
  p_lead_id uuid,
  p_preferred_coaching text[] DEFAULT NULL, -- legacy param name
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
  uuid, text[], text, text, text, text, text, uuid
) TO anon, authenticated;

-- Update scoring function to use chosen_services column
CREATE OR REPLACE FUNCTION public.compute_lead_score(p_lead_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public AS $$
DECLARE
  v_lead public.leads%ROWTYPE;
  v_score int := 0;
  v_same_city boolean := false;
  v_service_matches int := 0;
BEGIN
  SELECT * INTO v_lead FROM public.leads WHERE id = p_lead_id;
  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  IF COALESCE(v_lead.do_not_contact, false) THEN
    RETURN 0;
  END IF;

  IF COALESCE(trim(v_lead.client_phone), '') <> '' THEN
    v_score := v_score + 20;
  END IF;

  IF v_lead.coach_id IS NOT NULL AND COALESCE(v_lead.location, '') <> '' THEN
    SELECT EXISTS (
      SELECT 1 FROM public.coaches c
      WHERE c.id = v_lead.coach_id
        AND COALESCE(c.locations, '{}') @> ARRAY[v_lead.location]::text[]
    ) INTO v_same_city;
    IF v_same_city THEN
      v_score := v_score + 25;
    END IF;
  END IF;

  IF v_lead.coach_id IS NOT NULL AND COALESCE(array_length(v_lead.chosen_services, 1), 0) > 0 THEN
    SELECT COUNT(*) INTO v_service_matches
    FROM public.coach_services s
    WHERE s.coach_id = v_lead.coach_id
      AND s.is_active = true
      AND s.title = ANY (COALESCE(v_lead.chosen_services, '{}'));
    IF v_service_matches > 0 THEN
      v_score := v_score + LEAST(30, v_service_matches * 10);
    END IF;
  END IF;

  IF v_lead.start_timeframe IS NOT NULL THEN
    v_score := v_score + CASE v_lead.start_timeframe
      WHEN 'Immédiatement' THEN 25
      WHEN 'Dans les prochains jours' THEN 15
      WHEN 'Dans les prochains mois' THEN 5
      ELSE 0
    END;
  END IF;

  IF v_lead.experience IS NOT NULL THEN
    v_score := v_score + CASE lower(v_lead.experience)
      WHEN 'debutant' THEN 5
      WHEN 'intermediaire' THEN 10
      WHEN 'avance' THEN 15
      WHEN 'expert' THEN 20
      ELSE 0
    END;
  END IF;

  v_score := LEAST(100, GREATEST(0, v_score));
  RETURN v_score;
END;$$;

COMMIT;
