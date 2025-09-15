export interface ClientRequest {
  id?: string
  clientName: string
  email: string
  phone?: string
  location?: string
  coachingGoals?: string
  preferredLocation?: string
  // Deprecated: preferredCoaching (use chosenServices)
  preferredCoaching?: string[]
  chosenServices?: string[]
  availabilityNotes?: string
  availability?: string
  experience?: string
  additionalInfo?: string
  specialtyPreferences?: string[]
  startTimeframe?: string
  status: 'pending' | 'unlocked' | 'contacted'
  createdAt: Date
  targetCoaches: string[]
  priority: 'high' | 'medium' | 'low'
  source: 'web' | 'mobile' | 'referral'

  // Multistep tracking
  currentStep?: number
  completedSteps?: number[]
  isCompleted?: boolean
  doNotContact?: boolean
}

export interface Lead {
  id: string
  created_at: string
  updated_at: string
  client_name: string
  client_email: string
  client_phone?: string
  client_age?: number
  client_gender?: 'male' | 'female' | 'other' | 'prefer_not_say'
  location?: string
  /**
   * Legacy field kept for backwards compatibility with older functions / DB schemas.
   * New code should use chosen_services. Some components still reference preferred_coaching.
   */
  preferred_coaching?: string[] | readonly string[]
  /**
   * Normalised chosen services list. Can be an array of raw string titles or
   * rich objects (optionally with modalities, locations, days). Readonly forms
   * are accepted because Supabase typed responses often mark JSON arrays as readonly.
   */
  chosen_services?: ReadonlyArray<
    | string
    | {
        readonly title: string
        readonly modalities?: readonly string[]
        readonly locations?: readonly string[]
        readonly days?: readonly number[]
      }
  >
  goals?: string
  experience?: string
  availability?: string
  budget?: string
  start_timeframe?: string
  additional_info?: string
  status: 'new' | 'assigned' | 'contacted' | 'converted' | 'closed'
  coach_id?: string
  coach_note?: string
  contacted_at?: string
  converted_at?: string
  source: 'web' | 'mobile' | 'referral' | 'social' | 'ads'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  converted_booking_id?: string
  estimated_value?: number
  actual_value?: number
  do_not_contact?: boolean
  is_hidden?: boolean

  // Multistep tracking
  current_step: number
  completed_steps: readonly number[]
  is_completed: boolean
  lead_score?: number
  // Provenance (present when this lead is a duplicated copy of another lead)
  original_coach_id?: string
  original_lead_id?: string
  // Server-side locking (masked view)
  is_locked?: boolean | null
  distinct_email_rank?: number | null
  subscription_type?: string | null
  max_leads?: number | null
}

export interface LeadMetrics {
  totalLeads: number
  newLeads: number
  contactedLeads: number
  convertedLeads: number
  conversionRate: number
  thisMonth: {
    leads: number
    conversions: number
    revenue: number
  }
  lastMonth: {
    leads: number
    conversions: number
    revenue: number
  }
}
