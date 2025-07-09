export interface Proposal {
  id: string | number // UUID or INT
  client_id: string | number // FK to users.id
  created_at: Date
  desired_start: Date | string // Can be a date or "immediatement"
  location: string
  services: string[] // Array of selected services
  level: 'debutant' | 'intermediaire' | 'avance' | 'professionnel'
  group_preference: 'solo' | 'small_group' | 'group' | 'online' | 'any'
  languages: string[]
  availability: string
  extra_info?: string
  budget_range?: string
  gender_preference: 'homme' | 'femme' | 'peu_importe'
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'cancelled' | 'archived' | 'confirmed'
  expires_at: Date
  is_paid_for?: boolean // Whether coach paid for this specific lead
  // Additional client info for display
  client_gender?: 'homme' | 'femme' | 'non_specifie'
  client_age_group?: string
}
