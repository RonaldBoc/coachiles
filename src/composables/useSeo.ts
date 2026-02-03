import { useHead } from '@vueuse/head'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'

interface SeoConfig {
  title: MaybeRefOrGetter<string>
  description: MaybeRefOrGetter<string>
  image?: MaybeRefOrGetter<string | undefined>
  url?: MaybeRefOrGetter<string>
  type?: 'website' | 'article' | 'profile'
  keywords?: MaybeRefOrGetter<string[]>
  author?: MaybeRefOrGetter<string>
  publishedTime?: MaybeRefOrGetter<string>
  modifiedTime?: MaybeRefOrGetter<string>
}

interface SchemaOrgConfig {
  type:
    | 'Organization'
    | 'LocalBusiness'
    | 'Person'
    | 'Service'
    | 'WebPage'
    | 'FAQPage'
    | 'BreadcrumbList'
  data: Record<string, unknown>
}

const BASE_URL = 'https://coachiles.com'
const DEFAULT_IMAGE = `${BASE_URL}/images/og-image.jpg`
const SITE_NAME = 'Coachiles'

/**
 * Composable pour gérer le SEO de manière dynamique
 */
export function useSeo(config: SeoConfig) {
  const fullTitle = computed(() => {
    const title = toValue(config.title)
    return title.includes('Coachiles') ? title : `${title} | Coachiles`
  })

  const fullUrl = computed(() => {
    const url = toValue(config.url)
    return url ? `${BASE_URL}${url}` : BASE_URL
  })

  const imageUrl = computed(() => {
    const image = toValue(config.image)
    if (!image) return DEFAULT_IMAGE
    return image.startsWith('http') ? image : `${BASE_URL}${image}`
  })

  // Meta tags SEO using @vueuse/head
  useHead({
    title: fullTitle,
    meta: [
      { name: 'description', content: () => toValue(config.description) },
      { name: 'keywords', content: () => toValue(config.keywords)?.join(', ') },
      { name: 'author', content: () => toValue(config.author) || SITE_NAME },
      { name: 'robots', content: 'index, follow' },
      // Open Graph
      { property: 'og:title', content: fullTitle },
      { property: 'og:description', content: () => toValue(config.description) },
      { property: 'og:image', content: imageUrl },
      { property: 'og:url', content: fullUrl },
      { property: 'og:type', content: config.type || 'website' },
      { property: 'og:site_name', content: SITE_NAME },
      // Twitter
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: fullTitle },
      { name: 'twitter:description', content: () => toValue(config.description) },
      { name: 'twitter:image', content: imageUrl },
    ],
    link: [
      { rel: 'canonical', href: fullUrl },
    ],
  })
}

/**
 * Ajoute des données structurées Schema.org à la page
 */
export function useSchemaOrg(configs: SchemaOrgConfig | SchemaOrgConfig[]) {
  const schemas = Array.isArray(configs) ? configs : [configs]

  const scripts = schemas.map((config) => {
    const schema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': config.type,
      ...config.data,
    }

    return {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(schema),
    }
  })

  useHead({
    script: scripts,
  })
}

/**
 * Schema.org pour l'organisation Coachiles
 */
export function useOrganizationSchema() {
  useSchemaOrg({
    type: 'Organization',
    data: {
      name: 'Coachiles',
      url: BASE_URL,
      logo: `${BASE_URL}/images/logos/logo_coachiles_color.png`,
      description: 'Plateforme de mise en relation avec des coachs professionnels certifiés',
      sameAs: [
        // Ajoutez vos réseaux sociaux ici
        // 'https://www.facebook.com/coachiles',
        // 'https://www.instagram.com/coachiles',
        // 'https://www.linkedin.com/company/coachiles',
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        availableLanguage: ['French'],
      },
    },
  })
}

/**
 * Schema.org pour un coach individuel
 */
export function useCoachSchema(coach: {
  name: string
  description: string
  image?: string
  url: string
  specialties?: string[]
  location?: string
  rating?: number
  reviewCount?: number
  priceRange?: string
}) {
  useSchemaOrg([
    {
      type: 'Person',
      data: {
        name: coach.name,
        description: coach.description,
        image: coach.image,
        url: `${BASE_URL}${coach.url}`,
        jobTitle: 'Coach professionnel',
        knowsAbout: coach.specialties || [],
      },
    },
    {
      type: 'Service',
      data: {
        name: `Coaching avec ${coach.name}`,
        description: coach.description,
        provider: {
          '@type': 'Person',
          name: coach.name,
        },
        areaServed: coach.location || 'France',
        ...(coach.rating && {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: coach.rating,
            reviewCount: coach.reviewCount || 0,
            bestRating: 5,
            worstRating: 1,
          },
        }),
        ...(coach.priceRange && {
          priceRange: coach.priceRange,
        }),
      },
    },
  ])
}

/**
 * Schema.org pour une page de service/catégorie
 */
export function useServiceCategorySchema(category: {
  name: string
  description: string
  url: string
}) {
  useSchemaOrg({
    type: 'Service',
    data: {
      name: category.name,
      description: category.description,
      url: `${BASE_URL}${category.url}`,
      provider: {
        '@type': 'Organization',
        name: 'Coachiles',
      },
      areaServed: 'France',
      serviceType: 'Coaching',
    },
  })
}

/**
 * Schema.org pour une page FAQ
 */
export function useFaqSchema(faqs: Array<{ question: string; answer: string }>) {
  useSchemaOrg({
    type: 'FAQPage',
    data: {
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    },
  })
}

/**
 * Schema.org pour le fil d'Ariane (Breadcrumb)
 */
export function useBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  useSchemaOrg({
    type: 'BreadcrumbList',
    data: {
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: `${BASE_URL}${item.url}`,
      })),
    },
  })
}

/**
 * Schema.org pour la page d'accueil
 */
export function useWebsiteSchema() {
  useSchemaOrg({
    type: 'WebPage',
    data: {
      '@type': 'WebSite',
      name: 'Coachiles',
      url: BASE_URL,
      description:
        'Trouvez le coach idéal pour atteindre vos objectifs personnels et professionnels',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${BASE_URL}/coaches?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
  })
}
