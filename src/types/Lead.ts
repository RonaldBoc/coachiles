export interface ClientRequest {
  id: string
  clientName: string
  email: string
  phone: string
  coachingGoals: string
  preferredLocation: string
  budget: string
  availabilityNotes: string
  specialtyPreferences: string[]
  status: 'pending' | 'unlocked' | 'contacted'
  createdAt: Date
  targetCoaches: string[]
  priority: 'high' | 'medium' | 'low'
  source: 'web' | 'mobile' | 'referral'
}

export interface Lead {
  id: string
  clientRequestId: string
  coachId: string
  status: 'new' | 'viewed' | 'contacted' | 'converted' | 'lost'
  unlockedAt?: Date
  contactedAt?: Date
  convertedAt?: Date
  notes?: string
  clientInfo?: {
    name: string
    email: string
    phone: string
    goals: string
    location: string
    budget: string
    availability: string
    preferences: string[]
  }
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
