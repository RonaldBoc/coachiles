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
  last_sign_in_at?: string | null // Add auth info
  user_id?: string | null // Link to auth.users
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
  max_leads?: number | null
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

// Diploma moderation types
export interface CoachActivityDiploma {
  id: string
  title: string
  status: 'pending' | 'approved' | 'rejected'
  proofFileName?: string
  proofFilePath?: string
  proofFileUrl?: string // legacy support
  rejectionNote?: string
}
export interface AdminDiplomaSubmission {
  coach_id: string
  coach_name: string
  coach_email: string
  diploma_id: string
  title: string
  status: 'pending' | 'approved' | 'rejected'
  proofFilePath?: string
  proofFileUrl?: string // signed (ephemeral) or legacy public URL
  proofFileName?: string
  rejectionNote?: string
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
  async setCoachMaxLeads(coachId: string, maxLeads: number): Promise<{ error?: string }> {
    try {
      // Upsert into override table (must exist in schema). If not, attempt direct update on subscriptions for active row.
      const { error } = await supabase
        .from('coach_subscription_overrides')
        .upsert(
          { coach_id: coachId, max_leads: maxLeads, updated_at: new Date().toISOString() },
          { onConflict: 'coach_id' },
        )
      if (error) throw error
      return {}
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Failed to update max leads' }
    }
  },
  // Get coach authentication info (last sign in, etc.)
  async getCoachAuthInfo(
    coachId: string,
  ): Promise<{ last_sign_in_at: string | null; user_id: string | null } | null> {
    try {
      // First get the coach to find their email
      const { data: coach, error: coachError } = await supabase
        .from('coaches')
        .select('email')
        .eq('id', coachId)
        .single()

      if (coachError || !coach) return null

      // Then use admin function to get user info from auth.users
      const { data: authData } = await supabase.rpc('get_user_auth_info', {
        user_email: coach.email,
      })

      if (authData && authData.length > 0) {
        return {
          last_sign_in_at: authData[0].last_sign_in_at,
          user_id: authData[0].id,
        }
      }

      return null
    } catch (err) {
      console.warn('Failed to get auth info for coach:', coachId, err)
      return null
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
          'id, subscription_type, plan_name, current_period_start, current_period_end, subscription_status, auto_renew, max_leads',
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
  async getCoachServices(coachId: string): Promise<{
    data: {
      id: string
      coach_id: string
      title: string
      description: string | null
      can_be_solo: boolean
      can_be_group: boolean
      solo_price: number | null
      group_price: number | null
      solo_price_unit?: string | null
      group_price_unit?: string | null
      category: string | null
      sub_category: string | null
      domain: string | null
      duration: number | null
      can_be_at_home: boolean | null
      can_be_online: boolean | null
      can_be_in_public_spaces: boolean | null
      custom_place: unknown | null
      has_free_trial: boolean | null
      free_trial_modalities: string | null
      cancellation_policy: string | null
      use_profile_availability: boolean | null
      custom_availability: unknown | null
      is_active: boolean | null
      created_at: string | null
      updated_at: string | null
    }[]
    error?: string
  }> {
    try {
      if (this._superadminCache === null) await this.isSuperadmin()
      if (!this._superadminCache) throw new Error('forbidden')
      // Fetch all services (active & inactive) for fuller picture
      const { data, error } = await supabase
        .from('coach_services')
        .select('*')
        .eq('coach_id', coachId)
        .order('created_at', { ascending: false })
        .limit(200)
      if (error) throw error
      return {
        data: (data || []) as unknown as {
          id: string
          coach_id: string
          title: string
          description: string | null
          can_be_solo: boolean
          can_be_group: boolean
          solo_price: number | null
          group_price: number | null
          solo_price_unit?: string | null
          group_price_unit?: string | null
          category: string | null
          sub_category: string | null
          domain: string | null
          duration: number | null
          can_be_at_home: boolean | null
          can_be_online: boolean | null
          can_be_in_public_spaces: boolean | null
          custom_place: unknown | null
          has_free_trial: boolean | null
          free_trial_modalities: string | null
          cancellation_policy: string | null
          use_profile_availability: boolean | null
          custom_availability: unknown | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }[],
      }
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Failed to load services' }
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
  // --- Diploma / Certification Moderation ----------------------------------
  async listDiplomaSubmissions(): Promise<{ data: AdminDiplomaSubmission[]; error?: string }> {
    try {
      interface EnvMeta {
        env?: Record<string, string | undefined>
      }
      const envMeta = (import.meta as unknown as EnvMeta).env || {}
      const bucket = envMeta.VITE_SUPABASE_DIPLOMA_BUCKET || 'diploma-proofs'
      // Fetch coaches with profile_activity JSON (limit to recent updates for efficiency)
      const { data, error } = await supabase
        .from('coaches')
        .select('id, first_name, last_name, email, profile_activity, updated_at')
        .order('updated_at', { ascending: false })
        .limit(500)
      if (error) throw error
      interface CoachRowLite {
        id: string
        first_name?: string | null
        last_name?: string | null
        email: string
        profile_activity?: { diplomas?: CoachActivityDiploma[] }
        updated_at?: string
      }
      const rows: AdminDiplomaSubmission[] = (
        (data as CoachRowLite[] | null | undefined) || []
      ).flatMap((c) => {
        const diplomas = c.profile_activity?.diplomas as CoachActivityDiploma[] | undefined
        if (!Array.isArray(diplomas)) return []
        return diplomas.map((d) => ({
          coach_id: c.id,
          coach_name: `${c.first_name || ''} ${c.last_name || ''}`.trim(),
          coach_email: c.email,
          diploma_id: d.id || '',
          title: d.title || '',
          status: d.status || 'pending',
          proofFilePath: d.proofFilePath,
          // Temporarily copy legacy URL; will be replaced with signed version below if path present
          proofFileUrl: d.proofFileUrl,
          proofFileName: d.proofFileName,
          rejectionNote: d.rejectionNote,
        }))
      })
      // Generate signed URLs for any entries that have a path but no usable url or bucket is private
      for (const r of rows) {
        if (r.proofFilePath) {
          try {
            const { data: signed, error: signErr } = await supabase.storage
              .from(bucket)
              .createSignedUrl(r.proofFilePath, 600)
            if (!signErr && signed?.signedUrl) {
              r.proofFileUrl = signed.signedUrl
            }
          } catch {
            // Non-fatal; leave URL undefined
          }
        }
      }
      // Sort pending first then recently updated
      rows.sort((a, b) => {
        const statusOrder = (s: string) => (s === 'pending' ? 0 : s === 'rejected' ? 1 : 2)
        const so = statusOrder(a.status) - statusOrder(b.status)
        if (so !== 0) return so
        return 0
      })
      return { data: rows }
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Failed to load diplomas' }
    }
  },
  async setDiplomaStatus(
    coachId: string,
    diplomaId: string,
    status: 'approved' | 'rejected',
    note?: string,
  ): Promise<{ ok: boolean; error?: string }> {
    try {
      const { data: userRes } = await supabase.auth.getUser()
      const email = userRes.user?.email || ''
      if (this._superadminCache === null) await this.isSuperadmin()
      if (!this._superadminCache) throw new Error('forbidden')
      const { data, error } = await supabase.rpc('admin_set_diploma_status', {
        p_email: email,
        p_coach_id: coachId,
        p_diploma_id: diplomaId,
        p_status: status,
        p_note: note ?? null,
      })
      if (error) throw error
      const out = (data || {}) as { success?: boolean }
      return { ok: out.success === true }
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : 'Failed to update diploma' }
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
