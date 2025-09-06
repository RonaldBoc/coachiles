// Centralized lead unlocking logic
// Determines which lead IDs are unlocked for a coach based on subscription status.

export interface UnlockableLeadLike {
  id: string
  created_at?: string
  client_email?: string | null
  is_hidden?: boolean | null
  do_not_contact?: boolean | null
  is_completed?: boolean | null
  current_step?: number | null
}

export type SubscriptionStatus = 'active' | 'trial' | 'inactive' | undefined | null

// Compute unlocked lead IDs using business rules:
// 1. Base visibility: not hidden, not do_not_contact, completed OR step >=3
// 2. Active/trial => all visible leads unlocked
// 3. Inactive/free => only leads belonging to first 2 distinct email buckets (oldest-first),
//    subsequent distinct emails remain locked, but duplicates of already unlocked emails allowed.
export function computeUnlockedLeadIds(
  allLeads: UnlockableLeadLike[],
  subscriptionStatus: SubscriptionStatus,
): Set<string> {
  if (!allLeads?.length) return new Set()

  const visible = allLeads.filter(
    (l) =>
      !l.is_hidden &&
      !l.do_not_contact &&
      (l.is_completed || (typeof l.current_step === 'number' && (l.current_step ?? 0) >= 3)),
  )

  if (subscriptionStatus === 'active' || subscriptionStatus === 'trial') {
    return new Set(visible.map((l) => l.id))
  }

  const maxDistinct = 2
  const emailBuckets = new Set<string>()
  const unlocked: string[] = []
  const chronological = visible
    .slice()
    .sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime())
  for (const lead of chronological) {
    const bucket = (lead.client_email || '').trim().toLowerCase() || '__no_email__'
    if (emailBuckets.has(bucket)) {
      unlocked.push(lead.id)
      continue
    }
    if (emailBuckets.size < maxDistinct) {
      emailBuckets.add(bucket)
      unlocked.push(lead.id)
    }
  }
  return new Set(unlocked)
}

export function filterUnlockedLeads<T extends UnlockableLeadLike>(
  leads: T[],
  subscriptionStatus: SubscriptionStatus,
): T[] {
  const unlocked = computeUnlockedLeadIds(leads, subscriptionStatus)
  return leads.filter((l) => unlocked.has(l.id))
}
