<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div class="max-w-lg w-full bg-white rounded-lg shadow p-6">
      <div class="flex items-center gap-3 mb-4">
        <span
          class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600"
          >!
        </span>
        <h1 class="text-xl font-semibold text-gray-900">Account disabled</h1>
      </div>
      <p class="text-sm text-gray-600">
        Your coach account has been disabled by an administrator. You can still sign in, but access
        to coach features is temporarily restricted.
      </p>

      <div v-if="reason || disabledAt" class="mt-4 rounded-md bg-gray-50 p-3 text-sm text-gray-700">
        <div v-if="reason"><span class="font-medium">Reason:</span> {{ reason }}</div>
        <div v-if="disabledAt">
          <span class="font-medium">Since:</span> {{ formatDate(disabledAt) }}
        </div>
      </div>

      <div class="mt-6 flex items-center justify-between">
        <router-link to="/" class="text-sm text-indigo-600 hover:text-indigo-700"
          >Go to homepage</router-link
        >
        <button
          @click="signOut"
          class="inline-flex items-center rounded-md bg-gray-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700"
        >
          Sign out
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { computed } from 'vue'

const auth = useAuthStore()
const reason = computed(() => auth.coach?.disabledReason || null)
const disabledAt = computed(() => auth.coach?.disabledAt || null)

function formatDate(d?: Date | string | null) {
  if (!d) return null
  try {
    return new Date(d).toLocaleString()
  } catch {
    return String(d)
  }
}

async function signOut() {
  try {
    await auth.signOut()
  } catch (e) {
    console.warn('Failed to sign out:', e)
  }
}
</script>

<style scoped></style>
