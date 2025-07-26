import { supabase } from '@/utils/supabase'
import type { Lead } from '@/types/Lead'

export class LeadService {
  // Create a new lead (Step 1: Basic info)
  static async createLead(data: {
    client_name: string
    client_email: string
    coach_id?: string
  }): Promise<Lead | null> {
    try {
      const { data: lead, error } = await supabase
        .from('leads')
        .insert({
          client_name: data.client_name,
          client_email: data.client_email,
          coach_id: data.coach_id,
          current_step: 1,
          completed_steps: [1],
          is_completed: false,
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

      return lead
    } catch (error) {
      console.error('Error creating lead:', error)
      return null
    }
  }

  // Update lead (for subsequent steps)
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

      return lead
    } catch (error) {
      console.error('Error updating lead:', error)
      return null
    }
  }

  // Update lead step
  static async updateLeadStep(
    leadId: string,
    step: number,
    data: Partial<Lead>,
  ): Promise<Lead | null> {
    try {
      // Get current lead to update completed_steps
      const { data: currentLead, error: fetchError } = await supabase
        .from('leads')
        .select('completed_steps')
        .eq('id', leadId)
        .single()

      if (fetchError) {
        console.error('Error fetching current lead:', fetchError)
        return null
      }

      const completedSteps = currentLead.completed_steps || []
      if (!completedSteps.includes(step)) {
        completedSteps.push(step)
      }

      const updateData = {
        ...data,
        current_step: step,
        completed_steps: completedSteps,
        is_completed: step === 3, // Mark as completed when reaching step 3
        updated_at: new Date().toISOString(),
      }

      const { data: lead, error } = await supabase
        .from('leads')
        .update(updateData)
        .eq('id', leadId)
        .select()
        .single()

      if (error) {
        console.error('Error updating lead step:', error)
        return null
      }

      return lead
    } catch (error) {
      console.error('Error updating lead step:', error)
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

      return lead
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
      // Use the clean subscription view
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

      // For free accounts, we could track unlocked leads in a separate table
      // For now, we'll assume first 2 leads are auto-unlocked
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
