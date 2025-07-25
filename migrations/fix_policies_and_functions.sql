-- Quick fix for policy already exists error
-- Run this instead if you're getting the policy already exists error

-- First, drop existing policies to clean slate
DROP POLICY IF EXISTS "Anyone can view active coaches" ON public.coaches;
DROP POLICY IF EXISTS "Anyone can view active non-deleted coaches" ON public.coaches;
DROP POLICY IF EXISTS "Coaches can delete their own profile" ON public.coaches;
DROP POLICY IF EXISTS "Coaches can soft delete their own profile" ON public.coaches;

-- Recreate the policies we need
CREATE POLICY "Anyone can view active non-deleted coaches" ON public.coaches
    FOR SELECT USING (is_active = true AND deleted_at IS NULL);

CREATE POLICY "Coaches can soft delete their own profile" ON public.coaches
    FOR UPDATE TO authenticated 
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Now create just the functions (skip the table creation if they exist)
CREATE OR REPLACE FUNCTION public.soft_delete_coach_account(
    p_user_id UUID,
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
BEGIN
    -- Find the coach by user_id
    SELECT * INTO coach_record 
    FROM public.coaches 
    WHERE user_id = p_user_id AND deleted_at IS NULL;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Coach not found or already deleted'
        );
    END IF;
    
    -- Check if user is authorized
    IF auth.uid() != p_user_id THEN
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

CREATE OR REPLACE FUNCTION public.reactivate_coach_account(
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.soft_delete_coach_account TO authenticated;
GRANT EXECUTE ON FUNCTION public.reactivate_coach_account TO authenticated;
