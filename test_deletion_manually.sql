-- Test Account Deletion Function Directly
-- Run this to manually test the deletion function

-- First, let's see what your current email is (if you're logged in via Supabase auth)
SELECT auth.email() as current_authenticated_email;

-- Let's find your coach record
SELECT 
    id,
    email,
    first_name,
    is_active,
    deleted_at,
    created_at
FROM public.coaches 
ORDER BY created_at DESC 
LIMIT 5;

-- Let's manually test the deletion function with a specific email
-- REPLACE 'your-email@example.com' with your actual email
SELECT public.soft_delete_coach_account(
    'your-email@example.com',  -- Replace this with your actual email
    'Testing deletion manually',
    'user_requested'
) as deletion_result;

-- Check if it worked
SELECT 
    id,
    email,
    first_name,
    is_active,
    deleted_at,
    deletion_reason,
    deletion_type
FROM public.coaches 
WHERE email = 'your-email@example.com';  -- Replace this with your actual email

-- Check deletion log
SELECT 
    coach_email,
    deletion_reason,
    deletion_requested_at,
    reactivation_deadline,
    can_reactivate
FROM public.coach_deletion_log 
WHERE coach_email = 'your-email@example.com'  -- Replace this with your actual email
ORDER BY deletion_requested_at DESC;
