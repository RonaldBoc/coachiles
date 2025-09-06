-- Migration 45: Update admin_duplicate_lead to mark duplicated leads as completed (step 3)
-- Purpose: Make duplicated leads immediately visible to coaches whose UI filters
-- require (current_step >= 3) OR is_completed = true.
-- Changes compared to previous version (see migration 24):
--   * current_step: 1 -> 3
--   * completed_steps: '{1}' -> '{1,2,3}'
--   * is_completed: false -> true
--   * Keep chosen_services NULL (coach should re-collect service preferences)
--   * Preserve provenance columns original_coach_id / original_lead_id
-- Idempotent: function is replaced.

BEGIN;

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
      chosen_services, goals, experience, availability, budget, additional_info,
      status, coach_id, coach_note, contacted_at, converted_at, source, priority,
      converted_booking_id, estimated_value, actual_value,
      current_step, completed_steps, is_completed,
      original_coach_id, original_lead_id
    ) VALUES (
      src.client_name, src.client_email, src.client_phone, src.location,
      NULL, src.goals, src.experience, src.availability, src.budget, src.additional_info,
      'new', target_coach_id, NULL, NULL, NULL, src.source, src.priority,
      NULL, NULL, NULL,
      3, '{1,2,3}'::int[], true,
      src.coach_id, src.id
    ) RETURNING id INTO new_id;
    created_ids := created_ids || new_id;
  END LOOP;
  RETURN json_build_object('success', true, 'created_ids', created_ids, 'count', coalesce(array_length(created_ids,1),0));
END;$$;

GRANT EXECUTE ON FUNCTION public.admin_duplicate_lead(text, uuid, uuid[]) TO authenticated;

COMMIT;
