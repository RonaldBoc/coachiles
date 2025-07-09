import { defineStore } from 'pinia'
import type { CoachProfile } from '@/types/coach'

export const useUserStore = defineStore('user', {
  state: () => ({
    isLoggedIn: true, // Set to true for demo purposes
    coach: {
      id: '1',
      firstName: 'Marc',
      lastName: 'Dubois',
      city: 'Paris',
      country: 'France',
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
          reviewedBy: 'admin'
        },
        {
          id: '2',
          name: 'Certificat en Nutrition Sportive',
          photoUrl: '',
          status: 'pending',
          submittedAt: new Date('2024-12-01')
        }
      ],
      website: 'https://marc-dubois-coach.fr',
      accountStatus: 'pending',
      createdAt: new Date('2024-01-10'),
      suspensionReason: 'En attente de validation du certificat en nutrition sportive'
    } as CoachProfile | null,
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
