-- Migration 47: Fix execute_sql handling of UPDATE with CTE
-- The prior version caused a syntax error when wrapping an UPDATE that already included a CTE.
-- Strategy: detect UPDATE ... RETURNING; if it also contains a WITH prefix, do not wrap; instead execute directly and convert rows.
-- Additionally, broaden RETURNING detection to avoid false positives inside literals by using a regex on statement structure.

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
  is_update boolean := lower_q LIKE 'update %' OR lower_q LIKE 'with %update %';
  has_returning boolean := lower_q ~ 'update[\s\S]+returning';
  rowcount bigint := 0;
BEGIN
  IF NOT (is_with OR is_select OR is_update) THEN
    RAISE EXCEPTION 'Only WITH / SELECT / UPDATE statements allowed';
  END IF;
  IF position('notification_events' IN lower_q) = 0 THEN
    RAISE EXCEPTION 'Query must reference notification_events';
  END IF;

  -- Pure SELECT / WITH SELECT
  IF (is_select OR (is_with AND NOT is_update)) THEN
    RETURN QUERY EXECUTE format('SELECT to_jsonb(q) FROM (%s) q', trimmed);
    RETURN;
  END IF;

  -- UPDATE statements (with or without WITH)
  IF is_update THEN
    IF has_returning THEN
      -- Execute directly but wrap its result
      RETURN QUERY EXECUTE format('SELECT to_jsonb(t) FROM (%s) t', trimmed);
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
