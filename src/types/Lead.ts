export interface ClientRequest {
  id?: string
  clientName: string
  email: string
  phone?: string
  location?: string
  coachingGoals?: string
  preferredLocation?: string
  preferredCoaching?: string[]
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
  location?: string
  preferred_coaching?: readonly string[]
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

  // Multistep tracking
  current_step: number
  completed_steps: readonly number[]
  is_completed: boolean
  lead_score?: number
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
