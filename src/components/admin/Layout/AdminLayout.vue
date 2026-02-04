<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Sidebar -->
    <AdminSidebar
      :open="sidebarOpen"
      :current-section="currentSection"
      @navigate="handleNavigation"
      @close="sidebarOpen = false"
    />

    <!-- Main content -->
    <div
      class="transition-all duration-200 ease-in-out"
      :class="sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'"
    >
      <!-- Top header -->
      <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div class="px-4 sm:px-6 lg:px-8">
          <div class="flex h-16 items-center justify-between">
            <!-- Mobile menu button -->
            <button
              @click="sidebarOpen = !sidebarOpen"
              class="lg:hidden rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
            >
              <svg
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </button>

            <!-- Breadcrumbs -->
            <Breadcrumbs :items="breadcrumbs" />

            <!-- Right side -->
            <div class="flex items-center space-x-4">
              <!-- Global search -->
              <div class="hidden md:block">
                <div class="relative">
                  <input
                    type="search"
                    placeholder="Search everything..."
                    class="w-64 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white pl-10 pr-4 py-2 text-sm"
                    v-model="globalSearch"
                    @input="onGlobalSearch"
                  />
                  <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg
                      class="h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <!-- User menu -->
              <div class="relative">
                <button
                  class="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-200"
                >
                  <div class="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
                    <span class="text-white font-medium">{{ userInitials }}</span>
                  </div>
                  <span class="hidden md:block">{{ userEmail }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Page content -->
      <main class="p-4 sm:p-6 lg:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AdminSidebar from './AdminSidebar.vue'
import Breadcrumbs from './Breadcrumbs.vue'

const authStore = useAuthStore()
const route = useRoute()

const sidebarOpen = ref(true)
const globalSearch = ref('')
const currentSection = ref<string>((route.meta?.adminSection as string) || 'dashboard')

const userEmail = computed(() => authStore.user?.email || 'admin')
const userInitials = computed(() => {
  const email = userEmail.value
  return email.split('@')[0].substring(0, 2).toUpperCase()
})

const breadcrumbs = computed(() => {
  const items = [{ label: 'Admin', href: '/admin' }]

  switch (currentSection.value) {
    case 'coaches':
      items.push({ label: 'Coaches', href: '/admin/coaches' })
      break
    case 'leads':
      items.push({ label: 'Leads', href: '/admin/leads' })
      break
    case 'payments':
      items.push({ label: 'Payments', href: '/admin/payments' })
      break
    case 'moderation':
      items.push({ label: 'Moderation', href: '/admin/moderation' })
      break
    case 'config':
      items.push({ label: 'Configuration', href: '/admin/config' })
      break
    case 'audit':
      items.push({ label: 'Audit & Logs', href: '/admin/audit' })
      break
  }

  return items
})

const handleNavigation = (section: string) => {
  currentSection.value = section
}

const onGlobalSearch = () => {
  // TODO: Implement global search
  console.log('Global search:', globalSearch.value)
}

// Update current section when route changes
watch(
  () => route.meta?.adminSection,
  (newSection) => {
    if (newSection) {
      currentSection.value = newSection as string
    }
  },
)
</script>
