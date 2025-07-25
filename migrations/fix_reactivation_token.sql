-- Quick fix for the reactivation_token column error
-- Run this first if you're getting the "column does not exist" error

-- Check if the coach_deletion_log table exists and add missing column
DO $$ 
BEGIN
    -- Check if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_name = 'coach_deletion_log') THEN
        
        -- Add reactivation_token column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'coach_deletion_log' AND column_name = 'reactivation_token') THEN
            ALTER TABLE public.coach_deletion_log ADD COLUMN reactivation_token UUID DEFAULT uuid_generate_v4();
            RAISE NOTICE 'Added reactivation_token column to coach_deletion_log table';
        ELSE
            RAISE NOTICE 'reactivation_token column already exists';
        END IF;
    ELSE
        RAISE NOTICE 'coach_deletion_log table does not exist yet';
    END IF;
END $$;

-- Now create the index if the column exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'coach_deletion_log' AND column_name = 'reactivation_token') THEN
        CREATE INDEX IF NOT EXISTS idx_coach_deletion_log_reactivation_token 
        ON public.coach_deletion_log(reactivation_token) 
        WHERE reactivation_token IS NOT NULL;
        RAISE NOTICE 'Created index on reactivation_token column';
    ELSE
        RAISE NOTICE 'Cannot create index: reactivation_token column does not exist';
    END IF;
END $$;
