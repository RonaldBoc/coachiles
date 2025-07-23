-- Fix Services Table RLS Policies
-- Run this in your Supabase SQL Editor

-- First, let's check existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'services';

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view active services" ON public.services;
DROP POLICY IF EXISTS "Coaches can manage own services" ON public.services;
DROP POLICY IF EXISTS "Coaches can insert own services" ON public.services;
DROP POLICY IF EXISTS "Coaches can update own services" ON public.services;
DROP POLICY IF EXISTS "Coaches can delete own services" ON public.services;

-- Create new, more permissive policies for troubleshooting
CREATE POLICY "Allow authenticated users to view services" ON public.services
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow coaches to insert services" ON public.services
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND 
        coach_id = auth.uid()
    );

CREATE POLICY "Allow coaches to update own services" ON public.services
    FOR UPDATE USING (
        auth.role() = 'authenticated' AND 
        coach_id = auth.uid()
    );

CREATE POLICY "Allow coaches to delete own services" ON public.services
    FOR DELETE USING (
        auth.role() = 'authenticated' AND 
        coach_id = auth.uid()
    );

-- Verify the table has RLS enabled
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Check if the coach_id column exists and is of the right type
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'services' AND column_name = 'coach_id';

-- Test query to see current user context
SELECT 
    auth.uid() as current_user_id,
    auth.role() as current_role,
    auth.email() as current_email;
