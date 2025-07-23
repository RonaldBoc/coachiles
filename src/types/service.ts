// Service types for coach marketplace
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