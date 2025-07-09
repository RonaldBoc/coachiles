export interface Proposal {
  id: string | number // UUID or INT
  client_id: string | number // FK to users.id
  created_at: Date
  desired_start: Date
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
}
