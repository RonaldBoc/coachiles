import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import { supabase } from '@/utils/supabase'
import { initializeSessionManager } from '@/utils/sessionManager'
import { actionTracker } from '@/utils/actionTracker'
import type { User, Session } from '@supabase/supabase-js'
import type { Coach } from '@/types/coach'
import { useLeadStore } from '@/stores/leads'

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

  // Session manager
  let sessionManager: ReturnType<typeof initializeSessionManager> | null = null

  // Track last logged session to prevent duplicates
  let lastLoggedSession: string | null = null

  // Session expired handler
  const handleSessionExpired = async () => {
    console.log('🔒 Session expired, signing out...')
    user.value = null
    session.value = null
    coach.value = null
    setError('Your session has expired. Please sign in again.')
  }

  // Helper function to get client information for session tracking
  const getClientInfo = async () => {
    const userAgent = navigator.userAgent

    // Try to get public IP address
    let ipAddress = null
    let locationInfo = {}

    try {
      // Get public IP address from ipify service
      const ipResponse = await fetch('https://api.ipify.org?format=json')
      const ipData = await ipResponse.json()
      ipAddress = ipData.ip

      // Get location info based on IP
      if (ipAddress) {
        try {
          const locationResponse = await fetch(`https://ipapi.co/${ipAddress}/json/`)
          const locationData = await locationResponse.json()

          locationInfo = {
            country: locationData.country_name,
            country_code: locationData.country_code,
            region: locationData.region,
            city: locationData.city,
            postal: locationData.postal,
            latitude: locationData.latitude,
            longitude: locationData.longitude,
            timezone: locationData.timezone,
          }
        } catch (locationError) {
          console.warn('⚠️ Could not get location from IP:', locationError)
        }
      }
    } catch (ipError) {
      console.warn('⚠️ Could not get public IP address:', ipError)
    }

    // Enhanced device info (no GPS permission needed)
    const deviceInfo = {
      platform: navigator.platform,
      language: navigator.language,
      languages: navigator.languages,
      screen: `${screen.width}x${screen.height}`,
      color_depth: screen.colorDepth,
      pixel_ratio: window.devicePixelRatio,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      user_agent: userAgent,
      cookie_enabled: navigator.cookieEnabled,
      online: navigator.onLine,
    }

    return {
      userAgent,
      ipAddress,
      deviceInfo,
      locationInfo,
    }
  }

  // Log coach session when they sign in
  const logCoachSession = async (coachId: string, coachEmail: string) => {
    try {
      // Create unique session key to prevent duplicates
      const sessionKey = `${coachId}-${Date.now()}`

      // Check if we already logged a session recently (within last 10 seconds)
      const now = Date.now()
      if (lastLoggedSession) {
        const lastSessionTime = parseInt(lastLoggedSession.split('-').pop() || '0')
        if (now - lastSessionTime < 10000) {
          console.log('🔄 Session already logged recently, skipping duplicate')
          return { success: true, sessionId: null }
        }
      }

      console.log('📝 Logging coach session:', { coachId, coachEmail })

      // Get enhanced client info with IP and location
      const { userAgent, ipAddress, deviceInfo, locationInfo } = await getClientInfo()

      console.log('🌍 Client info gathered:', {
        ip: ipAddress,
        location: locationInfo,
        device: deviceInfo,
      })

      const { data, error } = await supabase.rpc('log_coach_session', {
        coach_id_param: coachId,
        coach_email_param: coachEmail,
        ip_param: ipAddress,
        user_agent_param: userAgent,
        device_info_param: { ...deviceInfo, location_info: locationInfo },
      })

      if (error) {
        console.error('❌ Failed to log coach session:', error)
      } else {
        console.log('✅ Coach session logged with IP and location:', data)
        lastLoggedSession = sessionKey // Remember this session
        
        // Set session ID in action tracker
        actionTracker.setSessionId(data)
      }

      return { success: !error, sessionId: data }
    } catch (err) {
      console.error('❌ Exception logging coach session:', err)
      return { success: false, sessionId: null }
    }
  }

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

      // Get current session with retry logic
      let currentSession: Session | null = null
      let sessionError: Error | null = null

      for (let retryCount = 0; retryCount < 3; retryCount++) {
        const { data, error } = await supabase.auth.getSession()
        currentSession = data.session
        sessionError = error

        if (!sessionError) break

        console.warn(`⚠️ Session error (attempt ${retryCount + 1}/3):`, sessionError.message)
        if (retryCount < 2) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * (retryCount + 1)))
        }
      }

      if (sessionError) {
        console.warn('⚠️ Persistent session error, clearing corrupted data:', sessionError.message)
        // Clear any corrupted session data
        await supabase.auth.signOut()
        user.value = null
        session.value = null
        coach.value = null
      } else if (currentSession) {
        console.log('✅ Found existing session for:', currentSession.user?.email)
        session.value = currentSession
        user.value = currentSession.user

        try {
          await loadCoachProfile()
        } catch (profileError) {
          console.warn('⚠️ Failed to load coach profile during initialization:', profileError)
          // Don't clear session just because profile loading failed
        }
      } else {
        console.log('ℹ️ No existing session found')
        // Ensure clean state
        user.value = null
        session.value = null
        coach.value = null
      }

      // Listen for auth changes with enhanced error handling
      supabase.auth.onAuthStateChange((event, newSession) => {
        console.log('🔐 Auth state changed:', event, newSession?.user?.email)

        // Handle token refresh events
        if (event === 'TOKEN_REFRESHED') {
          console.log('🔄 Token refreshed successfully')
          session.value = newSession
          user.value = newSession?.user || null
          return
        }

        // Handle sign in events
        if (event === 'SIGNED_IN') {
          session.value = newSession
          user.value = newSession?.user || null

          if (newSession) {
            // For sign-in events, we need to load coach profile immediately for router guards
            // This is safe because it's not during a tab visibility change
            loadCoachProfile(true).catch((profileError) => {
              console.warn('⚠️ Failed to load coach profile after sign in:', profileError)
            })

            // Defer session manager setup to prevent Supabase deadlock (GitHub issue #273)
            setTimeout(() => {
              try {
                // Start health monitoring for new session
                if (sessionManager) {
                  sessionManager.cleanup()
                }
                sessionManager = initializeSessionManager(handleSessionExpired)
                sessionManager.startHealthCheck(5)
              } catch (sessionError) {
                console.warn('⚠️ Failed to setup session manager:', sessionError)
              }
            }, 0)
          }
          return
        }

        // Handle sign out events
        if (event === 'SIGNED_OUT') {
          session.value = null
          user.value = null
          coach.value = null
          console.log('👋 User signed out, clearing state')
          return
        }

        // Handle session updates
        session.value = newSession
        user.value = newSession?.user || null
      })

      initialized.value = true
      console.log('✅ Auth initialization complete')

      // Start session health monitoring if we have a valid session
      if (session.value && user.value) {
        sessionManager = initializeSessionManager(handleSessionExpired)
        sessionManager.startHealthCheck(5) // Check every 5 minutes
      }
    } catch (err) {
      console.error('❌ Auth initialization error:', err)

      // Ensure clean state on initialization failure
      user.value = null
      session.value = null
      coach.value = null
      initialized.value = true // Still mark as initialized to prevent loops

      setError(err instanceof Error ? err.message : 'Failed to initialize authentication')
    } finally {
      setLoading(false)
    }
  }

  // Helper function to get subscription status from new architecture
  const getCoachSubscriptionStatus = async (
    coachId: string,
  ): Promise<'active' | 'inactive' | 'trial'> => {
    const { data } = await supabase
      .from('coaches_current_subscription')
      .select('subscription_type, has_active_subscription')
      .eq('id', coachId)
      .single()

    if (data?.has_active_subscription) {
      return data.subscription_type === 'premium' ? 'active' : 'trial'
    }
    return 'inactive'
  }

  // Load coach profile from database
  const loadCoachProfile = async (shouldLogSession = false) => {
    if (!user.value?.email) {
      return
    }

    try {
      const { data, error: profileError } = await supabase
        .from('coaches')
        .select('*')
        .eq('email', user.value.email)
        .maybeSingle()

      if (profileError) {
        throw profileError
      }

      if (data) {
        // Get subscription status from the new architecture
        const subscriptionStatus = await getCoachSubscriptionStatus(data.id)

        // Transform Supabase data to Coach type
        const cacheBustedAvatar = data.avatar_url
          ? `${data.avatar_url}?v=${new Date(data.updated_at).getTime()}`
          : ''
        coach.value = {
          id: data.id, // This is the coaches table UUID
          firstName: data.first_name,
          lastName: data.last_name,
          email: data.email,
          phone: data.phone || '',
          photo: cacheBustedAvatar,
          bio: data.bio || '',
          location: (data.locations && data.locations[0]) || '',
          specialties: data.specialties || [],
          certifications: data.certifications || [],
          experience: data.experience_years || 0,
          availability: data.availability?.join(', ') || '',
          rating: Number(data.rating) || 0,
          totalClients: data.total_sessions || 0,
          subscriptionStatus,
          services: [], // Will be loaded separately if needed
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
          isActive: data.is_active || false,
          hourlyRate: data.hourly_rate || 50,
          languages: data.languages || ['Français'],
          disabledReason: data.disabled_reason ?? null,
          disabledAt: data.disabled_at ? new Date(data.disabled_at) : null,
        }
        console.log('✅ Coach profile loaded:', coach.value?.firstName, coach.value?.lastName)

        // Log session if this is a new sign-in
        if (shouldLogSession && coach.value) {
          await logCoachSession(coach.value.id, coach.value.email)
        }
      } else {
        // No coach profile yet (first login / onboarding)
        console.log('ℹ️ No coach profile found for user:', user.value.email)
        coach.value = null
      }
    } catch (err) {
      console.error('❌ Error loading coach profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to load coach profile')
    }
  }

  // Refresh just the subscription status for the current coach
  const refreshSubscriptionStatus = async () => {
    if (!coach.value?.id) {
      console.warn('⚠️ No coach loaded, cannot refresh subscription status')
      return
    }

    try {
      console.log('🔄 Refreshing subscription status for coach:', coach.value.id)
      const oldStatus = coach.value.subscriptionStatus
      const newStatus = await getCoachSubscriptionStatus(coach.value.id)

      // Update the coach object with new subscription status
      coach.value = {
        ...coach.value,
        subscriptionStatus: newStatus,
      }

      console.log('✅ Subscription status refreshed:', oldStatus, '->', newStatus)

      if (oldStatus !== newStatus) {
        console.log('🔄 Subscription status changed, UI should update automatically')
      }
    } catch (err) {
      console.error('❌ Error refreshing subscription status:', err)
    }
  }

  // Create a new coach profile
  const createCoachProfile = async () => {
    if (!user.value?.email) {
      throw new Error('User must be authenticated to create coach profile')
    }

    try {
      console.log('👤 Creating coach profile for:', user.value.email)

      const newCoachData = {
        email: user.value.email,
        first_name: user.value.user_metadata?.firstName || user.value.email.split('@')[0],
        avatar_url: user.value.user_metadata?.avatar_url || '',
        bio: '',
        phone: user.value.user_metadata?.phone || '',
        locations: [],
        specialties: [],
        certifications: [],
        experience_years: 0,
        availability: [],
        rating: 0,
        total_sessions: 0,
        is_active: true,
        hourly_rate: 50,
        languages: ['Français'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data, error: createError } = await supabase
        .from('coaches')
        .insert(newCoachData)
        .select()
        .single()

      if (createError) {
        throw createError
      }

      // Transform to local coach format and set directly (no recursion)
      const cacheBustedNew = data.avatar_url
        ? `${data.avatar_url}?v=${new Date(data.updated_at).getTime()}`
        : ''
      coach.value = {
        id: data.id,
        firstName: data.first_name,
        email: data.email,
        phone: data.phone || '',
        photo: cacheBustedNew,
        bio: data.bio || '',
        location: (data.locations && data.locations[0]) || '',
        specialties: data.specialties || [],
        certifications: data.certifications || [],
        experience: data.experience_years || 0,
        availability: data.availability?.join(', ') || '',
        rating: Number(data.rating) || 0,
        totalClients: data.total_sessions || 0,
        subscriptionStatus: 'inactive', // New coaches start with inactive subscription
        services: [],
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        isActive: data.is_active || false,
        hourlyRate: data.hourly_rate || 50,
        languages: data.languages || ['Français'],
        disabledReason: data.disabled_reason ?? null,
        disabledAt: data.disabled_at ? new Date(data.disabled_at) : null,
      }

      console.log('✅ Coach profile created:', coach.value.firstName)
      return coach.value
    } catch (err) {
      console.error('❌ Error creating coach profile:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to create coach profile'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      clearError()
      // Proactively clear stale lead data from previous user
      try {
        const ls = useLeadStore()
        ls.clearLeads()
      } catch {}

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

      // Set user immediately
      user.value = data.user
      session.value = data.session

      // Load coach profile to determine if onboarding is complete
      await loadCoachProfile(true) // Enable session logging for direct sign-in

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

  // Sign in with an OAuth provider (currently only Google)
  const signInWithProvider = async (provider: 'google') => {
    try {
      setLoading(true)
      clearError()
      console.log('🌐 Starting OAuth sign in with provider:', provider)
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth?provider=${provider}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })
      if (oauthError) throw oauthError
      // Redirection will occur automatically; further logic resumes after return
    } catch (err) {
      console.error('❌ OAuth sign in error:', err)
      const errorMessage = err instanceof Error ? err.message : 'OAuth sign in failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      // Supabase will redirect; keep loading true briefly for UX if still on page
      setTimeout(() => setLoading(false), 1500)
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

      console.log('✅ Auth user created; coach profile will be completed during onboarding flow')

      // Note: We don't create the coach profile here anymore
      // The user will be redirected to onboarding (/coach/onboarding) to complete their profile

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

      // Cleanup session manager if running
      if (sessionManager) {
        sessionManager.cleanup()
        sessionManager = null
      }

      console.log('🚪 Attempting sign out...')

      // Try to sign out from Supabase
      const { error: signOutError } = await supabase.auth.signOut({ scope: 'local' })

      if (signOutError) {
        console.warn(
          '⚠️ Supabase sign out error (will clear local state anyway):',
          signOutError.message,
        )
        // Don't throw the error, just log it and clear local state
      }

      // Always clear local state regardless of Supabase response
      user.value = null
      session.value = null
      coach.value = null
      lastLoggedSession = null // Reset session tracker
      // Clear dependent stores (leads etc.)
      try {
        const ls = useLeadStore()
        ls.clearLeads()
      } catch {}

      console.log('✅ Sign out completed (local state cleared)')

      // Clear any persisted auth data
      try {
        localStorage.removeItem('supabase.auth.token')
        localStorage.removeItem('coachiles-auth-token')
        // Clear notification related keys to avoid cross-account leakage
        localStorage.removeItem('coach_notifications_v1')
        localStorage.removeItem('coach_known_unlocked_leads_v1')
        sessionStorage.clear()
      } catch (storageError) {
        console.warn('⚠️ Could not clear storage:', storageError)
      }
    } catch (err) {
      console.error('❌ Sign out error:', err)

      // Even if there's an error, clear local state
      user.value = null
      session.value = null
      coach.value = null

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

      console.log('🔄 Updating coach profile with data:', updates)

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
      if (updates.hourlyRate !== undefined) supabaseUpdates.hourly_rate = updates.hourlyRate
      if (updates.languages !== undefined) supabaseUpdates.languages = updates.languages

      supabaseUpdates.updated_at = new Date().toISOString()

      console.log('📤 Sending to Supabase:', supabaseUpdates)
      console.log('🎯 Updating coach with ID:', coach.value.id)

      const { data, error: updateError } = await supabase
        .from('coaches')
        .update(supabaseUpdates)
        .eq('id', coach.value.id)
        .select()
        .single()

      if (updateError) {
        console.error('💥 Supabase update error:', updateError)
        throw updateError
      }

      // Update local coach state with cache-busted avatar if changed
      let newPhoto = updates.photo
      if (updates.photo) {
        newPhoto = `${updates.photo}?v=${Date.now()}`
      }
      coach.value = { ...coach.value, ...updates, ...(newPhoto ? { photo: newPhoto } : {}) }

      // Track profile update action
      await actionTracker.trackProfileSave(supabaseUpdates)
      
      // Track photo upload separately if photo was changed
      if (updates.photo) {
        await actionTracker.trackPhotoUpload(updates.photo)
      }

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

  // Force clear all session data (for debugging corrupted sessions)
  const forceClearSession = async () => {
    try {
      console.log('🧹 Force clearing all session data...')

      // Clear Supabase session
      await supabase.auth.signOut({ scope: 'local' })

      // Clear local state
      user.value = null
      session.value = null
      coach.value = null

      // Clear storage
      try {
        localStorage.clear()
        sessionStorage.clear()
      } catch (storageError) {
        console.warn('⚠️ Could not clear storage:', storageError)
      }

      console.log('✅ Session force cleared')
    } catch (err) {
      console.error('❌ Force clear error:', err)
      // Clear local state anyway
      user.value = null
      session.value = null
      coach.value = null
    }
  }

  // Manual session health check (for debugging)
  const manualSessionHealthCheck = async (): Promise<boolean> => {
    if (!sessionManager) {
      console.warn('⚠️ Session manager not initialized')
      return false
    }
    return await sessionManager.manualHealthCheck()
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
    signInWithProvider,
    forceClearSession,
    resetPassword,
    updateCoachProfile,
    loadCoachProfile,
    refreshSubscriptionStatus,
    createCoachProfile,
    setError,
    clearError,
    manualSessionHealthCheck,
  }
})
