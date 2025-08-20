-- Create a SECURITY DEFINER function to finalize a lead from the public flow
-- This safely bypasses RLS while enforcing our own conditions server-side
-- Usage: select * from public.leads_finalize_public(<id>, ...);

CREATE OR REPLACE FUNCTION public.leads_finalize_public(
  p_lead_id uuid,
  p_preferred_coaching text[] DEFAULT NULL,
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
SET search_path = public
AS $$
DECLARE
  v_lead public.leads;
BEGIN
  -- Finalize the lead (allow even if already assigned to a coach)
  UPDATE public.leads
  SET
    preferred_coaching = COALESCE(p_preferred_coaching, preferred_coaching),
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

  -- Recompute score after finalization
  UPDATE public.leads
  SET lead_score = public.compute_lead_score(p_lead_id),
      updated_at = timezone('utc'::text, now())
  WHERE id = p_lead_id
  RETURNING * INTO v_lead;

  RETURN v_lead;
END;
$$;

-- Allow public and authenticated callers to execute this function
GRANT EXECUTE ON FUNCTION public.leads_finalize_public(
  uuid, text[], text, text, text, text, text, uuid
) TO anon, authenticated;

-- Set coach on a lead right after step 1 (only if currently unassigned)
CREATE OR REPLACE FUNCTION public.leads_set_coach_public(
  p_lead_id uuid,
  p_coach_id uuid
)
RETURNS public.leads
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lead public.leads;
BEGIN
  UPDATE public.leads
  SET coach_id = p_coach_id,
      updated_at = timezone('utc'::text, now())
  WHERE id = p_lead_id AND coach_id IS NULL
  RETURNING * INTO v_lead;

  IF v_lead.id IS NULL THEN
    RAISE EXCEPTION 'Lead not found or already assigned';
  END IF;

  -- Recompute score after assigning coach
  UPDATE public.leads
  SET lead_score = public.compute_lead_score(p_lead_id),
      updated_at = timezone('utc'::text, now())
  WHERE id = p_lead_id
  RETURNING * INTO v_lead;

  RETURN v_lead;
END;
$$;

GRANT EXECUTE ON FUNCTION public.leads_set_coach_public(uuid, uuid) TO anon, authenticated;

-- Update allowed fields for step 2 via SECURITY DEFINER (phone, location)
CREATE OR REPLACE FUNCTION public.leads_update_public(
  p_lead_id uuid,
  p_client_phone text DEFAULT NULL,
  p_location text DEFAULT NULL
)
RETURNS public.leads
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lead public.leads;
BEGIN
  UPDATE public.leads
  SET
    client_phone = COALESCE(p_client_phone, client_phone),
    location = COALESCE(p_location, location),
    current_step = CASE WHEN current_step IS NULL OR current_step < 2 THEN 2 ELSE current_step END,
    completed_steps = (
      SELECT ARRAY(
        SELECT DISTINCT e
        FROM (
          SELECT unnest(COALESCE(completed_steps, '{}'::int[])) e
          UNION ALL SELECT 1
          UNION ALL SELECT 2
        ) s
        ORDER BY e
      )
    ),
    updated_at = timezone('utc'::text, now())
  WHERE id = p_lead_id AND (is_completed IS NULL OR is_completed = false)
  RETURNING * INTO v_lead;

  IF v_lead.id IS NULL THEN
    RAISE EXCEPTION 'Lead not found or not eligible for update';
  END IF;

  -- Recompute score after step 2 changes
  UPDATE public.leads
  SET lead_score = public.compute_lead_score(p_lead_id),
      updated_at = timezone('utc'::text, now())
  WHERE id = p_lead_id
  RETURNING * INTO v_lead;

  RETURN v_lead;
END;
$$;

GRANT EXECUTE ON FUNCTION public.leads_update_public(uuid, text, text) TO anon, authenticated;

-- Add column to store client contact preference
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS do_not_contact boolean NOT NULL DEFAULT false;

-- Lead scoring column
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS lead_score integer NOT NULL DEFAULT 0;

-- Add a per-session id to prevent duplicate lead creation within the same modal flow
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS session_id uuid;

-- Ensure uniqueness only when session_id is provided
CREATE UNIQUE INDEX IF NOT EXISTS idx_leads_session_id
  ON public.leads(session_id)
  WHERE session_id IS NOT NULL;

-- Public RPC to set contact preference (do_not_contact)
CREATE OR REPLACE FUNCTION public.leads_set_contact_preference_public(
  p_lead_id uuid,
  p_do_not_contact boolean
)
RETURNS public.leads
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lead public.leads;
BEGIN
  UPDATE public.leads
  SET do_not_contact = COALESCE(p_do_not_contact, do_not_contact),
      updated_at = timezone('utc'::text, now())
  WHERE id = p_lead_id AND (is_completed IS NULL OR is_completed = false)
  RETURNING * INTO v_lead;

  IF v_lead.id IS NULL THEN
    RAISE EXCEPTION 'Lead not found or not eligible for contact preference update';
  END IF;

  -- Recompute score if contact preference changes
  UPDATE public.leads
  SET lead_score = public.compute_lead_score(p_lead_id),
      updated_at = timezone('utc'::text, now())
  WHERE id = p_lead_id
  RETURNING * INTO v_lead;

  RETURN v_lead;
END;
$$;

GRANT EXECUTE ON FUNCTION public.leads_set_contact_preference_public(uuid, boolean)
  TO anon, authenticated;

-- Core lead scoring function
CREATE OR REPLACE FUNCTION public.compute_lead_score(p_lead_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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

  -- Disqualify if do not contact
  IF COALESCE(v_lead.do_not_contact, false) THEN
    RETURN 0;
  END IF;

  -- Phone presence
  IF COALESCE(trim(v_lead.client_phone), '') <> '' THEN
    v_score := v_score + 20;
  END IF;

  -- City matches coach locations
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

  -- Service interest matches coach services
  IF v_lead.coach_id IS NOT NULL AND COALESCE(array_length(v_lead.preferred_coaching, 1), 0) > 0 THEN
    SELECT COUNT(*) INTO v_service_matches
    FROM public.coach_services s
    WHERE s.coach_id = v_lead.coach_id
      AND s.is_active = true
      AND s.title = ANY (COALESCE(v_lead.preferred_coaching, '{}'));
    IF v_service_matches > 0 THEN
      v_score := v_score + LEAST(30, v_service_matches * 10);
    END IF;
  END IF;

  -- Start timeframe urgency
  IF v_lead.start_timeframe IS NOT NULL THEN
    v_score := v_score + CASE v_lead.start_timeframe
      WHEN 'Immédiatement' THEN 25
      WHEN 'Dans les prochains jours' THEN 15
      WHEN 'Dans les prochains mois' THEN 5
      ELSE 0
    END;
  END IF;

  -- Completeness bonuses
  IF COALESCE(trim(v_lead.experience), '') <> '' THEN v_score := v_score + 5; END IF;
  IF COALESCE(trim(v_lead.availability), '') <> '' THEN v_score := v_score + 5; END IF;
  IF COALESCE(trim(v_lead.additional_info), '') <> '' THEN v_score := v_score + 5; END IF;

  RETURN v_score;
END;
$$;

-- Public RPC to recompute score explicitly
CREATE OR REPLACE FUNCTION public.leads_recompute_score_public(p_lead_id uuid)
RETURNS public.leads
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lead public.leads;
BEGIN
  UPDATE public.leads
  SET lead_score = public.compute_lead_score(p_lead_id),
      updated_at = timezone('utc'::text, now())
  WHERE id = p_lead_id
  RETURNING * INTO v_lead;

  IF v_lead.id IS NULL THEN
    RAISE EXCEPTION 'Lead not found';
  END IF;

  RETURN v_lead;
END;
$$;

GRANT EXECUTE ON FUNCTION public.leads_recompute_score_public(uuid) TO anon, authenticated;
