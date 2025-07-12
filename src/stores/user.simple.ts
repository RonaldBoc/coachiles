import { defineStore } from 'pinia'
import type { Coach } from '@/types/coach'
import type { Lead } from '@/types/Lead'
import type { UserSubscription } from '@/types/subscription'

export const useUserStore = defineStore('user', {
  state: () => ({
    isLoggedIn: true,
    userType: 'coach' as 'coach' | 'client',
    coach: {
      id: '1',
      firstName: 'Marc',
      lastName: 'Dubois',
      email: 'marc.dubois@example.com',
      phone: '+596 696 12 34 56',
      photo: '/avatars/marc.jpg',
      bio: "Coach sportif passionné avec 8 ans d'expérience. Spécialisé dans la remise en forme et la préparation physique.",
      location: 'Fort-de-France',
      specialties: [
        'Remise en forme',
        'Perte de poids',
        'Renforcement musculaire',
        'Nutrition sportive',
      ],
      certifications: ['BPJEPS Activités Gymniques', 'Certificat en Nutrition Sportive'],
      experience: 8,
      availability: 'Lun-Ven 9h-18h, Sam 9h-12h',
      rating: 4.7,
      totalClients: 45,
      subscriptionStatus: 'active',
      services: [
        {
          id: '1',
          name: 'Remise en forme personnalisée',
          description:
            'Programme sur mesure pour retrouver la forme et améliorer sa condition physique.',
          category: 'Fitness & Musculation',
          subcategory: 'Remise en forme générale',
          location: 'Fort-de-France',
          duration: 60,
          groupSize: 'individual',
          ageGroups: ['Adultes'],
          levels: ['Débutant', 'Intermédiaire'],
          isActive: true,
        },
        {
          id: '2',
          name: 'Coaching perte de poids',
          description: 'Accompagnement complet pour perdre du poids sainement et durablement.',
          category: 'Nutrition & Lifestyle',
          subcategory: 'Perte de poids',
          location: 'Fort-de-France',
          duration: 45,
          groupSize: 'individual',
          ageGroups: ['Adultes'],
          levels: ['Débutant', 'Intermédiaire', 'Avancé'],
          isActive: true,
        },
      ],
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-12-10'),
      isActive: true,
    } as Coach,
    leads: [
      {
        id: 'lead_001',
        clientRequestId: 'req_001',
        coachId: '1',
        status: 'new',
        unlockedAt: new Date('2024-12-01'),
        clientInfo: {
          name: 'Sophie Martin',
          email: 'sophie.martin@example.com',
          phone: '+596 696 98 76 54',
          goals: "Remise en forme après grossesse, retrouver de l'énergie",
          location: 'Fort-de-France',
          budget: '50-70€ par séance',
          availability: "Matin et fin d'après-midi en semaine",
          preferences: ['Remise en forme', 'Perte de poids'],
        },
      },
      {
        id: 'lead_002',
        clientRequestId: 'req_002',
        coachId: '1',
        status: 'contacted',
        unlockedAt: new Date('2024-11-28'),
        contactedAt: new Date('2024-11-29'),
        clientInfo: {
          name: 'Pierre Dubois',
          email: 'pierre.dubois@example.com',
          phone: '+596 696 11 22 33',
          goals: 'Préparation physique pour marathon',
          location: 'Schoelcher',
          budget: '60-80€ par séance',
          availability: 'Soir et weekend',
          preferences: ['Cardio', 'Endurance'],
        },
      },
      {
        id: 'lead_003',
        clientRequestId: 'req_003',
        coachId: '1',
        status: 'converted',
        unlockedAt: new Date('2024-11-20'),
        contactedAt: new Date('2024-11-21'),
        convertedAt: new Date('2024-11-25'),
        clientInfo: {
          name: 'Marie Leclerc',
          email: 'marie.leclerc@example.com',
          phone: '+596 696 44 55 66',
          goals: 'Renforcement musculaire et bien-être',
          location: 'Lamentin',
          budget: '70-90€ par séance',
          availability: 'Flexible',
          preferences: ['Musculation', 'Bien-être'],
        },
      },
    ] as Lead[],
    subscription: {
      id: 'sub_001',
      planId: 'professional',
      hasSubscription: true,
      status: 'active',
      startDate: new Date('2024-11-01'),
      endDate: new Date('2024-12-01'),
      nextBillingDate: new Date('2024-12-01'),
      autoRenew: true,
      leadsUsed: 8,
      leadsRemaining: 7,
      resetDate: new Date('2024-12-01'),
    } as UserSubscription,
  }),

  getters: {
    isCoach: (state) => state.userType === 'coach',
    isClient: (state) => state.userType === 'client',
    hasActiveSubscription: (state) => state.subscription.status === 'active',
    newLeadsCount: (state) => state.leads.filter((lead) => lead.status === 'new').length,
    contactedLeadsCount: (state) =>
      state.leads.filter((lead) => lead.status === 'contacted').length,
    convertedLeadsCount: (state) =>
      state.leads.filter((lead) => lead.status === 'converted').length,
    conversionRate: (state) => {
      const total = state.leads.length
      const converted = state.leads.filter((lead) => lead.status === 'converted').length
      return total > 0 ? Math.round((converted / total) * 100) : 0
    },
    activeServices: (state) => state.coach.services.filter((service) => service.isActive),
  },

  actions: {
    updateProfile(profileData: Partial<Coach>) {
      if (this.coach) {
        Object.assign(this.coach, profileData)
        this.coach.updatedAt = new Date()
      }
    },

    addService(service: Omit<Coach['services'][0], 'id'>) {
      if (this.coach) {
        const newService = {
          ...service,
          id: `service_${Date.now()}`,
        }
        this.coach.services.push(newService)
      }
    },

    updateService(serviceId: string, updates: Partial<Coach['services'][0]>) {
      if (this.coach) {
        const serviceIndex = this.coach.services.findIndex((s) => s.id === serviceId)
        if (serviceIndex !== -1) {
          Object.assign(this.coach.services[serviceIndex], updates)
        }
      }
    },

    deleteService(serviceId: string) {
      if (this.coach) {
        this.coach.services = this.coach.services.filter((s) => s.id !== serviceId)
      }
    },

    unlockLead(leadId: string) {
      const lead = this.leads.find((l) => l.id === leadId)
      if (lead && lead.status === 'new') {
        lead.status = 'viewed'
        if (this.subscription.leadsRemaining > 0) {
          this.subscription.leadsUsed++
          this.subscription.leadsRemaining--
        }
      }
    },

    contactLead(leadId: string) {
      const lead = this.leads.find((l) => l.id === leadId)
      if (lead) {
        lead.status = 'contacted'
        lead.contactedAt = new Date()
      }
    },

    convertLead(leadId: string) {
      const lead = this.leads.find((l) => l.id === leadId)
      if (lead) {
        lead.status = 'converted'
        lead.convertedAt = new Date()
      }
    },

    updateSubscription(subscriptionData: Partial<UserSubscription>) {
      Object.assign(this.subscription, subscriptionData)
    },

    login(_email: string, _password: string) {
      // Mock login - in real app, would validate credentials
      console.log('Login attempt with:', { email: _email, password: _password })
      this.isLoggedIn = true
      return Promise.resolve({ success: true })
    },

    logout() {
      this.isLoggedIn = false
      // Reset to initial state instead of null
      this.coach = {
        id: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        bio: '',
        location: '',
        specialties: [],
        certifications: [],
        experience: 0,
        availability: '',
        rating: 0,
        totalClients: 0,
        subscriptionStatus: 'inactive',
        services: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: false,
      }
      this.leads = []
      this.subscription = {
        hasSubscription: false,
        status: 'cancelled',
        autoRenew: false,
        leadsUsed: 0,
        leadsRemaining: 0,
        resetDate: new Date(),
      }
    },

    async fetchUserData() {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return Promise.resolve()
    },

    async saveProfile() {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      return Promise.resolve()
    },
  },
})
