import { supabase } from '@/utils/supabase'

export interface DeletionRequest {
  reason: string
  type: 'user_requested' | 'admin_action' | 'policy_violation'
}

export interface DeletionResult {
  success: boolean
  reactivationDeadline?: string
  reactivationToken?: string
  message?: string
  error?: string
}

export interface ReactivationInfo {
  email: string
  firstName: string
  lastName: string
  deletedAt: string
  permanentDeletionAt: string
  canReactivate: boolean
}

export interface UserDataExport {
  exportTimestamp: string
  profile: {
    email: string
    firstName: string
    lastName: string
    bio?: string
    location?: string
    createdAt: string
  }
  services: Array<{
    name: string
    description: string
    price: number
    duration: number
    createdAt: string
  }>
  stats: {
    totalServices: number
    accountAge: string
  }
}

export class AccountDeletionApi {
  /**
   * Export all user data for GDPR compliance
   */
  static async exportUserData(): Promise<UserDataExport> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Get coach profile
      const { data: coach, error: coachError } = await supabase
        .from('coaches')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (coachError) throw coachError

      // Get coach services
      const { data: services, error: servicesError } = await supabase
        .from('coach_services')
        .select('*')
        .eq('coach_id', coach.id)

      if (servicesError) throw servicesError

      // Prepare export data
      const exportData: UserDataExport = {
        exportTimestamp: new Date().toISOString(),
        profile: {
          email: user.email || '',
          firstName: coach.first_name || '',
          lastName: coach.last_name || '',
          bio: coach.bio || '',
          location: coach.location || '',
          createdAt: coach.created_at,
        },
        services: (services || []).map((service) => ({
          name: service.name,
          description: service.description,
          price: service.price,
          duration: service.duration,
          createdAt: service.created_at,
        })),
        stats: {
          totalServices: services?.length || 0,
          accountAge: this.calculateAccountAge(coach.created_at),
        },
      }

      return exportData
    } catch (error) {
      console.error('Export failed:', error)
      throw new Error('Failed to export user data')
    }
  }

  /**
   * Download user data as JSON file
   */
  static downloadUserData(data: UserDataExport): void {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `coachiles-data-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  /**
   * Initiate account deletion (soft delete with grace period)
   */
  static async deleteAccount(request: DeletionRequest): Promise<DeletionResult> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Call the soft delete function
      const { data, error } = await supabase.rpc('soft_delete_coach_account', {
        p_user_id: user.id,
        p_reason: request.reason,
        p_deletion_type: request.type,
      })

      if (error) throw error

      if (data?.success) {
        // Sign out the user
        await supabase.auth.signOut()

        return {
          success: true,
          reactivationDeadline: data.reactivation_deadline,
          reactivationToken: data.reactivation_token,
          message:
            'Votre compte a été programmé pour suppression. Vous avez 30 jours pour le réactiver.',
        }
      } else {
        throw new Error(data?.error || 'Deletion failed')
      }
    } catch (error) {
      console.error('Account deletion failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }

  /**
   * Get reactivation information by token
   */
  static async getReactivationInfo(token: string): Promise<ReactivationInfo | null> {
    try {
      const { data, error } = await supabase
        .from('coach_deletion_log')
        .select(
          `
          coaches!inner(
            first_name,
            last_name,
            user_id
          ),
          deleted_at,
          permanent_deletion_at,
          reactivated_at
        `,
        )
        .eq('reactivation_token', token)
        .is('reactivated_at', null)
        .single()

      if (error || !data) return null

      // Check if still within grace period
      const now = new Date()
      const deletionDate = new Date(data.permanent_deletion_at)
      const canReactivate = now < deletionDate

      if (!canReactivate) return null

      // Get user email
      const coachData = Array.isArray(data.coaches) ? data.coaches[0] : data.coaches
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(
        coachData.user_id,
      )

      if (authError) throw authError

      return {
        email: authUser.user?.email || '',
        firstName: coachData.first_name,
        lastName: coachData.last_name,
        deletedAt: data.deleted_at,
        permanentDeletionAt: data.permanent_deletion_at,
        canReactivate: true,
      }
    } catch (error) {
      console.error('Failed to get reactivation info:', error)
      return null
    }
  }

  /**
   * Reactivate a deleted account using token
   */
  static async reactivateAccount(token: string): Promise<DeletionResult> {
    try {
      // Call the reactivation function
      const { data, error } = await supabase.rpc('reactivate_coach_account', {
        p_reactivation_token: token,
      })

      if (error) throw error

      if (data?.success) {
        return {
          success: true,
          message: 'Votre compte a été réactivé avec succès.',
        }
      } else {
        throw new Error(data?.error || 'Reactivation failed')
      }
    } catch (error) {
      console.error('Account reactivation failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }

  /**
   * Calculate account age in human readable format
   */
  private static calculateAccountAge(createdAt: string): string {
    const created = new Date(createdAt)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - created.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 30) {
      return `${diffDays} jour${diffDays > 1 ? 's' : ''}`
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30)
      return `${months} mois`
    } else {
      const years = Math.floor(diffDays / 365)
      return `${years} an${years > 1 ? 's' : ''}`
    }
  }
}
