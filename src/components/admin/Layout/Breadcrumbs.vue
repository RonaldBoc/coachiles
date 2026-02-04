<template>
  <nav class="flex text-sm text-gray-500 dark:text-gray-400" aria-label="Breadcrumb">
    <ol class="inline-flex items-center space-x-1 md:space-x-3">
      <li v-for="(item, index) in items" :key="index" class="inline-flex items-center">
        <!-- Separator (not for first item) -->
        <svg
          v-if="index > 0"
          class="w-4 h-4 text-gray-400 mx-1"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clip-rule="evenodd"
          ></path>
        </svg>

        <!-- Breadcrumb item -->
        <router-link
          v-if="item.href && index < items.length - 1"
          :to="item.href"
          class="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          {{ item.label }}
        </router-link>
        <span
          v-else
          class="font-medium text-gray-700 dark:text-gray-200"
          :class="{ 'text-gray-500 dark:text-gray-400 font-normal': index < items.length - 1 }"
        >
          {{ item.label }}
        </span>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
interface BreadcrumbItem {
  label: string
  href?: string
}

defineProps<{
  items: BreadcrumbItem[]
}>()
</script>
