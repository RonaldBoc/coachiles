<!-- Contact page (renamed for multi-word rule) -->
<template>
  <!-- ...existing code copied from previous Contact.vue... -->
  <div class="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 py-16">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-14">
        <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-4">
          Contact
        </h1>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
          Une question, une suggestion ou un problème ? Envoyez-nous un message et nous vous
          répondrons rapidement.
        </p>
      </div>
      <!-- We keep logic minimal; consider extracting to composable if reused -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div class="lg:col-span-1 space-y-8">
          <div class="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Pourquoi nous écrire ?</h2>
            <ul class="space-y-3 text-sm text-gray-600">
              <li class="flex items-start">
                <span class="text-orange-500 mr-2">•</span> Assistance technique ou problème de
                compte
              </li>
              <li class="flex items-start">
                <span class="text-orange-500 mr-2">•</span> Question sur la plateforme ou le
                fonctionnement
              </li>
              <li class="flex items-start">
                <span class="text-orange-500 mr-2">•</span> Retour d'expérience ou suggestion
              </li>
              <li class="flex items-start">
                <span class="text-orange-500 mr-2">•</span> Demande relative à la conformité ou aux
                données personnelles
              </li>
            </ul>
          </div>
          <div
            class="bg-gradient-to-br from-orange-500 to-blue-600 rounded-2xl p-6 text-white shadow-md"
          >
            <h3 class="text-lg font-semibold mb-2">Coachs</h3>
            <p class="text-sm text-white/90 mb-4">
              Vous souhaitez rejoindre Coachiles ou avez une question sur l'abonnement ?
            </p>
            <RouterLink
              to="/coach/onboarding"
              class="inline-block bg-white text-orange-600 font-semibold px-5 py-2 rounded-full text-sm hover:shadow-md transition"
              >Devenir coach</RouterLink
            >
          </div>
        </div>
        <div class="lg:col-span-2">
          <div class="bg-white rounded-2xl shadow-md p-8 border border-gray-100">
            <form @submit.prevent="submit" class="space-y-6" v-if="!submitted">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Votre nom</label>
                  <input
                    v-model.trim="form.name"
                    type="text"
                    required
                    maxlength="80"
                    class="w-full px-4 py-3 border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Votre email</label>
                  <input
                    v-model.trim="form.email"
                    type="email"
                    required
                    maxlength="120"
                    class="w-full px-4 py-3 border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                  />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Sujet</label>
                <select
                  v-model="form.subject"
                  required
                  class="w-full px-4 py-3 border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                >
                  <option value="">Sélectionnez...</option>
                  <option>Assistance technique</option>
                  <option>Question générale</option>
                  <option>Problème avec un coach</option>
                  <option>Suggestion d'amélioration</option>
                  <option>Autre</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  v-model.trim="form.message"
                  rows="6"
                  required
                  maxlength="2000"
                  class="w-full px-4 py-3 border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm resize-y"
                  placeholder="Décrivez votre demande avec le plus de détails possible"
                ></textarea>
                <p class="mt-1 text-xs text-gray-400 text-right">
                  {{ form.message.length }}/2000 caractères
                </p>
              </div>
              <div class="flex items-center justify-between flex-wrap gap-3">
                <p class="text-xs text-gray-500">
                  En envoyant ce message, vous acceptez que nous vous recontactions par email.
                </p>
                <button
                  type="submit"
                  :disabled="loading"
                  class="inline-flex items-center px-8 py-3 rounded-full bg-gradient-to-r from-orange-500 to-blue-600 text-white font-semibold text-sm hover:shadow-lg hover:scale-[1.02] active:scale-95 transition disabled:opacity-50"
                >
                  <span v-if="!loading">Envoyer</span>
                  <span v-else class="flex items-center">
                    <svg
                      class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        class="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"
                      />
                      <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Envoi...
                  </span>
                </button>
              </div>
            </form>
            <div v-else class="text-center py-12">
              <div
                class="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center"
              >
                <svg
                  class="w-10 h-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 class="text-2xl font-bold text-gray-900 mb-3">Message envoyé !</h2>
              <p class="text-gray-600 mb-6 max-w-md mx-auto">
                Merci pour votre message. Notre équipe vous répondra sous 24 à 48 heures ouvrées.
              </p>
              <button
                @click="reset"
                class="px-6 py-3 rounded-full bg-gradient-to-r from-orange-500 to-blue-600 text-white font-semibold text-sm hover:shadow-md transition"
              >
                Envoyer un autre message
              </button>
            </div>
          </div>
          <div class="mt-10 text-sm text-gray-600">
            <p>
              Consultez aussi la
              <RouterLink to="/faq" class="text-orange-600 font-medium hover:underline"
                >FAQ</RouterLink
              >.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { reactive, ref } from 'vue'
interface ContactForm {
  name: string
  email: string
  subject: string
  message: string
}
const form = reactive<ContactForm>({ name: '', email: '', subject: '', message: '' })
const loading = ref(false)
const submitted = ref(false)
const fakeSend = () => new Promise((r) => setTimeout(r, 800))
const submit = async () => {
  if (!form.name || !form.email || !form.subject || !form.message) return
  loading.value = true
  try {
    console.log('📨 Contact submission:', { ...form })
    await fakeSend()
    submitted.value = true
  } finally {
    loading.value = false
  }
}
const reset = () => {
  form.name = ''
  form.email = ''
  form.subject = ''
  form.message = ''
  submitted.value = false
}
</script>
