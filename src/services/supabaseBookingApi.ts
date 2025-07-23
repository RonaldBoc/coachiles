import { supabase, type Tables } from '@/utils/supabase'
import type { Booking, CreateBookingData, UpdateBookingData, BookingFilters, BookingStats } from '@/types/booking'
import { handleApiError } from '@/utils/errors'

// Helper function to map Supabase data to our Booking interface
const mapSupabaseToBooking = (supabaseData: Tables<'bookings'>): Booking => {
  return {
    id: supabaseData.id,
    createdAt: new Date(supabaseData.created_at),
    updatedAt: new Date(supabaseData.updated_at),
    serviceId: supabaseData.service_id,
    coachId: supabaseData.coach_id,
    clientName: supabaseData.client_name,
    clientEmail: supabaseData.client_email,
    clientPhone: supabaseData.client_phone || undefined,
    scheduledAt: new Date(supabaseData.scheduled_at),
    durationMinutes: supabaseData.duration_minutes,
    timezone: supabaseData.timezone || 'Europe/Paris',
    status: supabaseData.status as 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show',
    paymentStatus: supabaseData.payment_status as 'pending' | 'paid' | 'refunded' | 'failed',
    totalAmount: Number(supabaseData.total_amount),
    currency: supabaseData.currency || 'EUR',
    notes: supabaseData.notes || undefined,
    internalNotes: supabaseData.internal_notes || undefined,
    confirmedAt: supabaseData.confirmed_at ? new Date(supabaseData.confirmed_at) : undefined,
    cancelledAt: supabaseData.cancelled_at ? new Date(supabaseData.cancelled_at) : undefined,
    cancellationReason: supabaseData.cancellation_reason || undefined,
    reminderSentAt: supabaseData.reminder_sent_at ? new Date(supabaseData.reminder_sent_at) : undefined,
    meetingUrl: supabaseData.meeting_url || undefined,
    meetingId: supabaseData.meeting_id || undefined,
    meetingPassword: supabaseData.meeting_password || undefined,
  }
}

export const supabaseBookingApi = {
  // Get bookings with filtering
  getBookings: async (params?: {
    page?: number
    limit?: number
    filters?: BookingFilters
  }) => {
    try {
      let query = supabase.from('bookings').select(`
        *,
        services(
          id,
          name,
          category,
          duration_minutes,
          price
        ),
        coaches(
          id,
          first_name,
          avatar_url,
          phone,
          email
        )
      `)

      // Apply filters
      if (params?.filters) {
        const { filters } = params
        
        if (filters.coachId) {
          query = query.eq('coach_id', filters.coachId)
        }
        if (filters.status) {
          query = query.eq('status', filters.status)
        }
        if (filters.paymentStatus) {
          query = query.eq('payment_status', filters.paymentStatus)
        }
        if (filters.clientEmail) {
          query = query.eq('client_email', filters.clientEmail)
        }
        if (filters.startDate) {
          query = query.gte('scheduled_at', filters.startDate.toISOString())
        }
        if (filters.endDate) {
          query = query.lte('scheduled_at', filters.endDate.toISOString())
        }
      }

      // Apply pagination
      const page = params?.page || 1
      const limit = params?.limit || 20
      const offset = (page - 1) * limit

      // Get total count
      const { count, error: countError } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })

      if (countError) throw countError

      // Get data with pagination
      const { data, error } = await query
        .range(offset, offset + limit - 1)
        .order('scheduled_at', { ascending: false })

      if (error) throw error

      return {
        data: data?.map(item => ({
          ...mapSupabaseToBooking(item),
          service: item.services ? {
            id: item.services.id,
            name: item.services.name,
            category: item.services.category,
            durationMinutes: item.services.duration_minutes,
            price: Number(item.services.price)
          } : undefined,
          coach: item.coaches ? {
            id: item.coaches.id,
            firstName: item.coaches.first_name,
            photo: item.coaches.avatar_url,
            phone: item.coaches.phone,
            email: item.coaches.email
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

  // Get booking by ID
  getBookingById: async (id: string): Promise<Booking> => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          services(
            id,
            name,
            category,
            duration_minutes,
            price,
            location_type
          ),
          coaches(
            id,
            first_name,
            avatar_url,
            phone,
            email
          )
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      if (!data) throw new Error('Booking not found')

      return {
        ...mapSupabaseToBooking(data),
        service: data.services ? {
          id: data.services.id,
          name: data.services.name,
          category: data.services.category,
          durationMinutes: data.services.duration_minutes,
          price: Number(data.services.price),
          locationType: data.services.location_type as 'online' | 'in-person' | 'both'
        } : undefined,
        coach: data.coaches ? {
          id: data.coaches.id,
          firstName: data.coaches.first_name,
          photo: data.coaches.avatar_url,
          phone: data.coaches.phone,
          email: data.coaches.email
        } : undefined
      }
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Get bookings for a specific coach
  getCoachBookings: async (coachId: string, filters?: {
    status?: string
    startDate?: Date
    endDate?: Date
    limit?: number
  }): Promise<Booking[]> => {
    try {
      let query = supabase
        .from('bookings')
        .select(`
          *,
          services(
            id,
            name,
            category
          )
        `)
        .eq('coach_id', coachId)

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      if (filters?.startDate) {
        query = query.gte('scheduled_at', filters.startDate.toISOString())
      }
      if (filters?.endDate) {
        query = query.lte('scheduled_at', filters.endDate.toISOString())
      }

      const { data, error } = await query
        .order('scheduled_at', { ascending: true })
        .limit(filters?.limit || 50)

      if (error) throw error

      return data?.map(item => ({
        ...mapSupabaseToBooking(item),
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

  // Create new booking
  createBooking: async (bookingData: CreateBookingData): Promise<Booking> => {
    try {
      // Get service details to calculate total amount
      const { data: service, error: serviceError } = await supabase
        .from('services')
        .select('price, duration_minutes, coach_id')
        .eq('id', bookingData.serviceId)
        .single()

      if (serviceError) throw serviceError
      if (!service) throw new Error('Service not found')

      const { data, error } = await supabase
        .from('bookings')
        .insert({
          service_id: bookingData.serviceId,
          coach_id: service.coach_id,
          client_name: bookingData.clientName,
          client_email: bookingData.clientEmail,
          client_phone: bookingData.clientPhone,
          scheduled_at: bookingData.scheduledAt.toISOString(),
          duration_minutes: service.duration_minutes,
          timezone: bookingData.timezone || 'Europe/Paris',
          total_amount: service.price,
          currency: 'EUR',
          notes: bookingData.notes,
          status: 'pending',
          payment_status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      if (!data) throw new Error('Failed to create booking')

      return mapSupabaseToBooking(data)
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Update booking
  updateBooking: async (id: string, updates: UpdateBookingData): Promise<Booking> => {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      }

      if (updates.status) {
        updateData.status = updates.status
        
        // Set confirmation/cancellation timestamps
        if (updates.status === 'confirmed') {
          updateData.confirmed_at = new Date().toISOString()
        } else if (updates.status === 'cancelled') {
          updateData.cancelled_at = new Date().toISOString()
        }
      }

      if (updates.paymentStatus) {
        updateData.payment_status = updates.paymentStatus
      }

      if (updates.scheduledAt) {
        updateData.scheduled_at = updates.scheduledAt.toISOString()
      }

      if (updates.notes !== undefined) {
        updateData.notes = updates.notes
      }

      if (updates.internalNotes !== undefined) {
        updateData.internal_notes = updates.internalNotes
      }

      if (updates.cancellationReason !== undefined) {
        updateData.cancellation_reason = updates.cancellationReason
      }

      if (updates.meetingUrl !== undefined) {
        updateData.meeting_url = updates.meetingUrl
      }

      if (updates.meetingId !== undefined) {
        updateData.meeting_id = updates.meetingId
      }

      if (updates.meetingPassword !== undefined) {
        updateData.meeting_password = updates.meetingPassword
      }

      const { data, error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      if (!data) throw new Error('Booking not found')

      return mapSupabaseToBooking(data)
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Cancel booking
  cancelBooking: async (id: string, reason?: string): Promise<Booking> => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancellation_reason: reason,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      if (!data) throw new Error('Booking not found')

      return mapSupabaseToBooking(data)
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Confirm booking
  confirmBooking: async (id: string, meetingDetails?: {
    meetingUrl?: string
    meetingId?: string
    meetingPassword?: string
  }): Promise<Booking> => {
    try {
      const updateData: any = {
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      if (meetingDetails?.meetingUrl) {
        updateData.meeting_url = meetingDetails.meetingUrl
      }
      if (meetingDetails?.meetingId) {
        updateData.meeting_id = meetingDetails.meetingId
      }
      if (meetingDetails?.meetingPassword) {
        updateData.meeting_password = meetingDetails.meetingPassword
      }

      const { data, error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      if (!data) throw new Error('Booking not found')

      return mapSupabaseToBooking(data)
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Mark booking as completed
  completeBooking: async (id: string): Promise<Booking> => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      if (!data) throw new Error('Booking not found')

      return mapSupabaseToBooking(data)
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Get booking statistics for a coach
  getBookingStats: async (coachId: string): Promise<BookingStats> => {
    try {
      const now = new Date()
      const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

      // Get all bookings for the coach
      const { data: allBookings, error: allError } = await supabase
        .from('bookings')
        .select('status, payment_status, total_amount, created_at, client_email')
        .eq('coach_id', coachId)

      if (allError) throw allError

      // Calculate stats
      const totalBookings = allBookings?.length || 0
      const pendingBookings = allBookings?.filter(b => b.status === 'pending').length || 0
      const confirmedBookings = allBookings?.filter(b => b.status === 'confirmed').length || 0
      const completedBookings = allBookings?.filter(b => b.status === 'completed').length || 0
      const cancelledBookings = allBookings?.filter(b => b.status === 'cancelled').length || 0
      
      const totalRevenue = allBookings
        ?.filter(b => b.payment_status === 'paid')
        .reduce((sum, b) => sum + Number(b.total_amount), 0) || 0

      // This month stats
      const thisMonthBookings = allBookings?.filter(b => 
        new Date(b.created_at) >= firstDayThisMonth
      ) || []
      
      const thisMonthRevenue = thisMonthBookings
        .filter(b => b.payment_status === 'paid')
        .reduce((sum, b) => sum + Number(b.total_amount), 0)

      const thisMonthNewClients = new Set(thisMonthBookings.map(b => b.client_email)).size

      // Last month stats
      const lastMonthBookings = allBookings?.filter(b => {
        const createdAt = new Date(b.created_at)
        return createdAt >= firstDayLastMonth && createdAt <= lastDayLastMonth
      }) || []

      const lastMonthRevenue = lastMonthBookings
        .filter(b => b.payment_status === 'paid')
        .reduce((sum, b) => sum + Number(b.total_amount), 0)

      const lastMonthNewClients = new Set(lastMonthBookings.map(b => b.client_email)).size

      return {
        totalBookings,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        cancelledBookings,
        totalRevenue,
        thisMonth: {
          bookings: thisMonthBookings.length,
          revenue: thisMonthRevenue,
          newClients: thisMonthNewClients,
        },
        lastMonth: {
          bookings: lastMonthBookings.length,
          revenue: lastMonthRevenue,
          newClients: lastMonthNewClients,
        },
      }
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Check for booking conflicts
  checkBookingConflicts: async (
    coachId: string,
    scheduledAt: Date,
    durationMinutes: number,
    excludeBookingId?: string
  ): Promise<boolean> => {
    try {
      const startTime = new Date(scheduledAt)
      const endTime = new Date(startTime.getTime() + durationMinutes * 60000)

      let query = supabase
        .from('bookings')
        .select('id, scheduled_at, duration_minutes')
        .eq('coach_id', coachId)
        .in('status', ['confirmed', 'pending'])

      if (excludeBookingId) {
        query = query.neq('id', excludeBookingId)
      }

      const { data, error } = await query

      if (error) throw error

      // Check for overlapping bookings
      const hasConflict = data?.some(booking => {
        const existingStart = new Date(booking.scheduled_at)
        const existingEnd = new Date(existingStart.getTime() + booking.duration_minutes * 60000)

        // Check if times overlap
        return (startTime < existingEnd && endTime > existingStart)
      }) || false

      return hasConflict
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Get upcoming bookings for a coach
  getUpcomingBookings: async (coachId: string, limit = 10): Promise<Booking[]> => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          services(
            id,
            name,
            category
          )
        `)
        .eq('coach_id', coachId)
        .in('status', ['confirmed', 'pending'])
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(limit)

      if (error) throw error

      return data?.map(item => ({
        ...mapSupabaseToBooking(item),
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
}

export default supabaseBookingApi