import { supabase } from '@/utils/supabase'
import { useAuthStore } from '@/stores/auth'

// Types for action tracking
export interface ActionTrackingData {
  actionType: string
  actionCategory: 'profile' | 'leads' | 'subscription' | 'content' | 'navigation' | 'services'
  actionDescription: string
  targetId?: string
  targetType?: string
  metadata?: Record<string, any>
  success?: boolean
  errorMessage?: string
  durationMs?: number
}

// Action tracking utility
export class CoachActionTracker {
  private static instance: CoachActionTracker
  private currentSessionId: string | null = null
  
  static getInstance(): CoachActionTracker {
    if (!this.instance) {
      this.instance = new CoachActionTracker()
    }
    return this.instance
  }

  setSessionId(sessionId: string | null) {
    this.currentSessionId = sessionId
  }

  // Track an action
  async trackAction(data: ActionTrackingData): Promise<void> {
    try {
      const authStore = useAuthStore()
      const coach = authStore.coach
      
      if (!coach) {
        console.warn('⚠️ Cannot track action: no authenticated coach')
        return
      }

      // Get current page info
      const pageUrl = window.location.pathname + window.location.search
      const userAgent = navigator.userAgent
      
      // Get IP address (from previous implementation)
      let ipAddress = null
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json')
        const ipData = await ipResponse.json()
        ipAddress = ipData.ip
      } catch {
        // IP detection failed, continue without it
      }

      console.log('📊 Tracking action:', {
        type: data.actionType,
        category: data.actionCategory,
        target: data.targetId,
        coach: coach.email
      })

      const { error } = await supabase.rpc('track_coach_action', {
        coach_id_param: coach.id,
        coach_email_param: coach.email,
        action_type_param: data.actionType,
        action_category_param: data.actionCategory,
        action_description_param: data.actionDescription,
        session_id_param: this.currentSessionId,
        target_id_param: data.targetId || null,
        target_type_param: data.targetType || null,
        metadata_param: data.metadata || {},
        page_url_param: pageUrl,
        user_agent_param: userAgent,
        ip_address_param: ipAddress,
        duration_ms_param: data.durationMs || null,
        success_param: data.success !== false,
        error_message_param: data.errorMessage || null
      })

      if (error) {
        console.error('❌ Failed to track action:', error)
      } else {
        console.log('✅ Action tracked successfully')
      }
    } catch (err) {
      console.error('❌ Exception tracking action:', err)
    }
  }

  // Convenience methods for common actions
  
  // Profile actions
  async trackProfileSave(changes?: Record<string, any>) {
    await this.trackAction({
      actionType: 'profile_save',
      actionCategory: 'profile',
      actionDescription: 'Coach updated their profile',
      metadata: { changes }
    })
  }

  async trackPhotoUpload(photoUrl: string) {
    await this.trackAction({
      actionType: 'photo_upload',
      actionCategory: 'profile',
      actionDescription: 'Coach uploaded a new profile photo',
      metadata: { photoUrl }
    })
  }

  // Lead actions
  async trackLeadView(leadId: string, leadDetails?: Record<string, any>) {
    await this.trackAction({
      actionType: 'lead_view',
      actionCategory: 'leads',
      actionDescription: 'Coach viewed a lead',
      targetId: leadId,
      targetType: 'lead',
      metadata: leadDetails
    })
  }

  async trackLeadStatusChange(leadId: string, newStatus: string) {
    await this.trackAction({
      actionType: 'lead_status_change',
      actionCategory: 'leads',
      actionDescription: `Coach changed lead status to ${newStatus}`,
      targetId: leadId,
      targetType: 'lead',
      metadata: { newStatus }
    })
  }

  async trackLeadListView(viewData?: Record<string, any>) {
    await this.trackAction({
      actionType: 'lead_list_view',
      actionCategory: 'leads',
      actionDescription: 'Coach viewed leads list',
      metadata: viewData
    })
  }

  async trackLeadAssignment(leadId: string, coachId: string) {
    await this.trackAction({
      actionType: 'lead_assignment',
      actionCategory: 'leads',
      actionDescription: 'Lead was assigned to coach',
      targetId: leadId,
      targetType: 'lead',
      metadata: { assignedToCoachId: coachId }
    })
  }

  async trackLeadNote(leadId: string, noteLength: number) {
    await this.trackAction({
      actionType: 'lead_note_add',
      actionCategory: 'leads',
      actionDescription: 'Coach added a note to a lead',
      targetId: leadId,
      targetType: 'lead',
      metadata: { noteLength }
    })
  }

  // Subscription actions
  async trackSubscriptionCreated(planId: string, amount: number) {
    await this.trackAction({
      actionType: 'subscription_created',
      actionCategory: 'subscription',
      actionDescription: `Coach subscribed to ${planId} plan`,
      targetType: 'subscription',
      metadata: { planId, amount }
    })
  }

  async trackSubscriptionUpgrade(fromPlan: string, toPlan: string, amount: number) {
    await this.trackAction({
      actionType: 'subscription_upgrade',
      actionCategory: 'subscription',
      actionDescription: `Coach upgraded from ${fromPlan} to ${toPlan} plan`,
      targetType: 'subscription',
      metadata: { fromPlan, toPlan, amount }
    })
  }

  async trackSubscriptionCancelled(planId: string, reason?: string) {
    await this.trackAction({
      actionType: 'subscription_cancelled',
      actionCategory: 'subscription',
      actionDescription: `Coach cancelled ${planId} subscription`,
      targetType: 'subscription',
      metadata: { planId, reason }
    })
  }
  async trackSubscriptionView() {
    await this.trackAction({
      actionType: 'subscription_view',
      actionCategory: 'subscription',
      actionDescription: 'Coach viewed subscription page',
    })
  }

  // Service actions
  async trackServiceCreate(serviceName: string, serviceType: string) {
    await this.trackAction({
      actionType: 'service_create',
      actionCategory: 'services',
      actionDescription: 'Coach created a new service',
      targetType: 'service',
      metadata: { serviceName, serviceType }
    })
  }

  async trackServiceUpdate(serviceId: string, changes: Record<string, any>) {
    await this.trackAction({
      actionType: 'service_update',
      actionCategory: 'services',
      actionDescription: 'Coach updated a service',
      targetId: serviceId,
      targetType: 'service',
      metadata: { changes }
    })
  }

  // Navigation actions
  async trackPageView(pageName: string, pageCategory?: string) {
    await this.trackAction({
      actionType: 'page_view',
      actionCategory: 'navigation',
      actionDescription: `Coach visited ${pageName}`,
      metadata: { pageName, pageCategory }
    })
  }

  // Generic error tracking
  async trackError(errorType: string, errorMessage: string, context?: Record<string, any>) {
    await this.trackAction({
      actionType: 'error',
      actionCategory: 'content',
      actionDescription: `Error occurred: ${errorType}`,
      success: false,
      errorMessage,
      metadata: context
    })
  }
}

// Export singleton instance
export const actionTracker = CoachActionTracker.getInstance()