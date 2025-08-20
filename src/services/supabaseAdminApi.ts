import { supabase } from '@/utils/supabase'

export type AdminCoach = {
  id: string
  email: string
  first_name?: string | null
  last_name?: string | null
  created_at?: string | null
  is_active?: boolean | null
  subscription_type?: string | null
}

export type AdminLead = {
  id: string
  client_name: string
  client_email: string
  status: string
  coach_id: string | null
  created_at: string
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

type RowsLike = { rows?: unknown[] }
function parseAdminList(value: unknown): unknown[] {
  if (Array.isArray(value)) return value
  if (value && typeof value === 'object' && Array.isArray((value as RowsLike).rows)) {
    return (value as RowsLike).rows as unknown[]
  }
  return []
}

export const AdminApi = {
  // cache to avoid redundant RPCs & prevent noisy 400s when not superadmin
  _superadminCache: null as boolean | null,
  async isSuperadmin(): Promise<boolean> {
    try {
      const { data: userRes } = await supabase.auth.getUser()
      const email = userRes.user?.email
      if (!email) return false

      // Try secure RPC if present
      try {
        const { data, error } = await supabase.rpc('is_superadmin', { p_email: email })
        if (!error && typeof data === 'boolean') {
          this._superadminCache = data
          return data
        }
      } catch {
        // ignore and fallback
      }

      // Fallback: allowlist from env
      const allowlist = (import.meta.env.VITE_SUPERADMINS as string | undefined)
        ?.split(',')
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean)
      const allowed = !!allowlist?.includes(email.toLowerCase())
      this._superadminCache = allowed
      return allowed
    } catch {
      return false
    }
  },

  async listCoaches(): Promise<{ data: AdminCoach[]; error?: string }> {
    try {
      const { data: userRes } = await supabase.auth.getUser()
      const email = userRes.user?.email || ''

      // Avoid RPC if not superadmin (prevents 400s in console)
      if (this._superadminCache === null) await this.isSuperadmin()
      const canUseAdminRpc = this._superadminCache === true

      // Prefer RPC
      if (canUseAdminRpc) {
        try {
          const { data, error } = await supabase.rpc('admin_list_coaches', { p_email: email })
          if (!error && data) return { data: parseAdminList(data) as AdminCoach[] }
        } catch {
          // fall through
        }
      }

      // Fallback direct query
      const { data, error } = await supabase
        .from('coaches')
        .select('id,email,first_name,last_name,created_at,is_active')
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
      const canUseAdminRpc = this._superadminCache === true

      if (canUseAdminRpc) {
        try {
          const { data, error } = await supabase.rpc('admin_list_leads', { p_email: email })
          if (!error && data) return { data: parseAdminList(data) as AdminLead[] }
        } catch {
          // fall through
        }
      }

      const { data, error } = await supabase
        .from('leads')
        .select('id, client_name, client_email, status, coach_id, created_at')
        .order('created_at', { ascending: false })
        .limit(500)

      if (error) throw error
      return { data: (data || []) as AdminLead[] }
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Failed to load leads' }
    }
  },

  async listDeletionLogs(): Promise<{ data: AdminDeletionLog[]; error?: string }> {
    try {
      const { data: userRes } = await supabase.auth.getUser()
      const email = userRes.user?.email || ''

      if (this._superadminCache === null) await this.isSuperadmin()
      const canUseAdminRpc = this._superadminCache === true

      if (canUseAdminRpc) {
        try {
          const { data, error } = await supabase.rpc('admin_list_deletion_logs', {
            p_email: email,
          })
          if (!error && data) return { data: parseAdminList(data) as AdminDeletionLog[] }
        } catch {
          // fall through
        }
      }

      const { data, error } = await supabase
        .from('coach_deletion_log')
        .select(
          'id, coach_id, deletion_reason, deletion_type, deletion_requested_at, reactivation_deadline, reactivated_at',
        )
        .order('deletion_requested_at', { ascending: false })
        .limit(500)

      if (error) throw error
      // Map deletion_reason -> reason for UI compatibility
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
}

export default AdminApi
