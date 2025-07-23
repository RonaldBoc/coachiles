export const COUNTRIES = {
  martinique: 'Martinique',
  guadeloupe: 'Guadeloupe', 
  guyane: 'Guyane'
} as const

export type CountryType = keyof typeof COUNTRIES

export const CITIES = {
  martinique: [
    'Fort-de-France',
    'Le Lamentin',
    'Le Robert',
    'Schoelcher',
    'Sainte-Marie',
    'Le François',
    'Ducos',
    'Rivière-Pilote',
    'Le Marin',
    'Sainte-Luce',
    'Rivière-Salée',
    'Les Trois-Îlets',
    'Le Vauclin',
    'Trinité',
    'Le Diamant',
    'Saint-Esprit',
    'Case-Pilote',
    'Le Carbet',
    'Bellefontaine',
    'Saint-Pierre',
    'Le Prêcheur',
    'Basse-Pointe',
    'Lorrain',
    'Macouba',
    'Grand-Rivière',
    'Ajoupa-Bouillon',
    'Morne-Rouge',
    'Saint-Joseph',
    'Gros-Morne',
    'Marigot',
    'Sainte-Anne',
    'Les Anses-d\'Arlet',
    'Fonds-Saint-Denis'
  ],
  guadeloupe: [
    'Pointe-à-Pitre',
    'Les Abymes',
    'Baie-Mahault',
    'Le Gosier',
    'Petit-Bourg',
    'Sainte-Anne',
    'Le Moule',
    'Morne-à-l\'Eau',
    'Capesterre-Belle-Eau',
    'Petit-Canal',
    'Goyave',
    'Bouillante',
    'Lamentin',
    'Sainte-Rose',
    'Port-Louis',
    'Basse-Terre',
    'Vieux-Habitants',
    'Trois-Rivières',
    'Gourbeyre',
    'Baillif',
    'Saint-Claude',
    'Vieux-Fort',
    'Terre-de-Haut',
    'Terre-de-Bas',
    'Saint-Louis',
    'Anse-Bertrand',
    'Le Désirada'
  ],
  guyane: [
    'Cayenne',
    'Saint-Laurent-du-Maroni',
    'Kourou',
    'Matoury',
    'Rémire-Montjoly',
    'Mana',
    'Maripasoula',
    'Grand-Santi',
    'Papaichton',
    'Saül',
    'Camopi',
    'Ouanary',
    'Régina',
    'Roura',
    'Saint-Élie',
    'Iracoubo',
    'Sinnamary',
    'Apatou',
    'Awala-Yalimapo',
    'Montsinéry-Tonnegrande'
  ]
} as const

export const getCitiesByCountry = (country: CountryType): readonly string[] => {
  return CITIES[country] || []
}

export const getCountryLabel = (country: CountryType): string => {
  return COUNTRIES[country] || country
}