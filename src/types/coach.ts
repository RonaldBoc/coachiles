export interface CoachProfile {
  id: string
  firstName: string
  lastName: string
  city: string
  country: string
  services: string[] // Array of services the coach offers
  photoUrl?: string
  description?: string
  diplomas?: string[]
  website?: string
}
