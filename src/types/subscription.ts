export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: number
  currency: 'EUR' | 'USD'
  billingCycle: 'monthly' | 'yearly'
  leadsPerMonth: number
  features: string[]
  isPopular?: boolean
  priority: 'low' | 'medium' | 'high'
  supportLevel: 'basic' | 'priority' | 'premium'
  createdAt: Date
  updatedAt: Date
  isActive: boolean
}

export interface UserSubscription {
  id?: string
  planId?: string
  hasSubscription: boolean
  status: 'active' | 'cancelled' | 'pending' | 'expired' | 'trial'
  startDate?: Date
  endDate?: Date
  nextBillingDate?: Date
  autoRenew: boolean
  cancelledAt?: Date
  cancellationReason?: string
  leadsUsed: number
  leadsRemaining: number
  resetDate: Date
}

export interface PaymentMethod {
  id: string
  type: 'card' | 'bank' | 'paypal'
  brand: string
  last4: string
  expiryMonth: number
  expiryYear: number
  isDefault: boolean
  createdAt: Date
}

export interface BillingHistoryItem {
  id: string
  subscriptionId: string
  planId: string
  planName: string
  amount: number
  currency: 'EUR' | 'USD'
  status: 'paid' | 'pending' | 'failed' | 'refunded'
  description: string
  date: Date
  paymentMethodId?: string
  invoiceUrl?: string
}

export interface AdminSubscriptionUpdate {
  planId: string
  updates: Partial<Omit<SubscriptionPlan, 'id' | 'createdAt'>>
}
