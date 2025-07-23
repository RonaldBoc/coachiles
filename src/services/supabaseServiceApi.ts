import { supabase, type Tables } from '@/utils/supabase'
import type { Service, CreateServiceData, UpdateServiceData, ServiceFilters } from '@/types/service'
import { handleApiError } from '@/utils/errors'

// Helper function to map Supabase data to our Service interface
const mapSupabaseToService = (supabaseData: Tables<'services'>): Service => {
  return {
    id: supabaseData.id,
    createdAt: new Date(supabaseData.created_at),
    updatedAt: new Date(supabaseData.updated_at),
    coachId: supabaseData.coach_id,
    name: supabaseData.name,
    description: supabaseData.description || undefined,
    category: supabaseData.category,
    subcategory: supabaseData.subcategory || undefined,
    price: Number(supabaseData.price),
    durationMinutes: supabaseData.duration_minutes,
    locationType: supabaseData.location_type as 'online' | 'in-person' | 'both',
    groupSize: supabaseData.group_size as 'individual' | 'small_group' | 'large_group',
    maxParticipants: supabaseData.max_participants || 1,
    isActive: supabaseData.is_active,
    requiresApproval: supabaseData.requires_approval,
    advanceBookingHours: supabaseData.advance_booking_hours || 24,
    tags: supabaseData.tags || [],
    targetAudience: supabaseData.target_audience || [],
    prerequisites: supabaseData.prerequisites || undefined,
    materialsIncluded: supabaseData.materials_included || undefined,
    cancellationPolicy: supabaseData.cancellation_policy || undefined,
  }
}

// Helper function to map our Service data to Supabase format
const mapServiceToSupabase = (serviceData: CreateServiceData | UpdateServiceData) => {
  return {
    name: serviceData.name,
    description: serviceData.description,
    category: serviceData.category,
    subcategory: serviceData.subcategory,
    price: serviceData.price,
    duration_minutes: serviceData.durationMinutes,
    location_type: serviceData.locationType || 'both',
    group_size: serviceData.groupSize || 'individual',
    max_participants: serviceData.maxParticipants || 1,
    requires_approval: serviceData.requiresApproval || false,
    advance_booking_hours: serviceData.advanceBookingHours || 24,
    tags: serviceData.tags || [],
    target_audience: serviceData.targetAudience || [],
    prerequisites: serviceData.prerequisites,
    materials_included: serviceData.materialsIncluded,
    cancellation_policy: serviceData.cancellationPolicy,
  }
}

export const supabaseServiceApi = {
  // Get all services with filtering
  getServices: async (params?: {
    page?: number
    limit?: number
    filters?: ServiceFilters
    coachId?: string
  }) => {
    try {
      let query = supabase.from('services').select('*')

      // Apply coach filter
      if (params?.coachId) {
        query = query.eq('coach_id', params.coachId)
      }

      // Apply other filters
      if (params?.filters) {
        const { filters } = params
        
        if (filters.category) {
          query = query.eq('category', filters.category)
        }
        if (filters.subcategory) {
          query = query.eq('subcategory', filters.subcategory)
        }
        if (filters.locationType) {
          query = query.eq('location_type', filters.locationType)
        }
        if (filters.groupSize) {
          query = query.eq('group_size', filters.groupSize)
        }
        if (filters.minPrice) {
          query = query.gte('price', filters.minPrice)
        }
        if (filters.maxPrice) {
          query = query.lte('price', filters.maxPrice)
        }
        if (filters.tags?.length) {
          query = query.overlaps('tags', filters.tags)
        }
        if (filters.search) {
          query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
        }
      }

      // Only show active services by default (unless specified otherwise)
      query = query.eq('is_active', true)

      // Apply pagination
      const page = params?.page || 1
      const limit = params?.limit || 20
      const offset = (page - 1) * limit

      // Get total count
      const { count, error: countError } = await supabase
        .from('services')
        .select('*', { count: 'exact', head: true })

      if (countError) throw countError

      // Get data with pagination
      const { data, error } = await query
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false })

      if (error) throw error

      return {
        data: data?.map(mapSupabaseToService) || [],
        total: count || 0,
        page,
        limit,
      }
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Get service by ID
  getServiceById: async (id: string): Promise<Service> => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      if (!data) throw new Error('Service not found')

      return mapSupabaseToService(data)
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Get services for a specific coach
  getCoachServices: async (coachId: string): Promise<Service[]> => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('coach_id', coachId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data?.map(mapSupabaseToService) || []
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Create new service
  createService: async (coachId: string, serviceData: CreateServiceData): Promise<Service> => {
    try {
      const { data, error } = await supabase
        .from('services')
        .insert({
          coach_id: coachId,
          ...mapServiceToSupabase(serviceData),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      if (!data) throw new Error('Failed to create service')

      return mapSupabaseToService(data)
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Update service
  updateService: async (id: string, updates: UpdateServiceData): Promise<Service> => {
    try {
      const { data, error } = await supabase
        .from('services')
        .update({
          ...mapServiceToSupabase(updates),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      if (!data) throw new Error('Service not found')

      return mapSupabaseToService(data)
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Delete service
  deleteService: async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Toggle service active status
  toggleServiceStatus: async (id: string): Promise<Service> => {
    try {
      // First get current status
      const { data: currentData, error: fetchError } = await supabase
        .from('services')
        .select('is_active')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError
      if (!currentData) throw new Error('Service not found')

      // Toggle status
      const { data, error } = await supabase
        .from('services')
        .update({
          is_active: !currentData.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      if (!data) throw new Error('Service not found')

      return mapSupabaseToService(data)
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Get service categories (for filtering/dropdowns)
  getServiceCategories: async (): Promise<string[]> => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('category')
        .eq('is_active', true)

      if (error) throw error

      // Get unique categories
      const categories = [...new Set(data?.map(item => item.category) || [])]
      return categories.filter(Boolean)
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Get subcategories for a specific category
  getServiceSubcategories: async (category: string): Promise<string[]> => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('subcategory')
        .eq('category', category)
        .eq('is_active', true)

      if (error) throw error

      // Get unique subcategories
      const subcategories = [...new Set(data?.map(item => item.subcategory).filter(Boolean) || [])]
      return subcategories
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Search services with advanced filters
  searchServices: async (searchParams: {
    query?: string
    category?: string
    location?: string
    maxPrice?: number
    coachId?: string
    limit?: number
  }) => {
    try {
      let query = supabase.from('services').select(`
        *,
        coaches!inner(
          id,
          first_name,
          avatar_url,
          rating,
          locations
        )
      `)

      query = query.eq('is_active', true)

      if (searchParams.query) {
        query = query.or(
          `name.ilike.%${searchParams.query}%,description.ilike.%${searchParams.query}%,category.ilike.%${searchParams.query}%`
        )
      }

      if (searchParams.category) {
        query = query.eq('category', searchParams.category)
      }

      if (searchParams.maxPrice) {
        query = query.lte('price', searchParams.maxPrice)
      }

      if (searchParams.coachId) {
        query = query.eq('coach_id', searchParams.coachId)
      }

      if (searchParams.location) {
        query = query.eq('coaches.locations', `cs.{${searchParams.location}}`)
      }

      const { data, error } = await query
        .order('price', { ascending: true })
        .limit(searchParams.limit || 20)

      if (error) throw error

      return data?.map(item => ({
        ...mapSupabaseToService(item),
        coach: item.coaches ? {
          id: item.coaches.id,
          firstName: item.coaches.first_name,
          photo: item.coaches.avatar_url,
          rating: item.coaches.rating,
          location: item.coaches.locations?.[0] || '',
        } : undefined
      })) || []
    } catch (error) {
      throw handleApiError(error)
    }
  },
}

export default supabaseServiceApi