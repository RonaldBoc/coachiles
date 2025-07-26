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
