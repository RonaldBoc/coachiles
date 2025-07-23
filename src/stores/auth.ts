import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import { supabase } from '@/utils/supabase'
import type { User, Session } from '@supabase/supabase-js'
import type { Coach } from '@/types/coach'

export interface AuthState {
  user: User | null
  session: Session | null
  coach: Coach | null
  loading: boolean
  error: string | null
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const session = ref<Session | null>(null)
  const coach = ref<Coach | null>(null)
  const loading = ref(true) // Start with loading true
  const error = ref<string | null>(null)
  const initialized = ref(false) // Track initialization state

  // Getters
  const isAuthenticated = computed(() => !!session.value && !!user.value)
  const isCoach = computed(() => !!coach.value)
  const userEmail = computed(() => user.value?.email || null)
  const coachId = computed(() => coach.value?.id || null)
  const isInitialized = computed(() => initialized.value)

  // Actions
  const setLoading = (isLoading: boolean) => {
    loading.value = isLoading
  }

  const setError = (errorMessage: string | null) => {
    error.value = errorMessage
  }

  const clearError = () => {
    error.value = null
  }

  // Initialize auth state from Supabase session
  const initialize = async () => {
    try {
      setLoading(true)
      clearError()

      console.log('🔄 Initializing auth state...')

      // Get current session
      const {
        data: { session: currentSession },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) {
        throw sessionError
      }

      if (currentSession) {
        console.log('✅ Found existing session for:', currentSession.user?.email)
        session.value = currentSession
        user.value = currentSession.user
        await loadCoachProfile()
      } else {
        console.log('ℹ️ No existing session found')
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, newSession) => {
        console.log('🔐 Auth state changed:', event, newSession?.user?.email)

        session.value = newSession
        user.value = newSession?.user || null

        if (event === 'SIGNED_IN' && newSession) {
          await loadCoachProfile()
        } else if (event === 'SIGNED_OUT') {
          coach.value = null
        }
      })

      initialized.value = true
      console.log('✅ Auth initialization complete')
    } catch (err) {
      console.error('❌ Auth initialization error:', err)
      setError(err instanceof Error ? err.message : 'Failed to initialize authentication')
    } finally {
      setLoading(false)
    }
  }

  // Load coach profile from database
  const loadCoachProfile = async () => {
    if (!user.value?.email) {
      return
    }

    try {
      const { data, error: profileError } = await supabase
        .from('coaches')
        .select('*')
        .eq('email', user.value.email)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        // PGRST116 = no rows found
        throw profileError
      }

      if (data) {
        // Transform Supabase data to Coach type
        coach.value = {
          id: data.id,
          firstName: data.first_name,
          email: data.email,
          phone: data.phone || '',
          photo: data.avatar_url || '',
          bio: data.bio || '',
          location: (data.locations && data.locations[0]) || '',
          specialties: data.specialties || [],
          certifications: data.certifications || [],
          experience: data.experience_years || 0,
          availability: data.availability?.join(', ') || '',
          rating: Number(data.rating) || 0,
          totalClients: data.total_sessions || 0,
          subscriptionStatus: data.subscription_type === 'active' ? 'active' : 'inactive',
          services: [], // Will be loaded separately if needed
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
          isActive: data.is_active || false,
        }
        console.log('✅ Coach profile loaded:', coach.value?.firstName)
      } else {
        console.log('ℹ️ No coach profile found for user:', user.value.email)
      }
    } catch (err) {
      console.error('❌ Error loading coach profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to load coach profile')
    }
  }

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      clearError()

      console.log('🔑 Attempting sign in for:', email)
      console.log('🔐 Password length:', password?.length || 0)

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        console.error('🚫 Supabase auth error:', signInError)
        throw signInError
      }

      console.log('✅ Sign in successful:', data.user?.email)

      // Auth state change will be handled by the listener
      return { user: data.user, session: data.session }
    } catch (err) {
      console.error('❌ Sign in error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Sign up new coach
  const signUp = async (
    email: string,
    password: string,
    coachData: {
      firstName: string
      phone?: string
      specialties?: string[]
    },
  ) => {
    try {
      setLoading(true)
      clearError()

      // Sign up user in Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: coachData.firstName,
            user_type: 'coach',
          },
        },
      })

      if (signUpError) {
        throw signUpError
      }

      // If email confirmation is disabled, create coach profile immediately
      if (data.user && !data.user.email_confirmed_at) {
        console.log('📧 Please check your email to confirm your account')
      }

      // Create coach profile in database
      if (data.user) {
        const { error: profileError } = await supabase.from('coaches').insert({
          email,
          first_name: coachData.firstName,
          phone: coachData.phone || '',
          specialties: coachData.specialties || [],
          is_active: false, // Requires admin approval or email confirmation
        })

        if (profileError) {
          console.error('❌ Error creating coach profile:', profileError)
          // Don't throw here as the user account was created successfully
        }
      }

      return { user: data.user, session: data.session }
    } catch (err) {
      console.error('❌ Sign up error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign up'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Sign out
  const signOut = async () => {
    try {
      setLoading(true)
      clearError()

      const { error: signOutError } = await supabase.auth.signOut()

      if (signOutError) {
        throw signOutError
      }

      // Clear local state
      user.value = null
      session.value = null
      coach.value = null
    } catch (err) {
      console.error('❌ Sign out error:', err)
      setError(err instanceof Error ? err.message : 'Failed to sign out')
    } finally {
      setLoading(false)
    }
  }

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      setLoading(true)
      clearError()

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (resetError) {
        throw resetError
      }

      return true
    } catch (err) {
      console.error('❌ Password reset error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to send reset email'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Update coach profile
  const updateCoachProfile = async (updates: Partial<Coach>) => {
    if (!coach.value || !user.value) {
      throw new Error('Not authenticated')
    }

    try {
      setLoading(true)
      clearError()

      // Transform Coach type to Supabase format
      const supabaseUpdates: Record<string, string | number | string[] | boolean> = {}

      if (updates.firstName !== undefined) supabaseUpdates.first_name = updates.firstName
      if (updates.phone !== undefined) supabaseUpdates.phone = updates.phone
      if (updates.bio !== undefined) supabaseUpdates.bio = updates.bio
      if (updates.photo !== undefined) supabaseUpdates.avatar_url = updates.photo
      if (updates.specialties !== undefined) supabaseUpdates.specialties = updates.specialties
      if (updates.certifications !== undefined)
        supabaseUpdates.certifications = updates.certifications
      if (updates.experience !== undefined) supabaseUpdates.experience_years = updates.experience
      if (updates.availability !== undefined)
        supabaseUpdates.availability = updates.availability.split(', ')
      if (updates.location !== undefined) supabaseUpdates.locations = [updates.location]

      supabaseUpdates.updated_at = new Date().toISOString()

      const { data, error: updateError } = await supabase
        .from('coaches')
        .update(supabaseUpdates)
        .eq('id', coach.value.id)
        .select()
        .single()

      if (updateError) {
        throw updateError
      }

      // Update local coach state
      coach.value = { ...coach.value, ...updates }

      return data
    } catch (err) {
      console.error('❌ Update profile error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return {
    // State
    user: readonly(user),
    session: readonly(session),
    coach: readonly(coach),
    loading: readonly(loading),
    error: readonly(error),

    // Getters
    isAuthenticated,
    isCoach,
    userEmail,
    coachId,
    isInitialized,

    // Actions
    initialize,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateCoachProfile,
    loadCoachProfile,
    setError,
    clearError,
  }
})
