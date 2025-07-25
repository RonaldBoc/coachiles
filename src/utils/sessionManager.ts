// Session Management Utilities
import { supabase } from './supabase'

export class SessionManager {
  private healthCheckInterval: NodeJS.Timeout | null = null
  private visibilityChangeHandler: (() => void) | null = null
  private onSessionExpired: (() => void) | null = null
  private isCheckingSession = false // Prevent concurrent checks

  constructor(onSessionExpired?: () => void) {
    this.onSessionExpired = onSessionExpired || null
    this.setupVisibilityHandler()
  }

  // Start session health monitoring
  startHealthCheck(intervalMinutes = 5) {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
    }

    this.healthCheckInterval = setInterval(
      async () => {
        await this.checkSessionHealth()
      },
      intervalMinutes * 60 * 1000,
    )

    console.log(`🩺 Session health monitoring started (${intervalMinutes}min intervals)`)
  }

  // Stop session monitoring
  stopHealthCheck() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
      this.healthCheckInterval = null
      console.log('🛑 Session health monitoring stopped')
    }
  }

  // Check if current session is healthy
  private async checkSessionHealth(): Promise<boolean> {
    // Prevent concurrent session checks
    if (this.isCheckingSession) {
      console.log('⏳ Session check already in progress, skipping...')
      return true
    }

    this.isCheckingSession = true

    try {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.warn('🚨 Session health check failed:', error.message)
        await this.handleSessionExpired()
        return false
      }

      if (!data.session) {
        console.warn('🚨 No active session found during health check')
        await this.handleSessionExpired()
        return false
      }

      // Check if token is close to expiration (within 5 minutes)
      const expiresAt = data.session.expires_at
      const now = Math.floor(Date.now() / 1000)
      const timeUntilExpiry = expiresAt ? expiresAt - now : 0

      if (timeUntilExpiry < 300) {
        // Less than 5 minutes
        console.log('🔄 Token expires soon, attempting refresh...')
        const { error: refreshError } = await supabase.auth.refreshSession()

        if (refreshError) {
          console.error('❌ Token refresh failed:', refreshError.message)
          await this.handleSessionExpired()
          return false
        }

        console.log('✅ Token refreshed successfully')
      }

      console.log('💚 Session health check passed')
      return true
    } catch (error) {
      console.error('⚠️ Session health check error:', error)

      // Check if it's a network error - don't expire session for these
      if (
        error instanceof Error &&
        (error.message.includes('fetch') || error.message.includes('network'))
      ) {
        console.log('🌐 Network error detected during health check, will retry later')
        return false
      }

      await this.handleSessionExpired()
      return false
    } finally {
      this.isCheckingSession = false
    }
  }

  // Handle session expiration
  private async handleSessionExpired() {
    console.log('🔒 Session expired, cleaning up...')

    try {
      await supabase.auth.signOut({ scope: 'local' })
    } catch (error) {
      console.warn('⚠️ Error during session cleanup:', error)
    }

    if (this.onSessionExpired) {
      this.onSessionExpired()
    }
  }

  // Handle browser tab visibility changes
  private setupVisibilityHandler() {
    this.visibilityChangeHandler = () => {
      if (document.visibilityState === 'visible') {
        console.log('👁️ Tab became visible, scheduling gentle session check...')

        // Prevent concurrent session checks during tab switching
        if (this.isCheckingSession) {
          console.log('⏳ Session check already in progress, skipping tab switch check...')
          return
        }

        // Add a larger delay to avoid conflicting with onAuthStateChange
        // This prevents the Supabase deadlock issue documented in GitHub #273
        setTimeout(async () => {
          // Double-check we're not already checking
          if (this.isCheckingSession) {
            console.log('⏳ Session check started elsewhere, skipping tab switch check...')
            return
          }

          try {
            // First, just check if we have a session without making API calls
            const { data, error } = await supabase.auth.getSession()

            if (error) {
              console.warn('⚠️ Session check after tab switch failed:', error.message)
              // Don't immediately expire - could be a temporary network issue
              return
            }

            if (!data.session) {
              console.log('ℹ️ No session found after tab switch')
              await this.handleSessionExpired()
              return
            }

            // Check if token is close to expiration
            const expiresAt = data.session.expires_at
            const now = Math.floor(Date.now() / 1000)
            const timeUntilExpiry = expiresAt ? expiresAt - now : Infinity

            if (timeUntilExpiry < 300) {
              // Less than 5 minutes - refresh proactively
              console.log('🔄 Refreshing token after tab switch...')
              const { error: refreshError } = await supabase.auth.refreshSession()

              if (refreshError) {
                console.warn('⚠️ Token refresh failed after tab switch:', refreshError.message)
                // Don't expire immediately - will be caught by next health check
              } else {
                console.log('✅ Token refreshed successfully after tab switch')
              }
            } else {
              console.log('💚 Session is healthy after tab switch')
            }
          } catch (error) {
            console.warn('⚠️ Error during tab switch session check:', error)
            // Don't handle as session expired for network errors
          }
        }, 1000) // 1000ms delay to prevent Supabase deadlock (GitHub issue #273)
      } else {
        console.log('👁️ Tab became hidden')
      }
    }

    document.addEventListener('visibilitychange', this.visibilityChangeHandler)
  }

  // Cleanup all listeners
  cleanup() {
    this.stopHealthCheck()

    if (this.visibilityChangeHandler) {
      document.removeEventListener('visibilitychange', this.visibilityChangeHandler)
      this.visibilityChangeHandler = null
    }

    console.log('🧹 Session manager cleanup complete')
  }

  // Manual session health check (useful for debugging)
  async manualHealthCheck(): Promise<boolean> {
    console.log('🔍 Manual session health check requested...')
    return await this.checkSessionHealth()
  }

  // Manual session refresh
  async refreshSession(): Promise<boolean> {
    try {
      const { error } = await supabase.auth.refreshSession()

      if (error) {
        console.error('❌ Manual session refresh failed:', error.message)
        return false
      }

      console.log('✅ Manual session refresh successful')
      return true
    } catch (error) {
      console.error('⚠️ Manual session refresh error:', error)
      return false
    }
  }
}

// Global session manager instance
let globalSessionManager: SessionManager | null = null

// Initialize global session manager
export const initializeSessionManager = (onSessionExpired?: () => void): SessionManager => {
  if (globalSessionManager) {
    globalSessionManager.cleanup()
  }

  globalSessionManager = new SessionManager(onSessionExpired)
  return globalSessionManager
}

// Get current session manager
export const getSessionManager = (): SessionManager | null => {
  return globalSessionManager
}

// Cleanup global session manager
export const cleanupSessionManager = () => {
  if (globalSessionManager) {
    globalSessionManager.cleanup()
    globalSessionManager = null
  }
}
