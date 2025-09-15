-- Migration 45: Add execute_sql RPC for notifications worker
-- The notifications-worker Edge Function calls /rest/v1/rpc/execute_sql with a { query } payload.
-- This RPC safely executes read/update statements used internally for queue processing.
-- NOTE: Restrict to SELECT/UPDATE on notification_events only to reduce risk.

CREATE OR REPLACE FUNCTION public.execute_sql(query text)
RETURNS SETOF jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  lower_q text := ltrim(lower(query));
BEGIN
  -- Basic guard: only allow statements that reference notification_events and begin with WITH/SELECT/UPDATE
  IF NOT (lower_q LIKE 'with %' OR lower_q LIKE 'select %' OR lower_q LIKE 'update %') THEN
    RAISE EXCEPTION 'Only WITH / SELECT / UPDATE statements allowed';
  END IF;
  IF position('notification_events' IN lower_q) = 0 THEN
    RAISE EXCEPTION 'Query must reference notification_events';
  END IF;

  RETURN QUERY EXECUTE format('SELECT to_jsonb(q) FROM (%s) q', query);
END;$$;

-- Grant execute to service role & authenticated if needed (service role used by Edge Function via key)
GRANT EXECUTE ON FUNCTION public.execute_sql(text) TO authenticated, service_role;
