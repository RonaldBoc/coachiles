import type { NavigationGuard } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Route guard to protect coach-only routes
export const requireAuth: NavigationGuard = async (to, from, next) => {
  const authStore = useAuthStore()

  // Wait for auth initialization to complete
  if (!authStore.isInitialized || authStore.loading) {
    console.log('⏳ Waiting for auth initialization...')

    // Wait for initialization with a reasonable timeout
    let attempts = 0
    const maxAttempts = 50 // 5 seconds max

    while ((!authStore.isInitialized || authStore.loading) && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      attempts++
    }

    if (attempts >= maxAttempts) {
      console.warn('⚠️ Auth initialization timeout')
    }
  }

  console.log('🔐 Auth check:', {
    isAuthenticated: authStore.isAuthenticated,
    isCoach: authStore.isCoach,
    user: authStore.user?.email,
  })

  if (!authStore.isAuthenticated) {
    console.log('❌ Not authenticated, redirecting to /auth')
    // Redirect to login page
    next({
      path: '/auth',
      query: { redirect: to.fullPath },
    })
  } else if (!authStore.isCoach) {
    console.log('❌ User is not a coach, redirecting to coach registration')
    // User is authenticated but not a coach - redirect to registration
    next({
      path: '/coach/registration',
      query: { redirect: to.fullPath },
    })
  } else {
    console.log('✅ Auth check passed, proceeding to route')
    next()
  }
}

// Route guard that only requires authentication (not coach status)
export const requireAuthOnly: NavigationGuard = async (to, from, next) => {
  const authStore = useAuthStore()

  // Wait for auth initialization to complete
  if (!authStore.isInitialized || authStore.loading) {
    console.log('⏳ Waiting for auth initialization...')

    let attempts = 0
    const maxAttempts = 50 // 5 seconds max

    while ((!authStore.isInitialized || authStore.loading) && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      attempts++
    }

    if (attempts >= maxAttempts) {
      console.warn('⚠️ Auth initialization timeout')
    }
  }

  console.log('🔐 Auth-only check:', {
    isAuthenticated: authStore.isAuthenticated,
    user: authStore.user?.email,
  })

  if (!authStore.isAuthenticated) {
    console.log('❌ Not authenticated, redirecting to /auth')
    // Redirect to login page
    next({
      path: '/auth',
      query: { redirect: to.fullPath },
    })
  } else {
    console.log('✅ User authenticated, allowing access')
    next()
  }
}

// Route guard to redirect authenticated users away from auth pages
export const redirectIfAuthenticated: NavigationGuard = async (to, from, next) => {
  const authStore = useAuthStore()

  // Wait for auth initialization to complete
  if (!authStore.isInitialized || authStore.loading) {
    console.log('⏳ Waiting for auth initialization before redirect check...')

    let attempts = 0
    const maxAttempts = 50 // 5 seconds max

    while ((!authStore.isInitialized || authStore.loading) && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      attempts++
    }
  }

  if (authStore.isAuthenticated && authStore.isCoach) {
    console.log('✅ User already authenticated, redirecting to /coach/profile')
    // Redirect to coach dashboard
    next('/coach/profile')
  } else {
    next()
  }
}
