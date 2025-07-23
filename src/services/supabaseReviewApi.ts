import { supabase, type Tables } from '@/utils/supabase'
import type { Review, CreateReviewData, UpdateReviewData, ReviewFilters, ReviewStats } from '@/types/review'
import { handleApiError } from '@/utils/errors'

// Helper function to map Supabase data to our Review interface
const mapSupabaseToReview = (supabaseData: Tables<'reviews'>): Review => {
  return {
    id: supabaseData.id,
    createdAt: new Date(supabaseData.created_at),
    updatedAt: new Date(supabaseData.updated_at),
    bookingId: supabaseData.booking_id || undefined,
    coachId: supabaseData.coach_id,
    serviceId: supabaseData.service_id || undefined,
    clientName: supabaseData.client_name,
    clientEmail: supabaseData.client_email,
    rating: supabaseData.rating,
    title: supabaseData.title || undefined,
    comment: supabaseData.comment || undefined,
    communicationRating: supabaseData.communication_rating || undefined,
    professionalismRating: supabaseData.professionalism_rating || undefined,
    expertiseRating: supabaseData.expertise_rating || undefined,
    valueRating: supabaseData.value_rating || undefined,
    isVerified: supabaseData.is_verified,
    isPublished: supabaseData.is_published,
    isAnonymous: supabaseData.is_anonymous,
    moderationStatus: supabaseData.moderation_status as 'pending' | 'approved' | 'rejected',
    moderationNotes: supabaseData.moderation_notes || undefined,
    coachResponse: supabaseData.coach_response || undefined,
    coachRespondedAt: supabaseData.coach_responded_at ? new Date(supabaseData.coach_responded_at) : undefined,
  }
}

export const supabaseReviewApi = {
  // Get reviews with filtering
  getReviews: async (params?: {
    page?: number
    limit?: number
    filters?: ReviewFilters
  }) => {
    try {
      let query = supabase.from('reviews').select(`
        *,
        coaches(
          id,
          first_name,
          avatar_url
        ),
        services(
          id,
          name,
          category
        ),
        bookings(
          id,
          scheduled_at,
          client_name
        )
      `)

      // Apply filters
      if (params?.filters) {
        const { filters } = params
        
        if (filters.coachId) {
          query = query.eq('coach_id', filters.coachId)
        }
        if (filters.serviceId) {
          query = query.eq('service_id', filters.serviceId)
        }
        if (filters.rating) {
          query = query.eq('rating', filters.rating)
        }
        if (filters.minRating) {
          query = query.gte('rating', filters.minRating)
        }
        if (filters.maxRating) {
          query = query.lte('rating', filters.maxRating)
        }
        if (filters.isPublished !== undefined) {
          query = query.eq('is_published', filters.isPublished)
        }
        if (filters.moderationStatus) {
          query = query.eq('moderation_status', filters.moderationStatus)
        }
        if (filters.hasCoachResponse !== undefined) {
          if (filters.hasCoachResponse) {
            query = query.not('coach_response', 'is', null)
          } else {
            query = query.is('coach_response', null)
          }
        }
        if (filters.startDate) {
          query = query.gte('created_at', filters.startDate.toISOString())
        }
        if (filters.endDate) {
          query = query.lte('created_at', filters.endDate.toISOString())
        }
      }

      // Only show published reviews by default for public queries
      if (!params?.filters || params.filters.isPublished !== false) {
        query = query.eq('is_published', true)
      }

      // Apply pagination
      const page = params?.page || 1
      const limit = params?.limit || 20
      const offset = (page - 1) * limit

      // Get total count
      const { count, error: countError } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })

      if (countError) throw countError

      // Get data with pagination
      const { data, error } = await query
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false })

      if (error) throw error

      return {
        data: data?.map(item => ({
          ...mapSupabaseToReview(item),
          coach: item.coaches ? {
            id: item.coaches.id,
            firstName: item.coaches.first_name,
            photo: item.coaches.avatar_url,
          } : undefined,
          service: item.services ? {
            id: item.services.id,
            name: item.services.name,
            category: item.services.category,
          } : undefined,
          booking: item.bookings ? {
            id: item.bookings.id,
            scheduledAt: new Date(item.bookings.scheduled_at),
            clientName: item.bookings.client_name || undefined,
          } : undefined
        })) || [],
        total: count || 0,
        page,
        limit,
      }
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Get review by ID
  getReviewById: async (id: string): Promise<Review> => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          coaches(
            id,
            first_name,
            avatar_url
          ),
          services(
            id,
            name,
            category
          ),
          bookings(
            id,
            scheduled_at,
            client_name
          )
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      if (!data) throw new Error('Review not found')

      return {
        ...mapSupabaseToReview(data),
        coach: data.coaches ? {
          id: data.coaches.id,
          firstName: data.coaches.first_name,
          photo: data.coaches.avatar_url,
        } : undefined,
        service: data.services ? {
          id: data.services.id,
          name: data.services.name,
          category: data.services.category,
        } : undefined,
        booking: data.bookings ? {
          id: data.bookings.id,
          scheduledAt: new Date(data.bookings.scheduled_at),
          clientName: data.bookings.client_name,
        } : undefined
      }
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Get reviews for a specific coach
  getCoachReviews: async (coachId: string, params?: {
    page?: number
    limit?: number
    includeUnpublished?: boolean
  }): Promise<Review[]> => {
    try {
      let query = supabase
        .from('reviews')
        .select(`
          *,
          services(
            id,
            name,
            category
          ),
          bookings(
            id,
            scheduled_at,
            client_name
          )
        `)
        .eq('coach_id', coachId)

      // Only include published reviews unless specified otherwise
      if (!params?.includeUnpublished) {
        query = query.eq('is_published', true)
      }

      const limit = params?.limit || 50
      const page = params?.page || 1
      const offset = (page - 1) * limit

      const { data, error } = await query
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data?.map(item => ({
        ...mapSupabaseToReview(item),
        service: item.services ? {
          id: item.services.id,
          name: item.services.name,
          category: item.services.category,
        } : undefined,
        booking: item.bookings ? {
          id: item.bookings.id,
          scheduledAt: new Date(item.bookings.scheduled_at),
          clientName: item.bookings.client_name || undefined,
        } : undefined
      })) || []
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Create new review
  createReview: async (reviewData: CreateReviewData): Promise<Review> => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          booking_id: reviewData.bookingId,
          coach_id: reviewData.coachId,
          service_id: reviewData.serviceId,
          client_name: reviewData.clientName,
          client_email: reviewData.clientEmail,
          rating: reviewData.rating,
          title: reviewData.title,
          comment: reviewData.comment,
          communication_rating: reviewData.communicationRating,
          professionalism_rating: reviewData.professionalismRating,
          expertise_rating: reviewData.expertiseRating,
          value_rating: reviewData.valueRating,
          is_anonymous: reviewData.isAnonymous || false,
          is_verified: false, // Reviews start unverified
          is_published: true, // Auto-publish for now, can add moderation later
          moderation_status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      if (!data) throw new Error('Failed to create review')

      return mapSupabaseToReview(data)
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Update review
  updateReview: async (id: string, updates: UpdateReviewData): Promise<Review> => {
    try {
      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      }

      if (updates.rating !== undefined) updateData.rating = updates.rating
      if (updates.title !== undefined) updateData.title = updates.title
      if (updates.comment !== undefined) updateData.comment = updates.comment
      if (updates.communicationRating !== undefined) updateData.communication_rating = updates.communicationRating
      if (updates.professionalismRating !== undefined) updateData.professionalism_rating = updates.professionalismRating
      if (updates.expertiseRating !== undefined) updateData.expertise_rating = updates.expertiseRating
      if (updates.valueRating !== undefined) updateData.value_rating = updates.valueRating
      if (updates.isPublished !== undefined) updateData.is_published = updates.isPublished
      if (updates.moderationStatus !== undefined) updateData.moderation_status = updates.moderationStatus
      if (updates.moderationNotes !== undefined) updateData.moderation_notes = updates.moderationNotes
      if (updates.coachResponse !== undefined) {
        updateData.coach_response = updates.coachResponse
        updateData.coach_responded_at = new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('reviews')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      if (!data) throw new Error('Review not found')

      return mapSupabaseToReview(data)
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Add coach response to review
  addCoachResponse: async (reviewId: string, response: string): Promise<Review> => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .update({
          coach_response: response,
          coach_responded_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', reviewId)
        .select()
        .single()

      if (error) throw error
      if (!data) throw new Error('Review not found')

      return mapSupabaseToReview(data)
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Delete review
  deleteReview: async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Get review statistics for a coach
  getReviewStats: async (coachId: string): Promise<ReviewStats> => {
    try {
      const { data: reviews, error } = await supabase
        .from('reviews')
        .select('rating, communication_rating, professionalism_rating, expertise_rating, value_rating, created_at')
        .eq('coach_id', coachId)
        .eq('is_published', true)

      if (error) throw error

      const totalReviews = reviews?.length || 0
      
      if (totalReviews === 0) {
        return {
          totalReviews: 0,
          averageRating: 0,
          ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
          categoryAverages: { communication: 0, professionalism: 0, expertise: 0, value: 0 },
          thisMonth: { reviews: 0, averageRating: 0 },
          lastMonth: { reviews: 0, averageRating: 0 },
        }
      }

      // Calculate average rating
      const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews

      // Rating distribution
      const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      reviews.forEach(review => {
        ratingDistribution[review.rating as keyof typeof ratingDistribution]++
      })

      // Category averages
      const categoryRatings = {
        communication: reviews.filter(r => r.communication_rating).map(r => r.communication_rating!),
        professionalism: reviews.filter(r => r.professionalism_rating).map(r => r.professionalism_rating!),
        expertise: reviews.filter(r => r.expertise_rating).map(r => r.expertise_rating!),
        value: reviews.filter(r => r.value_rating).map(r => r.value_rating!),
      }

      const categoryAverages = {
        communication: categoryRatings.communication.length > 0 
          ? categoryRatings.communication.reduce((a, b) => a + b, 0) / categoryRatings.communication.length 
          : 0,
        professionalism: categoryRatings.professionalism.length > 0 
          ? categoryRatings.professionalism.reduce((a, b) => a + b, 0) / categoryRatings.professionalism.length 
          : 0,
        expertise: categoryRatings.expertise.length > 0 
          ? categoryRatings.expertise.reduce((a, b) => a + b, 0) / categoryRatings.expertise.length 
          : 0,
        value: categoryRatings.value.length > 0 
          ? categoryRatings.value.reduce((a, b) => a + b, 0) / categoryRatings.value.length 
          : 0,
      }

      // Monthly stats
      const now = new Date()
      const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

      const thisMonthReviews = reviews.filter(r => new Date(r.created_at) >= firstDayThisMonth)
      const lastMonthReviews = reviews.filter(r => {
        const createdAt = new Date(r.created_at)
        return createdAt >= firstDayLastMonth && createdAt <= lastDayLastMonth
      })

      const thisMonthAverage = thisMonthReviews.length > 0
        ? thisMonthReviews.reduce((sum, r) => sum + r.rating, 0) / thisMonthReviews.length
        : 0

      const lastMonthAverage = lastMonthReviews.length > 0
        ? lastMonthReviews.reduce((sum, r) => sum + r.rating, 0) / lastMonthReviews.length
        : 0

      return {
        totalReviews,
        averageRating: Math.round(averageRating * 100) / 100,
        ratingDistribution,
        categoryAverages: {
          communication: Math.round(categoryAverages.communication * 100) / 100,
          professionalism: Math.round(categoryAverages.professionalism * 100) / 100,
          expertise: Math.round(categoryAverages.expertise * 100) / 100,
          value: Math.round(categoryAverages.value * 100) / 100,
        },
        thisMonth: {
          reviews: thisMonthReviews.length,
          averageRating: Math.round(thisMonthAverage * 100) / 100,
        },
        lastMonth: {
          reviews: lastMonthReviews.length,
          averageRating: Math.round(lastMonthAverage * 100) / 100,
        },
      }
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Get latest reviews for homepage/featured display
  getLatestReviews: async (limit = 10): Promise<Review[]> => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          coaches(
            id,
            first_name,
            avatar_url
          ),
          services(
            id,
            name,
            category
          )
        `)
        .eq('is_published', true)
        .gte('rating', 4) // Only show good reviews on homepage
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return data?.map(item => ({
        ...mapSupabaseToReview(item),
        coach: item.coaches ? {
          id: item.coaches.id,
          firstName: item.coaches.first_name,
          photo: item.coaches.avatar_url,
        } : undefined,
        service: item.services ? {
          id: item.services.id,
          name: item.services.name,
          category: item.services.category,
        } : undefined
      })) || []
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Check if client can review a booking (booking must be completed)
  canReviewBooking: async (bookingId: string, clientEmail: string): Promise<boolean> => {
    try {
      // Check if booking exists, is completed, and belongs to client
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select('id, status, client_email')
        .eq('id', bookingId)
        .eq('client_email', clientEmail)
        .eq('status', 'completed')
        .single()

      if (bookingError || !booking) return false

      // Check if review already exists
      const { data: existingReview, error: reviewError } = await supabase
        .from('reviews')
        .select('id')
        .eq('booking_id', bookingId)
        .single()

      if (reviewError && reviewError.code !== 'PGRST116') {
        // PGRST116 is "not found" which is what we want
        throw reviewError
      }

      // Can review if no existing review found
      return !existingReview
    } catch (error) {
      throw handleApiError(error)
    }
  },
}

export default supabaseReviewApi