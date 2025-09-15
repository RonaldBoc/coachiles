<template>
  <CoachLayout>
    <div class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <!-- Header -->
      <div
        class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl px-4 py-6 sm:p-8 flex items-start space-x-6"
      >
        <div class="relative group">
          <img
            :key="`profile-photo-${headerPhotoVersion}`"
            :src="headerPhotoOverride || profileData?.photo || '/default-avatar.svg'"
            :alt="`${profileData?.firstName || 'Coach'}`"
            class="h-24 w-24 rounded-full object-cover bg-gray-200"
          />
          <label
            v-if="authStore.user?.id"
            class="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/50 text-white text-[11px] opacity-0 group-hover:opacity-100 cursor-pointer transition"
          >
            <span v-if="!avatarUploading">Changer</span>
            <span v-else class="animate-pulse">...</span>
            <input type="file" accept="image/*" class="hidden" @change="handleHeaderAvatar" />
          </label>
          <button
            v-if="authStore.user?.id && profileData?.photo && !avatarUploading"
            @click.prevent="openDeleteAvatarModal"
            type="button"
            class="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold shadow opacity-0 group-hover:opacity-100 transition"
            title="Supprimer la photo"
          >
            ×
          </button>
        </div>
        <div class="flex-1">
          <h1 class="text-2xl font-bold text-gray-900">{{ profileData?.firstName || 'Coach' }}</h1>
          <p class="text-gray-600 mt-1">Gérez vos informations publiques et modalités générales.</p>
          <p
            v-if="avatarMessage"
            class="text-xs mt-2"
            :class="avatarMessage.startsWith('Erreur') ? 'text-red-600' : 'text-green-600'"
          >
            {{ avatarMessage }}
          </p>
          <p
            v-else-if="authStore.user?.id && !profileData?.photo"
            class="text-xs mt-2 text-amber-600 flex items-start gap-1"
          >
            <svg class="w-4 h-4 mt-0.5 flex-none" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.5a.75.75 0 00-1.5 0v4.25c0 .414.336.75.75.75h2a.75.75 0 000-1.5h-1.25V6.5zM10 13a1 1 0 100 2 1 1 0 000-2z"
                clip-rule="evenodd"
              />
            </svg>
            Ajoutez une photo de profil : les coaches avec photo reçoivent beaucoup plus de
            demandes.
          </p>
        </div>
      </div>

      <!-- Quick In-Page Navigation -->
      <nav
        ref="quickNav"
        class="bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/50 border border-gray-200 rounded-xl px-4 py-3 flex flex-wrap gap-2 sticky top-0 z-10"
        aria-label="Navigation rapide profil"
      >
        <button
          v-for="lnk in quickLinks"
          :key="lnk.id"
          type="button"
          @click="scrollTo(lnk.id)"
          class="px-3 py-1.5 rounded-full text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          :class="
            activeSection === lnk.id
              ? 'bg-blue-600 text-white shadow'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          "
        >
          {{ lnk.label }}
        </button>
      </nav>

      <!-- Unified Editor -->
      <CoachProfileEditor
        v-if="profileData?.id"
        :initial-coach-id="profileData.id"
        :initial-data="editorInitialData"
        :show-avatar-section="false"
        @saved="handleEditorSaved"
      />
    </div>
  </CoachLayout>
  <!-- Delete Avatar Modal -->
  <transition name="fade">
    <div
      v-if="showDeleteAvatarModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="cancelDeleteAvatar"></div>
      <div
        class="relative w-full max-w-sm bg-white rounded-xl shadow-lg ring-1 ring-black/5 p-6 space-y-4 animate-scale-in"
      >
        <div class="flex items-start space-x-3">
          <div
            class="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm2.28-10.03a.75.75 0 10-1.06-1.06L10 8.94 8.78 7.72a.75.75 0 10-1.06 1.06L8.94 10l-1.22 1.22a.75.75 0 101.06 1.06L10 11.06l1.22 1.22a.75.75 0 101.06-1.06L11.06 10l1.22-1.22z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div class="flex-1">
            <h2 class="text-sm font-semibold text-gray-900 mb-1">Supprimer la photo ?</h2>
            <p class="text-xs text-gray-600 leading-relaxed">
              Cette action retirera votre photo de profil. Vous pourrez toujours en téléverser une
              nouvelle plus tard.
            </p>
          </div>
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <button
            type="button"
            @click="cancelDeleteAvatar"
            class="px-3 py-1.5 rounded-md text-xs font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            id="confirm-delete-avatar-btn"
            type="button"
            @click="handleDeleteAvatar"
            :disabled="avatarUploading"
            class="px-3 py-1.5 rounded-md text-xs font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {{ avatarUploading ? 'Suppression…' : 'Supprimer' }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import CoachLayout from '@/layouts/CoachLayout.vue'
import { useAuthStore } from '@/stores/auth'
import CoachProfileEditor from '@/components/CoachProfileEditor.vue'
import { supabaseCoachApi } from '@/services/supabaseCoachApi'

type CountryType = 'martinique' | 'guadeloupe' | 'guyane'
const authStore = useAuthStore()
const profileData = computed(() => authStore.coach)

const parseLocationCountry = (location?: string): CountryType | '' => {
  if (!location) return ''
  const lower = location.toLowerCase()
  if (lower.includes('martinique')) return 'martinique'
  if (lower.includes('guadeloupe')) return 'guadeloupe'
  if (lower.includes('guyane')) return 'guyane'
  return ''
}
const parseLocationCity = (location?: string): string => location?.split(',')[0]?.trim() || ''

const editorInitialData = computed(() => {
  const c = profileData.value
  if (!c) return {}
  const languages = [...(c.languages || [])]
  const modalities = c.modalities
    ? {
        availabilityDays: [...modalitiesEnsureArray(c.modalities.availabilityDays)],
        locations: ensureAllLocations(c.modalities.locations),
        freeTrial: {
          enabled: !!c.modalities.freeTrial?.enabled,
          details: c.modalities.freeTrial?.details || '',
        },
        cancellationPolicy: c.modalities.cancellationPolicy || '',
      }
    : undefined
  return {
    personal: {
      firstName: c.firstName,
      lastName: c.lastName || '',
      age: null,
      gender: '',
      territory: parseLocationCountry(c.location) || '',
      city: parseLocationCity(c.location) || '',
      languages,
      languagesRaw: languages.join(', '),
    },
    contact: {
      email: c.email,
      phone: c.phone || '',
      website: '',
      instagram: '',
      facebook: '',
    },
    activity: {
      experienceYears: c.experience || 0,
      workExperiences: [],
      diplomas: [],
    },
    modalities,
  }
})

function modalitiesEnsureArray(val: unknown): string[] {
  return Array.isArray(val) ? (val.filter((v) => typeof v === 'string') as string[]) : []
}

interface LocationEntryRaw {
  enabled?: boolean
  details?: string
}
interface LocationsRawShape {
  atHome?: LocationEntryRaw
  visio?: LocationEntryRaw
  publicSpaces?: LocationEntryRaw
  gym?: LocationEntryRaw
  [key: string]: LocationEntryRaw | undefined
}
function ensureAllLocations(src: LocationsRawShape = {}) {
  const mk = (k: LocationEntryRaw | undefined) => ({
    enabled: !!k?.enabled,
    details: k?.details || '',
  })
  return {
    atHome: mk(src.atHome),
    visio: mk(src.visio),
    publicSpaces: mk(src.publicSpaces),
    gym: mk(src.gym),
  }
}

function handleEditorSaved() {
  if (authStore.loadCoachProfile) authStore.loadCoachProfile()
}

// Inline avatar update
const avatarUploading = ref(false)
const avatarMessage = ref('')
let avatarMsgTimeout: number | undefined
// Local override & version to force <img> refresh immediately after upload
const headerPhotoOverride = ref<string | null>(null)
const headerPhotoVersion = ref(0)
async function handleHeaderAvatar(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file || !profileData.value?.id) return
  try {
    avatarUploading.value = true
    avatarMessage.value = ''
    const newUrl = await supabaseCoachApi.uploadAvatar(profileData.value.id, file)
    // Immediate optimistic UI update with cache buster
    headerPhotoOverride.value = `${newUrl}?v=${Date.now()}`
    headerPhotoVersion.value++
    if (authStore.loadCoachProfile) await authStore.loadCoachProfile()
    avatarMessage.value = 'Photo mise à jour ✅'
  } catch (err) {
    avatarMessage.value = 'Erreur: ' + ((err as Error)?.message || String(err))
  } finally {
    avatarUploading.value = false
    if (avatarMsgTimeout) window.clearTimeout(avatarMsgTimeout)
    avatarMsgTimeout = window.setTimeout(() => (avatarMessage.value = ''), 5000)
  }
  // reset input value so selecting same file again triggers change
  ;(e.target as HTMLInputElement).value = ''
}

const showDeleteAvatarModal = ref(false)

function openDeleteAvatarModal() {
  if (!profileData.value?.id) return
  showDeleteAvatarModal.value = true
  // Optional: focus later
  setTimeout(() => {
    const btn = document.getElementById('confirm-delete-avatar-btn')
    btn?.focus()
  }, 50)
}

function cancelDeleteAvatar() {
  showDeleteAvatarModal.value = false
}

async function handleDeleteAvatar() {
  if (!profileData.value?.id) return
  try {
    avatarUploading.value = true
    await supabaseCoachApi.deleteAvatar(profileData.value.id)
    headerPhotoOverride.value = null
    headerPhotoVersion.value++
    if (authStore.loadCoachProfile) await authStore.loadCoachProfile()
    avatarMessage.value = 'Photo supprimée'
  } catch (err) {
    avatarMessage.value = 'Erreur: ' + ((err as Error)?.message || String(err))
  } finally {
    showDeleteAvatarModal.value = false
    avatarUploading.value = false
    if (avatarMsgTimeout) window.clearTimeout(avatarMsgTimeout)
    avatarMsgTimeout = window.setTimeout(() => (avatarMessage.value = ''), 5000)
  }
}

// Quick navigation
interface QuickLink {
  id: string
  label: string
}
const quickLinks: QuickLink[] = [
  { id: 'personal-section', label: 'Infos perso' },
  { id: 'contact-section', label: 'Contact' },
  { id: 'bio-section', label: 'Bio' },
  { id: 'activity-section', label: 'Activité' },
  { id: 'modalities-section', label: 'Modalités' },
]
const activeSection = ref<string>('personal-section')
const quickNav = ref<HTMLElement | null>(null)

function currentOffset(): number {
  // Height of sticky nav plus a small gap
  const navH = quickNav.value?.offsetHeight || 0
  return navH + 12
}

function scrollTo(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  const topTarget = el.getBoundingClientRect().top + window.scrollY - currentOffset()
  window.scrollTo({ top: topTarget, behavior: 'smooth' })
}

let scrollHandler: (() => void) | null = null
onMounted(() => {
  scrollHandler = () => {
    const scrollY = window.scrollY + currentOffset() + 1
    let current = activeSection.value
    for (const link of quickLinks) {
      const el = document.getElementById(link.id)
      if (!el) continue
      const elTop = el.getBoundingClientRect().top + window.scrollY
      if (scrollY >= elTop) current = link.id
    }
    activeSection.value = current
  }
  window.addEventListener('scroll', scrollHandler, { passive: true })
  // Recompute after initial render sizes settle
  nextTick(() => scrollHandler && scrollHandler())
  // If arriving with a hash (e.g., from dashboard pill), perform an adjusted scroll
  if (window.location.hash) {
    const id = window.location.hash.slice(1)
    // Delay slightly to ensure child component rendered
    setTimeout(() => scrollTo(id), 80)
  }
})
onBeforeUnmount(() => {
  if (scrollHandler) window.removeEventListener('scroll', scrollHandler)
})
</script>

<style scoped></style>
<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.animate-scale-in {
  animation: scale-in 0.18s ease;
}
@keyframes scale-in {
  from {
    transform: scale(0.92);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
