-- Verification Script: Check Coach Services Setup
-- Run this to verify that services are properly linked to coaches

-- 1. Check if coaches exist
SELECT 
  id,
  first_name,
  email,
  specialties
FROM coaches 
WHERE is_active = true
ORDER BY first_name;

-- 2. Check if coach_services table exists and has data
SELECT 
  COUNT(*) as total_services,
  COUNT(DISTINCT coach_id) as coaches_with_services
FROM coach_services 
WHERE is_active = true;

-- 3. Show services by coach
SELECT 
  c.first_name as coach_name,
  c.email,
  cs.title as service_title,
  cs.category,
  cs.solo_price,
  cs.group_price,
  cs.duration,
  cs.can_be_solo,
  cs.can_be_group
FROM coaches c
LEFT JOIN coach_services cs ON c.id = cs.coach_id AND cs.is_active = true
WHERE c.is_active = true
ORDER BY c.first_name, cs.title;

-- 4. Check for any issues
SELECT 
  'Missing coach_id references' as issue_type,
  COUNT(*) as count
FROM coach_services cs
LEFT JOIN coaches c ON cs.coach_id = c.id
WHERE c.id IS NULL

UNION ALL

SELECT 
  'Services without pricing' as issue_type,
  COUNT(*) as count
FROM coach_services 
WHERE (solo_price IS NULL AND group_price IS NULL)

UNION ALL

SELECT 
  'Services without delivery method' as issue_type,
  COUNT(*) as count
FROM coach_services 
WHERE (can_be_solo = false AND can_be_group = false);
