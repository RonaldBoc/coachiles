-- Complete Function Cleanup and Recreation
-- This script will remove ALL existing variations and create clean functions

-- Step 1: Drop ALL possible function variations
DROP FUNCTION IF EXISTS public.soft_delete_coach_account(text);
DROP FUNCTION IF EXISTS public.soft_delete_coach_account(text, text);
DROP FUNCTION IF EXISTS public.soft_delete_coach_account(text, text, text);
DROP FUNCTION IF EXISTS public.soft_delete_coach_account(uuid);
DROP FUNCTION IF EXISTS public.soft_delete_coach_account(uuid, text);
DROP FUNCTION IF EXISTS public.soft_delete_coach_account(uuid, text, text);

DROP FUNCTION IF EXISTS public.reactivate_coach_account();
DROP FUNCTION IF EXISTS public.reactivate_coach_account(text);
DROP FUNCTION IF EXISTS public.reactivate_coach_account(uuid);

-- Step 2: Drop any other related functions that might exist
DROP FUNCTION IF EXISTS public.delete_coach_account CASCADE;
DROP FUNCTION IF EXISTS public.coach_account_deletion CASCADE;
DROP FUNCTION IF EXISTS public.account_deletion CASCADE;

-- Step 3: Now create the functions with unique, clear signatures

-- Deletion function
CREATE FUNCTION public.soft_delete_coach_account(
    p_coach_email TEXT,
    p_reason TEXT DEFAULT NULL,
    p_deletion_type TEXT DEFAULT 'user_requested'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    coach_record RECORD;
    deletion_log_id UUID;
    reactivation_deadline TIMESTAMP WITH TIME ZONE := now() + INTERVAL '30 days';
    reactivation_token UUID := uuid_generate_v4();
    authenticated_email TEXT;
BEGIN
    -- Get the authenticated user's email
    authenticated_email := auth.email();
    
    IF authenticated_email IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'User not authenticated'
        );
    END IF;
    
    -- Find the coach by email
    SELECT * INTO coach_record 
    FROM public.coaches 
    WHERE email = p_coach_email AND deleted_at IS NULL;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Coach not found or already deleted'
        );
    END IF;
    
    -- Check if user is authorized (email must match)
    IF authenticated_email != p_coach_email THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Unauthorized to delete this account'
        );
    END IF;
    
    -- Create deletion log entry
    INSERT INTO public.coach_deletion_log (
        coach_id,
        coach_email,
        coach_name,
        deletion_type,
        deletion_reason,
        deletion_requested_at,
        can_reactivate,
        reactivation_deadline,
        reactivation_token,
        deletion_method
    ) VALUES (
        coach_record.id,
        coach_record.email,
        COALESCE(coach_record.first_name, '') || ' ' || COALESCE(coach_record.last_name, ''),
        p_deletion_type,
        p_reason,
        now(),
        true,
        reactivation_deadline,
        reactivation_token,
        'api'
    ) RETURNING id INTO deletion_log_id;
    
    -- Soft delete the coach
    UPDATE public.coaches 
    SET 
        deleted_at = now(),
        deletion_reason = p_reason,
        deletion_type = p_deletion_type,
        can_reactivate = true,
        is_active = false,
        updated_at = now()
    WHERE id = coach_record.id;
    
    RETURN json_build_object(
        'success', true,
        'deletion_log_id', deletion_log_id,
        'reactivation_deadline', reactivation_deadline,
        'reactivation_token', reactivation_token,
        'message', 'Account successfully deleted. You can reactivate within 30 days.'
    );
END;
$$;

-- Reactivation function
CREATE FUNCTION public.reactivate_coach_account(
    p_reactivation_token UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    coach_record RECORD;
    log_record RECORD;
BEGIN
    -- Find the deletion log entry by token
    SELECT * INTO log_record 
    FROM public.coach_deletion_log 
    WHERE reactivation_token = p_reactivation_token
    AND can_reactivate = true
    AND reactivation_deadline > now()
    AND reactivated_at IS NULL
    ORDER BY created_at DESC 
    LIMIT 1;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Invalid token, reactivation period expired, or account already reactivated'
        );
    END IF;
    
    -- Find the coach
    SELECT * INTO coach_record 
    FROM public.coaches 
    WHERE id = log_record.coach_id 
    AND deleted_at IS NOT NULL;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Coach not found or not deleted'
        );
    END IF;
    
    -- Reactivate the coach
    UPDATE public.coaches 
    SET 
        deleted_at = NULL,
        deletion_reason = NULL,
        deletion_type = NULL,
        can_reactivate = NULL,
        is_active = true,
        updated_at = now()
    WHERE id = coach_record.id;
    
    -- Update deletion log
    UPDATE public.coach_deletion_log 
    SET 
        reactivated_at = now(),
        can_reactivate = false
    WHERE id = log_record.id;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Account successfully reactivated',
        'coach_id', coach_record.id
    );
END;
$$;

-- Step 4: Grant permissions
GRANT EXECUTE ON FUNCTION public.soft_delete_coach_account(TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reactivate_coach_account(UUID) TO authenticated;

-- Step 5: Verify functions were created
SELECT 
    r.routine_name,
    r.routine_type,
    r.data_type as return_type,
    array_to_string(array_agg(p.parameter_name || ' ' || p.data_type ORDER BY p.ordinal_position), ', ') as parameters
FROM information_schema.routines r
LEFT JOIN information_schema.parameters p ON r.specific_name = p.specific_name
WHERE r.routine_schema = 'public' 
AND r.routine_name LIKE '%coach_account%'
GROUP BY r.routine_name, r.routine_type, r.data_type
ORDER BY r.routine_name;
