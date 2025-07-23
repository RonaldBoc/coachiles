import { supabase, type Tables } from '@/utils/supabase'
import type { Coach } from '@/types/coach'
import { handleApiError } from '@/utils/errors'

// Helper function to map Supabase data to our Coach interface
const mapSupabaseToCoach = (supabaseData: Tables<'coaches'>): Coach => {
  return {
    id: supabaseData.id,
    firstName: supabaseData.first_name,
    lastName: '', // Not stored in Supabase for privacy
    email: supabaseData.email,
    phone: supabaseData.phone || '',
    photo: supabaseData.avatar_url || undefined,
    bio: supabaseData.bio || '',
    location: supabaseData.locations?.[0] || 'Martinique', // Take first location
    specialties: supabaseData.specialties || [],
    certifications: supabaseData.certifications || [],
    experience: supabaseData.experience_years || 0,
    availability: supabaseData.availability?.join(', ') || '',
    rating: supabaseData.rating || 0,
    totalClients: supabaseData.total_sessions || 0,
    subscriptionStatus: supabaseData.subscription_type === 'free' ? 'inactive' : 'active',
    services: [], // Not implemented yet
    createdAt: new Date(supabaseData.created_at),
    updatedAt: new Date(supabaseData.updated_at),
    isActive: supabaseData.is_active,
  }
}

// Supabase Coach API service
export const supabaseCoachApi = {
  // Get all coaches with filtering and pagination
  getCoaches: async (params?: {
    page?: number
    limit?: number
    specialties?: string[]
    locations?: string[]
    experienceMin?: number
    rateMax?: number
    languages?: string[]
    search?: string
  }) => {
    try {
      let query = supabase.from('coaches').select('*').eq('is_active', true)

      // Apply filters
      if (params?.specialties?.length) {
        query = query.overlaps('specialties', params.specialties)
      }
      if (params?.locations?.length) {
        query = query.overlaps('locations', params.locations)
      }
      if (params?.experienceMin) {
        query = query.gte('experience_years', params.experienceMin)
      }
      if (params?.rateMax) {
        query = query.lte('hourly_rate', params.rateMax)
      }
      if (params?.languages?.length) {
        query = query.overlaps('languages', params.languages)
      }
      if (params?.search) {
        query = query.or(`first_name.ilike.%${params.search}%,bio.ilike.%${params.search}%`)
      }

      // Apply pagination
      const page = params?.page || 1
      const limit = params?.limit || 12
      const offset = (page - 1) * limit

      // Get total count first (without pagination)
      let countQuery = supabase
        .from('coaches')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      // Apply same filters for count
      if (params?.specialties?.length) {
        countQuery = countQuery.overlaps('specialties', params.specialties)
      }
      if (params?.locations?.length) {
        countQuery = countQuery.overlaps('locations', params.locations)
      }
      if (params?.experienceMin) {
        countQuery = countQuery.gte('experience_years', params.experienceMin)
      }
      if (params?.rateMax) {
        countQuery = countQuery.lte('hourly_rate', params.rateMax)
      }
      if (params?.languages?.length) {
        countQuery = countQuery.overlaps('languages', params.languages)
      }
      if (params?.search) {
        countQuery = countQuery.or(
          `first_name.ilike.%${params.search}%,bio.ilike.%${params.search}%`,
        )
      }

      const { count, error: countError } = await countQuery

      if (countError) {
        console.error('Supabase count error:', countError)
        throw countError
      }

      // Get data with pagination
      const { data, error } = await query
        .range(offset, offset + limit - 1)
        .order('rating', { ascending: false })

      if (error) {
        console.error('Supabase query error:', error)
        throw error
      }

      console.log('Supabase query result:', { data, totalItems: data?.length, totalCount: count })

      // Map Supabase data to our Coach interface
      const mappedCoaches = data?.map(mapSupabaseToCoach) || []
      console.log('✅ Mapped coaches:', mappedCoaches)

      return {
        data: mappedCoaches,
        total: count || 0,
        page,
        limit,
      }
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Get coach by ID
  getCoachById: async (id: string): Promise<Coach> => {
    try {
      const { data, error } = await supabase.from('coaches').select('*').eq('id', id).single()

      if (error) throw error
      if (!data) throw new Error('Coach not found')

      return mapSupabaseToCoach(data)
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Get coach by first name (for URL routing)
  getCoachByFirstName: async (firstName: string): Promise<Coach> => {
    try {
      const { data, error } = await supabase
        .from('coaches')
        .select('*')
        .eq('first_name', firstName)
        .eq('is_active', true)
        .single()

      if (error) throw error
      if (!data) throw new Error('Coach not found')

      return mapSupabaseToCoach(data)
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Update coach profile
  updateCoach: async (id: string, updates: Partial<Coach>): Promise<Coach> => {
    try {
      const { data, error } = await supabase
        .from('coaches')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      if (!data) throw new Error('Coach not found')

      return data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Create new coach profile
  createCoach: async (coachData: Omit<Coach, 'id' | 'createdAt' | 'updatedAt'>): Promise<Coach> => {
    try {
      const { data, error } = await supabase
        .from('coaches')
        .insert({
          ...coachData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      if (!data) throw new Error('Failed to create coach profile')

      return data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Upload avatar image (alias for compatibility)
  uploadPhoto: async (coachId: string, file: File): Promise<{ photoUrl: string }> => {
    const avatarUrl = await supabaseCoachApi.uploadAvatar(coachId, file)
    return { photoUrl: avatarUrl }
  },

  // Upload avatar image
  uploadAvatar: async (coachId: string, file: File): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${coachId}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('coach-avatars')
        .upload(filePath, file, {
          upsert: true,
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data } = supabase.storage.from('coach-avatars').getPublicUrl(filePath)

      // Update coach record with new avatar URL
      await supabase.from('coaches').update({ avatar_url: data.publicUrl }).eq('id', coachId)

      return data.publicUrl
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Get similar coaches (for recommendations)
  getSimilarCoaches: async (coachId: string, limit = 3): Promise<Coach[]> => {
    try {
      // First get the coach's specialties
      const { data: coach, error: coachError } = await supabase
        .from('coaches')
        .select('specialties')
        .eq('id', coachId)
        .single()

      if (coachError) throw coachError

      // Find coaches with similar specialties
      const { data, error } = await supabase
        .from('coaches')
        .select('*')
        .overlaps('specialties', coach.specialties)
        .neq('id', coachId)
        .eq('is_active', true)
        .order('rating', { ascending: false })
        .limit(limit)

      if (error) throw error

      return data?.map(mapSupabaseToCoach) || []
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Get coach statistics
  getCoachStats: async (coachId: string) => {
    try {
      // This would typically involve complex queries or database functions
      // For now, return basic stats from the coach record
      const { data: coach, error } = await supabase
        .from('coaches')
        .select('total_sessions, rating, response_time_hours')
        .eq('id', coachId)
        .single()

      if (error) throw error

      return {
        totalSessions: coach.total_sessions,
        averageRating: coach.rating,
        responseTimeHours: coach.response_time_hours,
        // These would come from more complex queries in a real implementation
        monthlyEarnings: 0,
        clientRetentionRate: 0,
        leadConversionRate: 0,
      }
    } catch (error) {
      throw handleApiError(error)
    }
  },
}

export default supabaseCoachApi
