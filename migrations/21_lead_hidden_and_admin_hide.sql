-- Migration: add is_hidden flag to leads and admin RPCs to manage it
-- 1) Schema change: add column if not exists
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS is_hidden boolean NOT NULL DEFAULT false;

-- 2) RPC: list leads for a specific coach including hidden flag
CREATE OR REPLACE FUNCTION public.admin_list_leads_for_coach(
  p_email text,
  p_coach_id uuid
) RETURNS TABLE (
  id uuid,
  client_name text,
  client_email text,
  status text,
  coach_id uuid,
  created_at timestamptz,
  is_hidden boolean
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT public.is_superadmin(p_email) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  RETURN QUERY
  SELECT l.id, l.client_name, l.client_email, l.status, l.coach_id, l.created_at, l.is_hidden
  FROM public.leads l
  WHERE l.coach_id = p_coach_id
  ORDER BY l.created_at DESC
  LIMIT 1000;
END;$$;

-- 3) RPC: set hidden flag
CREATE OR REPLACE FUNCTION public.admin_set_lead_hidden(
  p_email text,
  p_lead_id uuid,
  p_hidden boolean
) RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  updated_row record;
BEGIN
  IF NOT public.is_superadmin(p_email) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  UPDATE public.leads
    SET is_hidden = p_hidden,
        updated_at = now()
  WHERE id = p_lead_id
  RETURNING * INTO updated_row;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'not_found');
  END IF;

  RETURN json_build_object('success', true, 'lead_id', p_lead_id, 'is_hidden', p_hidden);
END;$$;

GRANT EXECUTE ON FUNCTION public.admin_list_leads_for_coach(text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_lead_hidden(text, uuid, boolean) TO authenticated;
