-- Revert multi-coach access and introduce duplication strategy
BEGIN;

-- Drop multi-access artifacts if they exist
DROP FUNCTION IF EXISTS public.admin_list_lead_access(text) CASCADE;
DROP FUNCTION IF EXISTS public.admin_set_lead_coaches(text, uuid, uuid[]) CASCADE;
DROP FUNCTION IF EXISTS public.admin_get_lead_details(text, uuid) CASCADE;
DROP TABLE IF EXISTS public.lead_coach_access CASCADE;

-- Simple lead details function (no access list)
CREATE OR REPLACE FUNCTION public.admin_get_lead_details(
  p_email text,
  p_lead_id uuid
) RETURNS json
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_lead record;
BEGIN
  IF NOT public.is_superadmin(p_email) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  SELECT * INTO v_lead FROM public.leads WHERE id = p_lead_id;
  IF v_lead.id IS NULL THEN
    RETURN json_build_object('lead', NULL, 'coach_ids', '[]'::json);
  END IF;
  RETURN json_build_object('lead', to_json(v_lead), 'coach_ids', '[]'::json);
END;$$;
GRANT EXECUTE ON FUNCTION public.admin_get_lead_details(text, uuid) TO authenticated;

-- Duplicate lead to multiple target coaches
CREATE OR REPLACE FUNCTION public.admin_duplicate_lead(
  p_email text,
  p_lead_id uuid,
  p_target_coach_ids uuid[]
) RETURNS json
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  src public.leads;
  new_id uuid;
  created_ids uuid[] := '{}';
BEGIN
  IF NOT public.is_superadmin(p_email) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  IF p_target_coach_ids IS NULL OR array_length(p_target_coach_ids,1) IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'no_targets');
  END IF;
  SELECT * INTO src FROM public.leads WHERE id = p_lead_id;
  IF src.id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'lead_not_found');
  END IF;
  FOREACH new_id IN ARRAY p_target_coach_ids LOOP
    INSERT INTO public.leads (
      client_name, client_email, client_phone, location,
      preferred_coaching, goals, experience, availability, budget, additional_info,
      status, coach_id, coach_note, contacted_at, converted_at, source, priority,
      converted_booking_id, estimated_value, actual_value,
      current_step, completed_steps, is_completed
    ) VALUES (
      src.client_name, src.client_email, src.client_phone, src.location,
      src.preferred_coaching, src.goals, src.experience, src.availability, src.budget, src.additional_info,
      'new', new_id, NULL, NULL, NULL, src.source, src.priority,
      NULL, NULL, NULL,
      1, '{1}'::int[], false
    ) RETURNING id INTO new_id;
    created_ids := created_ids || new_id;
  END LOOP;
  RETURN json_build_object('success', true, 'created_ids', created_ids, 'count', coalesce(array_length(created_ids,1),0));
END;$$;
GRANT EXECUTE ON FUNCTION public.admin_duplicate_lead(text, uuid, uuid[]) TO authenticated;

COMMIT;
