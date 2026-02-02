<template>
  <div class="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 py-16">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-14">
        <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-4">FAQ</h1>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
          Réponses aux questions les plus fréquentes sur Coachiles.
        </p>
      </div>

      <div class="space-y-8">
        <section class="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Pour les utilisateurs</h2>
          <div class="space-y-5">
            <details class="group" open>
              <summary
                class="cursor-pointer font-medium text-gray-800 flex items-start justify-between"
              >
                <span>Comment trouver le bon coach ?</span>
                <span
                  class="ml-4 text-gray-400 group-open:rotate-180 transition-transform select-none"
                  >⌄</span
                >
              </summary>
              <p class="mt-2 text-sm text-gray-600 leading-relaxed">
                Utilisez la recherche par spécialité ou ville, puis consultez les profils : note,
                expérience, services proposés et avis publiés après modération. Vous pouvez aussi
                contacter plusieurs coachs pour affiner votre choix.
              </p>
            </details>
            <details class="group">
              <summary
                class="cursor-pointer font-medium text-gray-800 flex items-start justify-between"
              >
                <span>Les avis sont-ils vérifiés ?</span>
                <span class="ml-4 text-gray-400 group-open:rotate-180 transition-transform">⌄</span>
              </summary>
              <p class="mt-2 text-sm text-gray-600 leading-relaxed">
                Oui. Chaque avis est examiné manuellement avant publication. Les réponses des coachs
                peuvent être masquées par l'équipe si elles ne respectent pas nos standards.
              </p>
            </details>
            <details class="group">
              <summary
                class="cursor-pointer font-medium text-gray-800 flex items-start justify-between"
              >
                <span>Comment contacter un coach ?</span>
                <span class="ml-4 text-gray-400 group-open:rotate-180 transition-transform">⌄</span>
              </summary>
              <p class="mt-2 text-sm text-gray-600 leading-relaxed">
                Depuis la fiche publique du coach, cliquez sur "Contacter". Un formulaire simple
                vous permet de transmettre vos objectifs et disponibilités.
              </p>
            </details>
          </div>
        </section>

        <section class="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Pour les coachs</h2>
          <div class="space-y-5">
            <details class="group" open>
              <summary
                class="cursor-pointer font-medium text-gray-800 flex items-start justify-between"
              >
                <span>Comment devenir coach sur Coachiles ?</span>
                <span
                  class="ml-4 text-gray-400 group-open:rotate-180 transition-transform select-none"
                  >⌄</span
                >
              </summary>
              <p class="mt-2 text-sm text-gray-600 leading-relaxed">
                Créez un compte puis complétez votre profil via l'espace coach (photo, bio,
                spécialités, services...). Certaines fonctionnalités avancées nécessitent un
                abonnement actif.
              </p>
            </details>
            <details class="group">
              <summary
                class="cursor-pointer font-medium text-gray-800 flex items-start justify-between"
              >
                <span>Comment les notes sont-elles calculées ?</span>
                <span class="ml-4 text-gray-400 group-open:rotate-180 transition-transform">⌄</span>
              </summary>
              <p class="mt-2 text-sm text-gray-600 leading-relaxed">
                La note moyenne d'un coach est recalculée uniquement à l'approbation d'un avis.
                Seuls les avis publiés comptent dans la moyenne.
              </p>
            </details>
            <details class="group">
              <summary
                class="cursor-pointer font-medium text-gray-800 flex items-start justify-between"
              >
                <span>Puis-je répondre aux avis ?</span>
                <span class="ml-4 text-gray-400 group-open:rotate-180 transition-transform">⌄</span>
              </summary>
              <p class="mt-2 text-sm text-gray-600 leading-relaxed">
                Oui, une seule réponse par avis est possible. Elle peut être modérée ou masquée si
                nécessaire.
              </p>
            </details>
          </div>
        </section>

        <section class="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Confidentialité & sécurité</h2>
          <div class="space-y-5">
            <details class="group" open>
              <summary
                class="cursor-pointer font-medium text-gray-800 flex items-start justify-between"
              >
                <span>Que faites-vous de mes données ?</span>
                <span
                  class="ml-4 text-gray-400 group-open:rotate-180 transition-transform select-none"
                  >⌄</span
                >
              </summary>
              <p class="mt-2 text-sm text-gray-600 leading-relaxed">
                Nous collectons uniquement les informations nécessaires au bon fonctionnement de la
                plateforme. Vous pouvez demander la suppression ou la réactivation d'un compte via
                les fonctionnalités prévues à cet effet.
              </p>
            </details>
            <details class="group">
              <summary
                class="cursor-pointer font-medium text-gray-800 flex items-start justify-between"
              >
                <span>Comment supprimer mon compte ?</span>
                <span class="ml-4 text-gray-400 group-open:rotate-180 transition-transform">⌄</span>
              </summary>
              <p class="mt-2 text-sm text-gray-600 leading-relaxed">
                Une procédure de suppression avec délai de sécurité est disponible dans votre
                espace. Vous pouvez annuler la suppression pendant la période tampon prévue.
              </p>
            </details>
          </div>
        </section>
      </div>

      <!-- CTA -->
      <div class="text-center mt-20">
        <RouterLink
          to="/coach/onboarding"
          class="inline-flex items-center px-8 py-4 rounded-full bg-gradient-to-r from-orange-500 to-blue-600 text-white font-bold shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition"
          >Devenir coach</RouterLink
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSeo, useFaqSchema, useBreadcrumbSchema } from '@/composables/useSeo'

// SEO Configuration
useSeo({
  title: 'FAQ | Questions fréquentes sur le coaching',
  description:
    'Trouvez les réponses à vos questions : comment trouver un coach, comment devenir coach, les avis, la confidentialité et plus encore.',
  url: '/faq',
  keywords: [
    'FAQ coaching',
    'questions coaching',
    'trouver un coach',
    'devenir coach',
    'avis coach',
  ],
})

// Schema.org FAQ pour un meilleur référencement
useFaqSchema([
  {
    question: 'Comment trouver le bon coach ?',
    answer:
      'Utilisez la recherche par spécialité ou ville, puis consultez les profils : note, expérience, services proposés et avis publiés après modération. Vous pouvez aussi contacter plusieurs coachs pour affiner votre choix.',
  },
  {
    question: 'Les avis sont-ils vérifiés ?',
    answer:
      "Oui. Chaque avis est examiné manuellement avant publication. Les réponses des coachs peuvent être masquées par l'équipe si elles ne respectent pas nos standards.",
  },
  {
    question: 'Comment contacter un coach ?',
    answer:
      'Depuis la fiche publique du coach, cliquez sur "Contacter". Un formulaire simple vous permet de transmettre vos objectifs et disponibilités.',
  },
  {
    question: 'Comment devenir coach sur Coachiles ?',
    answer:
      "Créez un compte puis complétez votre profil via l'espace coach (photo, bio, spécialités, services...). Certaines fonctionnalités avancées nécessitent un abonnement actif.",
  },
  {
    question: 'Comment les notes sont-elles calculées ?',
    answer:
      "La note moyenne d'un coach est recalculée uniquement à l'approbation d'un avis. Seuls les avis publiés comptent dans la moyenne.",
  },
  {
    question: 'Puis-je répondre aux avis ?',
    answer:
      'Oui, une seule réponse par avis est possible. Elle peut être modérée ou masquée si nécessaire.',
  },
  {
    question: 'Que faites-vous de mes données ?',
    answer:
      "Nous collectons uniquement les informations nécessaires au bon fonctionnement de la plateforme. Vous pouvez demander la suppression ou la réactivation d'un compte via les fonctionnalités prévues à cet effet.",
  },
  {
    question: 'Comment supprimer mon compte ?',
    answer:
      'Une procédure de suppression avec délai de sécurité est disponible dans votre espace. Vous pouvez annuler la suppression pendant la période tampon prévue.',
  },
])

useBreadcrumbSchema([
  { name: 'Accueil', url: '/' },
  { name: 'FAQ', url: '/faq' },
])
</script>
