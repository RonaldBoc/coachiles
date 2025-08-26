-- Add multi-coach access for leads
BEGIN;

-- Table to allow multiple coaches to access a lead
CREATE TABLE IF NOT EXISTS public.lead_coach_access (
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  coach_id uuid NOT NULL REFERENCES public.coaches(id) ON DELETE CASCADE,
  granted_at timestamptz NOT NULL DEFAULT now(),
  granted_by text NULL,
  PRIMARY KEY (lead_id, coach_id)
);

-- Backfill existing single coach assignments
INSERT INTO public.lead_coach_access (lead_id, coach_id)
SELECT l.id, l.coach_id
FROM public.leads l
WHERE l.coach_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- Function to get lead details + current coach access list
CREATE OR REPLACE FUNCTION public.admin_get_lead_details(
  p_email text,
  p_lead_id uuid
) RETURNS json
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_lead record;
  v_coaches json;
BEGIN
  IF NOT public.is_superadmin(p_email) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  SELECT * INTO v_lead FROM public.leads WHERE id = p_lead_id;
  IF v_lead.id IS NULL THEN
    RETURN json_build_object('lead', NULL, 'coach_ids', '[]'::json);
  END IF;

  SELECT coalesce(json_agg(ca.coach_id), '[]'::json) INTO v_coaches
  FROM public.lead_coach_access ca WHERE ca.lead_id = p_lead_id;

  RETURN json_build_object('lead', to_json(v_lead), 'coach_ids', v_coaches);
END;$$;

GRANT EXECUTE ON FUNCTION public.admin_get_lead_details(text, uuid) TO authenticated;

-- Set list of coaches for a lead (replace existing)
CREATE OR REPLACE FUNCTION public.admin_set_lead_coaches(
  p_email text,
  p_lead_id uuid,
  p_coach_ids uuid[]
) RETURNS json
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_superadmin(p_email) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  DELETE FROM public.lead_coach_access WHERE lead_id = p_lead_id;
  INSERT INTO public.lead_coach_access (lead_id, coach_id, granted_by)
  SELECT p_lead_id, unnest(p_coach_ids), p_email
  ON CONFLICT DO NOTHING;

  -- Mirror primary coach_id for backward compatibility: choose first id if any
  UPDATE public.leads SET coach_id = (SELECT p_coach_ids[1]) WHERE id = p_lead_id;

  RETURN json_build_object('success', true, 'lead_id', p_lead_id, 'coach_ids', p_coach_ids);
END;$$;

GRANT EXECUTE ON FUNCTION public.admin_set_lead_coaches(text, uuid, uuid[]) TO authenticated;

-- Helper to list associations (optional)
CREATE OR REPLACE FUNCTION public.admin_list_lead_access(p_email text)
RETURNS TABLE(lead_id uuid, coach_id uuid) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT public.is_superadmin(p_email) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  RETURN QUERY SELECT lead_id, coach_id FROM public.lead_coach_access;
END;$$;
GRANT EXECUTE ON FUNCTION public.admin_list_lead_access(text) TO authenticated;

COMMIT;
