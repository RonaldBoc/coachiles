export interface Coach {
  id: string
  firstName: string
  lastName?: string // Optional since we're hiding last names on the platform
  email: string
  phone: string
  photo?: string
  bio: string
  location: string
  specialties: string[]
  certifications: string[]
  experience: number // years of experience
  availability: string
  rating: number
  totalClients: number
  subscriptionStatus: 'active' | 'inactive' | 'trial'
  // subscription_type removed - use coaches_current_subscription view instead
  services?: unknown[] // Services are managed separately in the marketplace now
  createdAt: Date
  updatedAt: Date
  isActive: boolean
  hourlyRate?: number // hourly rate in euros
  languages?: string[] // spoken languages
  territory?: string // extracted territory code (e.g., martinique)
  // Modalities (course modalities/preferences)
  modalities?: {
    availabilityDays?: string[]
    locations?: {
      atHome?: { enabled: boolean; details?: string }
      visio?: { enabled: boolean; details?: string }
      publicSpaces?: { enabled: boolean; details?: string }
      gym?: { enabled: boolean; details?: string }
    }
    freeTrial?: { enabled: boolean; details?: string }
    cancellationPolicy?: string
  }
  // Admin deactivation metadata
  disabledReason?: string | null
  disabledAt?: Date | null
  // Structured activity JSON (new) including diplomas stored server-side
  profile_activity?: {
    diplomas?: Array<{
      id: string
      title?: string
      status?: 'pending' | 'approved' | 'rejected'
      proofFileName?: string
      proofFileUrl?: string
      rejectionNote?: string
    }>
    // Professional work experiences (free-text entries added by coach)
    workExperiences?: string[]
  }
}

export interface DiplomaDocument {
  id: string
  name: string
  photoUrl: string // URL to the diploma photo
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: Date
  reviewedAt?: Date
  reviewedBy?: string
  rejectionReason?: string
}

export interface ServiceRequirement {
  serviceName: string
  requiresDiploma: boolean
  requiredDiplomaTypes?: string[]
  description?: string
}
