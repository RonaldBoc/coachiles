-- Fix RLS policies for subscriptions table
-- Allow coaches to read their own subscriptions

-- Enable RLS on subscriptions table
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow coaches to read their own subscriptions
CREATE POLICY "Coaches can read their own subscriptions" ON subscriptions
  FOR SELECT
  USING (auth.uid()::text IN (
    SELECT id::text FROM coaches WHERE id = coach_id
  ));

-- Allow coaches to insert their own subscriptions (for the testing function)
CREATE POLICY "Coaches can insert their own subscriptions" ON subscriptions
  FOR INSERT
  WITH CHECK (auth.uid()::text IN (
    SELECT id::text FROM coaches WHERE id = coach_id
  ));

-- Allow coaches to update their own subscriptions
CREATE POLICY "Coaches can update their own subscriptions" ON subscriptions
  FOR UPDATE
  USING (auth.uid()::text IN (
    SELECT id::text FROM coaches WHERE id = coach_id
  ));

-- Test the policies
SELECT 'RLS policies created for subscriptions table' as status;
