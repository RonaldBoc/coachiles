import { supabase } from '@/utils/supabase'
import { handleApiError } from '@/utils/errors'

// Database subscription type (matches Supabase schema)
export interface Subscription {
  id: string
  created_at: string
  updated_at: string
  coach_id: string
  plan_type: string
  status: string
  current_period_start: string
  current_period_end: string
  price: number
  features: string[]
  is_active: boolean
  auto_renew: boolean
  payment_method: string | null
  last_payment_at: string | null
  next_payment_at: string | null
}

// Supabase Subscription API service
export const supabaseSubscriptionApi = {
  // Get coach's current subscription
  getCoachSubscription: async (coachId: string): Promise<Subscription | null> => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('coach_id', coachId)
        .eq('is_active', true)
        .single()

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows found
        throw error
      }

      return data || null
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Create new subscription
  createSubscription: async (subscriptionData: {
    coachId: string
    planType: string
    price: number
    features: string[]
    currentPeriodStart: string
    currentPeriodEnd: string
    paymentMethod?: string
  }): Promise<Subscription> => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          coach_id: subscriptionData.coachId,
          plan_type: subscriptionData.planType,
          price: subscriptionData.price,
          features: subscriptionData.features,
          current_period_start: subscriptionData.currentPeriodStart,
          current_period_end: subscriptionData.currentPeriodEnd,
          payment_method: subscriptionData.paymentMethod,
          status: 'active',
          is_active: true,
          auto_renew: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      if (!data) throw new Error('Failed to create subscription')

      return data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Update subscription
  updateSubscription: async (
    subscriptionId: string,
    updates: Partial<Subscription>,
  ): Promise<Subscription> => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscriptionId)
        .select()
        .single()

      if (error) throw error
      if (!data) throw new Error('Subscription not found')

      return data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Cancel subscription
  cancelSubscription: async (subscriptionId: string): Promise<Subscription> => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .update({
          status: 'cancelled',
          is_active: false,
          auto_renew: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscriptionId)
        .select()
        .single()

      if (error) throw error
      if (!data) throw new Error('Subscription not found')

      return data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Reactivate subscription
  reactivateSubscription: async (subscriptionId: string): Promise<Subscription> => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          is_active: true,
          auto_renew: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscriptionId)
        .select()
        .single()

      if (error) throw error
      if (!data) throw new Error('Subscription not found')

      return data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Update payment method
  updatePaymentMethod: async (
    subscriptionId: string,
    paymentMethod: string,
  ): Promise<Subscription> => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .update({
          payment_method: paymentMethod,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscriptionId)
        .select()
        .single()

      if (error) throw error
      if (!data) throw new Error('Subscription not found')

      return data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Renew subscription
  renewSubscription: async (
    subscriptionId: string,
    newPeriodEnd: string,
  ): Promise<Subscription> => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .update({
          current_period_start: new Date().toISOString(),
          current_period_end: newPeriodEnd,
          last_payment_at: new Date().toISOString(),
          next_payment_at: newPeriodEnd,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscriptionId)
        .select()
        .single()

      if (error) throw error
      if (!data) throw new Error('Subscription not found')

      return data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Get subscription history for a coach
  getSubscriptionHistory: async (coachId: string) => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('coach_id', coachId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Check if subscription is expired
  isSubscriptionExpired: async (coachId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('current_period_end')
        .eq('coach_id', coachId)
        .eq('is_active', true)
        .single()

      if (error || !data) return true

      const expiryDate = new Date(data.current_period_end)
      const now = new Date()

      return expiryDate < now
    } catch {
      return true
    }
  },
}

export default supabaseSubscriptionApi
