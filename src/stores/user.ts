import { defineStore } from 'pinia'
import type { CoachProfile } from '@/types/coach'
import { useSubscriptionStore } from './subscription'

export const useUserStore = defineStore('user', {
  state: () => ({
    isLoggedIn: true, // Set to true for demo purposes
    coach: {
      id: '1',
      firstName: 'Marc',
      lastName: 'Dubois',
      city: 'Paris',
      country: 'France',
      email: 'marc.dubois@example.com',
      emailVerified: true,
      phoneNumber: '+33 6 12 34 56 78',
      phoneVerified: false,
      services: [
        'Remise en forme',
        'Perte de poids',
        'Renforcement musculaire',
        'Nutrition sportive',
        'Motivation',
      ],
      photoUrl: '',
      description:
        "Coach sportif passionné avec 8 ans d'expérience. Spécialisé dans la remise en forme et la préparation physique.",
      diplomas: [
        {
          id: '1',
          name: 'BPJEPS Activités Gymniques',
          photoUrl: '',
          status: 'approved',
          submittedAt: new Date('2024-01-15'),
          reviewedAt: new Date('2024-01-20'),
          reviewedBy: 'admin',
        },
        {
          id: '2',
          name: 'Certificat en Nutrition Sportive',
          photoUrl: '',
          status: 'pending',
          submittedAt: new Date('2024-12-01'),
        },
      ],
      website: 'https://marc-dubois-coach.fr',
      accountStatus: 'pending',
      createdAt: new Date('2024-01-10'),
      suspensionReason: 'En attente de validation du certificat en nutrition sportive',
    } as CoachProfile | null,
  }),  actions: {
    login(data: CoachProfile) {
      this.isLoggedIn = true
      this.coach = data
    },
    logout() {
      this.isLoggedIn = false
      this.coach = null
    },
    
    // Subscription actions - delegate to subscription store
    toggleSubscription() {
      const subscriptionStore = useSubscriptionStore()
      subscriptionStore.toggleSubscription()
    },
    
    activateSubscription() {
      const subscriptionStore = useSubscriptionStore()
      subscriptionStore.subscribeToPlan('pro') // Default to pro plan
    },
    
    cancelSubscription() {
      const subscriptionStore = useSubscriptionStore()
      subscriptionStore.cancelSubscription()
    },
    
    upgradeSubscription() {
      const subscriptionStore = useSubscriptionStore()
      subscriptionStore.upgradeToPlan('premium')
    },
  },
})
