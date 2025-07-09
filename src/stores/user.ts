import { defineStore } from 'pinia'
import type { CoachProfile } from '@/types/coach'

export const useUserStore = defineStore('user', {
  state: () => ({
    isLoggedIn: false,
    coach: null as CoachProfile | null,
  }),
  actions: {
    login(data: CoachProfile) {
      this.isLoggedIn = true
      this.coach = data
    },
    logout() {
      this.isLoggedIn = false
      this.coach = null
    },
  },
})
