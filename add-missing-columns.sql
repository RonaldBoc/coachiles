-- Add missing columns to coaches table for enhanced profile
-- Run this in your Supabase SQL Editor

-- Add hourly_rate column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'coaches' AND column_name = 'hourly_rate') THEN
        ALTER TABLE public.coaches ADD COLUMN hourly_rate DECIMAL(10,2) DEFAULT 50;
    END IF;
END $$;

-- Add languages column if it doesn't exist  
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'coaches' AND column_name = 'languages') THEN
        ALTER TABLE public.coaches ADD COLUMN languages TEXT[] DEFAULT '{"Français"}';
    END IF;
END $$;

-- Update existing coaches to have default values
UPDATE public.coaches 
SET 
    hourly_rate = COALESCE(hourly_rate, 50),
    languages = COALESCE(languages, '{"Français"}')
WHERE hourly_rate IS NULL OR languages IS NULL;

-- Verify the new columns
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'coaches' 
AND column_name IN ('hourly_rate', 'languages')
ORDER BY column_name;
