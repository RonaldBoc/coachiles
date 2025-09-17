-- Migration 48: Rewrite execute_sql to avoid syntax error near UPDATE
-- Implements a safer pattern: execute UPDATE ... RETURNING directly and loop over results.

CREATE OR REPLACE FUNCTION public.execute_sql(query text)
RETURNS SETOF jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  trimmed text := regexp_replace(query, '^\s+', '');
  lower_q text := lower(trimmed);
  is_with boolean := lower_q LIKE 'with %';
  is_select boolean := lower_q LIKE 'select %';
  is_update boolean := lower_q LIKE 'update %' OR (is_with AND position(' update ' in lower_q) > 0);
  has_returning boolean := position(' returning ' in lower_q) > 0;
  r RECORD;
  rowcount bigint := 0;
BEGIN
  IF NOT (is_with OR is_select OR is_update) THEN
    RAISE EXCEPTION 'Only WITH / SELECT / UPDATE statements allowed';
  END IF;
  IF position('notification_events' IN lower_q) = 0 THEN
    RAISE EXCEPTION 'Query must reference notification_events';
  END IF;

  IF (is_select AND NOT is_update) OR (is_with AND NOT is_update) THEN
    RETURN QUERY EXECUTE format('SELECT to_jsonb(q) FROM (%s) q', trimmed);
    RETURN;
  END IF;

  IF is_update THEN
    IF has_returning THEN
      FOR r IN EXECUTE trimmed LOOP
        RETURN NEXT to_jsonb(r);
      END LOOP;
      RETURN;
    ELSE
      EXECUTE trimmed;
      GET DIAGNOSTICS rowcount = ROW_COUNT;
      RETURN QUERY SELECT jsonb_build_object('row_count', rowcount);
      RETURN;
    END IF;
  END IF;

  RETURN; -- safety
END;$$;

GRANT EXECUTE ON FUNCTION public.execute_sql(text) TO authenticated, service_role;
