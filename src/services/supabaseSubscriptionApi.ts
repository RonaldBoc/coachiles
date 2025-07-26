import { supabase } from '@/utils/supabase'
import { handleApiError } from '@/utils/errors'

// Database subscription type (matches coaches_current_subscription view)
export interface Subscription {
  id: string
  email: string
  first_name: string
  last_name: string
  coach_is_active: boolean
  subscription_type: string
  plan_name: string
  plan_limits: Record<string, unknown>
  plan_features: Record<string, unknown>
  plan_price: number
  subscription_status: string
  current_period_start: string
  current_period_end: string
  subscription_is_active: boolean
  auto_renew: boolean
  payment_method: string | null
  last_payment_at: string | null
  next_payment_at: string | null
  has_active_subscription: boolean
  max_leads: number
}

// Supabase Subscription API service
export const supabaseSubscriptionApi = {
  // Get coach's current subscription from the view
  getCoachSubscription: async (coachId: string): Promise<Subscription | null> => {
    try {
      const { data, error } = await supabase
        .from('coaches_current_subscription')
        .select('*')
        .eq('id', coachId)
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
    currentPeriodStart: string
    currentPeriodEnd: string
    paymentMethod?: string
  }): Promise<{ id: string; coach_id: string; plan_id: string; status: string; price: number }> => {
    try {
      // First, get the plan ID for the plan type
      const { data: planData, error: planError } = await supabase
        .from('subscription_plans')
        .select('id, price')
        .eq('plan_type', subscriptionData.planType)
        .single()

      if (planError || !planData) {
        throw new Error(`Plan type '${subscriptionData.planType}' not found`)
      }

      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          coach_id: subscriptionData.coachId,
          plan_id: planData.id,
          price: planData.price,
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
    updates: {
      status?: string
      is_active?: boolean
      auto_renew?: boolean
      payment_method?: string
    },
  ): Promise<{ id: string; status: string; is_active: boolean }> => {
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
  cancelSubscription: async (
    subscriptionId: string,
  ): Promise<{ id: string; status: string; is_active: boolean }> => {
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
  reactivateSubscription: async (
    subscriptionId: string,
  ): Promise<{ id: string; status: string; is_active: boolean }> => {
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
        .select(
          `
          id,
          plan_id,
          status,
          current_period_start,
          current_period_end,
          price,
          payment_method,
          created_at,
          subscription_plans(name, plan_type)
        `,
        )
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
