import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabaseSubscriptionApi } from '@/services/supabaseSubscriptionApi'
import { useAuthStore } from './auth'

export interface ModernSubscriptionPlan {
  id: string
  name: string
  description: string
  price: number
  currency: 'EUR'
  billingInterval: 'monthly' | 'yearly'
  features: string[]
  isActive: boolean
  limits: {
    leadsPerMonth: number
    maxServices: number
    prioritySupport: boolean
    advancedAnalytics: boolean
  }
}

export interface SubscriptionStatus {
  id?: string
  planId?: string
  status: 'active' | 'inactive' | 'past_due' | 'canceled' | 'trialing'
  currentPeriodStart?: Date
  currentPeriodEnd?: Date
  nextBillingDate?: Date
  autoRenew: boolean
  cancelAtPeriodEnd: boolean
  pausedUntil?: Date
  isActive: boolean
}

export interface BillingInfo {
  id: string
  amount: number
  currency: 'EUR'
  status: 'paid' | 'pending' | 'failed' | 'refunded'
  description: string
  date: Date
  invoiceUrl?: string
  paymentMethod?: string
}

export interface PaymentMethod {
  id: string
  type: 'card' | 'sepa' | 'paypal'
  brand?: string
  last4?: string
  expiryMonth?: number
  expiryYear?: number
  isDefault: boolean
  holderName: string
}

export const useModernSubscriptionStore = defineStore('modernSubscription', () => {
  // State
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Single €9/month plan as requested
  const availablePlans = ref<ModernSubscriptionPlan[]>([
    {
      id: 'pro_monthly',
      name: 'Coachiles Pro',
      description:
        'Accès complet à toutes les fonctionnalités pour développer votre activité de coaching',
      price: 9,
      currency: 'EUR',
      billingInterval: 'monthly',
      features: [
        'Leads illimités',
        'Services illimités',
        'Statistiques avancées',
        'Support prioritaire',
        'Badge coach vérifié',
        'Visibilité maximale',
        'Outils marketing',
        'Export des données',
      ],
      isActive: true,
      limits: {
        leadsPerMonth: -1, // unlimited
        maxServices: -1, // unlimited
        prioritySupport: true,
        advancedAnalytics: true,
      },
    },
  ])

  const currentSubscription = ref<SubscriptionStatus>({
    status: 'inactive',
    autoRenew: true,
    cancelAtPeriodEnd: false,
    isActive: false,
  })

  const billingHistory = ref<BillingInfo[]>([])
  const paymentMethods = ref<PaymentMethod[]>([])
  const usage = ref({
    leadsUsedThisMonth: 0,
    servicesCreated: 0,
    lastResetDate: new Date(),
  })

  // Getters
  const isSubscribed = computed(
    () => currentSubscription.value.isActive && currentSubscription.value.status === 'active',
  )

  const currentPlan = computed(() =>
    availablePlans.value.find((plan) => plan.id === currentSubscription.value.planId),
  )

  const hasPaymentMethod = computed(() => paymentMethods.value.length > 0)

  const defaultPaymentMethod = computed(() => paymentMethods.value.find((pm) => pm.isDefault))

  const subscriptionNeedsAttention = computed(() => {
    const status = currentSubscription.value.status
    return (
      status === 'past_due' ||
      status === 'canceled' ||
      (currentSubscription.value.cancelAtPeriodEnd && currentSubscription.value.currentPeriodEnd)
    )
  })

  // Actions
  const setLoading = (value: boolean) => {
    loading.value = value
  }

  const setError = (message: string | null) => {
    error.value = message
  }

  const clearError = () => {
    error.value = null
  }

  // Load subscription data from database
  const loadSubscriptionData = async () => {
    const authStore = useAuthStore()
    if (!authStore.coach?.id) return

    try {
      setLoading(true)
      clearError()

      // Load current subscription
      const subscription = await supabaseSubscriptionApi.getCoachSubscription(authStore.coach.id)

      if (subscription) {
        currentSubscription.value = {
          id: subscription.id,
          planId: subscription.plan_type === 'premium' ? 'pro_monthly' : undefined,
          status: subscription.status === 'active' ? 'active' : 'inactive',
          currentPeriodStart: new Date(subscription.current_period_start),
          currentPeriodEnd: new Date(subscription.current_period_end),
          nextBillingDate: subscription.next_payment_at
            ? new Date(subscription.next_payment_at)
            : undefined,
          autoRenew: subscription.auto_renew,
          cancelAtPeriodEnd: false, // TODO: Add this field to database
          isActive: subscription.is_active,
        }
      }

      // Load billing history
      const history = await supabaseSubscriptionApi.getSubscriptionHistory(authStore.coach.id)
      billingHistory.value = history.map((h) => ({
        id: h.id,
        amount: h.price,
        currency: 'EUR',
        status: 'paid', // Assuming paid for now
        description: `Abonnement ${h.plan_type} - ${new Date(h.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`,
        date: new Date(h.created_at),
        paymentMethod: h.payment_method || undefined,
      }))
    } catch (err) {
      console.error('Error loading subscription data:', err)
      setError("Erreur lors du chargement de l'abonnement")
    } finally {
      setLoading(false)
    }
  }

  // Subscribe to the pro plan
  const subscribe = async () => {
    const authStore = useAuthStore()
    if (!authStore.coach?.id) {
      setError('Coach non connecté')
      return false
    }

    try {
      setLoading(true)
      clearError()

      const plan = availablePlans.value[0] // Our single pro plan

      // Create subscription in database
      const now = new Date()
      const nextBilling = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days from now

      await supabaseSubscriptionApi.createSubscription({
        coachId: authStore.coach.id,
        planType: 'premium', // Map to database enum
        price: plan.price,
        features: plan.features,
        currentPeriodStart: now.toISOString(),
        currentPeriodEnd: nextBilling.toISOString(),
      })

      // Update local state
      currentSubscription.value = {
        planId: plan.id,
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        autoRenew: true,
        cancelAtPeriodEnd: false,
        isActive: true,
      }

      // Add billing record
      billingHistory.value.unshift({
        id: `inv_${Date.now()}`,
        amount: plan.price,
        currency: 'EUR',
        status: 'paid',
        description: `Abonnement ${plan.name} - ${new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`,
        date: new Date(),
      })

      return true
    } catch (err) {
      console.error('Error subscribing:', err)
      setError("Erreur lors de l'abonnement")
      return false
    } finally {
      setLoading(false)
    }
  }

  // Cancel subscription
  const cancelSubscription = async (immediate = false) => {
    const authStore = useAuthStore()
    if (!authStore.coach?.id || !currentSubscription.value.id) {
      setError('Aucun abonnement à annuler')
      return false
    }

    try {
      setLoading(true)
      clearError()

      await supabaseSubscriptionApi.cancelSubscription(currentSubscription.value.id)

      if (immediate) {
        currentSubscription.value.status = 'canceled'
        currentSubscription.value.isActive = false
      } else {
        currentSubscription.value.cancelAtPeriodEnd = true
      }

      return true
    } catch (err) {
      console.error('Error canceling subscription:', err)
      setError("Erreur lors de l'annulation")
      return false
    } finally {
      setLoading(false)
    }
  }

  // Reactivate subscription
  const reactivateSubscription = async () => {
    const authStore = useAuthStore()
    if (!authStore.coach?.id || !currentSubscription.value.id) {
      setError('Aucun abonnement à réactiver')
      return false
    }

    try {
      setLoading(true)
      clearError()

      await supabaseSubscriptionApi.reactivateSubscription(currentSubscription.value.id)

      currentSubscription.value.status = 'active'
      currentSubscription.value.isActive = true
      currentSubscription.value.cancelAtPeriodEnd = false

      return true
    } catch (err) {
      console.error('Error reactivating subscription:', err)
      setError('Erreur lors de la réactivation')
      return false
    } finally {
      setLoading(false)
    }
  }

  // Pause subscription (future feature)
  const pauseSubscription = async (pauseUntil: Date) => {
    try {
      setLoading(true)
      clearError()

      // TODO: Implement pause functionality in API
      currentSubscription.value.pausedUntil = pauseUntil

      return true
    } catch (err) {
      console.error('Error pausing subscription:', err)
      setError('Erreur lors de la pause')
      return false
    } finally {
      setLoading(false)
    }
  }

  // Add payment method
  const addPaymentMethod = async (paymentMethodData: Omit<PaymentMethod, 'id'>) => {
    try {
      setLoading(true)
      clearError()

      // TODO: Integrate with payment processor (Stripe)
      const newPaymentMethod: PaymentMethod = {
        ...paymentMethodData,
        id: `pm_${Date.now()}`,
      }

      // If this is the first payment method or explicitly set as default, make it default
      if (paymentMethods.value.length === 0 || newPaymentMethod.isDefault) {
        paymentMethods.value.forEach((pm) => (pm.isDefault = false))
        newPaymentMethod.isDefault = true
      }

      paymentMethods.value.push(newPaymentMethod)
      return true
    } catch (err) {
      console.error('Error adding payment method:', err)
      setError("Erreur lors de l'ajout du moyen de paiement")
      return false
    } finally {
      setLoading(false)
    }
  }

  // Remove payment method
  const removePaymentMethod = async (paymentMethodId: string) => {
    try {
      setLoading(true)
      clearError()

      const index = paymentMethods.value.findIndex((pm) => pm.id === paymentMethodId)
      if (index === -1) return false

      const wasDefault = paymentMethods.value[index].isDefault
      paymentMethods.value.splice(index, 1)

      // If we removed the default payment method, make the first remaining one default
      if (wasDefault && paymentMethods.value.length > 0) {
        paymentMethods.value[0].isDefault = true
      }

      return true
    } catch (err) {
      console.error('Error removing payment method:', err)
      setError('Erreur lors de la suppression du moyen de paiement')
      return false
    } finally {
      setLoading(false)
    }
  }

  // Update usage statistics
  const updateUsage = (leadsUsed: number, servicesCount: number) => {
    usage.value.leadsUsedThisMonth = leadsUsed
    usage.value.servicesCreated = servicesCount
  }

  return {
    // State
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    availablePlans: computed(() => availablePlans.value),
    currentSubscription: computed(() => currentSubscription.value),
    billingHistory: computed(() => billingHistory.value),
    paymentMethods: computed(() => paymentMethods.value),
    usage: computed(() => usage.value),

    // Getters
    isSubscribed,
    currentPlan,
    hasPaymentMethod,
    defaultPaymentMethod,
    subscriptionNeedsAttention,

    // Actions
    loadSubscriptionData,
    subscribe,
    cancelSubscription,
    reactivateSubscription,
    pauseSubscription,
    addPaymentMethod,
    removePaymentMethod,
    updateUsage,
    clearError,
  }
})
