-- Migration 23: Lead provenance tracking
-- Adds original_coach_id and original_lead_id to leads so that duplicated
-- leads can reference their source. Updates admin_duplicate_lead to populate
-- these fields. Also explicitly keeps coach-specific fields (coach_note,
-- contacted/conversion/value fields) cleared when duplicating.
-- NOTE: "services proposés" are not stored directly on the lead record; coach
-- service offerings live in separate tables, so nothing needs to be removed
-- besides ensuring no coach-specific note/value data is copied.

BEGIN;

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS original_coach_id uuid REFERENCES public.coaches(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS original_lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL;

-- Replace the duplication function to set provenance columns
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
  target_coach_id uuid;
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
  FOREACH target_coach_id IN ARRAY p_target_coach_ids LOOP
    INSERT INTO public.leads (
      client_name, client_email, client_phone, location,
      preferred_coaching, goals, experience, availability, budget, additional_info,
      status, coach_id, coach_note, contacted_at, converted_at, source, priority,
      converted_booking_id, estimated_value, actual_value,
      current_step, completed_steps, is_completed,
      original_coach_id, original_lead_id
    ) VALUES (
      src.client_name, src.client_email, src.client_phone, src.location,
      src.preferred_coaching, src.goals, src.experience, src.availability, src.budget, src.additional_info,
      'new', target_coach_id, NULL, NULL, NULL, src.source, src.priority,
      NULL, NULL, NULL,
      1, '{1}'::int[], false,
      src.coach_id, src.id
    ) RETURNING id INTO new_id;
    created_ids := created_ids || new_id;
  END LOOP;
  RETURN json_build_object('success', true, 'created_ids', created_ids, 'count', coalesce(array_length(created_ids,1),0));
END;$$;

-- Re-grant (harmless if already present)
GRANT EXECUTE ON FUNCTION public.admin_duplicate_lead(text, uuid, uuid[]) TO authenticated;

COMMIT;
