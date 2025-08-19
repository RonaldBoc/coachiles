<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-50">
    <div class="bg-white p-8 rounded-lg shadow-md text-center">
      <h1 class="text-2xl font-bold text-green-600 mb-4">Paiement réussi !</h1>
      <p class="text-gray-700 mb-6">Votre abonnement Coachiles Pro est maintenant actif.</p>
      <button class="bg-blue-600 text-white px-4 py-2 rounded" @click="goHome">
        Retour à votre compte
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useModernSubscriptionStore } from '@/stores/modernSubscription'

const route = useRoute()
const router = useRouter()
const sessionId = route.query.session_id as string | undefined
const subscriptionStore = useModernSubscriptionStore()

onMounted(async () => {
  // Optionally, you could verify the sessionId with your backend here
  await subscriptionStore.loadSubscriptionData()
})

function goHome() {
  router.push('/coach/account')
}
</script>

<style scoped>
/* Add any custom styles here */
</style>
