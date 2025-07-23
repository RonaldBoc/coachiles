// Payment types for transaction tracking
export interface Payment {
  id: string
  createdAt: Date
  updatedAt: Date
  
  // Payment Details
  bookingId?: string
  coachId: string
  
  // Transaction Info
  amount: number
  currency: string
  paymentMethod?: string // 'stripe', 'paypal', 'bank_transfer', etc.
  transactionId?: string // External payment processor ID
  
  // Status
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded'
  paymentType: 'booking' | 'subscription' | 'commission' | 'refund' | 'payout'
  
  // Fees & Commissions
  platformFee: number
  paymentProcessorFee: number
  coachEarnings: number
  
  // External References
  stripePaymentIntentId?: string
  stripeChargeId?: string
  paypalTransactionId?: string
  
  // Timing
  processedAt?: Date
  failedAt?: Date
  refundedAt?: Date
  
  // Metadata
  description?: string
  failureReason?: string
  metadata?: Record<string, any>
  
  // Payout tracking
  payoutId?: string
  payoutStatus?: 'pending' | 'paid' | 'failed'
  payoutDate?: Date
  
  // Related data (populated in queries)
  booking?: import('./booking').Booking
  coach?: import('./coach').Coach
}

export interface CreatePaymentData {
  bookingId?: string
  coachId: string
  amount: number
  currency?: string
  paymentMethod?: string
  paymentType?: 'booking' | 'subscription' | 'commission' | 'refund' | 'payout'
  description?: string
  metadata?: Record<string, any>
}

export interface UpdatePaymentData {
  status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded'
  transactionId?: string
  stripePaymentIntentId?: string
  stripeChargeId?: string
  paypalTransactionId?: string
  processedAt?: Date
  failedAt?: Date
  refundedAt?: Date
  failureReason?: string
  payoutId?: string
  payoutStatus?: 'pending' | 'paid' | 'failed'
  payoutDate?: Date
  metadata?: Record<string, any>
}

export interface PaymentFilters {
  coachId?: string
  bookingId?: string
  status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded'
  paymentType?: 'booking' | 'subscription' | 'commission' | 'refund' | 'payout'
  paymentMethod?: string
  startDate?: Date
  endDate?: Date
  minAmount?: number
  maxAmount?: number
}

export interface PaymentStats {
  totalPayments: number
  totalAmount: number
  totalFees: number
  totalCoachEarnings: number
  successfulPayments: number
  failedPayments: number
  refundedPayments: number
  pendingPayouts: number
  thisMonth: {
    payments: number
    amount: number
    fees: number
    earnings: number
  }
  lastMonth: {
    payments: number
    amount: number
    fees: number
    earnings: number
  }
  byPaymentMethod: {
    [method: string]: {
      count: number
      amount: number
    }
  }
}

export interface PayoutRequest {
  coachId: string
  amount: number
  bankAccount?: {
    accountHolderName: string
    iban: string
    bic?: string
  }
  paypalEmail?: string
  notes?: string
}

export interface PayoutSummary {
  coachId: string
  availableBalance: number
  pendingBalance: number
  totalEarnings: number
  lastPayoutDate?: Date
  nextPayoutDate?: Date
  payoutHistory: Payment[]
}