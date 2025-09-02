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
