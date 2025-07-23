import { createRouter, createWebHistory } from 'vue-router'
import CoachBrowser from '@/pages/CoachBrowser.vue'
import CoachAccount from '@/pages/CoachAccount.vue'
import CoachServices from '@/pages/CoachServices.vue'
import CoachProfile from '@/pages/CoachProfile.vue'
import CoachPublicProfile from '@/pages/CoachPublicProfile.vue'
import CoachProposals from '@/pages/CoachProposals.vue'
import AuthForm from '@/components/AuthForm.vue'
import { requireAuth, redirectIfAuthenticated } from './guards'

const routes = [
  { path: '/', redirect: '/coaches' },
  { path: '/coaches', component: CoachBrowser },
  { path: '/coach/:firstName', component: CoachPublicProfile, props: true },
  {
    path: '/auth',
    component: AuthForm,
    beforeEnter: redirectIfAuthenticated,
  },
  {
    path: '/coach/profile',
    component: CoachProfile,
    beforeEnter: requireAuth,
  },
  {
    path: '/coach/account',
    component: CoachAccount,
    beforeEnter: requireAuth,
  },
  {
    path: '/coach/services',
    component: CoachServices,
    beforeEnter: requireAuth,
  },
  {
    path: '/coach/proposals',
    component: CoachProposals,
    beforeEnter: requireAuth,
  },
  { path: '/coach/leads', redirect: '/coach/proposals' },
  // Legacy routes for backward compatibility
  { path: '/CoachProfile', redirect: '/coach/profile' },
  { path: '/CoachAccount', redirect: '/coach/account' },
  { path: '/CoachServices', redirect: '/coach/services' },
  { path: '/CoachProposals', redirect: '/coach/proposals' },
  { path: '/CoachLeads', redirect: '/coach/proposals' },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
