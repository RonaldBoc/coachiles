import { supabase } from '@/utils/supabase'

export type NotificationPrefs = {
  email_new_lead: boolean
  email_new_review: boolean
  email_system?: boolean
  email_marketing?: boolean
}

async function getUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user?.id) throw new Error('Utilisateur non connecté')
  return data.user.id
}

export async function getMyNotificationPrefs(): Promise<NotificationPrefs> {
  const userId = await getUserId()
  const { data, error } = await supabase
    .from('notification_preferences')
    .select('email_new_lead, email_new_review, email_system, email_marketing')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error

  if (!data) {
    // Insert defaults (email_new_lead/email_new_review default true in DB), return the row
    const { data: inserted, error: insErr } = await supabase
      .from('notification_preferences')
      .insert({ user_id: userId })
      .select('email_new_lead, email_new_review, email_system, email_marketing')
      .single()
    if (insErr) throw insErr
    return inserted as NotificationPrefs
  }
  return data as NotificationPrefs
}

export async function updateMyNotificationPrefs(patch: Partial<NotificationPrefs>): Promise<void> {
  const userId = await getUserId()
  const { error } = await supabase
    .from('notification_preferences')
    .update(patch)
    .eq('user_id', userId)
  if (error) throw error
}
