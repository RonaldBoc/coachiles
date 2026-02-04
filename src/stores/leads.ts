import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import { supabaseLeadApi } from '@/services/supabaseLeadApi'
import type { Lead } from '@/types/Lead'
import { actionTracker } from '@/utils/actionTracker'

export const useLeadStore = defineStore('leads', () => {
  // State
  const leads = ref<Lead[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const total = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(20)

  // Getters
  const isLoading = computed(() => loading.value)
  const hasError = computed(() => error.value !== null)
  const newLeadsCount = computed(() => leads.value.filter((lead) => lead.status === 'new').length)
  const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

  // Actions
  const setLoading = (isLoading: boolean) => {
    loading.value = isLoading
  }

  const setError = (errorMessage: string | null) => {
    error.value = errorMessage
  }

  const clearError = () => {
    error.value = null
  }

  // Fetch leads for the current coach
  const fetchLeads = async (
    coachId: string,
    params?: {
      page?: number
      limit?: number
      status?: string[]
      dateFrom?: string
      dateTo?: string
    },
  ) => {
    try {
      console.log('🔍 Fetching leads for coach:', coachId, params)
      setLoading(true)
      clearError()

      const response = await supabaseLeadApi.getLeadsForCoach(coachId, {
        page: params?.page || currentPage.value,
        limit: params?.limit || pageSize.value,
        status: params?.status,
        dateFrom: params?.dateFrom,
        dateTo: params?.dateTo,
      })

      if (params?.page === 1 || !params?.page) {
        leads.value = response.data
      } else {
        // Append for pagination
        leads.value = [...leads.value, ...response.data]
      }

      total.value = response.total
      currentPage.value = response.page

      console.log('✅ Leads fetched:', {
        total: total.value,
        current: leads.value.length,
        page: currentPage.value,
      })

      // Track leads viewing action
      await actionTracker.trackLeadListView({
        count: response.data.length,
        filters: params,
        page: response.page
      })

      return response
    } catch (err) {
      console.error('❌ Error fetching leads:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch leads'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Update lead status (contacted, converted, etc.)
  const updateLeadStatus = async (leadId: string, status: Lead['status']) => {
    try {
      setLoading(true)
      clearError()

      const updatedLead = await supabaseLeadApi.updateLeadStatus(leadId, status)

      // Update local state
      const leadIndex = leads.value.findIndex((lead) => lead.id === leadId)
      if (leadIndex !== -1) {
        leads.value[leadIndex] = updatedLead
      }

      // Track lead status change action
      await actionTracker.trackLeadStatusChange(leadId, status)

      console.log('✅ Lead status updated:', { leadId, status })
    } catch (err) {
      console.error('❌ Error updating lead status:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to update lead status'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Assign lead to coach (when coach expresses interest)
  const assignLeadToCoach = async (leadId: string, coachId: string) => {
    try {
      setLoading(true)
      clearError()

      await supabaseLeadApi.assignLeadToCoach(leadId, coachId)

      // Update local state
      const leadIndex = leads.value.findIndex((lead) => lead.id === leadId)
      if (leadIndex !== -1) {
        leads.value[leadIndex] = {
          ...leads.value[leadIndex],
          coach_id: coachId,
          status: 'assigned', // Change to valid status
        }
      }

      // Track lead assignment action
      await actionTracker.trackLeadAssignment(leadId, coachId)

      console.log('✅ Lead assigned to coach:', { leadId, coachId })
    } catch (err) {
      console.error('❌ Error assigning lead:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to assign lead'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Clear all leads (useful for logout or coach change)
  const clearLeads = () => {
    leads.value = []
    total.value = 0
    currentPage.value = 1
    clearError()
  }

  return {
    // State
    leads: readonly(leads),
    loading: readonly(loading),
    error: readonly(error),
    total: readonly(total),
    currentPage: readonly(currentPage),
    pageSize: readonly(pageSize),

    // Getters
    isLoading,
    hasError,
    newLeadsCount,
    totalPages,

    // Actions
    fetchLeads,
    updateLeadStatus,
    assignLeadToCoach,
    clearLeads,
    setError,
    clearError,
  }
})
