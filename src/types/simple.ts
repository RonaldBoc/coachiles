// Simplified types for partial objects returned by API queries
export interface SimpleCoach {
  id: string
  firstName: string
  photo?: string
  email?: string
  phone?: string
  rating?: number
}

export interface SimpleService {
  id: string
  name: string
  category: string
  price?: number
  durationMinutes?: number
  locationType?: string
}

export interface SimpleBooking {
  id: string
  clientName?: string
  clientEmail?: string
  scheduledAt: Date
}

export interface SimpleReview {
  id: string
  rating: number
  comment?: string
  createdAt: Date
}