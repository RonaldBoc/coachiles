-- Système de tracking des actions des coaches
-- Cette table enregistre toutes les actions importantes effectuées par les coaches

CREATE TABLE IF NOT EXISTS public.coach_actions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Coach info
    coach_id UUID REFERENCES public.coaches(id) ON DELETE CASCADE,
    coach_email TEXT NOT NULL,
    
    -- Session info
    session_id UUID REFERENCES public.coach_sessions(id) ON DELETE SET NULL,
    
    -- Action details
    action_type TEXT NOT NULL, -- 'profile_save', 'photo_upload', 'lead_view', 'lead_status_change', 'subscription_purchase', etc.
    action_category TEXT NOT NULL, -- 'profile', 'leads', 'subscription', 'content', 'navigation'
    action_description TEXT NOT NULL,
    
    -- Context data
    target_id TEXT, -- ID of the affected resource (lead_id, service_id, etc.)
    target_type TEXT, -- 'lead', 'service', 'subscription', etc.
    metadata JSONB DEFAULT '{}', -- Additional action data
    
    -- Technical details
    page_url TEXT,
    user_agent TEXT,
    ip_address INET,
    
    -- Analytics
    duration_ms INTEGER, -- Time spent on action (if measurable)
    success BOOLEAN DEFAULT true,
    error_message TEXT
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_coach_actions_coach_id ON public.coach_actions(coach_id);
CREATE INDEX IF NOT EXISTS idx_coach_actions_session_id ON public.coach_actions(session_id);
CREATE INDEX IF NOT EXISTS idx_coach_actions_type ON public.coach_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_coach_actions_category ON public.coach_actions(action_category);
CREATE INDEX IF NOT EXISTS idx_coach_actions_created_at ON public.coach_actions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_coach_actions_target ON public.coach_actions(target_type, target_id);

-- Function to track a coach action
CREATE OR REPLACE FUNCTION track_coach_action(
  coach_id_param UUID,
  coach_email_param TEXT,
  action_type_param TEXT,
  action_category_param TEXT,
  action_description_param TEXT,
  session_id_param UUID DEFAULT NULL,
  target_id_param TEXT DEFAULT NULL,
  target_type_param TEXT DEFAULT NULL,
  metadata_param JSONB DEFAULT '{}',
  page_url_param TEXT DEFAULT NULL,
  user_agent_param TEXT DEFAULT NULL,
  ip_address_param INET DEFAULT NULL,
  duration_ms_param INTEGER DEFAULT NULL,
  success_param BOOLEAN DEFAULT true,
  error_message_param TEXT DEFAULT NULL
)
RETURNS UUID
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
  action_id UUID;
BEGIN
  INSERT INTO public.coach_actions (
    coach_id,
    coach_email,
    session_id,
    action_type,
    action_category,
    action_description,
    target_id,
    target_type,
    metadata,
    page_url,
    user_agent,
    ip_address,
    duration_ms,
    success,
    error_message
  ) VALUES (
    coach_id_param,
    coach_email_param,
    session_id_param,
    action_type_param,
    action_category_param,
    action_description_param,
    target_id_param,
    target_type_param,
    metadata_param,
    page_url_param,
    user_agent_param,
    ip_address_param,
    duration_ms_param,
    success_param,
    error_message_param
  ) RETURNING id INTO action_id;
  
  RETURN action_id;
END;
$$;

-- Function to get coach actions
CREATE OR REPLACE FUNCTION get_coach_actions(
  coach_id_param UUID,
  limit_param INTEGER DEFAULT 100,
  action_type_filter TEXT DEFAULT NULL,
  action_category_filter TEXT DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  created_at TIMESTAMPTZ,
  action_type TEXT,
  action_category TEXT,
  action_description TEXT,
  target_id TEXT,
  target_type TEXT,
  metadata JSONB,
  page_url TEXT,
  duration_ms INTEGER,
  success BOOLEAN,
  error_message TEXT
) 
SECURITY DEFINER
LANGUAGE sql
AS $$
  SELECT 
    ca.id,
    ca.created_at,
    ca.action_type,
    ca.action_category,
    ca.action_description,
    ca.target_id,
    ca.target_type,
    ca.metadata,
    ca.page_url,
    ca.duration_ms,
    ca.success,
    ca.error_message
  FROM public.coach_actions ca
  WHERE ca.coach_id = coach_id_param
    AND (action_type_filter IS NULL OR ca.action_type = action_type_filter)
    AND (action_category_filter IS NULL OR ca.action_category = action_category_filter)
  ORDER BY ca.created_at DESC
  LIMIT limit_param;
$$;

-- Function to get action analytics
CREATE OR REPLACE FUNCTION get_coach_action_stats(coach_id_param UUID)
RETURNS TABLE(
  total_actions BIGINT,
  actions_today BIGINT,
  actions_this_week BIGINT,
  most_common_action TEXT,
  last_action_time TIMESTAMPTZ,
  avg_session_duration NUMERIC
) 
SECURITY DEFINER
LANGUAGE sql
AS $$
  SELECT 
    COUNT(*) as total_actions,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as actions_today,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as actions_this_week,
    (
      SELECT action_type 
      FROM public.coach_actions 
      WHERE coach_id = coach_id_param 
      GROUP BY action_type 
      ORDER BY COUNT(*) DESC 
      LIMIT 1
    ) as most_common_action,
    MAX(created_at) as last_action_time,
    AVG(duration_ms) FILTER (WHERE duration_ms IS NOT NULL) as avg_session_duration
  FROM public.coach_actions
  WHERE coach_id = coach_id_param;
$$;

-- Grant permissions
GRANT SELECT ON public.coach_actions TO authenticated;
GRANT EXECUTE ON FUNCTION track_coach_action(UUID, TEXT, TEXT, TEXT, TEXT, UUID, TEXT, TEXT, JSONB, TEXT, TEXT, INET, INTEGER, BOOLEAN, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_coach_actions(UUID, INTEGER, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_coach_action_stats(UUID) TO authenticated;