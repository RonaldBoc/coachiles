-- Migration 46: Harden execute_sql RPC (trim whitespace, support UPDATE without RETURNING)
-- Fixes errors when queries begin with a newline and when UPDATE lacks RETURNING.

CREATE OR REPLACE FUNCTION public.execute_sql(query text)
RETURNS SETOF jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  lower_q text := regexp_replace(lower(query), '^\s+', ''); -- trim all leading whitespace
  has_returning boolean := position(' returning ' in lower(lower(query))) > 0;
  rowcount bigint := 0;
BEGIN
  IF NOT (lower_q LIKE 'with %' OR lower_q LIKE 'select %' OR lower_q LIKE 'update %') THEN
    RAISE EXCEPTION 'Only WITH / SELECT / UPDATE statements allowed';
  END IF;
  IF position('notification_events' IN lower_q) = 0 THEN
    RAISE EXCEPTION 'Query must reference notification_events';
  END IF;

  IF lower_q LIKE 'select %' OR lower_q LIKE 'with %' THEN
    RETURN QUERY EXECUTE format('SELECT to_jsonb(q) FROM (%s) q', query);
    RETURN;
  END IF;

  -- UPDATE statements
  IF lower_q LIKE 'update %' THEN
    IF has_returning THEN
      RETURN QUERY EXECUTE format('SELECT to_jsonb(q) FROM (%s) q', query);
      RETURN;
    ELSE
      EXECUTE query;
      GET DIAGNOSTICS rowcount = ROW_COUNT;
      RETURN QUERY SELECT jsonb_build_object('row_count', rowcount);
      RETURN;
    END IF;
  END IF;

  -- Fallback (should not reach)
  RETURN;
END;$$;

GRANT EXECUTE ON FUNCTION public.execute_sql(text) TO authenticated, service_role;
