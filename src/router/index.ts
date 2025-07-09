import { createRouter, createWebHistory } from 'vue-router'
import CoachAccount from '@/pages/CoachAccount.vue'
import CoachServices from '@/pages/CoachServices.vue'
import CoachProfile from '@/pages/CoachProfile.vue'
import CoachProposals from '@/pages/CoachProposals.vue'
import CoachLeads from '@/pages/CoachLeads.vue'

const routes = [
  { path: '/', redirect: '/CoachProposals' },
  { path: '/CoachProfile', component: CoachProfile },
  { path: '/CoachAccount', component: CoachAccount },
  { path: '/CoachServices', component: CoachServices },
  { path: '/CoachProposals', component: CoachProposals },
  { path: '/CoachLeads', component: CoachLeads },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
