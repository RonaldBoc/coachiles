import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/utils/supabase'
import {
  AdminApi,
  type AdminCoach,
  type AdminLead,
  type PaymentRow,
  type AdminReview,
  type AdminDiplomaSubmission,
  type AdminDeletionLog,
} from '@/services/supabaseAdminApi'

export const useAdminStore = defineStore('admin', () => {
  // State
  const currentSection = ref<
    'dashboard' | 'coaches' | 'leads' | 'payments' | 'moderation' | 'config' | 'audit'
  >('dashboard')
  const sidebarOpen = ref(true)

  // Data
  const coaches = ref<AdminCoach[]>([])
  const leads = ref<AdminLead[]>([])
  const payments = ref<PaymentRow[]>([])
  const reviews = ref<AdminReview[]>([])
  const certifications = ref<AdminDiplomaSubmission[]>([])
  const deletionLogs = ref<AdminDeletionLog[]>([])

  // Loading states
  const loading = ref(false)
  const coachesLoading = ref(false)
  const leadsLoading = ref(false)
  const paymentsLoading = ref(false)
  const reviewsLoading = ref(false)
  const certificationsLoading = ref(false)

  // Error states
  const error = ref<string | null>(null)
  const coachesError = ref<string | null>(null)
  const leadsError = ref<string | null>(null)
  const paymentsError = ref<string | null>(null)
  const reviewsError = ref<string | null>(null)
  const certificationsError = ref<string | null>(null)

  // Filters and search
  const filters = ref<Record<string, any>>({})
  const searchQuery = ref('')

  // Computed
  const isInitialized = computed(() => AdminApi._superadminCache !== null)

  const kpis = computed(() => ({
    totalCoaches: coaches.value.length,
    activeCoaches: coaches.value.filter((c) => c.is_active).length,
    totalLeads: leads.value.length,
    newLeadsToday: leads.value.filter((l) => {
      const today = new Date().toDateString()
      const leadDate = new Date(l.created_at).toDateString()
      return today === leadDate
    }).length,
    pendingReviews: reviews.value.filter((r) => r.moderation_status === 'pending').length,
    pendingCertifications: certifications.value.filter((c) => c.status === 'pending').length,
    pendingDeletions: deletionLogs.value.filter((d) => !d.reactivated_at).length,
  }))

  // Actions
  const initialize = async () => {
    loading.value = true
    error.value = null

    try {
      const isAdmin = await AdminApi.isSuperadmin()
      if (!isAdmin) {
        throw new Error('Access denied: superadmin required')
      }

      // Load basic data
      await Promise.all([loadCoaches(), loadLeads()])
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to initialize admin panel'
    } finally {
      loading.value = false
    }
  }

  const loadCoaches = async () => {
    coachesLoading.value = true
    coachesError.value = null

    try {
      const result = await AdminApi.listCoaches()
      if (result.error) {
        throw new Error(result.error)
      }
      coaches.value = result.data
    } catch (err) {
      coachesError.value = err instanceof Error ? err.message : 'Failed to load coaches'
    } finally {
      coachesLoading.value = false
    }
  }

  const loadLeads = async () => {
    leadsLoading.value = true
    leadsError.value = null

    try {
      const result = await AdminApi.listLeads()
      if (result.error) {
        throw new Error(result.error)
      }
      leads.value = result.data
    } catch (err) {
      leadsError.value = err instanceof Error ? err.message : 'Failed to load leads'
    } finally {
      leadsLoading.value = false
    }
  }

  const loadLeadsForCoach = async (coachId: string): Promise<AdminLead[]> => {
    try {
      console.log('Store: loading leads for coach ID:', coachId)
      const result = await AdminApi.listLeadsForCoach(coachId)
      if (result.error) {
        console.error('Store: API error loading leads:', result.error)
        throw new Error(result.error)
      }
      console.log('Store: loaded leads:', result.data)
      return result.data
    } catch (err) {
      console.error('Store: Failed to load coach leads:', err)
      return []
    }
  }

  const loadReviews = async () => {
    reviewsLoading.value = true
    reviewsError.value = null

    try {
      const result = await AdminApi.listReviews()
      if (result.error) {
        throw new Error(result.error)
      }
      reviews.value = result.data
    } catch (err) {
      reviewsError.value = err instanceof Error ? err.message : 'Failed to load reviews'
    } finally {
      reviewsLoading.value = false
    }
  }

  const loadCertifications = async () => {
    certificationsLoading.value = true
    certificationsError.value = null

    try {
      const result = await AdminApi.listDiplomaSubmissions()
      if (result.error) {
        throw new Error(result.error)
      }
      certifications.value = result.data
    } catch (err) {
      certificationsError.value =
        err instanceof Error ? err.message : 'Failed to load certifications'
    } finally {
      certificationsLoading.value = false
    }
  }

  const loadDeletionLogs = async () => {
    try {
      const result = await AdminApi.listDeletionLogs()
      if (result.error) {
        throw new Error(result.error)
      }
      deletionLogs.value = result.data
    } catch (err) {
      console.error('Failed to load deletion logs:', err)
    }
  }

  // Coach actions
  const setCoachActive = async (coachId: string, active: boolean, reason?: string) => {
    try {
      const result = await AdminApi.setCoachActive(coachId, active, reason)
      if (result.error) {
        throw new Error(result.error)
      }

      // Update local state
      const coach = coaches.value.find((c) => c.id === coachId)
      if (coach) {
        coach.is_active = active
        if (!active && reason) {
          coach.disabled_reason = reason
        } else if (active) {
          coach.disabled_reason = null
        }
      }

      return { success: true }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to update coach status',
      }
    }
  }

  const setCoachSubscription = async (
    coachId: string,
    planType: 'free' | 'premium',
    periodStart?: string,
    periodEnd?: string,
  ) => {
    try {
      const result = await AdminApi.setCoachSubscription(coachId, planType, periodStart, periodEnd)
      if (result.error) {
        throw new Error(result.error)
      }

      return { success: true }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to update subscription',
      }
    }
  }

  // Lead actions
  const setLeadHidden = async (leadId: string, hidden: boolean) => {
    try {
      const result = await AdminApi.setLeadHidden(leadId, hidden)
      if (result.error) {
        throw new Error(result.error)
      }

      // Update local state
      const lead = leads.value.find((l) => l.id === leadId)
      if (lead) {
        lead.is_hidden = result.hidden
      }

      return { success: true }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to update lead visibility',
      }
    }
  }

  const deleteLead = async (leadId: string) => {
    try {
      const result = await AdminApi.deleteLead(leadId)
      if (result.error) {
        throw new Error(result.error)
      }

      // Remove from local state
      const index = leads.value.findIndex((l) => l.id === leadId)
      if (index > -1) {
        leads.value.splice(index, 1)
      }

      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to delete lead' }
    }
  }

  // Review actions
  const approveReview = async (reviewId: string, note?: string) => {
    try {
      const result = await AdminApi.approveReview(reviewId, note)
      if (result.error) {
        throw new Error(result.error)
      }

      // Update local state
      const review = reviews.value.find((r) => r.id === reviewId)
      if (review) {
        review.moderation_status = 'approved'
        review.is_published = true
      }

      return { success: true }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to approve review',
      }
    }
  }

  const rejectReview = async (reviewId: string, note?: string) => {
    try {
      const result = await AdminApi.rejectReview(reviewId, note)
      if (result.error) {
        throw new Error(result.error)
      }

      // Update local state
      const review = reviews.value.find((r) => r.id === reviewId)
      if (review) {
        review.moderation_status = 'rejected'
        review.is_published = false
      }

      return { success: true }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to reject review',
      }
    }
  }

  // Certification actions
  const setDiplomaStatus = async (
    coachId: string,
    diplomaId: string,
    status: 'approved' | 'rejected',
    note?: string,
  ) => {
    try {
      const result = await AdminApi.setDiplomaStatus(coachId, diplomaId, status, note)
      if (result.error) {
        throw new Error(result.error)
      }

      // Update local state
      const cert = certifications.value.find(
        (c) => c.coach_id === coachId && c.diploma_id === diplomaId,
      )
      if (cert) {
        cert.status = status
        if (note) {
          cert.rejectionNote = note
        }
      }

      return { success: true }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to update certification status',
      }
    }
  }

  // Utility functions
  const navigateTo = (section: typeof currentSection.value) => {
    currentSection.value = section
  }

  const getCoachName = (coachId: string | null | undefined) => {
    if (!coachId) return '—'
    const coach = coaches.value.find((c) => c.id === coachId)
    if (!coach) return '—'
    return `${coach.first_name || ''} ${coach.last_name || ''}`.trim() || coach.email
  }

  // Get coach authentication info (last sign-in time)
  const getCoachAuthInfo = async (coachId: string) => {
    try {
      // First get the coach to find their email
      const { data: coach, error: coachError } = await supabase
        .from('coaches')
        .select('email')
        .eq('id', coachId)
        .single()

      if (coachError || !coach) return null

      // Then use the SQL function to get user info from auth.users
      const { data: authData, error: authError } = await supabase.rpc('get_user_auth_info', {
        user_email: coach.email,
      })

      if (authError) {
        console.warn('Auth function error:', authError.message)
        return null
      }

      // authData is now a JSON object, not an array
      if (authData) {
        return {
          last_sign_in_at: authData.last_sign_in_at,
          user_id: authData.id,
        }
      }

      return null
    } catch (err) {
      console.warn('Failed to get auth info for coach:', coachId, err)
      return null
    }
  }

  // Coach sessions management
  const getCoachSessions = async (coachId: string, limit: number = 50) => {
    try {
      const { data, error } = await supabase.rpc('get_coach_sessions', {
        coach_id_param: coachId,
        limit_param: limit,
      })

      if (error) {
        console.error('Error getting coach sessions:', error)
        return { success: false, error: error.message, data: [] }
      }

      return { success: true, data: data || [] }
    } catch (err) {
      console.error('Exception getting coach sessions:', err)
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to get sessions',
        data: [],
      }
    }
  }

  const logCoachSession = async (
    coachId: string,
    coachEmail: string,
    ipAddress?: string,
    userAgent?: string,
    deviceInfo?: any,
  ) => {
    try {
      const { data, error } = await supabase.rpc('log_coach_session', {
        coach_id_param: coachId,
        coach_email_param: coachEmail,
        ip_param: ipAddress || null,
        user_agent_param: userAgent || null,
        device_info_param: deviceInfo || {},
      })

      if (error) {
        console.error('Error logging coach session:', error)
        return { success: false, error: error.message }
      }

      return { success: true, sessionId: data }
    } catch (err) {
      console.error('Exception logging coach session:', err)
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to log session',
      }
    }
  }

  const endCoachSession = async (sessionId: string, logoutReason: string = 'manual') => {
    try {
      const { data, error } = await supabase.rpc('end_coach_session', {
        session_id_param: sessionId,
        logout_reason_param: logoutReason,
      })

      if (error) {
        console.error('Error ending coach session:', error)
        return { success: false, error: error.message }
      }

      return { success: true, ended: data }
    } catch (err) {
      console.error('Exception ending coach session:', err)
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to end session',
      }
    }
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '—'
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return {
    // State
    currentSection,
    sidebarOpen,

    // Data
    coaches,
    leads,
    payments,
    reviews,
    certifications,
    deletionLogs,

    // Loading states
    loading,
    coachesLoading,
    leadsLoading,
    paymentsLoading,
    reviewsLoading,
    certificationsLoading,

    // Error states
    error,
    coachesError,
    leadsError,
    paymentsError,
    reviewsError,
    certificationsError,

    // Computed
    isInitialized,
    kpis,

    // Actions
    initialize,
    loadCoaches,
    loadLeads,
    loadLeadsForCoach,
    loadReviews,
    loadCertifications,
    loadDeletionLogs,

    // Coach actions
    setCoachActive,
    setCoachSubscription,

    // Lead actions
    setLeadHidden,
    deleteLead,

    // Review actions
    approveReview,
    rejectReview,

    // Certification actions
    setDiplomaStatus,

    // Utilities
    navigateTo,
    getCoachName,
    getCoachAuthInfo,
    getCoachSessions,
    logCoachSession,
    endCoachSession,
    formatDate,
  }
})
