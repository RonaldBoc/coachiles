<template>
  <header class="bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center py-4">
        <!-- Logo and Navigation -->
        <div class="flex items-center space-x-8">
          <!-- Logo -->
          <router-link to="/" class="flex items-center">
            <h1
              class="text-2xl font-black text-transparent bg-gradient-to-r from-orange-500 to-blue-600 bg-clip-text"
            >
              Coachiles
            </h1>
          </router-link>

          <!-- Navigation Links -->
          <nav class="hidden md:flex space-x-6">
            <router-link
              to="/coach/profile"
              :class="[
                'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                $route.path === '/coach/profile'
                  ? 'bg-orange-100 text-orange-800'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
              ]"
            >
              Mon Profil
            </router-link>
            <router-link
              to="/coach/proposals"
              :class="[
                'px-3 py-2 rounded-md text-sm font-medium transition-colors relative',
                $route.path === '/coach/proposals'
                  ? 'bg-orange-100 text-orange-800'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
              ]"
            >
              Propositions
              <!-- Badge for new proposals -->
              <span
                v-if="newProposalsCount > 0"
                class="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full"
              >
                {{ newProposalsCount }}
              </span>
            </router-link>
            <router-link
              to="/coach/marketplace"
              :class="[
                'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                $route.path === '/coach/marketplace'
                  ? 'bg-orange-100 text-orange-800'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
              ]"
            >
              Marketplace
            </router-link>
            <router-link
              to="/coach/bookings"
              :class="[
                'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                $route.path === '/coach/bookings'
                  ? 'bg-orange-100 text-orange-800'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
              ]"
            >
              Réservations
            </router-link>
            <router-link
              to="/coach/account"
              :class="[
                'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                $route.path === '/coach/account'
                  ? 'bg-orange-100 text-orange-800'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
              ]"
            >
              Paramètres
            </router-link>
          </nav>
        </div>

        <!-- User Menu -->
        <div class="flex items-center space-x-4">
          <!-- Notifications -->
          <button
            type="button"
            class="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            <BellIcon class="h-6 w-6" />
            <!-- Notification dot -->
            <span
              v-if="hasNotifications"
              class="absolute top-0 right-0 block h-2 w-2 bg-red-400 rounded-full"
            ></span>
          </button>

          <!-- Profile Dropdown -->
          <Menu as="div" class="relative">
            <MenuButton
              class="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              <img
                :src="coach?.photo || '/default-avatar.svg'"
                :alt="coach?.firstName"
                class="h-8 w-8 rounded-full object-cover bg-gray-200"
              />
              <span class="hidden md:block text-sm font-medium text-gray-700">
                {{ coach?.firstName }}
              </span>
              <ChevronDownIcon class="h-4 w-4 text-gray-400" />
            </MenuButton>

            <transition
              enter-active-class="transition ease-out duration-100"
              enter-from-class="transform opacity-0 scale-95"
              enter-to-class="transform opacity-100 scale-100"
              leave-active-class="transition ease-in duration-75"
              leave-from-class="transform opacity-100 scale-100"
              leave-to-class="transform opacity-0 scale-95"
            >
              <MenuItems
                class="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
              >
                <MenuItem v-slot="{ active }">
                  <router-link
                    to="/coach/profile"
                    :class="[
                      active ? 'bg-gray-100' : '',
                      'flex items-center px-4 py-2 text-sm text-gray-700',
                    ]"
                  >
                    <UserIcon class="mr-3 h-4 w-4" />
                    Mon Profil
                  </router-link>
                </MenuItem>
                <MenuItem v-slot="{ active }">
                  <router-link
                    to="/coach/account"
                    :class="[
                      active ? 'bg-gray-100' : '',
                      'flex items-center px-4 py-2 text-sm text-gray-700',
                    ]"
                  >
                    <CogIcon class="mr-3 h-4 w-4" />
                    Paramètres
                  </router-link>
                </MenuItem>
                <MenuItem v-slot="{ active }">
                  <a
                    href="/"
                    :class="[
                      active ? 'bg-gray-100' : '',
                      'flex items-center px-4 py-2 text-sm text-gray-700',
                    ]"
                  >
                    <HomeIcon class="mr-3 h-4 w-4" />
                    Voir le site
                  </a>
                </MenuItem>
                <hr class="my-1" />
                <MenuItem v-slot="{ active }">
                  <button
                    @click="handleSignOut"
                    :class="[
                      active ? 'bg-gray-100' : '',
                      'flex w-full items-center px-4 py-2 text-sm text-gray-700',
                    ]"
                  >
                    <ArrowRightOnRectangleIcon class="mr-3 h-4 w-4" />
                    Se déconnecter
                  </button>
                </MenuItem>
              </MenuItems>
            </transition>
          </Menu>

          <!-- Mobile menu button -->
          <button
            type="button"
            @click="showMobileMenu = !showMobileMenu"
            class="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <Bars3Icon v-if="!showMobileMenu" class="h-6 w-6" />
            <XMarkIcon v-else class="h-6 w-6" />
          </button>
        </div>
      </div>

      <!-- Mobile Navigation -->
      <div v-if="showMobileMenu" class="md:hidden border-t border-gray-200 py-4">
        <nav class="space-y-2">
          <router-link
            to="/coach/profile"
            @click="showMobileMenu = false"
            :class="[
              'block px-3 py-2 rounded-md text-base font-medium',
              $route.path === '/coach/profile'
                ? 'bg-orange-100 text-orange-800'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
            ]"
          >
            Mon Profil
          </router-link>
          <router-link
            to="/coach/proposals"
            @click="showMobileMenu = false"
            :class="[
              'block px-3 py-2 rounded-md text-base font-medium',
              $route.path === '/coach/proposals'
                ? 'bg-orange-100 text-orange-800'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
            ]"
          >
            Propositions
            <span
              v-if="newProposalsCount > 0"
              class="ml-2 inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full"
            >
              {{ newProposalsCount }}
            </span>
          </router-link>
          <router-link
            to="/coach/marketplace"
            @click="showMobileMenu = false"
            :class="[
              'block px-3 py-2 rounded-md text-base font-medium',
              $route.path === '/coach/marketplace'
                ? 'bg-orange-100 text-orange-800'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
            ]"
          >
            Marketplace
          </router-link>
          <router-link
            to="/coach/bookings"
            @click="showMobileMenu = false"
            :class="[
              'block px-3 py-2 rounded-md text-base font-medium',
              $route.path === '/coach/bookings'
                ? 'bg-orange-100 text-orange-800'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
            ]"
          >
            Réservations
          </router-link>
          <router-link
            to="/coach/account"
            @click="showMobileMenu = false"
            :class="[
              'block px-3 py-2 rounded-md text-base font-medium',
              $route.path === '/coach/account'
                ? 'bg-orange-100 text-orange-800'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
            ]"
          >
            Paramètres
          </router-link>
        </nav>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import {
  BellIcon,
  ChevronDownIcon,
  UserIcon,
  CogIcon,
  HomeIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'

// Router
const router = useRouter()

// Auth Store
const authStore = useAuthStore()

// Component State
const showMobileMenu = ref(false)

// Computed
const coach = computed(() => authStore.coach)
const newProposalsCount = ref(2) // TODO: Get from proposals store
const hasNotifications = computed(() => newProposalsCount.value > 0)

// Methods
const handleSignOut = async () => {
  try {
    await authStore.signOut()
    router.push('/')
  } catch (error) {
    console.error('Sign out error:', error)
  }
}
</script>
