export interface DayAvailability {
  day: 'lundi' | 'mardi' | 'mercredi' | 'jeudi' | 'vendredi' | 'samedi' | 'dimanche'
  morning: boolean // Disponible le matin
  afternoon: boolean // Disponible l'après-midi
  evening: boolean // Disponible le soir
}

export interface Lead {
  id: string | number
  clientId: string | number
  clientName: string
  clientEmail: string
  clientPhone: string
  clientGender: 'homme' | 'femme' | 'non_specifie'
  clientAgeGroup: string
  location: string // Localisation géographique du client
  meetingLocationPreference:
    | 'domicile_client'
    | 'salle_sport'
    | 'exterieur'
    | 'domicile_coach'
    | 'lieu_public'
    | 'en_ligne'
    | 'flexible'
  services: string[]
  level: 'debutant' | 'intermediaire' | 'avance' | 'professionnel'
  groupPreference: 'solo' | 'small_group' | 'group' | 'online' | 'any'
  desiredStart: Date | string
  availability: string // Description générale des disponibilités
  weeklyAvailability: DayAvailability[] // Disponibilités détaillées par jour
  sessionsPerWeek: number // Nombre de séances souhaitées par semaine
  budget?: string
  languages: string[]
  extraInfo?: string
  genderPreference: 'homme' | 'femme' | 'peu_importe'

  // Lead acquisition info
  acquiredAt: Date // When coach accepted/bought this lead
  acquisitionType: 'accepted' | 'purchased' // How coach got this lead
  originalProposalId: string | number
  amountPaid?: number // If purchased

  // Lead status and interaction
  leadStatus: 'new' | 'contacted' | 'in_progress' | 'converted' | 'lost' | 'inactive'
  lastContactDate?: Date
  nextFollowUpDate?: Date
  notes: string[]
  conversionValue?: number // If converted to paying client
  conversionDate?: Date

  // Interaction tracking
  contactAttempts: number
  responseReceived: boolean
  meetingScheduled: boolean
  contractSigned: boolean

  // Feedback and reporting
  clientRating?: number // 1-5 rating of client interaction
  coachFeedback?: string
  issuesReported: string[]
  isReported: boolean
  reportReason?: string
  reportDate?: Date

  // Administrative
  expiresAt?: Date // Some leads might have expiry
  priority: 'low' | 'medium' | 'high'
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export interface LeadNote {
  id: string
  leadId: string | number
  content: string
  type: 'general' | 'contact' | 'meeting' | 'issue' | 'success'
  createdAt: Date
  isPrivate: boolean
}

export interface LeadAction {
  id: string
  leadId: string | number
  type: 'contact' | 'meeting' | 'email' | 'call' | 'note' | 'status_change'
  description: string
  scheduledDate?: Date
  completedDate?: Date
  status: 'pending' | 'completed' | 'cancelled'
  createdAt: Date
}
