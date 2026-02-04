import { defineStore } from 'pinia'
import type {
  SubscriptionPlan,
  UserSubscription,
  PaymentMethod,
  BillingHistoryItem,
} from '@/types/subscription'
import { actionTracker } from '@/utils/actionTracker'

export const useSubscriptionStore = defineStore('subscription', {
  state: () => ({
    // Available subscription plans
    plans: [
      {
        id: 'free',
        name: 'Gratuit',
        description: 'Plan de base pour commencer',
        price: 0,
        currency: 'EUR' as const,
        billingCycle: 'monthly' as const,
        features: ['5 propositions par mois', 'Support par email', 'Profil de base'],
        leadsPerMonth: 5,
        priority: 'low' as const,
        supportLevel: 'basic' as const,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        isActive: true,
      },
      {
        id: 'pro',
        name: 'Pro',
        description: 'Pour les coachs actifs',
        price: 29.99,
        currency: 'EUR' as const,
        billingCycle: 'monthly' as const,
        features: [
          '50 propositions par mois',
          'Gestion des leads avancée',
          'Support prioritaire',
          'Statistiques détaillées',
          'Calendrier intégré',
        ],
        isPopular: true,
        leadsPerMonth: 50,
        priority: 'medium' as const,
        supportLevel: 'priority' as const,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2025-01-01'),
        isActive: true,
      },
      {
        id: 'premium',
        name: 'Premium',
        description: 'Solution complète pour professionnels',
        price: 49.99,
        currency: 'EUR' as const,
        billingCycle: 'monthly' as const,
        features: [
          'Propositions illimitées',
          'Priorité dans les recherches clients',
          'Support client premium 24/7',
          'Outils de gestion avancés',
          'Statistiques avancées',
          'API access',
          'Branding personnalisé',
        ],
        leadsPerMonth: -1, // -1 means unlimited
        priority: 'high' as const,
        supportLevel: 'premium' as const,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2025-01-01'),
        isActive: true,
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        description: 'Pour les grandes équipes',
        price: 99.99,
        currency: 'EUR' as const,
        billingCycle: 'monthly' as const,
        features: [
          'Tout du plan Premium',
          'Gestion multi-utilisateurs',
          'Support dédié',
          'Intégrations personnalisées',
          'Formation incluse',
          'SLA garanti',
        ],
        leadsPerMonth: -1,
        priority: 'high' as const,
        supportLevel: 'premium' as const,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2025-01-01'),
        isActive: true,
      },
    ] as SubscriptionPlan[],

    // User's current subscription
    userSubscription: {
      hasSubscription: false,
      status: 'cancelled',
      autoRenew: true,
    } as UserSubscription,

    // Payment methods (always available)
    paymentMethods: [
      {
        id: 'pm_1',
        type: 'card',
        brand: 'Visa',
        last4: '4242',
        expiryMonth: 12,
        expiryYear: 2027,
        isDefault: true,
        createdAt: new Date('2024-06-01'),
      },
      {
        id: 'pm_2',
        type: 'card',
        brand: 'MasterCard',
        last4: '5555',
        expiryMonth: 8,
        expiryYear: 2026,
        isDefault: false,
        createdAt: new Date('2024-08-15'),
      },
    ] as PaymentMethod[],

    // Billing history (always available)
    billingHistory: [
      {
        id: 'inv_1',
        subscriptionId: 'sub_1',
        planId: 'pro',
        planName: 'Pro',
        amount: 29.99,
        currency: 'EUR',
        status: 'paid',
        description: 'Abonnement Pro - Janvier 2025',
        date: new Date('2025-01-15'),
        paymentMethodId: 'pm_1',
        invoiceUrl: '#',
      },
      {
        id: 'inv_2',
        subscriptionId: 'sub_1',
        planId: 'pro',
        planName: 'Pro',
        amount: 29.99,
        currency: 'EUR',
        status: 'paid',
        description: 'Abonnement Pro - Décembre 2024',
        date: new Date('2024-12-15'),
        paymentMethodId: 'pm_1',
        invoiceUrl: '#',
      },
      {
        id: 'inv_3',
        subscriptionId: 'sub_1',
        planId: 'free',
        planName: 'Gratuit',
        amount: 0,
        currency: 'EUR',
        status: 'paid',
        description: 'Plan Gratuit - Novembre 2024',
        date: new Date('2024-11-01'),
        invoiceUrl: '#',
      },
    ] as BillingHistoryItem[],

    // Admin settings
    isAdmin: false, // This would be determined by user role in real app
  }),

  getters: {
    // Get current plan details
    currentPlan: (state) => {
      if (!state.userSubscription.planId) return state.plans.find((p) => p.id === 'free')
      return state.plans.find((p) => p.id === state.userSubscription.planId)
    },

    // Get active plans only
    activePlans: (state) => state.plans.filter((p) => p.isActive),

    // Get popular plan
    popularPlan: (state) => state.plans.find((p) => p.isPopular),

    // Check if user has active subscription
    hasActiveSubscription: (state) => {
      return state.userSubscription.hasSubscription && state.userSubscription.status === 'active'
    },

    // Get default payment method
    defaultPaymentMethod: (state) => state.paymentMethods.find((pm) => pm.isDefault),

    // Get recent billing history
    recentBilling: (state) => state.billingHistory.slice(0, 5),

    // Get plan by ID
    getPlanById: (state) => (id: string) => state.plans.find((p) => p.id === id),
  },

  actions: {
    // User subscription actions
    toggleSubscription() {
      this.userSubscription.hasSubscription = !this.userSubscription.hasSubscription
      this.userSubscription.status = this.userSubscription.hasSubscription ? 'active' : 'cancelled'

      if (this.userSubscription.hasSubscription && !this.userSubscription.planId) {
        // Default to pro plan when activating
        this.subscribeToPlan('pro')
      }
    },

    subscribeToPlan(planId: string) {
      const plan = this.plans.find((p) => p.id === planId)
      if (!plan) return false

      this.userSubscription = {
        ...this.userSubscription,
        planId,
        hasSubscription: true,
        status: 'active',
        startDate: new Date(),
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        autoRenew: true,
      }

      // Add billing record if not free plan
      if (plan.price > 0) {
        this.addBillingRecord(planId, plan.name, plan.price, plan.currency)
      }

      // Track subscription action
      actionTracker.trackSubscriptionCreated(planId, plan.price)

      return true
    },

    cancelSubscription(reason?: string) {
      this.userSubscription.hasSubscription = false
      this.userSubscription.status = 'cancelled'
      this.userSubscription.cancelledAt = new Date()
      this.userSubscription.cancellationReason = reason

      // Track subscription cancellation
      actionTracker.trackSubscriptionCancelled(this.userSubscription.planId!, reason)

      // Revert to free plan
      this.userSubscription.planId = 'free'
    },

    upgradeToPlan(planId: string) {
      const plan = this.plans.find((p) => p.id === planId)
      if (!plan) return false

      const previousPlan = this.userSubscription.planId

      this.userSubscription.planId = planId
      this.userSubscription.hasSubscription = true
      this.userSubscription.status = 'active'

      // Add billing record
      if (plan.price > 0) {
        this.addBillingRecord(planId, plan.name, plan.price, plan.currency)
      }

      // Track subscription upgrade
      actionTracker.trackSubscriptionUpgrade(previousPlan, planId, plan.price)

      return true
    },

    // Payment method actions
    addPaymentMethod(paymentMethod: Omit<PaymentMethod, 'id' | 'createdAt'>) {
      const newPaymentMethod: PaymentMethod = {
        ...paymentMethod,
        id: `pm_${Date.now()}`,
        createdAt: new Date(),
      }

      // If this is set as default, make others non-default
      if (newPaymentMethod.isDefault) {
        this.paymentMethods.forEach((pm) => (pm.isDefault = false))
      }

      this.paymentMethods.push(newPaymentMethod)
      return newPaymentMethod
    },

    removePaymentMethod(paymentMethodId: string) {
      const index = this.paymentMethods.findIndex((pm) => pm.id === paymentMethodId)
      if (index > -1) {
        this.paymentMethods.splice(index, 1)

        // If removed method was default, make first remaining method default
        if (!this.paymentMethods.find((pm) => pm.isDefault) && this.paymentMethods.length > 0) {
          this.paymentMethods[0].isDefault = true
        }
      }
    },

    setDefaultPaymentMethod(paymentMethodId: string) {
      this.paymentMethods.forEach((pm) => {
        pm.isDefault = pm.id === paymentMethodId
      })
    },

    // Billing actions
    addBillingRecord(planId: string, planName: string, amount: number, currency: 'EUR' | 'USD') {
      const newRecord: BillingHistoryItem = {
        id: `inv_${Date.now()}`,
        subscriptionId: this.userSubscription.id || 'sub_1',
        planId,
        planName,
        amount,
        currency,
        status: 'paid',
        description: `Abonnement ${planName} - ${new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`,
        date: new Date(),
        paymentMethodId: this.defaultPaymentMethod?.id,
      }

      this.billingHistory.unshift(newRecord)
    },

    // Admin actions
    setAdminMode(isAdmin: boolean) {
      this.isAdmin = isAdmin
    },

    updatePlan(planId: string, updates: Partial<Omit<SubscriptionPlan, 'id' | 'createdAt'>>) {
      if (!this.isAdmin) {
        console.error('Admin access required')
        return false
      }

      const planIndex = this.plans.findIndex((p) => p.id === planId)
      if (planIndex === -1) return false

      this.plans[planIndex] = {
        ...this.plans[planIndex],
        ...updates,
        updatedAt: new Date(),
      }

      return true
    },

    createPlan(plan: Omit<SubscriptionPlan, 'id' | 'createdAt' | 'updatedAt'>) {
      if (!this.isAdmin) {
        console.error('Admin access required')
        return false
      }

      const newPlan: SubscriptionPlan = {
        ...plan,
        id: `plan_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      this.plans.push(newPlan)
      return newPlan
    },

    deactivatePlan(planId: string) {
      if (!this.isAdmin) {
        console.error('Admin access required')
        return false
      }

      const plan = this.plans.find((p) => p.id === planId)
      if (plan) {
        plan.isActive = false
        plan.updatedAt = new Date()
        return true
      }
      return false
    },
  },
})
