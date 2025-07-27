/**
 * Coach Options Configuration
 *
 * This file contains all the dynamic options for coach profiles.
 * Update these arrays to add/remove certifications, languages, specialties etc.
 * without touching component code.
 */

export interface CertificationGroup {
  category: string
  certifications: string[]
}

export interface SpecialtyGroup {
  category: string
  specialties: string[]
}

export const SPECIALTY_OPTIONS: SpecialtyGroup[] = [
  {
    category: 'Fitness & Musculation',
    specialties: [
      'Remise en forme générale',
      'Perte de poids',
      'Prise de masse musculaire',
      'Musculation & Force',
      'CrossFit',
      'Functional training',
      'HIIT',
      'Circuit training',
    ],
  },
  {
    category: 'Cardio & Endurance',
    specialties: [
      'Course à pied',
      'Trail running',
      'Marathon',
      'Cyclisme',
      'Natation',
      'Triathlon',
      'Endurance cardiovasculaire',
      'Marche sportive',
    ],
  },
  {
    category: 'Sports de combat',
    specialties: [
      'Boxe anglaise',
      'Boxe française',
      'Kickboxing',
      'MMA',
      'Judo',
      'Karaté',
      'Taekwondo',
      'Arts martiaux mixtes',
    ],
  },
  {
    category: 'Sports collectifs',
    specialties: [
      'Football',
      'Basketball',
      'Volleyball',
      'Handball',
      'Rugby',
      'Tennis de table',
      'Badminton',
      'Tennis',
    ],
  },
  {
    category: 'Bien-être & Relaxation',
    specialties: [
      'Yoga',
      'Pilates',
      'Méditation',
      'Sophrologie',
      'Stretching',
      'Relaxation',
      'Respiration',
      'Gestion du stress',
    ],
  },
  {
    category: 'Rééducation & Thérapie',
    specialties: [
      'Rééducation fonctionnelle',
      'Kinésithérapie sportive',
      'Ostéopathie',
      'Massage thérapeutique',
      'Récupération sportive',
      'Prévention des blessures',
      'Réathlétisation',
    ],
  },
  {
    category: 'Nutrition & Lifestyle',
    specialties: [
      'Nutrition sportive',
      'Rééquilibrage alimentaire',
      'Conseil en nutrition',
      'Préparation de repas',
      'Compléments alimentaires',
      'Hydratation',
      'Gestion du poids',
    ],
  },
  {
    category: 'Danse',
    specialties: [
      'Danse contemporaine',
      'Danse classique',
      'Hip-hop',
      'Salsa',
      'Bachata',
      'Kizomba',
      'Zouk',
      'Dancehall',
      'Afrobeat',
      'Danse de salon',
      'Tango',
      'Valse',
      'Jazz',
      'Modern jazz',
      'Danse africaine',
    ],
  },
  {
    category: 'Spécialisations techniques',
    specialties: [
      'Préparation physique',
      'Préparation mentale',
      'Analyse vidéo',
      'Tests physiques',
      "Planification d'entraînement",
      'Coaching de performance',
      'Biomécanique',
    ],
  },
]

export const CERTIFICATION_OPTIONS: CertificationGroup[] = [
  {
    category: 'Diplômes STAPS & Sport',
    certifications: [
      'BPJEPS',
      'CQP',
      'Licence STAPS',
      'Master STAPS',
      'Préparateur Physique',
      'Éducateur Sportif',
    ],
  },
  {
    category: 'Fitness & Musculation',
    certifications: [
      'Certification HIIT',
      'Certification CrossFit Level 1',
      'Certification Personal Trainer',
      'Certification Functional Training',
    ],
  },
  {
    category: 'Yoga & Bien-être',
    certifications: [
      'RYT 200',
      'RYT 500',
      'Certification Yoga Vinyasa',
      'Certification Yin Yoga',
      'Certification Pilates',
      'Instructor Pilates Mat',
      'Certification Sophrologie',
      'Diplôme Sophrologue',
    ],
  },
  {
    category: 'Santé & Thérapie',
    certifications: [
      'Kinésithérapeute',
      'Masseur-Kinésithérapeute',
      'Certification Massage Sportif',
      'Ostéopathe',
      'Chiropracteur',
    ],
  },
  {
    category: 'Nutrition & Diététique',
    certifications: [
      'Diététicien',
      'Nutritionniste',
      'Certification Nutrition',
      'Certification Nutrition Sportive',
      'BTS Diététique',
    ],
  },
  {
    category: 'Spécialisations',
    certifications: [
      'Certification Natation',
      "Brevet d'État d'Éducateur Sportif",
      'Certification Aquafitness',
      'Formation Premiers Secours',
      'Militaire',
      'Sapeur-Pompier',
    ],
  },
]

export const LANGUAGE_OPTIONS: string[] = [
  'Français',
  'Créole Martiniquais',
  'Créole Guadeloupéen',
  'Créole Guyanais',
  'Anglais',
  'Espagnol',
  'Portugais',
  'Italien',
  'Allemand',
  'Néerlandais',
  'Chinois',
  'Japonais',
]

/**
 * Get all certifications as a flat array
 */
export const getAllCertifications = (): string[] => {
  return CERTIFICATION_OPTIONS.flatMap((group) => group.certifications)
}

/**
 * Get all specialties as a flat array
 */
export const getAllSpecialties = (): string[] => {
  return SPECIALTY_OPTIONS.flatMap((group) => group.specialties)
}

/**
 * Find which category a certification belongs to
 */
export const getCertificationCategory = (certification: string): string | undefined => {
  for (const group of CERTIFICATION_OPTIONS) {
    if (group.certifications.includes(certification)) {
      return group.category
    }
  }
  return undefined
}

/**
 * Find which category a specialty belongs to
 */
export const getSpecialtyCategory = (specialty: string): string | undefined => {
  for (const group of SPECIALTY_OPTIONS) {
    if (group.specialties.includes(specialty)) {
      return group.category
    }
  }
  return undefined
}

/**
 * Add a new certification to a specific category
 */
export const addCertificationToCategory = (category: string, certification: string): boolean => {
  const group = CERTIFICATION_OPTIONS.find((g) => g.category === category)
  if (group && !group.certifications.includes(certification)) {
    group.certifications.push(certification)
    return true
  }
  return false
}

/**
 * Add a new specialty to a specific category
 */
export const addSpecialtyToCategory = (category: string, specialty: string): boolean => {
  const group = SPECIALTY_OPTIONS.find((g) => g.category === category)
  if (group && !group.specialties.includes(specialty)) {
    group.specialties.push(specialty)
    return true
  }
  return false
}

/**
 * Remove a certification from its category
 */
export const removeCertificationFromCategory = (certification: string): boolean => {
  for (const group of CERTIFICATION_OPTIONS) {
    const index = group.certifications.indexOf(certification)
    if (index !== -1) {
      group.certifications.splice(index, 1)
      return true
    }
  }
  return false
}

/**
 * Remove a specialty from its category
 */
export const removeSpecialtyFromCategory = (specialty: string): boolean => {
  for (const group of SPECIALTY_OPTIONS) {
    const index = group.specialties.indexOf(specialty)
    if (index !== -1) {
      group.specialties.splice(index, 1)
      return true
    }
  }
  return false
}
