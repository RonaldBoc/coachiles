import { supabase } from '@/utils/supabase'

// Clean restored file
export type AdminCoach = {
  id: string
  email: string
  first_name?: string | null
  last_name?: string | null
  created_at?: string | null
  is_active?: boolean | null
  disabled_reason?: string | null
  subscription_type?: string | null
}
export type AdminLead = {
  id: string
  client_name: string
  client_email: string
  status: string
  coach_id: string | null
  created_at: string
  is_hidden?: boolean
}
export type AdminDeletionLog = {
  id: string
  coach_id: string | null
  reason: string | null
  deletion_type: string | null
  deletion_requested_at: string
  reactivation_deadline: string | null
  reactivated_at: string | null
  coach_name?: string | null
}
export type CoachSubscriptionSummary = {
  id: string
  subscription_type: 'free' | 'premium' | string
  plan_name?: string | null
  current_period_start?: string | null
  current_period_end?: string | null
  subscription_status?: string | null
  auto_renew?: boolean | null
}
export type PaymentRow = {
  id: string
  created_at: string
  amount: number
  currency: string
  status: string
  payment_type: string
  transaction_id: string | null
  description: string | null
  coach_earnings: number
}
export type AdminReview = {
  id: string
  created_at: string
  updated_at: string
  coach_id: string
  client_name: string
  client_email: string
  rating: number
  comment?: string | null
  moderation_status: string
  is_published: boolean
  is_verified: boolean
  coach_response?: string | null
  coach_response_hidden?: boolean | null
}

interface RowsLike {
  rows?: unknown[]
}
function parseAdminList(value: unknown): unknown[] {
  if (Array.isArray(value)) return value
  if (value && typeof value === 'object' && Array.isArray((value as RowsLike).rows))
    return (value as RowsLike).rows as unknown[]
  return []
}

export const AdminApi = {
  _superadminCache: null as boolean | null,
  async isSuperadmin(): Promise<boolean> {
    try {
      const { data: userRes } = await supabase.auth.getUser()
      const email = userRes.user?.email
      if (!email) return false
      try {
        const { data, error } = await supabase.rpc('is_superadmin', { p_email: email })
        if (error) throw error
        const ok = data === true
        this._superadminCache = ok
        return ok
      } catch {
        const envAdminsRaw = import.meta.env.VITE_SUPERADMINS || ''
        const list = envAdminsRaw
          .split(/[;,\s]+/)
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean)
        const ok = list.includes((email || '').toLowerCase())
        this._superadminCache = ok
        return ok
      }
    } catch {
      this._superadminCache = false
      return false
    }
  },
  async listCoaches(): Promise<{ data: AdminCoach[]; error?: string }> {
    try {
      const { data: userRes } = await supabase.auth.getUser()
      const email = userRes.user?.email || ''
      if (this._superadminCache === null) await this.isSuperadmin()
      if (this._superadminCache) {
        try {
          const { data, error } = await supabase.rpc('admin_list_coaches', { p_email: email })
          if (!error && data) return { data: parseAdminList(data) as AdminCoach[] }
        } catch {}
      }
      const { data, error } = await supabase
        .from('coaches')
        .select('id,email,first_name,last_name,created_at,is_active,disabled_reason')
        .order('created_at', { ascending: false })
        .limit(500)
      if (error) throw error
      return { data: (data || []) as AdminCoach[] }
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Failed to load coaches' }
    }
  },
  async listLeads(): Promise<{ data: AdminLead[]; error?: string }> {
    try {
      const { data: userRes } = await supabase.auth.getUser()
      const email = userRes.user?.email || ''
      if (this._superadminCache === null) await this.isSuperadmin()
      if (this._superadminCache) {
        try {
          const { data, error } = await supabase.rpc('admin_list_leads', { p_email: email })
          if (!error && data) return { data: parseAdminList(data) as AdminLead[] }
        } catch {}
      }
      const { data, error } = await supabase
        .from('leads')
        .select('id, client_name, client_email, status, coach_id, created_at, is_hidden')
        .order('created_at', { ascending: false })
        .limit(500)
      if (error) throw error
      return { data: (data || []) as AdminLead[] }
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Failed to load leads' }
    }
  },
  async listLeadsForCoach(coachId: string): Promise<{ data: AdminLead[]; error?: string }> {
    try {
      const { data: userRes } = await supabase.auth.getUser()
      const email = userRes.user?.email || ''
      if (this._superadminCache === null) await this.isSuperadmin()
      if (!this._superadminCache) throw new Error('forbidden')
      const { data, error } = await supabase.rpc('admin_list_leads_for_coach', {
        p_email: email,
        p_coach_id: coachId,
      })
      if (error) throw error
      return { data: (data || []) as AdminLead[] }
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Failed to load coach leads' }
    }
  },
  async setLeadHidden(
    leadId: string,
    hidden: boolean,
  ): Promise<{ ok: boolean; error?: string; hidden?: boolean }> {
    try {
      const { data: userRes } = await supabase.auth.getUser()
      const email = userRes.user?.email || ''
      if (this._superadminCache === null) await this.isSuperadmin()
      if (!this._superadminCache) throw new Error('forbidden')
      const { data, error } = await supabase.rpc('admin_set_lead_hidden', {
        p_email: email,
        p_lead_id: leadId,
        p_hidden: hidden,
      })
      if (error) throw error
      const out = (data || {}) as { success?: boolean; is_hidden?: boolean }
      return { ok: out.success === true, hidden: out.is_hidden }
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : 'Failed to update lead' }
    }
  },
  async deleteLead(leadId: string): Promise<{ ok: boolean; error?: string }> {
    try {
      const { data: userRes } = await supabase.auth.getUser()
      const email = userRes.user?.email || ''
      if (this._superadminCache === null) await this.isSuperadmin()
      if (!this._superadminCache) throw new Error('forbidden')
      const { data, error } = await supabase.rpc('admin_delete_lead', {
        p_email: email,
        p_lead_id: leadId,
      })
      if (error) throw error
      const out = (data || {}) as { success?: boolean }
      return { ok: out.success === true }
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : 'Failed to delete lead' }
    }
  },
  async getLeadDetails(leadId: string): Promise<{
    data: { lead: Record<string, unknown> | null; coach_ids: string[] }
    error?: string
  }> {
    try {
      const { data: userRes } = await supabase.auth.getUser()
      const email = userRes.user?.email || ''
      if (this._superadminCache === null) await this.isSuperadmin()
      if (!this._superadminCache) throw new Error('forbidden')
      const { data, error } = await supabase.rpc('admin_get_lead_details', {
        p_email: email,
        p_lead_id: leadId,
      })
      if (error) throw error
      const out = (data || {}) as { lead?: Record<string, unknown> | null; coach_ids?: string[] }
      return { data: { lead: out.lead ?? null, coach_ids: out.coach_ids ?? [] } }
    } catch (err) {
      return {
        data: { lead: null, coach_ids: [] },
        error: err instanceof Error ? err.message : 'Failed to get lead',
      }
    }
  },
  async duplicateLead(
    leadId: string,
    targetCoachIds: string[],
  ): Promise<{ ok: boolean; error?: string; created?: string[] }> {
    try {
      const { data: userRes } = await supabase.auth.getUser()
      const email = userRes.user?.email || ''
      if (this._superadminCache === null) await this.isSuperadmin()
      if (!this._superadminCache) throw new Error('forbidden')
      const { data, error } = await supabase.rpc('admin_duplicate_lead', {
        p_email: email,
        p_lead_id: leadId,
        p_target_coach_ids: targetCoachIds,
      })
      if (error) throw error
      const out = (data || {}) as { success?: boolean; created_ids?: string[] }
      return { ok: out.success === true, created: out.created_ids }
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : 'Failed to duplicate lead' }
    }
  },
  async listDeletionLogs(): Promise<{ data: AdminDeletionLog[]; error?: string }> {
    try {
      const { data: userRes } = await supabase.auth.getUser()
      const email = userRes.user?.email || ''
      if (this._superadminCache === null) await this.isSuperadmin()
      if (this._superadminCache) {
        try {
          const { data, error } = await supabase.rpc('admin_list_deletion_logs', { p_email: email })
          if (!error && data) return { data: parseAdminList(data) as AdminDeletionLog[] }
        } catch {}
      }
      const { data, error } = await supabase
        .from('coach_deletion_log')
        .select(
          'id, coach_id, deletion_reason, deletion_type, deletion_requested_at, reactivation_deadline, reactivated_at',
        )
        .order('deletion_requested_at', { ascending: false })
        .limit(500)
      if (error) throw error
      const mapped = (
        (data || []) as Array<AdminDeletionLog & { deletion_reason?: string | null }>
      ).map((row) => ({
        ...row,
        reason: row.deletion_reason ?? row.reason ?? null,
      })) as AdminDeletionLog[]
      return { data: mapped }
    } catch (err) {
      return {
        data: [],
        error: err instanceof Error ? err.message : 'Failed to load deletion logs',
      }
    }
  },
  async getCoachSubscriptionMap(): Promise<{
    data: Record<string, CoachSubscriptionSummary>
    error?: string
  }> {
    try {
      const { data, error } = await supabase
        .from('coaches_current_subscription')
        .select(
          'id, subscription_type, plan_name, current_period_start, current_period_end, subscription_status, auto_renew',
        )
        .limit(2000)
      if (error) throw error
      const map: Record<string, CoachSubscriptionSummary> = {}
      ;(data || []).forEach((row) => {
        const r = row as unknown as CoachSubscriptionSummary
        map[r.id] = r
      })
      return { data: map }
    } catch (err) {
      return {
        data: {},
        error: err instanceof Error ? err.message : 'Failed to load subscriptions',
      }
    }
  },
  async getCoachDetails(coachId: string): Promise<{
    data: {
      coach: Record<string, unknown> | null
      subscription: CoachSubscriptionSummary | null
      payments: PaymentRow[]
    }
    error?: string
  }> {
    try {
      const { data: userRes } = await supabase.auth.getUser()
      const email = userRes.user?.email || ''
      if (this._superadminCache === null) await this.isSuperadmin()
      if (!this._superadminCache) throw new Error('forbidden')
      const { data, error } = await supabase.rpc('admin_get_coach_details', {
        p_email: email,
        p_coach_id: coachId,
      })
      if (error) throw error
      const value = (data || {}) as Record<string, unknown>
      return {
        data: {
          coach: (value.coach as Record<string, unknown>) ?? null,
          subscription: (value.subscription as CoachSubscriptionSummary) ?? null,
          payments: ((value.payments as PaymentRow[]) ?? []) as PaymentRow[],
        },
      }
    } catch (err) {
      return {
        data: { coach: null, subscription: null, payments: [] },
        error: err instanceof Error ? err.message : 'Failed to load coach details',
      }
    }
  },
  async setCoachSubscription(
    coachId: string,
    planType: 'free' | 'premium',
    periodStart?: string,
    periodEnd?: string,
  ): Promise<{ ok: boolean; error?: string }> {
    try {
      const { data: userRes } = await supabase.auth.getUser()
      const email = userRes.user?.email || ''
      if (this._superadminCache === null) await this.isSuperadmin()
      if (!this._superadminCache) throw new Error('forbidden')
      const { data, error } = await supabase.rpc('admin_set_coach_subscription', {
        p_email: email,
        p_coach_id: coachId,
        p_plan_type: planType,
        p_period_start: periodStart ?? null,
        p_period_end: periodEnd ?? null,
      })
      if (error) throw error
      const out = (data || {}) as { success?: boolean }
      return { ok: out.success === true }
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : 'Failed to set subscription' }
    }
  },
  async cancelCoachSubscription(
    coachId: string,
    mode: 'at_period_end' | 'at_date' | 'immediate',
    endDate?: string,
  ): Promise<{
    ok: boolean
    error?: string
    data?: {
      success?: boolean
      mode?: string
      current_period_end?: string | null
      effective_date?: string | null
    }
  }> {
    try {
      const { data: userRes } = await supabase.auth.getUser()
      const email = userRes.user?.email || ''
      if (this._superadminCache === null) await this.isSuperadmin()
      if (!this._superadminCache) throw new Error('forbidden')
      const { data, error } = await supabase.rpc('admin_cancel_subscription', {
        p_email: email,
        p_coach_id: coachId,
        p_mode: mode,
        p_end_date: endDate ?? null,
      })
      if (error) throw error
      const out = (data || {}) as {
        success?: boolean
        mode?: string
        current_period_end?: string | null
        effective_date?: string | null
      }
      return { ok: out.success === true, data: out }
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : 'Failed to cancel' }
    }
  },
  async listPaymentsForCoach(coachId: string): Promise<{ data: PaymentRow[]; error?: string }> {
    try {
      const { data: userRes } = await supabase.auth.getUser()
      const email = userRes.user?.email || ''
      if (this._superadminCache === null) await this.isSuperadmin()
      if (!this._superadminCache) throw new Error('forbidden')
      const { data, error } = await supabase.rpc('admin_list_payments_for_coach', {
        p_email: email,
        p_coach_id: coachId,
      })
      if (error) throw error
      const rows = parseAdminList(data) as PaymentRow[]
      return { data: rows }
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Failed to load payments' }
    }
  },
  async setCoachActive(
    coachId: string,
    active: boolean,
    reason?: string,
  ): Promise<{ ok: boolean; error?: string }> {
    try {
      const { data: userRes } = await supabase.auth.getUser()
      const email = userRes.user?.email || ''
      if (this._superadminCache === null) await this.isSuperadmin()
      if (!this._superadminCache) throw new Error('forbidden')
      const { data, error } = await supabase.rpc('admin_set_coach_active', {
        p_email: email,
        p_coach_id: coachId,
        p_active: active,
        p_reason: reason ?? null,
      })
      if (error) throw error
      const out = (data || {}) as { success?: boolean }
      return { ok: out.success === true }
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : 'Failed to update status' }
    }
  },
  async listReviews(options?: {
    status?: string
    coachId?: string
    limit?: number
  }): Promise<{ data: AdminReview[]; error?: string }> {
    try {
      const { data: userRes } = await supabase.auth.getUser()
      const email = userRes.user?.email || ''
      if (this._superadminCache === null) await this.isSuperadmin()
      if (!this._superadminCache) throw new Error('forbidden')
      const { data, error } = await supabase.rpc('admin_list_reviews', {
        p_email: email,
        p_status: options?.status ?? null,
        p_coach_id: options?.coachId ?? null,
        p_limit: options?.limit ?? 500,
      })
      if (error) throw error
      return { data: (data || []) as AdminReview[] }
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Failed to load reviews' }
    }
  },
  async approveReview(reviewId: string, note?: string): Promise<{ ok: boolean; error?: string }> {
    try {
      const { data: userRes } = await supabase.auth.getUser()
      const email = userRes.user?.email || ''
      if (this._superadminCache === null) await this.isSuperadmin()
      if (!this._superadminCache) throw new Error('forbidden')
      const { data, error } = await supabase.rpc('approve_review', {
        p_review_id: reviewId,
        p_admin_email: email,
        p_notes: note ?? null,
      })
      if (error) throw error
      return { ok: !!data }
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : 'Failed to approve review' }
    }
  },
  async rejectReview(reviewId: string, note?: string): Promise<{ ok: boolean; error?: string }> {
    try {
      const { data: userRes } = await supabase.auth.getUser()
      const email = userRes.user?.email || ''
      if (this._superadminCache === null) await this.isSuperadmin()
      if (!this._superadminCache) throw new Error('forbidden')
      const { data, error } = await supabase.rpc('reject_review', {
        p_review_id: reviewId,
        p_admin_email: email,
        p_notes: note ?? null,
      })
      if (error) throw error
      return { ok: !!data }
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : 'Failed to reject review' }
    }
  },
  async hideCoachResponse(
    reviewId: string,
    hide: boolean,
    note?: string,
  ): Promise<{ ok: boolean; error?: string }> {
    try {
      const { data: userRes } = await supabase.auth.getUser()
      const email = userRes.user?.email || ''
      if (this._superadminCache === null) await this.isSuperadmin()
      if (!this._superadminCache) throw new Error('forbidden')
      const { data, error } = await supabase.rpc('admin_hide_coach_response', {
        p_review_id: reviewId,
        p_admin_email: email,
        p_hide: hide,
        p_notes: note ?? null,
      })
      if (error) throw error
      return { ok: !!data }
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : 'Failed to hide coach response',
      }
    }
  },
  async deleteReview(reviewId: string, note?: string): Promise<{ ok: boolean; error?: string }> {
    try {
      const { data: userRes } = await supabase.auth.getUser()
      const email = userRes.user?.email || ''
      if (this._superadminCache === null) await this.isSuperadmin()
      if (!this._superadminCache) throw new Error('forbidden')
      const { data, error } = await supabase.rpc('admin_delete_review', {
        p_review_id: reviewId,
        p_admin_email: email,
        p_notes: note ?? null,
      })
      if (error) throw error
      return { ok: !!data }
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : 'Failed to delete review' }
    }
  },
}

export default AdminApi
