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
      let query = supabase.from('leads').select('*').eq('coach_id', coachId)

      // Apply filters
      if (params?.status?.length) {
        query = query.in('status', params.status)
      }
      if (params?.dateFrom) {
        query = query.gte('created_at', params.dateFrom)
      }
      if (params?.dateTo) {
        query = query.lte('created_at', params.dateTo)
      }

      // Apply pagination
      const page = params?.page || 1
      const limit = params?.limit || 20
      const offset = (page - 1) * limit

      const { data, error, count } = await query
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false })

      if (error) throw error

      return {
        data: data || [],
        total: count || 0,
        page,
        limit,
      }
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Create new lead (client request)
  createLead: async (leadData: {
    clientName: string
    clientEmail: string
    clientPhone: string
    preferredCoaching: string[]
    goals: string
    experience: string
    availability: string
    budget: string
    location: string
    additionalInfo?: string
  }): Promise<Lead> => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .insert({
          client_name: leadData.clientName,
          client_email: leadData.clientEmail,
          client_phone: leadData.clientPhone,
          preferred_coaching: leadData.preferredCoaching,
          goals: leadData.goals,
          experience: leadData.experience,
          availability: leadData.availability,
          budget: leadData.budget,
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

      const { data: leads, error } = await query

      if (error) throw error

      const totalLeads = leads?.length || 0
      const newLeads = leads?.filter((lead) => lead.status === 'new').length || 0
      const contactedLeads = leads?.filter((lead) => lead.contacted_at).length || 0
      const convertedLeads = leads?.filter((lead) => lead.status === 'converted').length || 0

      // Calculate average response time
      const contactedWithTimes = leads?.filter((lead) => lead.contacted_at && lead.created_at) || []

      const averageResponseTime =
        contactedWithTimes.length > 0
          ? contactedWithTimes.reduce((sum, lead) => {
              const created = new Date(lead.created_at)
              const contacted = new Date(lead.contacted_at!)
              return sum + (contacted.getTime() - created.getTime())
            }, 0) /
            (contactedWithTimes.length * 1000 * 60 * 60) // Convert to hours
          : 0

      return {
        totalLeads,
        newLeads,
        contactedLeads,
        convertedLeads,
        conversionRate: totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0,
        averageResponseTime: Math.round(averageResponseTime * 100) / 100,
      }
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Assign lead to coach (for lead distribution)
  assignLeadToCoach: async (leadId: string, coachId: string): Promise<Lead> => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .update({
          coach_id: coachId,
          status: 'assigned',
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
}

export default supabaseLeadApi
