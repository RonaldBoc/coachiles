-- Debug Account Deletion Status
-- Run this in your Supabase SQL Editor to check what happened

-- Check if deletion columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'coaches' 
AND column_name IN ('deleted_at', 'deletion_reason', 'deletion_type', 'can_reactivate')
ORDER BY column_name;

-- Check current coaches table state (looking for deleted accounts)
SELECT 
    id,
    email,
    first_name,
    is_active,
    deleted_at,
    deletion_reason,
    deletion_type,
    can_reactivate,
    created_at
FROM public.coaches 
WHERE deleted_at IS NOT NULL 
OR is_active = false
LIMIT 10;

-- Check if any deletion logs exist
SELECT 
    coach_email,
    deletion_type,
    deletion_reason,
    deletion_requested_at,
    can_reactivate,
    reactivation_deadline,
    reactivated_at
FROM public.coach_deletion_log 
ORDER BY deletion_requested_at DESC
LIMIT 5;

-- Check current RLS policies on coaches table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'coaches';

-- Test if the deletion function exists and works
SELECT routine_name, routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%coach_account%';
