// Real API services
import { supabaseCoachApi } from './supabaseCoachApi'
import { supabaseLeadApi } from './supabaseLeadApi'
import { supabaseSubscriptionApi } from './supabaseSubscriptionApi'
import { supabaseServiceApi } from './supabaseServiceApi'
import { supabaseBookingApi } from './supabaseBookingApi'
import { supabaseReviewApi } from './supabaseReviewApi'
import { supabasePaymentApi } from './supabasePaymentApi'

// Export all APIs
export const coachApi = supabaseCoachApi
export const leadApi = supabaseLeadApi
export const subscriptionApi = supabaseSubscriptionApi
export const serviceApi = supabaseServiceApi
export const bookingApi = supabaseBookingApi
export const reviewApi = supabaseReviewApi
export const paymentApi = supabasePaymentApi

export default {
  coach: coachApi,
  lead: leadApi,
  subscription: subscriptionApi,
  service: serviceApi,
  booking: bookingApi,
  review: reviewApi,
  payment: paymentApi,
}
