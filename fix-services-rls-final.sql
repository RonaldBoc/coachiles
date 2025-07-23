-- Fix RLS policies for services table
-- This script will drop existing policies and create new ones that work correctly

-- First, let's check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'services';

-- Drop existing RLS policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."services";
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON "public"."services";
DROP POLICY IF EXISTS "Enable update for users based on email" ON "public"."services";
DROP POLICY IF EXISTS "Enable delete for users based on email" ON "public"."services";
DROP POLICY IF EXISTS "Allow coaches to manage their own services" ON "public"."services";
DROP POLICY IF EXISTS "coaches_can_insert_services" ON "public"."services";
DROP POLICY IF EXISTS "coaches_can_update_services" ON "public"."services";
DROP POLICY IF EXISTS "coaches_can_delete_services" ON "public"."services";

-- Enable RLS on services table
ALTER TABLE "public"."services" ENABLE ROW LEVEL SECURITY;

-- Create new policies that work correctly

-- 1. Allow everyone to read services (for public marketplace)
CREATE POLICY "services_select_policy" ON "public"."services"
    FOR SELECT USING (true);

-- 2. Allow authenticated users to insert services if they are the coach
CREATE POLICY "services_insert_policy" ON "public"."services"
    FOR INSERT 
    WITH CHECK (
        auth.uid() IS NOT NULL 
        AND EXISTS (
            SELECT 1 FROM "public"."coaches" 
            WHERE "coaches"."id" = "services"."coach_id"
            AND "coaches"."email" = auth.email()
        )
    );

-- 3. Allow coaches to update their own services
CREATE POLICY "services_update_policy" ON "public"."services"
    FOR UPDATE 
    USING (
        auth.uid() IS NOT NULL 
        AND EXISTS (
            SELECT 1 FROM "public"."coaches" 
            WHERE "coaches"."id" = "services"."coach_id"
            AND "coaches"."email" = auth.email()
        )
    )
    WITH CHECK (
        auth.uid() IS NOT NULL 
        AND EXISTS (
            SELECT 1 FROM "public"."coaches" 
            WHERE "coaches"."id" = "services"."coach_id"
            AND "coaches"."email" = auth.email()
        )
    );

-- 4. Allow coaches to delete their own services
CREATE POLICY "services_delete_policy" ON "public"."services"
    FOR DELETE 
    USING (
        auth.uid() IS NOT NULL 
        AND EXISTS (
            SELECT 1 FROM "public"."coaches" 
            WHERE "coaches"."id" = "services"."coach_id"
            AND "coaches"."email" = auth.email()
        )
    );

-- Check the new policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'services';

-- Test the policy by checking if the current user can access coaches table
SELECT 
    auth.uid() as current_user_id,
    auth.email() as current_user_email,
    (SELECT count(*) FROM "public"."coaches" WHERE "coaches"."email" = auth.email()) as coach_count;
