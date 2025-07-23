import { api } from '@/utils/api'
import type { Lead } from '@/types/Lead'

// API response types
export interface LeadResponse {
  data: Lead[]
  total: number
  page: number
  limit: number
}

export interface LeadCreateRequest {
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
}

// Lead API service
export const leadApi = {
  // Get leads for a coach (requires authentication)
  getLeadsForCoach: (
    coachId: string,
    params?: {
      page?: number
      limit?: number
      status?: string[]
      dateFrom?: string
      dateTo?: string
    },
  ): Promise<LeadResponse> => {
    const searchParams = new URLSearchParams()

    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.status?.length) {
      params.status.forEach((status) => searchParams.append('status[]', status))
    }
    if (params?.dateFrom) searchParams.append('dateFrom', params.dateFrom)
    if (params?.dateTo) searchParams.append('dateTo', params.dateTo)

    return api.get<LeadResponse>(`/coaches/${coachId}/leads?${searchParams.toString()}`)
  },

  // Create new lead (client request)
  createLead: (data: LeadCreateRequest): Promise<Lead> => {
    return api.post<Lead>('/leads', data)
  },

  // Update lead status (coach action)
  updateLeadStatus: (leadId: string, status: string): Promise<Lead> => {
    return api.patch<Lead>(`/leads/${leadId}/status`, { status })
  },

  // Add coach note to lead
  addNote: (leadId: string, note: string): Promise<Lead> => {
    return api.patch<Lead>(`/leads/${leadId}/note`, { note })
  },

  // Mark lead as contacted
  markAsContacted: (leadId: string): Promise<Lead> => {
    return api.patch<Lead>(`/leads/${leadId}/contacted`)
  },

  // Get lead statistics for coach
  getLeadStats: (
    coachId: string,
    period?: '7d' | '30d' | '90d' | '1y',
  ): Promise<{
    totalLeads: number
    newLeads: number
    contactedLeads: number
    convertedLeads: number
    conversionRate: number
    averageResponseTime: number
  }> => {
    const searchParams = new URLSearchParams()
    if (period) searchParams.append('period', period)

    return api.get(`/coaches/${coachId}/leads/stats?${searchParams.toString()}`)
  },
}

export default leadApi
