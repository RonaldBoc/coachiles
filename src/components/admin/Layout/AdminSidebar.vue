<template>
  <aside
    class="fixed inset-y-0 left-0 z-50 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-200 ease-in-out"
    :class="open ? 'w-64' : 'w-16'"
  >
    <!-- Header -->
    <div
      class="flex h-16 items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700"
    >
      <div class="flex items-center space-x-3" v-if="open">
        <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
          <span class="text-sm font-semibold text-white">C</span>
        </div>
        <div>
          <h1 class="text-lg font-semibold text-gray-900 dark:text-white">Coachiles</h1>
          <p class="text-xs text-gray-500 dark:text-gray-400">Admin Panel</p>
        </div>
      </div>
      <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600" v-else>
        <span class="text-sm font-semibold text-white">C</span>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="mt-6 px-3">
      <ul class="space-y-1">
        <!-- Dashboard -->
        <li>
          <SidebarItem
            icon="📊"
            label="Dashboard"
            :active="currentSection === 'dashboard'"
            :collapsed="!open"
            @click="$emit('navigate', 'dashboard')"
          />
        </li>

        <!-- Section divider -->
        <li class="pt-6" v-if="open">
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Management</p>
        </li>

        <!-- Coaches -->
        <li>
          <SidebarItem
            icon="👥"
            label="Coaches"
            :badge="coachesCount"
            :active="currentSection === 'coaches'"
            :collapsed="!open"
            @click="$emit('navigate', 'coaches')"
          />
        </li>

        <!-- Leads -->
        <li>
          <SidebarItem
            icon="📝"
            label="Leads"
            :badge="leadsCount"
            :active="currentSection === 'leads'"
            :collapsed="!open"
            @click="$emit('navigate', 'leads')"
          />
        </li>

        <!-- Payments -->
        <li>
          <SidebarItem
            icon="💰"
            label="Payments"
            :active="currentSection === 'payments'"
            :collapsed="!open"
            @click="$emit('navigate', 'payments')"
          />
        </li>

        <!-- Section divider -->
        <li class="pt-6" v-if="open">
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Quality</p>
        </li>

        <!-- Moderation -->
        <li>
          <SidebarItem
            icon="✅"
            label="Moderation"
            :badge="pendingCount"
            badge-color="red"
            :active="currentSection === 'moderation'"
            :collapsed="!open"
            @click="$emit('navigate', 'moderation')"
          />
        </li>

        <!-- Section divider -->
        <li class="pt-6" v-if="open">
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">System</p>
        </li>

        <!-- Configuration -->
        <li>
          <SidebarItem
            icon="⚙️"
            label="Configuration"
            :active="currentSection === 'config'"
            :collapsed="!open"
            @click="$emit('navigate', 'config')"
          />
        </li>

        <!-- Audit & Logs -->
        <li>
          <SidebarItem
            icon="📋"
            label="Audit & Logs"
            :active="currentSection === 'audit'"
            :collapsed="!open"
            @click="$emit('navigate', 'audit')"
          />
        </li>
      </ul>
    </nav>

    <!-- Bottom actions -->
    <div class="absolute bottom-0 w-full p-3 border-t border-gray-200 dark:border-gray-700">
      <!-- Toggle sidebar -->
      <button
        @click="$emit('toggle')"
        class="w-full flex items-center justify-center p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
        :class="open ? 'justify-start space-x-3 px-4' : 'justify-center'"
      >
        <svg
          class="h-5 w-5 transition-transform"
          :class="open ? 'rotate-180' : ''"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
          />
        </svg>
        <span v-if="open" class="text-sm font-medium">Collapse</span>
      </button>
    </div>

    <!-- Mobile overlay -->
    <div v-if="open" class="fixed inset-0 bg-black/25 lg:hidden" @click="$emit('close')"></div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAdminStore } from '@/stores/admin'
import SidebarItem from './SidebarItem.vue'

defineProps<{
  open: boolean
  currentSection: string
}>()

defineEmits<{
  navigate: [section: string]
  close: []
  toggle: []
}>()

const adminStore = useAdminStore()

// Computed badges for counts
const coachesCount = computed(() => adminStore.coaches.length || 0)
const leadsCount = computed(() => adminStore.leads.length || 0)
const pendingCount = computed(() => {
  // Count pending reviews + pending certifications
  const pendingReviews = adminStore.reviews.filter((r) => r.moderation_status === 'pending').length
  const pendingCerts = adminStore.certifications.filter((c) => c.status === 'pending').length
  return pendingReviews + pendingCerts
})
</script>
