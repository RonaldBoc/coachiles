-- Script pour nettoyer les sessions en doublon
-- Exécuter ceci dans Supabase pour nettoyer les sessions multiples

-- 1. Marquer toutes les sessions actives précédentes comme terminées
UPDATE public.coach_sessions 
SET 
  session_end = session_start + interval '1 minute', -- Session de 1 minute par défaut
  duration_minutes = 1,
  status = 'ended',
  logout_reason = 'cleanup'
WHERE status = 'active' 
  AND session_start < NOW() - interval '1 hour'; -- Sessions de plus d'1h

-- 2. Pour chaque coach, garder seulement la session la plus récente comme active
WITH ranked_sessions AS (
  SELECT 
    id,
    coach_id,
    session_start,
    ROW_NUMBER() OVER (
      PARTITION BY coach_id 
      ORDER BY session_start DESC
    ) as rn
  FROM public.coach_sessions 
  WHERE status = 'active'
)
UPDATE public.coach_sessions 
SET 
  status = 'ended',
  session_end = session_start + interval '5 minutes',
  duration_minutes = 5,
  logout_reason = 'duplicate_cleanup'
FROM ranked_sessions 
WHERE coach_sessions.id = ranked_sessions.id 
  AND ranked_sessions.rn > 1;

-- 3. Afficher le résumé après nettoyage
SELECT 
  coach_email,
  COUNT(*) as total_sessions,
  COUNT(*) FILTER (WHERE status = 'active') as active_sessions,
  COUNT(*) FILTER (WHERE status = 'ended') as ended_sessions,
  MAX(session_start) as last_session
FROM public.coach_sessions 
GROUP BY coach_email, coach_id
ORDER BY last_session DESC;