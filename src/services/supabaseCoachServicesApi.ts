// Supabase Coach Services API
// src/services/supabaseCoachServicesApi.ts

import { supabase } from '@/utils/supabase'
import type { CoachService, ServiceFormData } from '@/types/service'

interface DbCustomPlace {
  label?: string | null
  address?: string | null
}

// Database types
interface DbCoachService {
  id: string
  coach_id: string
  title: string
  description: string | null
  can_be_solo: boolean
  can_be_group: boolean
  solo_price: number | null
  group_price: number | null
  solo_price_unit?: 'per_hour' | 'per_session' | null
  group_price_unit?: 'per_hour' | 'per_session' | null
  category: string
  sub_category: string | null
  domain: string | null
  duration: number
  can_be_at_home: boolean
  can_be_online: boolean
  can_be_in_public_spaces: boolean
  custom_place: DbCustomPlace | null
  has_free_trial: boolean
  free_trial_modalities: string | null
  cancellation_policy: string
  use_profile_availability: boolean
  custom_availability: unknown | null
  is_active: boolean
  created_at: string
  updated_at: string
}

interface DbCoachServiceInsert {
  coach_id?: string
  title: string
  description: string | null
  can_be_solo: boolean
  can_be_group: boolean
  solo_price: number | null
  group_price: number | null
  solo_price_unit?: 'per_hour' | 'per_session' | null
  group_price_unit?: 'per_hour' | 'per_session' | null
  category: string
  sub_category: string | null
  domain?: string | null
  duration: number
  can_be_at_home: boolean
  can_be_online: boolean
  can_be_in_public_spaces: boolean
  custom_place?: DbCustomPlace | null
  has_free_trial: boolean
  free_trial_modalities: string | null
  cancellation_policy: string
  use_profile_availability: boolean
  custom_availability: unknown | null
}

export class SupabaseCoachServicesApi {
  /**
   * Fetch all services for the authenticated coach
   */
  async getCoachServices(): Promise<CoachService[]> {
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Get coach profile to use the correct coach UUID from coaches table
      const { data: coachData, error: coachError } = await supabase
        .from('coaches')
        .select('id')
        .eq('email', user.email)
        .single()

      if (coachError || !coachData) {
        throw new Error('Coach profile not found')
      }

      console.log('📡 Loading services for coach UUID:', coachData.id)

      // Use the coach's database UUID (not auth user ID)
      // Fetch ALL services (active + inactive) so UI can enforce plan limits
      const { data, error } = await supabase
        .from('coach_services')
        .select('*')
        .eq('coach_id', coachData.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error fetching coach services:', error)
        throw error
      }

      console.log('✅ Found', data?.length || 0, 'services for coach')
      return this.transformDatabaseServices(data || [])
    } catch (error) {
      console.error('❌ Error in getCoachServices:', error)
      throw error
    }
  }

  /**
   * Fetch services for a specific coach (public view)
   */
  async getPublicCoachServices(coachId: string): Promise<CoachService[]> {
    try {
      const { data, error } = await supabase
        .from('coach_services')
        .select('*')
        .eq('coach_id', coachId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error fetching public coach services:', error)
        throw error
      }

      return this.transformDatabaseServices(data || [])
    } catch (error) {
      console.error('❌ Error in getPublicCoachServices:', error)
      throw error
    }
  }

  /**
   * Create a new service
   */
  async createService(serviceData: ServiceFormData): Promise<CoachService> {
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      console.log('🔐 Creating service for user:', user.email)

      // Get coach profile to use the correct coach UUID from coaches table
      const { data: coachData, error: coachError } = await supabase
        .from('coaches')
        .select('id')
        .eq('email', user.email)
        .single()

      console.log('👤 Coach lookup result:', { coachData, coachError })

      if (coachError) {
        console.error('❌ Coach lookup error:', coachError)
        throw new Error(`Coach profile not found: ${coachError.message}`)
      }

      if (!coachData) {
        throw new Error('Coach profile not found - no data returned')
      }

      console.log('✅ Found coach UUID:', coachData.id)

      // Use the coach's database UUID (not auth user ID)
      const dbData = this.transformToDatabase(serviceData, coachData.id)
      console.log('📝 Service data to insert:', dbData)

      const { data, error } = await supabase
        .from('coach_services')
        .insert([dbData])
        .select()
        .single()

      console.log('💾 Database insert result:', { data, error })

      if (error) {
        console.error('❌ Error creating service:', error)
        console.error('❌ Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        })
        throw error
      }

      return this.transformDatabaseService(data)
    } catch (error) {
      console.error('❌ Error in createService:', error)
      throw error
    }
  }

  /**
   * Update an existing service
   */
  async updateService(serviceId: string, serviceData: ServiceFormData): Promise<CoachService> {
    try {
      const dbData = this.transformToDatabase(serviceData)
      delete dbData.coach_id // Don't update coach_id

      const { data, error } = await supabase
        .from('coach_services')
        .update(dbData)
        .eq('id', serviceId)
        .select()
        .single()

      if (error) {
        console.error('❌ Error updating service:', error)
        throw error
      }

      return this.transformDatabaseService(data)
    } catch (error) {
      console.error('❌ Error in updateService:', error)
      throw error
    }
  }

  /**
   * Set a service active / inactive (used for enforcing free plan limits)
   */
  async setServiceActive(serviceId: string, isActive: boolean): Promise<void> {
    try {
      const { error } = await supabase
        .from('coach_services')
        .update({ is_active: isActive })
        .eq('id', serviceId)

      if (error) {
        console.error('❌ Error toggling service active state:', error)
        throw error
      }
    } catch (error) {
      console.error('❌ Error in setServiceActive:', error)
      throw error
    }
  }

  /**
   * Delete a service (soft delete by setting is_active to false)
   */
  async deleteService(serviceId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('coach_services')
        .update({ is_active: false })
        .eq('id', serviceId)

      if (error) {
        console.error('❌ Error deleting service:', error)
        throw error
      }
    } catch (error) {
      console.error('❌ Error in deleteService:', error)
      throw error
    }
  }

  /**
   * Transform database records to CoachService type
   */
  private transformDatabaseServices(dbServices: DbCoachService[]): CoachService[] {
    return dbServices.map((service) => this.transformDatabaseService(service))
  }

  private transformDatabaseService(dbService: DbCoachService): CoachService {
    return {
      id: dbService.id,
      coachId: dbService.coach_id,
      title: dbService.title,
      description: dbService.description || '',
      canBeSolo: dbService.can_be_solo,
      canBeGroup: dbService.can_be_group,
      soloPrice: dbService.solo_price,
      groupPrice: dbService.group_price,
      soloPriceUnit: dbService.solo_price_unit || 'per_session',
      groupPriceUnit: dbService.group_price_unit || 'per_session',
      category: dbService.category,
      subCategory: dbService.sub_category || undefined,
      domain: dbService.domain || undefined,
      duration: dbService.duration,
      canBeAtHome: dbService.can_be_at_home,
      canBeOnline: dbService.can_be_online,
      canBeInPublicSpaces: dbService.can_be_in_public_spaces,
      customPlace: dbService.custom_place
        ? {
            ...(dbService.custom_place.label ? { label: dbService.custom_place.label } : {}),
            ...(dbService.custom_place.address ? { address: dbService.custom_place.address } : {}),
          }
        : undefined,
      hasFreeTrial: dbService.has_free_trial,
      freeTrialModalities: dbService.free_trial_modalities || undefined,
      cancellationPolicy: dbService.cancellation_policy,
      useProfileAvailability: dbService.use_profile_availability,
      customAvailability: (dbService.custom_availability as []) || [],
      isActive: dbService.is_active,
      createdAt: new Date(dbService.created_at),
      updatedAt: new Date(dbService.updated_at),
    }
  }

  /**
   * Transform ServiceFormData to database format
   */
  private transformToDatabase(
    serviceData: ServiceFormData,
    coachId?: string,
  ): DbCoachServiceInsert {
    return {
      ...(coachId && { coach_id: coachId }),
      title: serviceData.title,
      description: serviceData.description || null,
      can_be_solo: serviceData.canBeSolo,
      can_be_group: serviceData.canBeGroup,
      solo_price: serviceData.soloPrice,
      group_price: serviceData.groupPrice,
      solo_price_unit: serviceData.soloPriceUnit || 'per_session',
      group_price_unit: serviceData.groupPriceUnit || 'per_session',
      category: serviceData.category,
      sub_category: serviceData.subCategory || null,
      domain: (serviceData as { domain?: string }).domain || null,
      duration: serviceData.duration,
      can_be_at_home: serviceData.canBeAtHome,
      can_be_online: serviceData.canBeOnline,
      can_be_in_public_spaces: serviceData.canBeInPublicSpaces,
      custom_place:
        serviceData.canBeOtherLocation &&
        (serviceData.otherLocationLabel || serviceData.otherLocationAddress)
          ? {
              label: serviceData.otherLocationLabel || null,
              address: serviceData.otherLocationAddress || null,
            }
          : null,
      has_free_trial: serviceData.hasFreeTrial,
      free_trial_modalities: serviceData.freeTrialModalities || null,
      cancellation_policy: serviceData.cancellationPolicy,
      use_profile_availability: serviceData.useProfileAvailability,
      custom_availability:
        serviceData.customAvailability.length > 0 ? serviceData.customAvailability : null,
    }
  }
}

// Export singleton instance
export const supabaseCoachServicesApi = new SupabaseCoachServicesApi()
