// Services that require diplomas for validation
export const SERVICE_REQUIREMENTS = [
  // Coaching Sportif - Most require certifications
  {
    serviceName: 'Remise en forme',
    requiresDiploma: true,
    requiredDiplomaTypes: ['BPJEPS', 'CQP', 'Licence STAPS'],
  },
  { serviceName: 'Perte de poids', requiresDiploma: false },
  {
    serviceName: 'Prise de masse',
    requiresDiploma: true,
    requiredDiplomaTypes: ['BPJEPS', 'CQP', 'Licence STAPS'],
  },
  {
    serviceName: 'Renforcement musculaire',
    requiresDiploma: true,
    requiredDiplomaTypes: ['BPJEPS', 'CQP', 'Licence STAPS'],
  },
  {
    serviceName: 'Préparation physique',
    requiresDiploma: true,
    requiredDiplomaTypes: ['BPJEPS', 'CQP', 'Licence STAPS', 'Préparateur Physique'],
  },
  {
    serviceName: 'Réathlétisation',
    requiresDiploma: true,
    requiredDiplomaTypes: ['Kinésithérapeute', 'BPJEPS', 'Licence STAPS'],
  },
  {
    serviceName: 'Cardio training',
    requiresDiploma: true,
    requiredDiplomaTypes: ['BPJEPS', 'CQP'],
  },
  {
    serviceName: 'HIIT',
    requiresDiploma: true,
    requiredDiplomaTypes: ['BPJEPS', 'CQP', 'Certificat HIIT'],
  },
  {
    serviceName: 'Entraînement fonctionnel',
    requiresDiploma: true,
    requiredDiplomaTypes: ['BPJEPS', 'CQP'],
  },
  {
    serviceName: 'Musculation en salle',
    requiresDiploma: true,
    requiredDiplomaTypes: ['BPJEPS', 'CQP'],
  },
  {
    serviceName: 'Coaching à domicile',
    requiresDiploma: true,
    requiredDiplomaTypes: ['BPJEPS', 'CQP'],
  },
  {
    serviceName: 'Coaching en extérieur',
    requiresDiploma: true,
    requiredDiplomaTypes: ['BPJEPS', 'CQP'],
  },
  { serviceName: 'Coaching en visio', requiresDiploma: false },
  {
    serviceName: 'Cours collectifs',
    requiresDiploma: true,
    requiredDiplomaTypes: ['BPJEPS', 'CQP'],
  },
  {
    serviceName: 'Préparation militaire',
    requiresDiploma: true,
    requiredDiplomaTypes: ['Militaire', 'BPJEPS', 'Préparateur Physique'],
  },

  // Bien-être & Corps
  {
    serviceName: 'Yoga',
    requiresDiploma: true,
    requiredDiplomaTypes: ['Certification Yoga', 'RYT 200', 'RYT 500'],
  },
  {
    serviceName: 'Pilates',
    requiresDiploma: true,
    requiredDiplomaTypes: ['Certification Pilates', 'BPJEPS'],
  },
  { serviceName: 'Stretching', requiresDiploma: false },
  { serviceName: 'Relaxation', requiresDiploma: false },
  {
    serviceName: 'Sophrologie',
    requiresDiploma: true,
    requiredDiplomaTypes: ['Certification Sophrologie', 'Diplôme Sophrologue'],
  },
  { serviceName: 'Méditation', requiresDiploma: false },
  {
    serviceName: 'Massage sportif',
    requiresDiploma: true,
    requiredDiplomaTypes: ['Masseur-Kinésithérapeute', 'Certification Massage Sportif'],
  },
  {
    serviceName: 'Prévention des blessures',
    requiresDiploma: true,
    requiredDiplomaTypes: ['Kinésithérapeute', 'BPJEPS', 'Licence STAPS'],
  },

  // Coaching Nutritionnel - All require certifications
  {
    serviceName: 'Rééquilibrage alimentaire',
    requiresDiploma: true,
    requiredDiplomaTypes: ['Diététicien', 'Nutritionniste', 'Certification Nutrition'],
  },
  {
    serviceName: 'Nutrition pour perte de poids',
    requiresDiploma: true,
    requiredDiplomaTypes: ['Diététicien', 'Nutritionniste', 'Certification Nutrition'],
  },
  {
    serviceName: 'Nutrition sportive',
    requiresDiploma: true,
    requiredDiplomaTypes: ['Diététicien', 'Nutritionniste', 'Certification Nutrition Sportive'],
  },
  {
    serviceName: 'Suivi diététique',
    requiresDiploma: true,
    requiredDiplomaTypes: ['Diététicien', 'Nutritionniste'],
  },
  {
    serviceName: 'Plan alimentaire',
    requiresDiploma: true,
    requiredDiplomaTypes: ['Diététicien', 'Nutritionniste', 'Certification Nutrition'],
  },
  {
    serviceName: 'Coaching végétarien',
    requiresDiploma: true,
    requiredDiplomaTypes: ['Diététicien', 'Nutritionniste', 'Certification Nutrition'],
  },
  {
    serviceName: 'Nutrition prise de masse',
    requiresDiploma: true,
    requiredDiplomaTypes: ['Diététicien', 'Nutritionniste', 'Certification Nutrition Sportive'],
  },
  {
    serviceName: 'Gestion des troubles alimentaires',
    requiresDiploma: true,
    requiredDiplomaTypes: ['Psychologue', 'Diététicien', 'Nutritionniste'],
  },

  // Développement Personnel - Mixed requirements
  { serviceName: 'Motivation', requiresDiploma: false },
  { serviceName: 'Confiance en soi', requiresDiploma: false },
  { serviceName: 'Gestion du stress', requiresDiploma: false },
  { serviceName: 'Sommeil', requiresDiploma: false },
  {
    serviceName: 'Post-burnout',
    requiresDiploma: true,
    requiredDiplomaTypes: ['Psychologue', 'Coach Certifié', 'Thérapeute'],
  },
  {
    serviceName: 'Mental sportif',
    requiresDiploma: true,
    requiredDiplomaTypes: ['Psychologue du Sport', 'Préparateur Mental', 'Coach Mental'],
  },
  { serviceName: 'Discipline', requiresDiploma: false },
  { serviceName: 'Spiritualité', requiresDiploma: false },

  // Vie & Professionnel - Mixed requirements
  { serviceName: 'Coaching vie de famille', requiresDiploma: false },
  { serviceName: 'Reconversion', requiresDiploma: false },
  { serviceName: 'Organisation personnelle', requiresDiploma: false },
  { serviceName: 'Gestion du temps', requiresDiploma: false },
  { serviceName: 'Coaching pour entrepreneur', requiresDiploma: false },
]

export const getServiceRequirement = (serviceName: string) => {
  return SERVICE_REQUIREMENTS.find((req) => req.serviceName === serviceName)
}

export const getServicesRequiringDiplomas = () => {
  return SERVICE_REQUIREMENTS.filter((req) => req.requiresDiploma)
}
