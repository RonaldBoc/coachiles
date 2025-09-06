import { supabase } from '@/utils/supabase'
import type { Lead } from '@/types/Lead'
import { handleApiError } from '@/utils/errors'

// Supabase Lead API service
export const supabaseLeadApi = {
  // Get leads for a coach (requires authentication)
  getLeadsForCoach: async (
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
      // Helper to build a query (masked view preferred)
      const buildQuery = (source: 'coach_leads_masked' | 'leads') => {
        let q = supabase.from(source).select('*').eq('coach_id', coachId)
        if (params?.status?.length) q = q.in('status', params.status)
        if (params?.dateFrom) q = q.gte('created_at', params.dateFrom)
        if (params?.dateTo) q = q.lte('created_at', params.dateTo)
        return q
      }

      const page = params?.page || 1
      const limit = params?.limit || 20
      const offset = (page - 1) * limit

      // Try masked view first
      let { data, error, count } = await buildQuery('coach_leads_masked')
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false })

      if (error) {
        console.warn(
          '[supabaseLeadApi] Masked view unavailable, falling back to raw leads:',
          error.message,
        )
        ;({ data, error, count } = await buildQuery('leads')
          .range(offset, offset + limit - 1)
          .order('created_at', { ascending: false }))
        if (error) throw error
      }

      return { data: data || [], total: count || 0, page, limit }
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Assign a lead to a coach (claim). Note: RLS may require a SECURITY DEFINER RPC for production.
  assignLeadToCoach: async (leadId: string, coachId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ coach_id: coachId, status: 'assigned', updated_at: new Date().toISOString() })
        .eq('id', leadId)

      if (error) throw error
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Create new lead (client request)
  createLead: async (leadData: {
    clientName: string
    clientEmail: string
    clientPhone: string
    chosenServices: string[]
    goals: string
    experience: string
    availability: string
    location: string
    startTimeframe?: string
    additionalInfo?: string
  }): Promise<Lead> => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .insert({
          client_name: leadData.clientName,
          client_email: leadData.clientEmail,
          client_phone: leadData.clientPhone,
          chosen_services: leadData.chosenServices,
          goals: leadData.goals,
          experience: leadData.experience,
          availability: leadData.availability,
          start_timeframe: leadData.startTimeframe,
          location: leadData.location,
          additional_info: leadData.additionalInfo,
          status: 'new',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      if (!data) throw new Error('Failed to create lead')

      return data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Update lead status (coach action)
  updateLeadStatus: async (leadId: string, status: string): Promise<Lead> => {
    try {
      const updateData: {
        status: string
        updated_at: string
        contacted_at?: string
        converted_at?: string
      } = {
        status,
        updated_at: new Date().toISOString(),
      }

      // Set timestamps for specific status changes
      if (status === 'contacted') {
        updateData.contacted_at = new Date().toISOString()
      } else if (status === 'converted') {
        updateData.converted_at = new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('leads')
        .update(updateData)
        .eq('id', leadId)
        .select()
        .single()

      if (error) throw error
      if (!data) throw new Error('Lead not found')

      return data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Add coach note to lead
  addNote: async (leadId: string, note: string): Promise<Lead> => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .update({
          coach_note: note,
          updated_at: new Date().toISOString(),
        })
        .eq('id', leadId)
        .select()
        .single()

      if (error) throw error
      if (!data) throw new Error('Lead not found')

      return data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Mark lead as contacted
  markAsContacted: async (leadId: string): Promise<Lead> => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .update({
          status: 'contacted',
          contacted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', leadId)
        .select()
        .single()

      if (error) throw error
      if (!data) throw new Error('Lead not found')

      return data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Get lead statistics for coach
  getLeadStats: async (coachId: string, period?: '7d' | '30d' | '90d' | '1y') => {
    try {
      let dateFilter = ''
      const now = new Date()

      switch (period) {
        case '7d':
          dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
          break
        case '30d':
          dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
          break
        case '90d':
          dateFilter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString()
          break
        case '1y':
          dateFilter = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString()
          break
      }

      let query = supabase.from('leads').select('*').eq('coach_id', coachId)

      if (dateFilter) {
        query = query.gte('created_at', dateFilter)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      throw handleApiError(error)
    }
  },
}

export default supabaseLeadApi
