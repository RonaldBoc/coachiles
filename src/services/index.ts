import { config } from '@/utils/config'

// Import both mock and real API services
import { coachApi as mockCoachApi } from './coachApi'
import { leadApi as mockLeadApi } from './leadApi'
import { subscriptionApi as mockSubscriptionApi } from './subscriptionApi'

import { supabaseCoachApi } from './supabaseCoachApi'
import { supabaseLeadApi } from './supabaseLeadApi'
import { supabaseSubscriptionApi } from './supabaseSubscriptionApi'

// Smart API selector that chooses between mock and real APIs
export const smartCoachApi = config.useMockData ? mockCoachApi : supabaseCoachApi
export const smartLeadApi = config.useMockData ? mockLeadApi : supabaseLeadApi
export const smartSubscriptionApi = config.useMockData
  ? mockSubscriptionApi
  : supabaseSubscriptionApi

// Export as default APIs
export const coachApi = smartCoachApi
export const leadApi = smartLeadApi
export const subscriptionApi = smartSubscriptionApi

export default {
  coach: smartCoachApi,
  lead: smartLeadApi,
  subscription: smartSubscriptionApi,
}
