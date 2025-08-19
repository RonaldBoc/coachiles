<template>
  <div class="fixed inset-0 pointer-events-none z-[100]">
    <div class="absolute top-4 right-4 space-y-3 w-80 max-w-[92vw]">
      <div
        v-for="t in toasts"
        :key="t.id"
        class="pointer-events-auto rounded-md shadow ring-1 ring-black/5 overflow-hidden bg-white"
      >
        <div :class="['px-4 py-3 flex items-start', bgClass(t.type)]">
          <div class="flex-shrink-0 mt-0.5">
            <span
              v-if="t.type === 'success'"
              class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-700"
              >✓</span
            >
            <span
              v-else-if="t.type === 'error'"
              class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-700"
              >!</span
            >
            <span
              v-else
              class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700"
              >i</span
            >
          </div>
          <div class="ml-3 flex-1">
            <p v-if="t.title" class="text-sm font-medium text-gray-900">{{ t.title }}</p>
            <p class="text-sm text-gray-700">{{ t.message }}</p>
          </div>
          <button class="ml-3 text-gray-400 hover:text-gray-600" @click="remove(t.id)">×</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '@/composables/useToast'

const { toasts, remove } = useToast()

const bgClass = (type: 'success' | 'error' | 'info') => {
  switch (type) {
    case 'success':
      return 'border-l-4 border-green-400'
    case 'error':
      return 'border-l-4 border-red-400'
    default:
      return 'border-l-4 border-blue-400'
  }
}
</script>
