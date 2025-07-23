import { supabase, type Tables } from '@/utils/supabase'
import type { Payment, CreatePaymentData, UpdatePaymentData, PaymentFilters, PaymentStats } from '@/types/payment'
import { handleApiError } from '@/utils/errors'

// Helper function to map Supabase data to our Payment interface
const mapSupabaseToPayment = (supabaseData: Tables<'payments'>): Payment => {
  return {
    id: supabaseData.id,
    createdAt: new Date(supabaseData.created_at),
    updatedAt: new Date(supabaseData.updated_at),
    bookingId: supabaseData.booking_id || undefined,
    coachId: supabaseData.coach_id,
    amount: Number(supabaseData.amount),
    currency: supabaseData.currency || 'EUR',
    paymentMethod: supabaseData.payment_method || undefined,
    transactionId: supabaseData.transaction_id || undefined,
    status: supabaseData.status as 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded',
    paymentType: supabaseData.payment_type as 'booking' | 'subscription' | 'commission' | 'refund' | 'payout',
    platformFee: Number(supabaseData.platform_fee),
    paymentProcessorFee: Number(supabaseData.payment_processor_fee),
    coachEarnings: Number(supabaseData.coach_earnings),
    stripePaymentIntentId: supabaseData.stripe_payment_intent_id || undefined,
    stripeChargeId: supabaseData.stripe_charge_id || undefined,
    paypalTransactionId: supabaseData.paypal_transaction_id || undefined,
    processedAt: supabaseData.processed_at ? new Date(supabaseData.processed_at) : undefined,
    failedAt: supabaseData.failed_at ? new Date(supabaseData.failed_at) : undefined,
    refundedAt: supabaseData.refunded_at ? new Date(supabaseData.refunded_at) : undefined,
    description: supabaseData.description || undefined,
    failureReason: supabaseData.failure_reason || undefined,
    metadata: supabaseData.metadata || {},
    payoutId: supabaseData.payout_id || undefined,
    payoutStatus: supabaseData.payout_status as 'pending' | 'paid' | 'failed' || undefined,
    payoutDate: supabaseData.payout_date ? new Date(supabaseData.payout_date) : undefined,
  }
}

export const supabasePaymentApi = {
  // Get payments with filtering
  getPayments: async (params?: {
    page?: number
    limit?: number
    filters?: PaymentFilters
  }) => {
    try {
      let query = supabase.from('payments').select(`
        *,
        bookings(
          id,
          client_name,
          client_email,
          scheduled_at
        ),
        coaches(
          id,
          first_name,
          email
        )
      `)

      // Apply filters
      if (params?.filters) {
        const { filters } = params
        
        if (filters.coachId) {
          query = query.eq('coach_id', filters.coachId)
        }
        if (filters.bookingId) {
          query = query.eq('booking_id', filters.bookingId)
        }
        if (filters.status) {
          query = query.eq('status', filters.status)
        }
        if (filters.paymentType) {
          query = query.eq('payment_type', filters.paymentType)
        }
        if (filters.paymentMethod) {
          query = query.eq('payment_method', filters.paymentMethod)
        }
        if (filters.startDate) {
          query = query.gte('created_at', filters.startDate.toISOString())
        }
        if (filters.endDate) {
          query = query.lte('created_at', filters.endDate.toISOString())
        }
        if (filters.minAmount) {
          query = query.gte('amount', filters.minAmount)
        }
        if (filters.maxAmount) {
          query = query.lte('amount', filters.maxAmount)
        }
      }

      // Apply pagination
      const page = params?.page || 1
      const limit = params?.limit || 20
      const offset = (page - 1) * limit

      // Get total count
      const { count, error: countError } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true })

      if (countError) throw countError

      // Get data with pagination
      const { data, error } = await query
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false })

      if (error) throw error

      return {
        data: data?.map(item => ({
          ...mapSupabaseToPayment(item),
          booking: item.bookings ? {
            id: item.bookings.id,
            clientName: item.bookings.client_name,
            clientEmail: item.bookings.client_email,
            scheduledAt: new Date(item.bookings.scheduled_at),
          } : undefined,
          coach: item.coaches ? {
            id: item.coaches.id,
            firstName: item.coaches.first_name,
            email: item.coaches.email,
          } : undefined
        })) || [],
        total: count || 0,
        page,
        limit,
      }
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Get payment by ID
  getPaymentById: async (id: string): Promise<Payment> => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          bookings(
            id,
            client_name,
            client_email,
            scheduled_at,
            service_id,
            services(
              id,
              name,
              category
            )
          ),
          coaches(
            id,
            first_name,
            email
          )
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      if (!data) throw new Error('Payment not found')

      return {
        ...mapSupabaseToPayment(data),
        booking: data.bookings ? {
          id: data.bookings.id,
          clientName: data.bookings.client_name,
          clientEmail: data.bookings.client_email,
          scheduledAt: new Date(data.bookings.scheduled_at),
        } : undefined,
        coach: data.coaches ? {
          id: data.coaches.id,
          firstName: data.coaches.first_name,
          email: data.coaches.email,
        } : undefined
      }
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Get payments for a specific coach
  getCoachPayments: async (coachId: string, filters?: {
    status?: string
    paymentType?: string
    startDate?: Date
    endDate?: Date
    limit?: number
  }): Promise<Payment[]> => {
    try {
      let query = supabase
        .from('payments')
        .select(`
          *,
          bookings(
            id,
            client_name,
            scheduled_at
          )
        `)
        .eq('coach_id', coachId)

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      if (filters?.paymentType) {
        query = query.eq('payment_type', filters.paymentType)
      }
      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate.toISOString())
      }
      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate.toISOString())
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(filters?.limit || 50)

      if (error) throw error

      return data?.map(item => ({
        ...mapSupabaseToPayment(item),
        booking: item.bookings ? {
          id: item.bookings.id,
          clientName: item.bookings.client_name,
          scheduledAt: new Date(item.bookings.scheduled_at),
        } : undefined
      })) || []
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Create new payment
  createPayment: async (paymentData: CreatePaymentData): Promise<Payment> => {
    try {
      // Calculate fees (these would be configurable in a real app)
      const platformFeeRate = 0.10 // 10%
      const paymentProcessorFeeRate = 0.029 // 2.9% + fixed fee (simplified)
      
      const platformFee = paymentData.amount * platformFeeRate
      const paymentProcessorFee = paymentData.amount * paymentProcessorFeeRate
      const coachEarnings = paymentData.amount - platformFee - paymentProcessorFee

      const { data, error } = await supabase
        .from('payments')
        .insert({
          booking_id: paymentData.bookingId,
          coach_id: paymentData.coachId,
          amount: paymentData.amount,
          currency: paymentData.currency || 'EUR',
          payment_method: paymentData.paymentMethod,
          payment_type: paymentData.paymentType || 'booking',
          platform_fee: platformFee,
          payment_processor_fee: paymentProcessorFee,
          coach_earnings: coachEarnings,
          description: paymentData.description,
          metadata: paymentData.metadata || {},
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      if (!data) throw new Error('Failed to create payment')

      return mapSupabaseToPayment(data)
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Update payment
  updatePayment: async (id: string, updates: UpdatePaymentData): Promise<Payment> => {
    try {
      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      }

      if (updates.status) {
        updateData.status = updates.status
        
        // Set timing fields based on status
        if (updates.status === 'completed') {
          updateData.processed_at = new Date().toISOString()
        } else if (updates.status === 'failed') {
          updateData.failed_at = new Date().toISOString()
        } else if (updates.status === 'refunded') {
          updateData.refunded_at = new Date().toISOString()
        }
      }

      if (updates.transactionId !== undefined) {
        updateData.transaction_id = updates.transactionId
      }
      if (updates.stripePaymentIntentId !== undefined) {
        updateData.stripe_payment_intent_id = updates.stripePaymentIntentId
      }
      if (updates.stripeChargeId !== undefined) {
        updateData.stripe_charge_id = updates.stripeChargeId
      }
      if (updates.paypalTransactionId !== undefined) {
        updateData.paypal_transaction_id = updates.paypalTransactionId
      }
      if (updates.failureReason !== undefined) {
        updateData.failure_reason = updates.failureReason
      }
      if (updates.payoutId !== undefined) {
        updateData.payout_id = updates.payoutId
      }
      if (updates.payoutStatus !== undefined) {
        updateData.payout_status = updates.payoutStatus
      }
      if (updates.payoutDate !== undefined) {
        updateData.payout_date = updates.payoutDate.toISOString()
      }
      if (updates.metadata !== undefined) {
        updateData.metadata = updates.metadata
      }

      const { data, error } = await supabase
        .from('payments')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      if (!data) throw new Error('Payment not found')

      return mapSupabaseToPayment(data)
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Mark payment as completed
  completePayment: async (id: string, transactionId: string): Promise<Payment> => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .update({
          status: 'completed',
          transaction_id: transactionId,
          processed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      if (!data) throw new Error('Payment not found')

      return mapSupabaseToPayment(data)
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Mark payment as failed
  failPayment: async (id: string, reason: string): Promise<Payment> => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .update({
          status: 'failed',
          failure_reason: reason,
          failed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      if (!data) throw new Error('Payment not found')

      return mapSupabaseToPayment(data)
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Process refund
  refundPayment: async (id: string, refundAmount?: number): Promise<Payment> => {
    try {
      const { data: payment, error: fetchError } = await supabase
        .from('payments')
        .select('amount, coach_earnings')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError
      if (!payment) throw new Error('Payment not found')

      const refundAmountFinal = refundAmount || payment.amount

      const { data, error } = await supabase
        .from('payments')
        .update({
          status: 'refunded',
          refunded_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          metadata: { refund_amount: refundAmountFinal }
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      if (!data) throw new Error('Payment not found')

      return mapSupabaseToPayment(data)
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Get payment statistics for a coach
  getPaymentStats: async (coachId: string): Promise<PaymentStats> => {
    try {
      const now = new Date()
      const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

      // Get all completed payments that haven't been paid out
      const { data: allPayments, error: allError } = await supabase
        .from('payments')
        .select('status, payment_type, payment_method, amount, platform_fee, payment_processor_fee, coach_earnings, created_at, payout_id')
        .eq('coach_id', coachId)

      if (allError) throw allError

      const totalPayments = allPayments?.length || 0
      const totalAmount = allPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0
      const totalFees = allPayments?.reduce((sum, p) => sum + Number(p.platform_fee) + Number(p.payment_processor_fee), 0) || 0
      const totalCoachEarnings = allPayments?.reduce((sum, p) => sum + Number(p.coach_earnings), 0) || 0
      
      const successfulPayments = allPayments?.filter(p => p.status === 'completed').length || 0
      const failedPayments = allPayments?.filter(p => p.status === 'failed').length || 0
      const refundedPayments = allPayments?.filter(p => p.status === 'refunded').length || 0
      const pendingPayouts = allPayments?.filter(p => p.status === 'completed' && !p.payout_id).length || 0

      // This month stats
      const thisMonthPayments = allPayments?.filter(p => 
        new Date(p.created_at) >= firstDayThisMonth && p.status === 'completed'
      ) || []
      
      const thisMonthAmount = thisMonthPayments.reduce((sum, p) => sum + Number(p.amount), 0)
      const thisMonthFees = thisMonthPayments.reduce((sum, p) => sum + Number(p.platform_fee) + Number(p.payment_processor_fee), 0)
      const thisMonthEarnings = thisMonthPayments.reduce((sum, p) => sum + Number(p.coach_earnings), 0)

      // Last month stats
      const lastMonthPayments = allPayments?.filter(p => {
        const createdAt = new Date(p.created_at)
        return createdAt >= firstDayLastMonth && createdAt <= lastDayLastMonth && p.status === 'completed'
      }) || []

      const lastMonthAmount = lastMonthPayments.reduce((sum, p) => sum + Number(p.amount), 0)
      const lastMonthFees = lastMonthPayments.reduce((sum, p) => sum + Number(p.platform_fee) + Number(p.payment_processor_fee), 0)
      const lastMonthEarnings = lastMonthPayments.reduce((sum, p) => sum + Number(p.coach_earnings), 0)

      // Payment method breakdown
      const byPaymentMethod: { [method: string]: { count: number; amount: number } } = {}
      allPayments?.filter(p => p.status === 'completed').forEach(payment => {
        const method = payment.payment_method || 'unknown'
        if (!byPaymentMethod[method]) {
          byPaymentMethod[method] = { count: 0, amount: 0 }
        }
        byPaymentMethod[method].count++
        byPaymentMethod[method].amount += Number(payment.amount)
      })

      return {
        totalPayments,
        totalAmount,
        totalFees,
        totalCoachEarnings,
        successfulPayments,
        failedPayments,
        refundedPayments,
        pendingPayouts,
        thisMonth: {
          payments: thisMonthPayments.length,
          amount: thisMonthAmount,
          fees: thisMonthFees,
          earnings: thisMonthEarnings,
        },
        lastMonth: {
          payments: lastMonthPayments.length,
          amount: lastMonthAmount,
          fees: lastMonthFees,
          earnings: lastMonthEarnings,
        },
        byPaymentMethod,
      }
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Get coach's available balance (completed payments not yet paid out)
  getCoachBalance: async (coachId: string): Promise<{
    availableBalance: number
    pendingBalance: number
    totalEarnings: number
    lastPayoutDate?: Date
  }> => {
    try {
      // Get all completed payments that haven't been paid out
      const { data: availablePayments, error: availableError } = await supabase
        .from('payments')
        .select('coach_earnings')
        .eq('coach_id', coachId)
        .eq('status', 'completed')
        .is('payout_id', null)

      if (availableError) throw availableError

      // Get all pending payments
      const { data: pendingPayments, error: pendingError } = await supabase
        .from('payments')
        .select('coach_earnings')
        .eq('coach_id', coachId)
        .in('status', ['pending', 'processing'])

      if (pendingError) throw pendingError

      // Get total earnings
      const { data: allPayments, error: allError } = await supabase
        .from('payments')
        .select('coach_earnings')
        .eq('coach_id', coachId)
        .eq('status', 'completed')

      if (allError) throw allError

      // Get last payout date
      const { data: lastPayout } = await supabase
        .from('payments')
        .select('payout_date')
        .eq('coach_id', coachId)
        .not('payout_id', 'is', null)
        .order('payout_date', { ascending: false })
        .limit(1)
        .single()

      // Note: Error is expected if no payouts exist yet

      const availableBalance = availablePayments?.reduce((sum, p) => sum + Number(p.coach_earnings), 0) || 0
      const pendingBalance = pendingPayments?.reduce((sum, p) => sum + Number(p.coach_earnings), 0) || 0
      const totalEarnings = allPayments?.reduce((sum, p) => sum + Number(p.coach_earnings), 0) || 0

      return {
        availableBalance,
        pendingBalance,
        totalEarnings,
        lastPayoutDate: lastPayout?.payout_date ? new Date(lastPayout.payout_date) : undefined,
      }
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Create payout record
  createPayout: async (coachId: string, amount: number): Promise<Payment> => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .insert({
          coach_id: coachId,
          amount: -amount, // Negative amount for payout
          currency: 'EUR',
          payment_type: 'payout',
          coach_earnings: -amount,
          platform_fee: 0,
          payment_processor_fee: 0,
          status: 'pending',
          description: 'Coach payout',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      if (!data) throw new Error('Failed to create payout')

      return mapSupabaseToPayment(data)
    } catch (error) {
      throw handleApiError(error)
    }
  },
}

export default supabasePaymentApi