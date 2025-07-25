-- Fix RLS Policies for Coach Profile Updates
-- This script fixes the 406 error when updating coach profiles

-- Drop existing policies
DROP POLICY IF EXISTS "Coaches can update own profile" ON public.coaches;
DROP POLICY IF EXISTS "Coaches can insert own profile" ON public.coaches;

-- Create new policies using email-based matching
CREATE POLICY "Coaches can update own profile" ON public.coaches
    FOR UPDATE USING (auth.jwt() ->> 'email' = email);

CREATE POLICY "Coaches can insert own profile" ON public.coaches
    FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = email);

-- Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'coaches' AND schemaname = 'public';
