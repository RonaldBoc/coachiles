<template>
  <button
    @click="$emit('click')"
    class="w-full group flex items-center rounded-md p-2 text-sm font-medium transition-colors duration-150 ease-in-out"
    :class="[
      active
        ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 border-r-2 border-indigo-600 dark:border-indigo-400'
        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white',
      collapsed ? 'justify-center px-2' : 'justify-start px-4',
    ]"
  >
    <!-- Icon -->
    <span class="flex-shrink-0 text-lg" :class="collapsed ? 'mr-0' : 'mr-3'">
      {{ icon }}
    </span>

    <!-- Label (hidden when collapsed) -->
    <span v-if="!collapsed" class="flex-1 text-left">
      {{ label }}
    </span>

    <!-- Badge (hidden when collapsed) -->
    <span
      v-if="!collapsed && badge && badge > 0"
      class="ml-auto inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
      :class="badgeClasses"
    >
      {{ formatBadge(badge) }}
    </span>

    <!-- Tooltip for collapsed state -->
    <div v-if="collapsed" class="absolute left-14 z-10 hidden group-hover:block">
      <div
        class="bg-gray-900 dark:bg-gray-700 text-white text-xs rounded py-1 px-2 whitespace-nowrap"
      >
        {{ label }}
        <span v-if="badge && badge > 0" class="ml-1 opacity-75">({{ formatBadge(badge) }})</span>
      </div>
    </div>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  icon: string
  label: string
  active?: boolean
  collapsed?: boolean
  badge?: number
  badgeColor?: 'blue' | 'red' | 'green' | 'yellow' | 'gray'
}>()

defineEmits<{
  click: []
}>()

const badgeClasses = computed(() => {
  const color = props.badgeColor || 'blue'
  const baseClasses = {
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
    red: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200',
    green: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200',
    yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200',
    gray: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  }
  return baseClasses[color]
})

const formatBadge = (count: number) => {
  if (count > 999) return '999+'
  return count.toString()
}
</script>
