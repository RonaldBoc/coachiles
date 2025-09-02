import { supabase } from '@/utils/supabase'
import type { Lead } from '@/types/Lead'

export class LeadService {
  // Create a new lead (Step 1: Basic info)
  static async createLead(data: {
    client_name: string
    client_email: string
    client_phone?: string
    client_age?: number
    client_gender?: 'male' | 'female' | 'other' | 'prefer_not_say'
    coach_id?: string
    session_id?: string
  }): Promise<Lead | null> {
    try {
      const { data: lead, error } = await supabase
        .from('leads')
        .insert({
          client_name: data.client_name,
          client_email: data.client_email,
          client_phone: data.client_phone, // now captured at step 1
          client_age: data.client_age,
          client_gender: data.client_gender,
          coach_id: data.coach_id,
          session_id: data.session_id,
          status: 'new',
          source: 'web',
          priority: 'medium',
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating lead:', error)
        return null
      }

      return lead as unknown as Lead
    } catch (error) {
      console.error('Error creating lead:', error)
      return null
    }
  }

  // Set the coach on a lead (after step 1) via RPC (only if unassigned)
  static async setCoachPublic(leadId: string, coachId: string): Promise<Lead | null> {
    try {
      const { data, error } = await supabase.rpc('leads_set_coach_public', {
        p_lead_id: leadId,
        p_coach_id: coachId,
      })
      if (error) {
        console.error('Error setting coach via RPC:', error)
        return null
      }
      return data as unknown as Lead
    } catch (error) {
      console.error('Error setting coach via RPC:', error)
      return null
    }
  }

  // Force recompute lead score
  static async recomputeLeadScore(leadId: string): Promise<Lead | null> {
    try {
      const { data, error } = await supabase.rpc('leads_recompute_score_public', {
        p_lead_id: leadId,
      })
      if (error) {
        console.error('Error recomputing lead score:', error)
        return null
      }
      return data as unknown as Lead
    } catch (error) {
      console.error('Error recomputing lead score:', error)
      return null
    }
  }

  // Update lead (generic)
  static async updateLead(leadId: string, data: Partial<Lead>): Promise<Lead | null> {
    try {
      const { data: lead, error } = await supabase
        .from('leads')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', leadId)
        .select()
        .single()

      if (error) {
        console.error('Error updating lead:', error)
        return null
      }

      return lead as unknown as Lead
    } catch (error) {
      console.error('Error updating lead:', error)
      return null
    }
  }

  // Set contact preference (do_not_contact) while the lead is in-progress
  static async setContactPreference(leadId: string, doNotContact: boolean): Promise<Lead | null> {
    try {
      const { data, error } = await supabase.rpc('leads_set_contact_preference_public', {
        p_lead_id: leadId,
        p_do_not_contact: doNotContact,
      })
      if (error) {
        console.error('Error setting contact preference via RPC:', error)
        return null
      }
      return data as unknown as Lead
    } catch (error) {
      console.error('Error setting contact preference via RPC:', error)
      return null
    }
  }

  // Update lead step using RPCs to avoid RLS issues for public flow
  static async updateLeadStep(
    leadId: string,
    step: number,
    data: Partial<Lead>,
  ): Promise<Lead | null> {
    try {
      const updateData: Partial<Lead> = {
        ...data,
        updated_at: new Date().toISOString(),
      }

      if (step === 3) {
        return await LeadService.finalizeLeadPublic(
          leadId,
          updateData as Partial<Lead> & { start_timeframe?: string | null },
          null,
        )
      }

      const { data: lead, error } = await supabase.rpc('leads_update_public', {
        p_lead_id: leadId,
        p_client_phone: updateData.client_phone ?? null,
        p_location: updateData.location ?? null,
      })

      if (error) {
        console.error('Error updating lead step:', error)
        return null
      }

      return lead as unknown as Lead
    } catch (error) {
      console.error('Error updating lead step:', error)
      return null
    }
  }

  // Finalize lead via SECURITY DEFINER RPC to bypass RLS safely and set step tracking + coach
  static async finalizeLeadPublic(
    leadId: string,
    data: Partial<Lead> & { start_timeframe?: string | null },
    coachId?: string | null,
  ): Promise<Lead | null> {
    try {
      // Support structured chosen_services (jsonb) or legacy string[]
      type ChosenServiceObj = {
        title: string
        modalities?: string[]
        locations?: string[]
        days?: number[]
      }
      let preferredPayload: ChosenServiceObj[] | string[] | null = null
      const raw =
        (data as unknown as { chosen_services?: unknown; preferred_coaching?: unknown })
          .chosen_services ??
        (data as unknown as { chosen_services?: unknown; preferred_coaching?: unknown })
          .preferred_coaching
      if (raw) {
        if (Array.isArray(raw) && raw.length) {
          if (typeof raw[0] === 'object') {
            preferredPayload = raw as ChosenServiceObj[] // jsonb structured
          } else {
            preferredPayload = raw as string[] // simple titles
          }
        } else if (Array.isArray(raw)) {
          preferredPayload = []
        }
      }
      const { data: finalized, error } = await supabase.rpc('leads_finalize_public', {
        p_lead_id: leadId,
        p_preferred_coaching: preferredPayload,
        p_experience: data.experience ?? null,
        p_goals: data.goals ?? null,
        p_availability: data.availability ?? null,
        p_start_timeframe: data.start_timeframe ?? null,
        p_additional_info: data.additional_info ?? null,
        p_coach_id: coachId ?? null,
      })

      if (error) {
        console.error('Error finalizing lead via RPC:', error, {
          payload: {
            p_lead_id: leadId,
            p_preferred_coaching: preferredPayload,
            p_experience: data.experience ?? null,
            p_goals: data.goals ?? null,
            p_availability: data.availability ?? null,
            p_start_timeframe: data.start_timeframe ?? null,
            p_additional_info: data.additional_info ?? null,
            p_coach_id: coachId ?? null,
          },
        })
        return null
      }

      return finalized as unknown as Lead
    } catch (error) {
      console.error('Error finalizing lead via RPC:', error)
      return null
    }
  }

  // Get lead by ID
  static async getLead(leadId: string): Promise<Lead | null> {
    try {
      const { data: lead, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single()

      if (error) {
        console.error('Error fetching lead:', error)
        return null
      }

      return lead as unknown as Lead
    } catch (error) {
      console.error('Error fetching lead:', error)
      return null
    }
  }

  // Get leads for a coach with subscription filtering
  static async getCoachLeads(coachId: string): Promise<Lead[]> {
    try {
      const { data: leads, error } = await supabase
        .from('leads')
        .select('*')
        .eq('coach_id', coachId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching coach leads:', error)
        return []
      }

      return leads || []
    } catch (error) {
      console.error('Error fetching coach leads:', error)
      return []
    }
  }

  // Check coach subscription and unlocked leads count
  static async getCoachSubscriptionInfo(coachId: string): Promise<{
    subscriptionType: string
    unlockedLeadsCount: number
    maxUnlockedLeads: number
  }> {
    try {
      const { data: coachSubscription, error: subscriptionError } = await supabase
        .from('coaches_current_subscription')
        .select('subscription_type, max_leads, has_active_subscription, plan_limits')
        .eq('id', coachId)
        .single()

      if (subscriptionError) {
        console.error('Error fetching coach subscription:', subscriptionError)
        return {
          subscriptionType: 'free',
          unlockedLeadsCount: 0,
          maxUnlockedLeads: 2,
        }
      }

      const subscriptionType = coachSubscription?.subscription_type || 'free'
      const maxUnlockedLeads =
        coachSubscription?.max_leads === -1 ? Infinity : coachSubscription?.max_leads || 2

      const unlockedLeadsCount = subscriptionType === 'free' ? 2 : Infinity

      return {
        subscriptionType,
        unlockedLeadsCount,
        maxUnlockedLeads,
      }
    } catch (error) {
      console.error('Error fetching coach subscription info:', error)
      return {
        subscriptionType: 'free',
        unlockedLeadsCount: 0,
        maxUnlockedLeads: 2,
      }
    }
  }

  // Get all leads (admin)
  static async getAllLeads(): Promise<Lead[]> {
    try {
      const { data: leads, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching all leads:', error)
        return []
      }

      return leads || []
    } catch (error) {
      console.error('Error fetching all leads:', error)
      return []
    }
  }
}

export default LeadService
