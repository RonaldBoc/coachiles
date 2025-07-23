<template>
  <div class="h-screen flex overflow-hidden">
    <!-- Sidebar that changes width but stays in place - Hidden on public routes -->
    <aside
      v-if="!isPublicRoute"
      class="bg-gray-900 text-white flex flex-col transition-all duration-300 ease-in-out flex-shrink-0"
      :class="[
        isCollapsed ? 'w-16' : 'w-64',
        isMobile && !isCollapsed ? 'mobile-sidebar-open' : '',
      ]"
    >
      <!-- Header with logo only -->
      <div class="p-4 border-b border-gray-700">
        <div class="flex items-center">
          <!-- Logo - always visible but compact when collapsed -->
          <div class="flex items-center min-w-0">
            <div
              class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            >
              C
            </div>
            <h2
              v-if="!isCollapsed"
              class="ml-3 text-xl font-bold text-white transition-all duration-300"
            >
              Coachiles
            </h2>
          </div>
        </div>
      </div>

      <!-- Navigation Menu -->
      <nav class="flex-1 p-4">
        <ul class="space-y-2">
          <li>
            <router-link
              to="/CoachProposals"
              class="nav-link"
              :class="{ 'justify-center': isCollapsed }"
              :title="isCollapsed ? 'Propositions' : ''"
            >
              <svg
                class="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span v-if="!isCollapsed" class="ml-3 transition-all duration-300">
                Propositions
              </span>
            </router-link>
          </li>

          <li>
            <router-link
              to="/CoachLeads"
              class="nav-link"
              :class="{ 'justify-center': isCollapsed }"
              :title="isCollapsed ? 'Leads' : ''"
            >
              <svg
                class="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span v-if="!isCollapsed" class="ml-3 transition-all duration-300"> Leads </span>
            </router-link>
          </li>

          <li>
            <router-link
              to="/CoachServices"
              class="nav-link"
              :class="{ 'justify-center': isCollapsed }"
              :title="isCollapsed ? 'Services' : ''"
            >
              <svg
                class="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2H5a2 2 0 00-2 2v2M7 7h10"
                />
              </svg>
              <span v-if="!isCollapsed" class="ml-3 transition-all duration-300"> Services </span>
            </router-link>
          </li>

          <li>
            <router-link
              to="/coach/marketplace"
              class="nav-link"
              :class="{ 'justify-center': isCollapsed }"
              :title="isCollapsed ? 'Marketplace' : ''"
            >
              <svg
                class="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
              <span v-if="!isCollapsed" class="ml-3 transition-all duration-300">
                Marketplace
              </span>
            </router-link>
          </li>

          <li>
            <router-link
              to="/coach/bookings"
              class="nav-link"
              :class="{ 'justify-center': isCollapsed }"
              :title="isCollapsed ? 'Reservations' : ''"
            >
              <svg
                class="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span v-if="!isCollapsed" class="ml-3 transition-all duration-300">
                Reservations
              </span>
            </router-link>
          </li>

          <li>
            <router-link
              to="/CoachProfile"
              class="nav-link"
              :class="{ 'justify-center': isCollapsed }"
              :title="isCollapsed ? 'Profil' : ''"
            >
              <svg
                class="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span v-if="!isCollapsed" class="ml-3 transition-all duration-300"> Profil </span>
            </router-link>
          </li>

          <li>
            <router-link
              to="/CoachAccount"
              class="nav-link"
              :class="{ 'justify-center': isCollapsed }"
              :title="isCollapsed ? 'Mon compte' : ''"
            >
              <svg
                class="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span v-if="!isCollapsed" class="ml-3 transition-all duration-300"> Mon compte </span>
            </router-link>
          </li>
        </ul>
      </nav>

      <!-- Footer with toggle button -->
      <div class="border-t border-gray-700">
        <!-- Dashboard text (only when expanded) -->
        <div v-if="!isCollapsed" class="px-4 py-2">
          <div class="text-xs text-gray-400 text-center">Coachiles Dashboard</div>
        </div>

        <!-- Toggle button -->
        <div class="p-4">
          <button
            @click="toggleSidebar"
            class="w-full p-2 rounded-lg hover:bg-gray-700 transition-colors duration-200 text-gray-300 hover:text-white flex items-center"
            :class="{ 'justify-center': isCollapsed }"
            :title="isCollapsed ? 'Étendre le menu' : 'Réduire le menu'"
          >
            <svg
              class="w-5 h-5 transition-transform duration-300"
              :class="{ 'rotate-180': isCollapsed }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
            <span v-if="!isCollapsed" class="ml-3 text-sm"> Réduire </span>
          </button>
        </div>
      </div>
    </aside>

    <!-- Mobile overlay -->
    <div v-if="isMobile && !isCollapsed" class="mobile-overlay" @click="toggleSidebar"></div>

    <!-- Main Content Area -->
    <main
      class="flex-1 overflow-auto"
      :class="[
        isPublicRoute ? 'bg-transparent' : 'bg-gray-100',
        { 'mobile-hidden': isMobile && !isCollapsed && !isPublicRoute },
      ]"
    >
      <div :class="isPublicRoute ? '' : 'max-w-7xl mx-auto p-6'">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'

// Get current route
const route = useRoute()

// Define public routes that shouldn't show the sidebar
const publicRoutes = ['/coaches', '/']
const isPublicRoute = computed(() => {
  // Public routes: home, coaches listing, and individual coach profiles (/coach/:firstName)
  // But NOT coach dashboard pages (/coach/account, /coach/services, etc.)
  const coachDashboardPages = ['account', 'services', 'proposals', 'profile', 'leads']
  return (
    publicRoutes.includes(route.path) ||
    (route.path.startsWith('/coach/') &&
      !coachDashboardPages.some((page) => route.path.includes(`/coach/${page}`)))
  )
})

// Sidebar state
const isCollapsed = ref(false)
const isMobile = ref(false)

// Check if we're on mobile
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 480
  // On mobile, start with collapsed sidebar
  if (isMobile.value && !isCollapsed.value) {
    isCollapsed.value = true
  }
}

// Toggle sidebar function
const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}

// Handle window resize
onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped>
.nav-link {
  @apply flex items-center px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200;
}

.nav-link.router-link-active {
  @apply bg-blue-600 text-white;
}

.nav-link.router-link-active:hover {
  @apply bg-blue-500;
}

/* Mobile styles */
@media (max-width: 480px) {
  .mobile-sidebar-open {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 75vw !important;
    height: 100vh !important;
    z-index: 9999 !important;
  }

  .mobile-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    z-index: 9998;
  }

  .mobile-hidden {
    display: none;
  }
}
</style>
