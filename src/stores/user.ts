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
    
    // Subscription state
    subscription: {
      hasSubscription: false,
      plan: 'Premium',
      status: 'cancelled',
      price: 49,
      currency: 'EUR',
      billingCycle: 'monthly',
      nextBillingDate: new Date('2025-02-15'),
      autoRenew: true,
      features: [
        'Accès illimité aux offres Premium',
        'Priorité dans les recherches clients',
        'Support client prioritaire',
        'Outils de gestion avancés',
        'Statistiques détaillées'
      ],
      paymentMethod: {
        brand: 'Visa',
        last4: '4242',
        expiryMonth: 12,
        expiryYear: 2027
      },
      billingHistory: [
        {
          id: '1',
          date: new Date('2025-01-15'),
          amount: 49,
          currency: 'EUR',
          status: 'paid',
          description: 'Abonnement Premium - Janvier 2025'
        },
        {
          id: '2',
          date: new Date('2024-12-15'),
          amount: 49,
          currency: 'EUR',
          status: 'paid',
          description: 'Abonnement Premium - Décembre 2024'
        }
      ]
    },
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
    
    // Subscription actions
    toggleSubscription() {
      this.subscription.hasSubscription = !this.subscription.hasSubscription
      this.subscription.status = this.subscription.hasSubscription ? 'active' : 'cancelled'
    },
    
    activateSubscription() {
      this.subscription.hasSubscription = true
      this.subscription.status = 'active'
    },
    
    cancelSubscription() {
      this.subscription.hasSubscription = false
      this.subscription.status = 'cancelled'
    },
    
    upgradeSubscription() {
      // In a real app, this would handle plan changes
      console.log('Upgrading subscription...')
    },
  },
})
