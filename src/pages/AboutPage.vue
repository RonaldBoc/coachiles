<template>
  <div class="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 py-16">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-14">
        <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-4">
          À propos de Coachiles
        </h1>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
          Notre mission : rendre le coaching sportif et bien-être plus accessible, humain et
          transparent.
        </p>
      </div>

      <!-- Mission -->
      <section class="mb-16">
        <div class="bg-white rounded-2xl shadow-md p-8 border border-gray-100">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Notre vision</h2>
          <div class="prose prose-sm sm:prose-base max-w-none text-gray-700">
            <p>
              Coachiles est né d'une conviction simple : un accompagnement personnalisé et motivant
              change profondément la façon dont nous progressons, que ce soit en fitness, santé ou
              bien-être mental. Pourtant, trouver le bon coach peut être difficile — manque de
              transparence, qualifications parfois floues, échanges fragmentés.
            </p>
            <p>
              Nous construisons une plateforme qui réunit des coachs engagés et des personnes en
              quête de progression durable. Notre approche privilégie la confiance, la clarté et la
              simplicité d'échange.
            </p>
            <ul>
              <li>Mettre en avant la compétence et l'expérience réelle.</li>
              <li>Fluidifier la mise en relation et la première prise de contact.</li>
              <li>Valoriser les avis authentiques et modérés manuellement.</li>
              <li>Offrir des outils utiles (services, essais, suivi futur...).</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Values -->
      <section class="mb-16">
        <h2 class="text-2xl font-bold text-gray-900 mb-8 text-center">Nos valeurs</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 class="font-semibold text-gray-900 mb-2">Transparence</h3>
            <p class="text-sm text-gray-600">
              Des profils clairs, des avis vérifiés et des informations accessibles sans détour.
            </p>
          </div>
          <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 class="font-semibold text-gray-900 mb-2">Confiance</h3>
            <p class="text-sm text-gray-600">
              Modération humaine, certifications mises en avant, cadre sécurisé et respectueux.
            </p>
          </div>
          <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 class="font-semibold text-gray-900 mb-2">Progression</h3>
            <p class="text-sm text-gray-600">
              Outils pensés pour accompagner durablement l'effort, pas une simple mise en relation.
            </p>
          </div>
        </div>
      </section>

      <!-- Roadmap / future -->
      <section class="mb-20">
        <div
          class="bg-gradient-to-br from-orange-500 to-blue-600 rounded-2xl p-8 text-white shadow-md"
        >
          <h2 class="text-2xl font-bold mb-4">Ce que nous construisons ensuite</h2>
          <ul class="text-sm space-y-2 text-white/90">
            <li>• Messagerie directe simplifiée</li>
            <li>• Packs personnalisés & suivi d'objectifs</li>
            <li>• Recommandations intelligentes basées sur votre progression</li>
            <li>• Outils d'onboarding coach unifiés</li>
          </ul>
        </div>
      </section>

      <!-- Call to action -->
      <div class="text-center">
        <RouterLink
          to="/coach/registration"
          class="inline-flex items-center px-8 py-4 rounded-full bg-gradient-to-r from-orange-500 to-blue-600 text-white font-bold shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition"
          >Rejoindre en tant que coach</RouterLink
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Static informational page
</script>
