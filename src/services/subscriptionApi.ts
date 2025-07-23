import { api } from '@/utils/api'
import type { SubscriptionPlan, UserSubscription, BillingHistoryItem } from '@/types/subscription'

// API response types
export interface SubscriptionResponse {
  subscription: UserSubscription
  plan: SubscriptionPlan
  billingHistory: BillingHistoryItem[]
}

export interface CreateSubscriptionRequest {
  planId: string
  paymentMethodId?: string
}

// Subscription API service
export const subscriptionApi = {
  // Get available plans
  getPlans: (): Promise<SubscriptionPlan[]> => {
    return api.get<SubscriptionPlan[]>('/subscription/plans')
  },

  // Get current subscription for a coach
  getSubscription: (coachId: string): Promise<SubscriptionResponse> => {
    return api.get<SubscriptionResponse>(`/coaches/${coachId}/subscription`)
  },

  // Subscribe to a plan
  subscribeToPlan: (
    coachId: string,
    data: CreateSubscriptionRequest,
  ): Promise<UserSubscription> => {
    return api.post<UserSubscription>(`/coaches/${coachId}/subscription`, data)
  },

  // Update subscription plan
  updateSubscription: (coachId: string, planId: string): Promise<UserSubscription> => {
    return api.patch<UserSubscription>(`/coaches/${coachId}/subscription`, { planId })
  },

  // Cancel subscription
  cancelSubscription: (coachId: string): Promise<UserSubscription> => {
    return api.patch<UserSubscription>(`/coaches/${coachId}/subscription/cancel`)
  },

  // Resume cancelled subscription
  resumeSubscription: (coachId: string): Promise<UserSubscription> => {
    return api.patch<UserSubscription>(`/coaches/${coachId}/subscription/resume`)
  },

  // Get billing history
  getBillingHistory: (
    coachId: string,
    params?: {
      page?: number
      limit?: number
    },
  ): Promise<{ data: BillingHistoryItem[]; total: number }> => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())

    return api.get(`/coaches/${coachId}/billing?${searchParams.toString()}`)
  },

  // Download invoice
  downloadInvoice: (invoiceId: string): Promise<Blob> => {
    return api.get(`/billing/invoices/${invoiceId}/download`, {
      responseType: 'blob',
    })
  },
}

export default subscriptionApi
