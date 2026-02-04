-- Create sample session data for testing
-- This will populate the coach_sessions table with realistic test data

-- First, enable the sample data section from the schema
INSERT INTO public.coach_sessions (coach_id, coach_email, session_start, session_end, duration_minutes, ip_address, user_agent, status, logout_reason)
SELECT 
  c.id,
  c.email,
  NOW() - (random() * interval '7 days'),
  NOW() - (random() * interval '6 days'),
  (random() * 180 + 10)::INTEGER,
  ('192.168.' || floor(random() * 255) || '.' || floor(random() * 255))::INET,
  CASE floor(random() * 3)
    WHEN 0 THEN 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    WHEN 1 THEN 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
    ELSE 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  END,
  'ended',
  CASE floor(random() * 4)
    WHEN 0 THEN 'manual'
    WHEN 1 THEN 'timeout'
    WHEN 2 THEN 'expired'
    ELSE 'manual'
  END
FROM public.coaches c
LIMIT 50; -- Generate 50 sample sessions

-- Also add some active sessions
INSERT INTO public.coach_sessions (coach_id, coach_email, session_start, ip_address, user_agent, status)
SELECT 
  c.id,
  c.email,
  NOW() - (random() * interval '2 hours'),
  ('192.168.' || floor(random() * 255) || '.' || floor(random() * 255))::INET,
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'active'
FROM public.coaches c
LIMIT 5; -- 5 active sessions

-- Add some suspicious sessions
INSERT INTO public.coach_sessions (coach_id, coach_email, session_start, session_end, duration_minutes, ip_address, user_agent, status, logout_reason, is_suspicious)
SELECT 
  c.id,
  c.email,
  NOW() - (random() * interval '10 days'),
  NOW() - (random() * interval '9 days'),
  (random() * 30 + 5)::INTEGER, -- Shorter suspicious sessions
  ('10.0.' || floor(random() * 255) || '.' || floor(random() * 255))::INET,
  'SuspiciousBot/1.0',
  'ended',
  'forced',
  true
FROM public.coaches c
LIMIT 3; -- 3 suspicious sessions

-- Show results
SELECT 
  COUNT(*) as total_sessions,
  COUNT(*) FILTER (WHERE status = 'active') as active_sessions,
  COUNT(*) FILTER (WHERE status = 'ended') as ended_sessions,
  COUNT(*) FILTER (WHERE is_suspicious = true) as suspicious_sessions
FROM public.coach_sessions;