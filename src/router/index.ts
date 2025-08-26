import { createRouter, createWebHistory } from 'vue-router'
import CoachBrowser from '@/pages/CoachBrowser.vue'
import ServiceBrowser from '@/pages/ServiceBrowser.vue'
import CoachAccount from '@/pages/CoachAccount.vue'
import CoachMarketplace from '@/pages/CoachMarketplace.vue'
import CoachMarketplaceDebug from '@/pages/CoachMarketplaceDebug.vue'
import CoachMarketplaceSimple from '@/pages/CoachMarketplaceSimple.vue'
import CoachBookings from '@/pages/CoachBookings.vue'
import CoachBookingsDebug from '@/pages/CoachBookingsDebug.vue'
import CoachBookingsSimple from '@/pages/CoachBookingsSimple.vue'
import CoachProfile from '@/pages/CoachProfile.vue'
import CoachPublicProfile from '@/pages/CoachPublicProfile.vue'
import CoachProposals from '@/pages/CoachProposals.vue'
import CoachRegistration from '@/pages/CoachRegistration.vue'
import CoachSignup from '@/pages/CoachSignup.vue'
import CoachOnboarding from '@/pages/CoachOnboarding.vue'
import AccountReactivation from '@/pages/AccountReactivation.vue'
import AccountDeletionDemo from '@/pages/AccountDeletionDemo.vue'
import APITestPage from '@/pages/APITestPage.vue'
import AuthForm from '@/components/AuthForm.vue'
import {
  requireAuth,
  requireAuthOnly,
  redirectIfAuthenticated,
  requireOnboarding,
  requireSuperadmin,
} from './guards'
import Superadmin from '@/pages/Superadmin.vue'

import SuccessPage from '@/pages/Success.vue'
import CoachDisabled from '@/pages/CoachDisabled.vue'

const routes = [
  { path: '/', redirect: '/coaches' },
  { path: '/coaches', component: CoachBrowser },
  { path: '/services', component: ServiceBrowser },
  { path: '/coach/:id', component: CoachPublicProfile, props: true },
  {
    path: '/signup',
    component: CoachSignup,
    beforeEnter: redirectIfAuthenticated,
  },
  {
    path: '/auth',
    component: AuthForm,
    beforeEnter: redirectIfAuthenticated,
  },
  {
    path: '/account/reactivate',
    component: AccountReactivation,
    // No auth guard - this is for deleted accounts
  },
  {
    path: '/coach/onboarding',
    component: CoachOnboarding,
    beforeEnter: requireOnboarding, // Only allow users who need onboarding
  },
  {
    path: '/coach/registration',
    component: CoachRegistration,
    beforeEnter: requireAuthOnly, // Only requires authentication, not coach status
  },
  {
    path: '/coach/profile',
    component: CoachProfile,
    beforeEnter: requireAuth,
  },
  {
    path: '/coach/disabled',
    component: CoachDisabled,
    beforeEnter: requireAuthOnly,
  },
  {
    path: '/coach/account',
    component: CoachAccount,
    beforeEnter: requireAuth,
  },
  {
    path: '/coach/services',
    redirect: '/coach/marketplace',
  },
  {
    path: '/coach/marketplace',
    component: CoachMarketplace,
    beforeEnter: requireAuth,
  },
  {
    path: '/coach/marketplace-debug',
    component: CoachMarketplaceDebug,
    beforeEnter: requireAuth,
  },
  {
    path: '/coach/marketplace-simple',
    component: CoachMarketplaceSimple,
    beforeEnter: requireAuth,
  },
  {
    path: '/coach/bookings',
    component: CoachBookings,
    beforeEnter: requireAuth,
  },
  {
    path: '/coach/bookings-debug',
    component: CoachBookingsDebug,
    beforeEnter: requireAuth,
  },
  {
    path: '/coach/bookings-simple',
    component: CoachBookingsSimple,
    beforeEnter: requireAuth,
  },
  {
    path: '/coach/proposals',
    component: CoachProposals,
    beforeEnter: requireAuth,
  },
  {
    path: '/test-api',
    component: APITestPage,
  },
  {
    path: '/superadmin',
    component: Superadmin,
    beforeEnter: [requireAuthOnly, requireSuperadmin],
  },
  {
    path: '/demo/account-deletion',
    component: AccountDeletionDemo,
  },
  { path: '/coach/leads', redirect: '/coach/proposals' },
  { path: '/success', component: SuccessPage },
  // Legacy routes for backward compatibility
  { path: '/CoachProfile', redirect: '/coach/profile' },
  { path: '/CoachAccount', redirect: '/coach/account' },
  { path: '/CoachServices', redirect: '/coach/marketplace' },
  { path: '/CoachProposals', redirect: '/coach/proposals' },
  { path: '/CoachLeads', redirect: '/coach/proposals' },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Preserve browser back/forward saved position
    if (savedPosition) return savedPosition
    // Always scroll to top on normal navigation
    return { left: 0, top: 0 }
  },
})

// Force scroll-to-top for dynamic public coach profile navigations (SPA transitions)
router.afterEach((to) => {
  if (to.path.match(/^\/coach\/[0-9a-fA-F-]{10,}$/)) {
    // Defer to next frame to avoid layout shifts pushing scroll
    requestAnimationFrame(() => {
      window.scrollTo(0, 0)
      // Extra safety after potential async content injection
      setTimeout(() => window.scrollTo(0, 0), 50)
    })
  }
})

export default router
