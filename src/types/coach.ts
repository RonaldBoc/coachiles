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

export interface CoachProfile {
  id: string
  firstName: string
  lastName: string
  city: string
  country: string
  email: string
  emailVerified: boolean
  phoneNumber: string
  phoneVerified: boolean
  services: string[] // Array of services the coach offers
  photoUrl?: string
  description?: string
  diplomas?: DiplomaDocument[]
  website?: string
  accountStatus: 'pending' | 'approved' | 'suspended' | 'rejected'
  createdAt: Date
  approvedAt?: Date
  suspensionReason?: string
}

export interface ServiceRequirement {
  serviceName: string
  requiresDiploma: boolean
  requiredDiplomaTypes?: string[]
  description?: string
}
