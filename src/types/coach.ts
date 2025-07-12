export interface Coach {
  id: string
  firstName: string
  lastName: string
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
  services: Service[]
  createdAt: Date
  updatedAt: Date
  isActive: boolean
}

export interface Service {
  id: string
  name: string
  description: string
  category: string
  subcategory: string
  location: string
  duration: number // in minutes
  groupSize: 'individual' | 'small_group' | 'large_group'
  ageGroups: string[]
  levels: string[]
  isActive: boolean
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
