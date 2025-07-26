-- Test script to check current leads table structure
-- Run this in Supabase SQL editor

-- Check if leads table exists and its structure
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'leads' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check existing leads data
SELECT COUNT(*) as total_leads FROM public.leads;

-- Sample of existing data
SELECT 
  id, 
  created_at,
  status,
  client_name,
  client_email,
  goals,
  current_step
FROM public.leads 
ORDER BY created_at DESC 
LIMIT 5;
