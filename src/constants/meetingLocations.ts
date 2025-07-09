export const MEETING_LOCATIONS = {
  domicile_client: 'À domicile (chez le client)',
  salle_sport: 'Salle de sport / Gym',
  exterieur: 'En extérieur (parc, plage, etc.)',
  domicile_coach: 'À domicile (chez le coach)',
  lieu_public: 'Lieu public (studio, centre communautaire)',
  en_ligne: 'En ligne / Visioconférence',
  flexible: 'Flexible / À déterminer',
} as const

export type MeetingLocationType = keyof typeof MEETING_LOCATIONS

export const getMeetingLocationLabel = (location: MeetingLocationType): string => {
  return MEETING_LOCATIONS[location] || location
}
