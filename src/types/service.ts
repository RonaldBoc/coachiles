// Service types for coach marketplace
export interface CoachService {
  id: string
  coachId: string
  title: string
  description: string

  // Service Type & Pricing
  canBeSolo: boolean
  canBeGroup: boolean
  soloPrice: number | null
  groupPrice: number | null

  // Category & Classification
  category: string // From coach's specialties
  subCategory?: string // (Deprecated) Optional custom text
  domain?: string // Derived higher-level grouping (ex: Fitness & Musculation)

  // Session Details
  duration: number // in minutes

  // Location Options
  canBeAtHome: boolean
  canBeOnline: boolean
  canBeInPublicSpaces: boolean
  // Custom specific place (optional JSON from DB)
  customPlace?: {
    label?: string
    address?: string
  }

  // Free Trial
  hasFreeTrial: boolean
  freeTrialModalities?: string

  // Cancellation
  cancellationPolicy: string

  // Availability
  useProfileAvailability: boolean
  customAvailability?: ServiceAvailability[]

  // Meta
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ServiceAvailability {
  dayOfWeek: number // 0=Sunday, 1=Monday, ..., 6=Saturday
  startTime: string // "09:00"
  endTime: string // "17:00"
  isActive: boolean
}

export interface ServiceFormData {
  title: string
  description: string
  canBeSolo: boolean
  canBeGroup: boolean
  soloPrice: number | null
  groupPrice: number | null
  category: string
  // Removed from UI; keeping for backward compatibility in code paths
  subCategory: string
  domain?: string
  duration: number
  canBeAtHome: boolean
  canBeOnline: boolean
  canBeInPublicSpaces: boolean
  canBeOtherLocation?: boolean
  otherLocationLabel?: string
  otherLocationAddress?: string
  // When persisting we map otherLocation* fields into customPlace JSON in DB
  customPlace?: {
    label?: string
    address?: string
  }
  hasFreeTrial: boolean
  freeTrialModalities: string
  cancellationPolicy: string
  useProfileAvailability: boolean
  customAvailability: ServiceAvailability[]
}

// Duration options (in minutes)
export const DURATION_OPTIONS = [
  { label: '30 minutes', value: 30 },
  { label: '45 minutes', value: 45 },
  { label: '1 heure', value: 60 },
  { label: '1h15', value: 75 },
  { label: '1h30', value: 90 },
  { label: '2 heures', value: 120 },
  { label: '2h30', value: 150 },
  { label: '3 heures', value: 180 },
]

// Default cancellation policies
export const CANCELLATION_POLICIES = [
  "Annulation gratuite jusqu'à 24h avant",
  "Annulation gratuite jusqu'à 48h avant",
  "Annulation gratuite jusqu'à 12h avant",
  "Annulation gratuite jusqu'à 2h avant",
  'Aucune annulation possible',
  'Autre (à préciser)',
]

// Legacy interface for backward compatibility
export interface Service {
  id: string
  createdAt: Date
  updatedAt: Date

  // Service Details
  coachId: string
  name: string
  description?: string
  category: string
  subcategory?: string

  // Pricing & Logistics
  price: number
  durationMinutes: number
  locationType: 'online' | 'in-person' | 'both'
  groupSize: 'individual' | 'small_group' | 'large_group'
  maxParticipants: number

  // Availability
  isActive: boolean
  requiresApproval: boolean
  advanceBookingHours: number

  // Metadata
  tags: string[]
  targetAudience: string[]
  prerequisites?: string
  materialsIncluded?: string
  cancellationPolicy?: string
}

export interface CreateServiceData {
  name: string
  description?: string
  category: string
  subcategory?: string
  price: number
  durationMinutes: number
  locationType?: 'online' | 'in-person' | 'both'
  groupSize?: 'individual' | 'small_group' | 'large_group'
  maxParticipants?: number
  requiresApproval?: boolean
  advanceBookingHours?: number
  tags?: string[]
  targetAudience?: string[]
  prerequisites?: string
  materialsIncluded?: string
  cancellationPolicy?: string
}

export interface UpdateServiceData {
  name?: string
  description?: string
  category?: string
  subcategory?: string
  price?: number
  durationMinutes?: number
  locationType?: 'online' | 'in-person' | 'both'
  groupSize?: 'individual' | 'small_group' | 'large_group'
  maxParticipants?: number
  isActive?: boolean
  requiresApproval?: boolean
  advanceBookingHours?: number
  tags?: string[]
  targetAudience?: string[]
  prerequisites?: string
  materialsIncluded?: string
  cancellationPolicy?: string
}

export interface ServiceFilters {
  category?: string
  subcategory?: string
  locationType?: 'online' | 'in-person' | 'both'
  groupSize?: 'individual' | 'small_group' | 'large_group'
  minPrice?: number
  maxPrice?: number
  tags?: string[]
  search?: string
}
