// Review types for coach ratings and feedback
export interface Review {
  id: string
  createdAt: Date
  updatedAt: Date

  // Review Details
  bookingId?: string
  coachId: string
  serviceId?: string

  // Client Info
  clientName: string
  clientEmail: string

  // Review Content
  rating: number // 1-5
  title?: string
  comment?: string

  // Category Ratings (optional detailed feedback)
  communicationRating?: number // 1-5
  professionalismRating?: number // 1-5
  expertiseRating?: number // 1-5
  valueRating?: number // 1-5

  // Status & Moderation
  isVerified: boolean
  isPublished: boolean
  isAnonymous: boolean
  moderationStatus: 'pending' | 'approved' | 'rejected'
  moderationNotes?: string

  // Response from Coach
  coachResponse?: string
  coachRespondedAt?: Date
  coachResponseHidden?: boolean

  // Related data (populated in queries)
  booking?: import('./simple').SimpleBooking
  coach?: import('./simple').SimpleCoach
  service?: import('./simple').SimpleService
}

export interface CreateReviewData {
  bookingId?: string
  coachId: string
  serviceId?: string
  clientName: string
  clientEmail: string
  rating: number
  title?: string
  comment?: string
  communicationRating?: number
  professionalismRating?: number
  expertiseRating?: number
  valueRating?: number
  isAnonymous?: boolean
  // Optional Google reCAPTCHA token for anti-bot verification (handled server-side)
  captchaToken?: string
}

export interface UpdateReviewData {
  rating?: number
  title?: string
  comment?: string
  communicationRating?: number
  professionalismRating?: number
  expertiseRating?: number
  valueRating?: number
  isPublished?: boolean
  moderationStatus?: 'pending' | 'approved' | 'rejected'
  moderationNotes?: string
  coachResponse?: string
}

export interface ReviewFilters {
  coachId?: string
  serviceId?: string
  rating?: number
  minRating?: number
  maxRating?: number
  isPublished?: boolean
  moderationStatus?: 'pending' | 'approved' | 'rejected'
  startDate?: Date
  endDate?: Date
  hasCoachResponse?: boolean
}

export interface ReviewStats {
  totalReviews: number
  averageRating: number
  ratingDistribution: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
  categoryAverages: {
    communication: number
    professionalism: number
    expertise: number
    value: number
  }
  thisMonth: {
    reviews: number
    averageRating: number
  }
  lastMonth: {
    reviews: number
    averageRating: number
  }
}

export interface CoachReviewSummary {
  coachId: string
  totalReviews: number
  averageRating: number
  latestReviews: Review[]
  ratingTrend: 'up' | 'down' | 'stable'
}
