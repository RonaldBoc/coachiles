-- Table pour tracker les sessions des coaches
-- Cette table enregistre chaque connexion avec des détails complets

CREATE TABLE IF NOT EXISTS public.coach_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Coach info
    coach_id UUID REFERENCES public.coaches(id) ON DELETE CASCADE,
    coach_email TEXT NOT NULL,
    
    -- Session info
    session_start TIMESTAMP WITH TIME ZONE NOT NULL,
    session_end TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    
    -- Connection details
    ip_address INET,
    user_agent TEXT,
    device_info JSONB DEFAULT '{}',
    location_info JSONB DEFAULT '{}',
    
    -- Session status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'ended', 'expired')),
    logout_reason TEXT CHECK (logout_reason IN ('manual', 'timeout', 'forced', 'expired')),
    
    -- Security
    is_suspicious BOOLEAN DEFAULT false,
    security_flags TEXT[]
);

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS idx_coach_sessions_coach_id ON public.coach_sessions(coach_id);
CREATE INDEX IF NOT EXISTS idx_coach_sessions_start_time ON public.coach_sessions(session_start DESC);
CREATE INDEX IF NOT EXISTS idx_coach_sessions_ip ON public.coach_sessions(ip_address);

-- Function to get coach sessions
CREATE OR REPLACE FUNCTION get_coach_sessions(coach_id_param UUID, limit_param INTEGER DEFAULT 50)
RETURNS TABLE(
  id UUID,
  session_start TIMESTAMPTZ,
  session_end TIMESTAMPTZ,
  duration_minutes INTEGER,
  ip_address INET,
  user_agent TEXT,
  device_info JSONB,
  location_info JSONB,
  status TEXT,
  logout_reason TEXT,
  is_suspicious BOOLEAN
) 
SECURITY DEFINER
LANGUAGE sql
AS $$
  SELECT 
    cs.id,
    cs.session_start,
    cs.session_end,
    cs.duration_minutes,
    cs.ip_address,
    cs.user_agent,
    cs.device_info,
    cs.location_info,
    cs.status,
    cs.logout_reason,
    cs.is_suspicious
  FROM public.coach_sessions cs
  WHERE cs.coach_id = coach_id_param
  ORDER BY cs.session_start DESC
  LIMIT limit_param;
$$;

-- Function to log a new session
CREATE OR REPLACE FUNCTION log_coach_session(
  coach_id_param UUID,
  coach_email_param TEXT,
  ip_param INET DEFAULT NULL,
  user_agent_param TEXT DEFAULT NULL,
  device_info_param JSONB DEFAULT '{}'
)
RETURNS UUID
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
  session_id UUID;
  location_info_extracted JSONB;
BEGIN
  -- First, mark any existing active sessions as ended for this coach
  UPDATE public.coach_sessions 
  SET 
    session_end = NOW(),
    duration_minutes = EXTRACT(EPOCH FROM (NOW() - session_start)) / 60,
    status = 'ended',
    logout_reason = 'new_session'
  WHERE coach_id = coach_id_param AND status = 'active';
  
  -- Extract location_info from device_info if present
  location_info_extracted := COALESCE(device_info_param->'location_info', '{}');
  
  INSERT INTO public.coach_sessions (
    coach_id,
    coach_email,
    session_start,
    ip_address,
    user_agent,
    device_info,
    location_info,
    status
  ) VALUES (
    coach_id_param,
    coach_email_param,
    NOW(),
    ip_param,
    user_agent_param,
    device_info_param,
    location_info_extracted,
    'active'
  ) RETURNING id INTO session_id;
  
  RETURN session_id;
END;
$$;

-- Function to end a session
CREATE OR REPLACE FUNCTION end_coach_session(
  session_id_param UUID,
  logout_reason_param TEXT DEFAULT 'manual'
)
RETURNS BOOLEAN
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.coach_sessions 
  SET 
    session_end = NOW(),
    duration_minutes = EXTRACT(EPOCH FROM (NOW() - session_start)) / 60,
    status = 'ended',
    logout_reason = logout_reason_param
  WHERE id = session_id_param AND status = 'active';
  
  RETURN FOUND;
END;
$$;

-- Grant permissions
GRANT SELECT ON public.coach_sessions TO authenticated;
GRANT EXECUTE ON FUNCTION get_coach_sessions(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION log_coach_session(UUID, TEXT, INET, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION end_coach_session(UUID, TEXT) TO authenticated;

-- Sample session data for testing (uncomment if you want test data)
/*
INSERT INTO public.coach_sessions (coach_id, coach_email, session_start, session_end, duration_minutes, ip_address, user_agent, status, logout_reason)
SELECT 
  c.id,
  c.email,
  NOW() - (random() * interval '7 days'),
  NOW() - (random() * interval '6 days'),
  (random() * 180 + 10)::INTEGER,
  ('192.168.' || floor(random() * 255) || '.' || floor(random() * 255))::INET,
  CASE floor(random() * 3)
    WHEN 0 THEN 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    WHEN 1 THEN 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15'
    ELSE 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  END,
  'ended',
  'manual'
FROM public.coaches c
LIMIT 100;
*/