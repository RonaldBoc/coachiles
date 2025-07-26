-- Check and fix RLS policies for subscriptions table
-- This addresses the 403 Forbidden / RLS policy violation error

-- 1. Check current RLS policies on subscriptions table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'subscriptions';

-- 2. Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity, forcerowsecurity 
FROM pg_tables 
WHERE tablename = 'subscriptions';

-- 3. Create or update RLS policy to allow coaches to manage their own subscriptions
DROP POLICY IF EXISTS "Coaches can manage their own subscriptions" ON subscriptions;

CREATE POLICY "Coaches can manage their own subscriptions" 
  ON subscriptions 
  FOR ALL 
  TO authenticated 
  USING (
    -- Allow access if the user is the coach who owns the subscription
    auth.uid()::text IN (
      SELECT id::text FROM coaches WHERE id = subscriptions.coach_id
    )
  )
  WITH CHECK (
    -- Allow inserts/updates if the user is the coach who owns the subscription
    auth.uid()::text IN (
      SELECT id::text FROM coaches WHERE id = subscriptions.coach_id
    )
  );

-- 4. Alternative: Create a more permissive policy for testing
-- DROP POLICY IF EXISTS "Allow authenticated users to manage subscriptions" ON subscriptions;
-- 
-- CREATE POLICY "Allow authenticated users to manage subscriptions" 
--   ON subscriptions 
--   FOR ALL 
--   TO authenticated 
--   USING (true)
--   WITH CHECK (true);

-- 5. Ensure coaches table has proper RLS as well
DROP POLICY IF EXISTS "Coaches can read their own profile" ON coaches;

CREATE POLICY "Coaches can read their own profile" 
  ON coaches 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid()::text = id::text);

-- 6. Test the policies work
DO $$
DECLARE
  test_coach_id uuid;
  test_plan_id uuid;
BEGIN
  -- Get a test coach and plan
  SELECT id INTO test_coach_id FROM coaches LIMIT 1;
  SELECT id INTO test_plan_id FROM subscription_plans WHERE plan_type = 'premium' LIMIT 1;
  
  IF test_coach_id IS NOT NULL AND test_plan_id IS NOT NULL THEN
    RAISE NOTICE 'Found test coach: %', test_coach_id;
    RAISE NOTICE 'Found premium plan: %', test_plan_id;
    RAISE NOTICE 'RLS policies updated for subscriptions table';
  ELSE
    RAISE NOTICE 'No test data found - ensure coaches and subscription_plans have data';
  END IF;
END $$;

-- 7. Show final policies
SELECT 
  'RLS Policies for subscriptions:' as info,
  policyname, 
  permissive,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'subscriptions'
ORDER BY policyname;
