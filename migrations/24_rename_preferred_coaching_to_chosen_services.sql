-- Migration 24: Rename preferred_coaching -> chosen_services
-- 1. Rename column
-- 2. Rename associated index (if exists)
-- 3. Update admin_duplicate_lead to NOT copy chosen_services (set to NULL)
-- Notes:
--    We keep historical data by renaming the column; no data loss.

BEGIN;

-- Rename column if it exists and target doesn't already exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='leads' AND column_name='preferred_coaching'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='leads' AND column_name='chosen_services'
  ) THEN
    ALTER TABLE public.leads RENAME COLUMN preferred_coaching TO chosen_services;
  END IF;
END$$;

-- Rename GIN index if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='idx_leads_preferred_coaching'
  ) THEN
    ALTER INDEX public.idx_leads_preferred_coaching RENAME TO idx_leads_chosen_services;
  END IF;
END$$;

-- Ensure new index exists (idempotent)
CREATE INDEX IF NOT EXISTS idx_leads_chosen_services ON public.leads USING GIN(chosen_services);

-- Update duplication function: set chosen_services = NULL when duplicating
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
      1, '{1}'::int[], false,
      src.coach_id, src.id
    ) RETURNING id INTO new_id;
    created_ids := created_ids || new_id;
  END LOOP;
  RETURN json_build_object('success', true, 'created_ids', created_ids, 'count', coalesce(array_length(created_ids,1),0));
END;$$;

GRANT EXECUTE ON FUNCTION public.admin_duplicate_lead(text, uuid, uuid[]) TO authenticated;

COMMIT;
