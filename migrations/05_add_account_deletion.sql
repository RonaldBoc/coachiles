-- Account Deletion Schema Migration
-- Run this migration to add deletion capabilities to the coaches table

-- Add deletion tracking fields to coaches table
DO $$ 
BEGIN
    -- Add deleted_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'coaches' AND column_name = 'deleted_at') THEN
        ALTER TABLE public.coaches ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Add deletion_reason column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'coaches' AND column_name = 'deletion_reason') THEN
        ALTER TABLE public.coaches ADD COLUMN deletion_reason TEXT;
    END IF;

    -- Add can_reactivate column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'coaches' AND column_name = 'can_reactivate') THEN
        ALTER TABLE public.coaches ADD COLUMN can_reactivate BOOLEAN DEFAULT true;
    END IF;

    -- Add deletion_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'coaches' AND column_name = 'deletion_type') THEN
        ALTER TABLE public.coaches ADD COLUMN deletion_type TEXT CHECK (deletion_type IN ('user_requested', 'admin_action', 'gdpr_request', 'inactive_cleanup'));
    END IF;
END $$;

-- Create deletion log table for audit trail
CREATE TABLE IF NOT EXISTS public.coach_deletion_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Coach reference (keep even after coach deletion for audit)
    coach_id UUID NOT NULL REFERENCES public.coaches(id),
    coach_email TEXT NOT NULL,
    coach_name TEXT NOT NULL,
    
    -- Deletion details
    deletion_type TEXT NOT NULL CHECK (deletion_type IN ('user_requested', 'admin_action', 'gdpr_request', 'inactive_cleanup')),
    deletion_reason TEXT,
    deletion_requested_at TIMESTAMP WITH TIME ZONE NOT NULL,
    deletion_completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Reactivation tracking
    can_reactivate BOOLEAN DEFAULT true,
    reactivation_deadline TIMESTAMP WITH TIME ZONE,
    reactivation_token UUID DEFAULT uuid_generate_v4(),
    reactivated_at TIMESTAMP WITH TIME ZONE,
    
    -- Data cleanup tracking
    personal_data_anonymized_at TIMESTAMP WITH TIME ZONE,
    files_deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Additional metadata
    user_ip_address INET,
    user_agent TEXT,
    deletion_method TEXT, -- 'ui', 'api', 'admin_panel', 'automated'
    
    -- Admin who processed (if applicable)
    processed_by_admin_id UUID,
    admin_notes TEXT
);

-- Add reactivation_token column if table already exists but column doesn't
DO $$ 
BEGIN
    -- Add reactivation_token column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'coach_deletion_log' AND column_name = 'reactivation_token') THEN
        ALTER TABLE public.coach_deletion_log ADD COLUMN reactivation_token UUID DEFAULT uuid_generate_v4();
    END IF;
END $$;

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_coaches_deleted_at ON public.coaches(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_coaches_deletion_type ON public.coaches(deletion_type) WHERE deletion_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_coach_deletion_log_coach_id ON public.coach_deletion_log(coach_id);
CREATE INDEX IF NOT EXISTS idx_coach_deletion_log_deletion_type ON public.coach_deletion_log(deletion_type);
CREATE INDEX IF NOT EXISTS idx_coach_deletion_log_reactivation_deadline ON public.coach_deletion_log(reactivation_deadline) WHERE can_reactivate = true;
CREATE INDEX IF NOT EXISTS idx_coach_deletion_log_reactivation_token ON public.coach_deletion_log(reactivation_token) WHERE reactivation_token IS NOT NULL;

-- Update RLS policies to exclude deleted coaches from public views
DROP POLICY IF EXISTS "Anyone can view active coaches" ON public.coaches;

CREATE POLICY "Anyone can view active non-deleted coaches" ON public.coaches
    FOR SELECT USING (is_active = true AND deleted_at IS NULL);

-- Allow coaches to delete their own accounts
DROP POLICY IF EXISTS "Coaches can delete their own profile" ON public.coaches;

CREATE POLICY "Coaches can soft delete their own profile" ON public.coaches
    FOR UPDATE TO authenticated 
    USING (email = auth.email())
    WITH CHECK (email = auth.email());

-- RLS for deletion log (admin and system access only)
ALTER TABLE public.coach_deletion_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only system can insert deletion logs" ON public.coach_deletion_log
    FOR INSERT WITH CHECK (true); -- Allow inserts from system/functions

CREATE POLICY "Allow reading deletion logs for reactivation" ON public.coach_deletion_log
    FOR SELECT USING (true); -- Allow reads for public reactivation lookup

-- Function to soft delete a coach account
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
    result JSON;
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
    
    -- Check if user is authorized (the coach themselves)
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
    
    -- TODO: Trigger cleanup jobs
    -- - Cancel future bookings
    -- - Notify affected clients
    -- - Schedule anonymization job
    
    RETURN json_build_object(
        'success', true,
        'deletion_log_id', deletion_log_id,
        'reactivation_deadline', reactivation_deadline,
        'reactivation_token', reactivation_token,
        'message', 'Account successfully deleted. You can reactivate within 30 days.'
    );
END;
$$;

-- Function to reactivate a deleted coach account
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
    result JSON;
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

-- Comment on tables and functions
COMMENT ON TABLE public.coach_deletion_log IS 'Audit trail for coach account deletions and reactivations';
COMMENT ON FUNCTION public.soft_delete_coach_account IS 'Soft delete a coach account with 30-day reactivation window';
COMMENT ON FUNCTION public.reactivate_coach_account IS 'Reactivate a soft-deleted coach account within the grace period';

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.soft_delete_coach_account TO authenticated;
GRANT EXECUTE ON FUNCTION public.reactivate_coach_account TO authenticated;
