import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
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
import CoachDashboard from '@/pages/CoachDashboard.vue'
import CoachPublicProfile from '@/pages/CoachPublicProfile.vue'
import CoachProposals from '@/pages/CoachProposals.vue'
import CoachSignup from '@/pages/CoachSignup.vue'
import CoachOnboarding from '@/pages/CoachOnboarding.vue'
import Abonnement from '@/pages/Abonnement.vue'
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
import ContactPage from '@/pages/ContactPage.vue'
import AboutPage from '@/pages/AboutPage.vue'
import FAQPage from '@/pages/FAQPage.vue'
import PrivacyPolicy from '@/pages/PrivacyPolicy.vue'
import TermsOfService from '@/pages/TermsOfService.vue'

const routes = [
  { path: '/', component: HomePage, meta: { title: 'Accueil - Coachiles' } },
  { path: '/coaches', component: CoachBrowser, meta: { title: 'Coachs' } },
  { path: '/services', component: ServiceBrowser, meta: { title: 'Services' } },
  { path: '/coach/:id', component: CoachPublicProfile, props: true, meta: { title: 'Coach' } },
  {
    path: '/signup',
    component: CoachSignup,
    beforeEnter: redirectIfAuthenticated,
    meta: { title: 'Inscription' },
  },
  {
    path: '/auth',
    component: AuthForm,
    beforeEnter: redirectIfAuthenticated,
    meta: { title: 'Connexion' },
  },
  {
    path: '/account/reactivate',
    component: AccountReactivation,
    // No auth guard - this is for deleted accounts
    meta: { title: 'Réactivation du compte' },
  },
  {
    path: '/coach/onboarding',
    component: CoachOnboarding,
    beforeEnter: requireOnboarding, // Only allow users who need onboarding
    meta: { title: 'Onboarding' },
  },
  {
    path: '/coach/profile',
    component: CoachProfile,
    beforeEnter: requireAuth,
    meta: { title: 'Mon Profil' },
  },
  {
    path: '/coach/dashboard',
    component: CoachDashboard,
    beforeEnter: requireAuth,
    meta: { title: 'Dashboard' },
  },
  {
    path: '/coach/disabled',
    component: CoachDisabled,
    beforeEnter: requireAuthOnly,
    meta: { title: 'Compte désactivé' },
  },
  {
    path: '/coach/account',
    component: CoachAccount,
    beforeEnter: requireAuth,
    meta: { title: 'Paramètres' },
  },
  {
    path: '/coach/abonnement',
    component: Abonnement,
    beforeEnter: requireAuth,
    meta: { title: 'Abonnement' },
  },
  // Services (renamed from marketplace) - new canonical path
  {
    path: '/coach/services',
    component: CoachMarketplace,
    beforeEnter: requireAuth,
    meta: { title: 'Mes Services' },
  },
  // Legacy marketplace path kept as redirect for existing bookmarks
  {
    path: '/coach/marketplace',
    redirect: '/coach/services',
  },
  {
    path: '/coach/marketplace-debug',
    component: CoachMarketplaceDebug,
    beforeEnter: requireAuth,
    meta: { title: 'Services (Debug)' },
  },
  {
    path: '/coach/marketplace-simple',
    component: CoachMarketplaceSimple,
    beforeEnter: requireAuth,
    meta: { title: 'Services (Simple)' },
  },
  {
    path: '/coach/bookings',
    component: CoachBookings,
    beforeEnter: requireAuth,
    meta: { title: 'Réservations' },
  },
  {
    path: '/coach/bookings-debug',
    component: CoachBookingsDebug,
    beforeEnter: requireAuth,
    meta: { title: 'Réservations (Debug)' },
  },
  {
    path: '/coach/bookings-simple',
    component: CoachBookingsSimple,
    beforeEnter: requireAuth,
    meta: { title: 'Réservations (Simple)' },
  },
  {
    path: '/coach/proposals',
    component: CoachProposals,
    beforeEnter: requireAuth,
    meta: { title: 'Propositions' },
  },
  {
    path: '/test-api',
    component: APITestPage,
    meta: { title: 'API Test' },
  },
  {
    path: '/superadmin',
    component: Superadmin,
    beforeEnter: [requireAuthOnly, requireSuperadmin],
    meta: { title: 'Superadmin' },
  },
  {
    path: '/demo/account-deletion',
    component: AccountDeletionDemo,
    meta: { title: 'Suppression de compte (Demo)' },
  },
  { path: '/coach/leads', redirect: '/coach/proposals' },
  { path: '/success', component: SuccessPage, meta: { title: 'Succès' } },
  { path: '/contact', component: ContactPage, meta: { title: 'Contact' } },
  { path: '/a-propos', component: AboutPage, meta: { title: 'À propos' } },
  { path: '/faq', component: FAQPage, meta: { title: 'FAQ' } },
  { path: '/privacy', component: PrivacyPolicy, meta: { title: 'Politique de confidentialité' } },
  { path: '/cgu', component: TermsOfService, meta: { title: 'Conditions générales d\'utilisation' } },
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
  // Dynamic document title
  const base = 'Coachiles'
  const page = (to.meta?.title as string) || ''
  document.title = page ? `${base} - ${page}` : base
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
