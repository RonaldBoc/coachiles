-- RLS AUDIT SCRIPT (Postgres/Supabase)
-- Purpose: Inspect RLS status, policy coverage, grants, views, and SECURITY DEFINER functions.
-- How to run:
--  - Paste in Supabase SQL Editor and run, or execute via psql.
--  - Optional: uncomment the "Simulate JWT" block to test policies as a user.
-- Safe to run in production (read-only queries).

-- =============================
-- SECTION 0: Scope
-- =============================
-- Adjust schemas to inspect if needed (portable for Supabase SQL Editor)
-- Edit the array below across the queries if you use more schemas (e.g., 'extensions')
-- Example change: ARRAY['public','storage','extensions']

-- =============================
-- SECTION 1: Tables RLS status and policy counts
-- =============================
WITH tables AS (
  SELECT
    n.nspname AS schema,
    c.relname AS table,
    c.relrowsecurity AS rls_enabled,
    c.relforcerowsecurity AS rls_forced,
    c.oid AS relid
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE c.relkind = 'r' -- ordinary tables
  AND n.nspname = ANY (ARRAY['public','storage'])
)
SELECT
  t.schema,
  t.table,
  t.rls_enabled,
  t.rls_forced,
  COALESCE(p.policy_count, 0) AS policy_count
FROM tables t
LEFT JOIN (
  SELECT schemaname, tablename, COUNT(*) AS policy_count
  FROM pg_policies
  GROUP BY 1,2
) p ON p.schemaname = t.schema AND p.tablename = t.table
ORDER BY t.schema, t.table;

-- =============================
-- SECTION 2: Detailed policies (who, what, using, with_check)
-- =============================
SELECT
  schemaname AS schema,
  tablename AS table,
  policyname,
  cmd AS command,
  roles,
  qual  AS using_expression,
  with_check
FROM pg_policies
WHERE schemaname = ANY (ARRAY['public','storage'])
ORDER BY 1,2,3;

-- =============================
-- SECTION 3: Coverage matrix per table (has SELECT/INSERT/UPDATE/DELETE policy)
-- =============================
WITH base AS (
  SELECT schemaname, tablename,
         MAX((cmd = 'select')::int)::bool AS has_select,
         MAX((cmd = 'insert')::int)::bool AS has_insert,
         MAX((cmd = 'update')::int)::bool AS has_update,
         MAX((cmd = 'delete')::int)::bool AS has_delete
  FROM pg_policies
  WHERE schemaname = ANY (ARRAY['public','storage'])
  GROUP BY 1,2
)
SELECT t.schema, t.table, t.rls_enabled, t.rls_forced,
       COALESCE(b.has_select, false) AS has_select,
       COALESCE(b.has_insert, false) AS has_insert,
       COALESCE(b.has_update, false) AS has_update,
       COALESCE(b.has_delete, false) AS has_delete
FROM (
  SELECT n.nspname AS schema, c.relname AS table, c.relrowsecurity AS rls_enabled, c.relforcerowsecurity AS rls_forced
  FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE c.relkind='r' AND n.nspname = ANY (ARRAY['public','storage'])
) t
LEFT JOIN base b ON b.schemaname = t.schema AND b.tablename = t.table
ORDER BY t.schema, t.table;

-- =============================
-- SECTION 4: Tables with grants to anon/authenticated/public (and RLS off)
-- =============================
WITH grants AS (
  SELECT grantee, table_schema, table_name, privilege_type
  FROM information_schema.role_table_grants
  WHERE table_schema NOT IN ('pg_catalog','information_schema')
    AND grantee IN ('anon','authenticated','public')
), rls AS (
  SELECT n.nspname AS schema, c.relname AS table, c.relrowsecurity AS rls_enabled
  FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
  WHERE c.relkind='r'
)
SELECT g.table_schema AS schema, g.table_name AS table, string_agg(DISTINCT g.grantee, ',') AS grantees,
       string_agg(DISTINCT g.privilege_type, ',') AS privileges,
       COALESCE(r.rls_enabled, false) AS rls_enabled
FROM grants g
LEFT JOIN rls r ON r.schema=g.table_schema AND r.table=g.table_name
GROUP BY 1,2,5
ORDER BY 1,2;

-- =============================
-- SECTION 5: Views granted to anon/authenticated/public, with definitions
-- =============================
WITH views AS (
  SELECT n.nspname AS schema, c.relname AS view, c.oid
  FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
  WHERE c.relkind='v' AND n.nspname = ANY (ARRAY['public','storage'])
), grants AS (
  SELECT grantee, table_schema, table_name, privilege_type
  FROM information_schema.role_table_grants
  WHERE privilege_type='SELECT'
    AND grantee IN ('anon','authenticated','public')
)
SELECT v.schema, v.view,
       string_agg(DISTINCT g.grantee, ',') AS grantees,
       pg_get_viewdef(v.oid, true) AS view_sql
FROM views v
LEFT JOIN grants g ON g.table_schema=v.schema AND g.table_name=v.view
GROUP BY v.schema, v.view, v.oid
HAVING string_agg(DISTINCT g.grantee, ',') IS NOT NULL
ORDER BY 1,2;

-- =============================
-- SECTION 6: SECURITY DEFINER functions exposed to anon/authenticated/public
-- =============================
WITH funcs AS (
  SELECT n.nspname AS schema, p.proname AS function, p.oid, p.prosecdef AS security_definer
  FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
  WHERE n.nspname NOT IN ('pg_catalog','information_schema')
), privs AS (
  SELECT routine_schema AS schema, routine_name AS function, grantee, privilege_type
  FROM information_schema.routine_privileges
)
SELECT f.schema, f.function,
       f.security_definer,
       string_agg(DISTINCT (pr.grantee||':'||pr.privilege_type), ',') AS grants
FROM funcs f
LEFT JOIN privs pr ON pr.schema=f.schema AND pr.function=f.function
WHERE f.security_definer IS TRUE
GROUP BY 1,2,3
ORDER BY 1,2;

-- =============================
-- SECTION 7: Potentially broad policies (heuristics)
-- =============================
-- Flags policies whose USING/WITH CHECK are NULL or trivially true or only gate on auth.role().
SELECT schemaname AS schema, tablename AS table, policyname, cmd, roles,
       qual AS using_expression, with_check
FROM pg_policies
WHERE schemaname = ANY (ARRAY['public','storage'])
  AND (
    qual IS NULL OR with_check IS NULL OR
    qual::text ~* '\\btrue\\b' OR with_check::text ~* '\\btrue\\b' OR
    qual::text ~* 'auth.role' OR with_check::text ~* 'auth.role'
  )
ORDER BY 1,2,3;

-- =============================
-- SECTION 8 (Optional): Simulate a Supabase JWT to test policies interactively
-- =============================
-- Uncomment and fill values to emulate requests in SQL (affects current transaction only):
-- DO $$ BEGIN
--   PERFORM set_config('request.jwt.claims', '{"sub":"<user-uuid>","role":"authenticated","email":"user@example.com"}', true);
-- END $$;
-- -- Now try a query you expect to be filtered, e.g.:
-- -- SELECT * FROM public.coaches;  -- should return only rows for the simulated user if policies enforce it

-- End of audit
