<script setup lang="ts">
import { reactive, computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { XMarkIcon, ArrowUpTrayIcon, GlobeAltIcon } from '@heroicons/vue/24/outline'
import { supabase } from '@/utils/supabase'
import {
  LANGUAGE_OPTIONS,
  getAllCertifications,
  SPECIALTY_OPTIONS,
  type SpecialtyGroup,
} from '@/constants/coachOptions'
import {
  COUNTRIES,
  getCitiesByCountry,
  getCountryLabel,
  type CountryType,
} from '@/constants/locations'

// NOTE: This component is a first iteration scaffold. It keeps everything local until save() is called.
// You can later hydrate initialData from backend and persist via an API / Supabase update.

interface DiplomaEntry {
  id: string
  title: string
  status: 'pending' | 'approved' | 'rejected'
  proofFileName?: string
  // New: store only the storage object path; signed URLs are generated on demand for private bucket
  proofFilePath?: string
  // Legacy field (kept temporarily for backward compatibility / migration display)
  proofFileUrl?: string
  rejectionNote?: string
  // Ephemeral client-side flag to show upload success feedback
  _uploadSuccess?: boolean
}
interface DiplomaLike {
  id?: string
  title?: string
  status?: 'pending' | 'approved' | 'rejected'
  proofFileName?: string
  proofFilePath?: string
  proofFileUrl?: string
  rejectionNote?: string
}

interface ModalitiesLocationsEntry {
  enabled: boolean
  details: string
}
interface ModalitiesData {
  availabilityDays: string[]
  locations: {
    atHome: ModalitiesLocationsEntry
    visio: ModalitiesLocationsEntry
    publicSpaces: ModalitiesLocationsEntry
    gym: ModalitiesLocationsEntry
  }
  freeTrial: { enabled: boolean; details: string }
  cancellationPolicy: string
}

interface CoachProfilePayload {
  personal: {
    firstName: string
    lastName: string
    age: number | null
    gender: string
    territory: string
    city: string
    languages: string[]
    languagesRaw?: string
  }
  contact: {
    email: string
    phone: string
    website: string
    instagram: string
    facebook: string
  }
  activity: {
    experienceYears: number | null
    workExperiences: string[]
    diplomas: DiplomaEntry[]
    specialties: string[]
  }
  modalities: ModalitiesData
}

// Database row shape (subset) for hydration
interface CoachDbRow {
  id: string
  email: string
  first_name?: string
  last_name?: string
  languages?: string[]
  specialties?: string[]
  certifications?: string[]
  experience_years?: number | null
  availability?: string[]
  hourly_rate?: number | null
  profile_personal?: Partial<CoachProfilePayload['personal']>
  profile_contact?: Partial<CoachProfilePayload['contact']>
  profile_activity?: Partial<CoachProfilePayload['activity']>
  modalities?: Partial<ModalitiesData>
  bio?: string | null
  avatar_url?: string | null
}

type InitialData = {
  personal?: Partial<CoachProfilePayload['personal']>
  contact?: Partial<CoachProfilePayload['contact']>
  activity?: Partial<CoachProfilePayload['activity']>
  modalities?: Partial<ModalitiesData>
}

const props = defineProps<{
  initialCoachId?: string
  initialData?: InitialData
  showAvatarSection?: boolean // if false, parent handles avatar editing
}>()
const emit = defineEmits<{ (e: 'saved', payload: CoachProfilePayload): void }>()

// Storage bucket (configurable via env). Create this bucket in Supabase Storage if it does not exist.
// Example: in a .env file add VITE_SUPABASE_DIPLOMA_BUCKET=coach-diplomas
interface ViteEnvMeta {
  env?: Record<string, string>
}
const metaEnv = (import.meta as unknown as ViteEnvMeta).env || {}
const DIPLOMA_BUCKET = metaEnv.VITE_SUPABASE_DIPLOMA_BUCKET || 'diploma-proofs'

// Days of week (French abbreviations)
const weekDays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

// Gender options (local only)
const GENDER_OPTIONS = [
  { value: 'male', label: 'Homme' },
  { value: 'female', label: 'Femme' },
]
// Derived global lists (flattened)
const ALL_CERTIFICATIONS = getAllCertifications()
const TERRITORY_KEYS = Object.keys(COUNTRIES) as CountryType[]

// Reactive model (merge with initialData if provided)
const model = reactive({
  // Pricing
  hourlyRate: null as number | null,
  personal: {
    firstName: props.initialData?.personal?.firstName || '',
    lastName: props.initialData?.personal?.lastName || '',
    age: props.initialData?.personal?.age || (null as number | null),
    gender: props.initialData?.personal?.gender || '',
    territory: (props.initialData?.personal?.territory as CountryType) || ('' as '' | CountryType),
    city: props.initialData?.personal?.city || '',
    languagesRaw: (props.initialData?.personal?.languages || []).join(', '), // legacy text field
  },
  contact: {
    email: props.initialData?.contact?.email || '',
    phone: props.initialData?.contact?.phone || '', // will hold RAW digits only (no prefix) for UI
    website: props.initialData?.contact?.website || '',
    instagram: props.initialData?.contact?.instagram || '',
    facebook: props.initialData?.contact?.facebook || '',
  },
  bio: '',
  activity: {
    experienceYears: props.initialData?.activity?.experienceYears || (null as number | null),
    workExperiences: props.initialData?.activity?.workExperiences || ([] as string[]),
    diplomas: (props.initialData?.activity?.diplomas || []) as DiplomaEntry[],
    newDiplomaTitle: '' as string,
    newWorkExp: '' as string,
    specialties: props.initialData?.activity?.specialties
      ? [...props.initialData.activity.specialties]
      : ([] as string[]),
  },
  modalities: {
    availabilityDays: props.initialData?.modalities?.availabilityDays || ([] as string[]),
    locations: {
      atHome: {
        enabled: props.initialData?.modalities?.locations?.atHome?.enabled || false,
        details: props.initialData?.modalities?.locations?.atHome?.details || '',
      },
      visio: {
        enabled: props.initialData?.modalities?.locations?.visio?.enabled || false,
        details: props.initialData?.modalities?.locations?.visio?.details || '',
      },
      publicSpaces: {
        enabled: props.initialData?.modalities?.locations?.publicSpaces?.enabled || false,
        details: props.initialData?.modalities?.locations?.publicSpaces?.details || '',
      },
      gym: {
        enabled: props.initialData?.modalities?.locations?.gym?.enabled || false,
        details: props.initialData?.modalities?.locations?.gym?.details || '',
      },
    },
    freeTrial: {
      enabled: props.initialData?.modalities?.freeTrial?.enabled || false,
      details: props.initialData?.modalities?.freeTrial?.details || '',
    },
    cancellationPolicy: props.initialData?.modalities?.cancellationPolicy || '',
  },
})

// Phone indicative selector (reuse onboarding logic)
const phoneIndicatives = [
  { code: 'mq', prefix: '+596', flag: '🇲🇶', label: 'Martinique' },
  { code: 'gp', prefix: '+590', flag: '🇬🇵', label: 'Guadeloupe' },
  { code: 'fr', prefix: '+33', flag: '🇫🇷', label: 'France' },
  { code: 'gf', prefix: '+594', flag: '🇬🇫', label: 'Guyane' },
]
type PhoneIndicativeCode = (typeof phoneIndicatives)[number]['code']
const phoneIndicative = ref<PhoneIndicativeCode>('mq')
const showProfileIndicativeMenu = ref(false)
const profilePhoneSelectorRef = ref<HTMLElement | null>(null)
const profileOpenAbove = ref(false)
const profileSelectedPhoneIndicative = computed(
  () => phoneIndicatives.find((p) => p.code === phoneIndicative.value) || phoneIndicatives[0],
)
function toggleProfilePhoneMenu() {
  showProfileIndicativeMenu.value = !showProfileIndicativeMenu.value
  if (showProfileIndicativeMenu.value) {
    const el = profilePhoneSelectorRef.value
    if (el) {
      const rect = el.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top
      const estimatedHeight = 240
      profileOpenAbove.value = spaceBelow < estimatedHeight && spaceAbove > spaceBelow
    }
  }
}
function selectProfilePhoneIndicative(code: PhoneIndicativeCode) {
  phoneIndicative.value = code
  showProfileIndicativeMenu.value = false
}
function handleProfilePhoneRawInput(e: Event) {
  const target = e.target as HTMLInputElement
  const digits = target.value.replace(/\D+/g, '').slice(0, 10)
  model.contact.phone = digits
}
function handleProfilePhoneClickOutside(e: MouseEvent) {
  if (!showProfileIndicativeMenu.value) return
  const el = profilePhoneSelectorRef.value
  if (el && !el.contains(e.target as Node)) showProfileIndicativeMenu.value = false
}
if (typeof window !== 'undefined') {
  window.addEventListener('click', handleProfilePhoneClickOutside)
}

// Managed arrays (chips style)
const languagesList = ref<string[]>(
  props.initialData?.personal?.languages ? [...props.initialData.personal.languages] : [],
)
// Fallback: if initialData absent but languagesRaw present
if (!languagesList.value.length && model.personal.languagesRaw) {
  languagesList.value = model.personal.languagesRaw
    .split(',')
    .map((l) => l.trim())
    .filter(Boolean)
}
const languages = computed(() => languagesList.value)

// City options depend on territory
const cityOptions = computed(() =>
  model.personal.territory ? getCitiesByCountry(model.personal.territory as CountryType) : [],
)
watch(
  () => model.personal.territory,
  (val) => {
    if (val && !cityOptions.value.includes(model.personal.city)) {
      model.personal.city = ''
    }
  },
)

// Language add/remove
function addLanguage(lang: string) {
  if (!lang || languagesList.value.includes(lang)) return
  languagesList.value.push(lang)
}
function removeLanguage(lang: string) {
  const i = languagesList.value.indexOf(lang)
  if (i >= 0) languagesList.value.splice(i, 1)
}

// Specialties add/remove
function addSpecialty(spec: string) {
  if (!spec || model.activity.specialties.includes(spec)) return
  // Limit to 4 specialties
  if (model.activity.specialties.length >= 4) return
  model.activity.specialties.push(spec)
}
function removeSpecialty(spec: string) {
  const i = model.activity.specialties.indexOf(spec)
  if (i >= 0) model.activity.specialties.splice(i, 1)
}

// Specialty search & grouped filtering
const specialtySearch = ref('')
const filteredSpecialtyGroups = computed<SpecialtyGroup[]>(() => {
  const term = specialtySearch.value.trim().toLowerCase()
  if (!term) return SPECIALTY_OPTIONS
  return (
    SPECIALTY_OPTIONS.map((g) => {
      const categoryMatches = g.category.toLowerCase().includes(term)
      return {
        category: g.category,
        // If category name matches the term, include ALL its specialties.
        // Otherwise only the specialties whose label includes the term.
        specialties: categoryMatches
          ? g.specialties.slice()
          : g.specialties.filter((s) => s.toLowerCase().includes(term)),
      }
    })
      // Keep group only if it now has at least one specialty (either via category match or specialty match)
      .filter((g) => g.specialties.length > 0)
  )
})

// Dropdown state & outside click handling
const showSpecialtyDropdown = ref(false)
const specialtyDropdownEl = ref<HTMLElement | null>(null)

function openSpecialtyDropdown() {
  showSpecialtyDropdown.value = true
}
function closeSpecialtyDropdown() {
  showSpecialtyDropdown.value = false
}

function handleOutsideClick(e: MouseEvent) {
  if (!showSpecialtyDropdown.value) return
  const target = e.target as Node
  if (specialtyDropdownEl.value && !specialtyDropdownEl.value.contains(target)) {
    closeSpecialtyDropdown()
  }
}

function selectSpecialty(opt: string) {
  addSpecialty(opt)
  specialtySearch.value = ''
  closeSpecialtyDropdown()
}

onMounted(() => {
  window.addEventListener('mousedown', handleOutsideClick)
  // If we have an email (preferred for RLS) or an id, hydrate existing saved data
  if (model.contact.email || props.initialCoachId) {
    hydrateFromDatabase()
  }
  // Default hourly rate if unset (business default 50€)
  if (model.hourlyRate === null) model.hourlyRate = 50
})
onBeforeUnmount(() => {
  window.removeEventListener('mousedown', handleOutsideClick)
})

const hasSpecialtyMatches = computed(() =>
  filteredSpecialtyGroups.value.some((g) => g.specialties.length > 0),
)

// --- Avatar management (change profile picture) ---
import maleDefaultAvatar from '@/assets/avatars/default_male.svg'
import femaleDefaultAvatar from '@/assets/avatars/default_female.svg'
import { supabaseCoachApi } from '@/services/supabaseCoachApi'
import { generateId } from '@/utils/id'

const currentCoachId = ref<string | null>(props.initialCoachId || null)
const avatarUrl = ref<string | null>(null)
const pendingAvatarFile = ref<File | null>(null)
const avatarPreviewUrl = ref<string | null>(null)
const isUploadingAvatar = ref(false)
const avatarUploadMessage = ref<string | null>(null)
let avatarMsgTimeout: number | undefined

function defaultAvatarForGender(gender: string) {
  return gender === 'female' ? femaleDefaultAvatar : maleDefaultAvatar
}

function handleAvatarFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (avatarPreviewUrl.value) URL.revokeObjectURL(avatarPreviewUrl.value)
  pendingAvatarFile.value = file
  avatarPreviewUrl.value = URL.createObjectURL(file)
  avatarUploadMessage.value = null
  // Auto-upload immediately if we have coach id
  if (!currentCoachId.value) {
    avatarUploadMessage.value = 'Profil non encore chargé. Réessayez dans un instant.'
    return
  }
  uploadNewAvatar()
}
function cancelPendingAvatar() {
  if (avatarPreviewUrl.value) URL.revokeObjectURL(avatarPreviewUrl.value)
  avatarPreviewUrl.value = null
  pendingAvatarFile.value = null
  avatarUploadMessage.value = null
}
async function uploadNewAvatar() {
  if (!pendingAvatarFile.value) return
  if (!currentCoachId.value) {
    alert('Impossible de téléverser la photo: identifiant du coach introuvable.')
    return
  }
  try {
    isUploadingAvatar.value = true
    avatarUploadMessage.value = null
    const newUrl = await supabaseCoachApi.uploadAvatar(
      currentCoachId.value,
      pendingAvatarFile.value,
    )
    avatarUrl.value = newUrl
    cancelPendingAvatar()
    avatarUploadMessage.value = 'Photo mise à jour ✅'
  } catch (err) {
    const msg = (err as Error)?.message || String(err)
    avatarUploadMessage.value = 'Erreur: ' + msg
  } finally {
    isUploadingAvatar.value = false
    if (avatarMsgTimeout) window.clearTimeout(avatarMsgTimeout)
    avatarMsgTimeout = window.setTimeout(() => {
      avatarUploadMessage.value = null
    }, 5000)
  }
}

// Save UI state
const isSaving = ref(false)
const saveSuccess = ref(false)
const saveMessage = ref('')
let saveSuccessTimeout: number | undefined

// Diploma selection from predefined list
const selectedDiplomaOption = ref('')
function addDiplomaFromSelect() {
  const title = selectedDiplomaOption.value.trim()
  if (!title) return
  if (model.activity.diplomas.some((d) => d.title === title)) {
    selectedDiplomaOption.value = ''
    return
  }
  model.activity.diplomas.push({ id: generateId(), title, status: 'pending' })
  selectedDiplomaOption.value = ''
}

async function uploadDiplomaProof(d: DiplomaEntry, file: File) {
  const bucket = DIPLOMA_BUCKET
  const cleanName = file.name.replace(/[^\w.\-]/g, '_')
  // Ensure we have an authenticated user (RLS requires auth context)
  const { data: authData } = await supabase.auth.getUser()
  const userId = authData?.user?.id
  if (!userId) {
    alert('Vous devez être connecté pour téléverser un diplôme.')
    return
  }
  // Use userId folder so a simple RLS policy can allow inserts only into own folder
  const path = `${userId}/${Date.now()}_${cleanName}`
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false })
  if (!error) {
    d.proofFileName = file.name
    d.proofFilePath = path
    // Do NOT generate/stash a public URL for private bucket; legacy field left untouched
    d.status = 'pending'
    d._uploadSuccess = true
    // Clear success flag after a few seconds
    window.setTimeout(() => {
      d._uploadSuccess = false
    }, 6000)
    return
  }
  // Enhanced error messaging
  if (error.message?.toLowerCase().includes('bucket not found')) {
    alert(
      `Le bucket de stockage "${bucket}" est introuvable.\n\n` +
        'Créez-le dans Supabase > Storage > Create bucket (public recommandé) ou définissez VITE_SUPABASE_DIPLOMA_BUCKET avec un bucket existant.\n\n' +
        'Ensuite ré-essayez.',
    )
    return
  }
  if (error.message?.toLowerCase().includes('row-level security')) {
    alert(
      'Échec RLS lors de linsertion dans storage.objects.\n\n' +
        'Ajoutez une policy comme:\n' +
        'CREATE POLICY "allow diploma uploads" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = \'' +
        bucket +
        "' AND auth.role() = 'authenticated' AND split_part(name,'/',1) = auth.uid()::text );\n\n" +
        'Puis refaites le téléversement.',
    )
    return
  }
  if (error.message?.toLowerCase().includes('duplicate')) {
    alert('Un fichier avec ce nom existe déjà. Réessayez après avoir renommé le fichier.')
    return
  }
  alert("Erreur lors de l'upload: " + error.message)
}

function addDiploma() {
  const title = model.activity.newDiplomaTitle.trim()
  if (!title) return
  model.activity.diplomas.push({ id: generateId(), title, status: 'pending' })
  model.activity.newDiplomaTitle = ''
}
function removeDiploma(id: string) {
  const i = model.activity.diplomas.findIndex((d) => d.id === id)
  if (i > -1) model.activity.diplomas.splice(i, 1)
}

// Work experience add/remove
function addWorkExperience() {
  const v = model.activity.newWorkExp.trim()
  if (!v) return
  model.activity.workExperiences.push(v)
  model.activity.newWorkExp = ''
}
function removeWorkExperience(idx: number) {
  model.activity.workExperiences.splice(idx, 1)
}

async function save() {
  if (isSaving.value) return
  isSaving.value = true
  saveSuccess.value = false
  saveMessage.value = ''
  // Build payload
  const payload: CoachProfilePayload = {
    personal: { ...model.personal, languages: languages.value },
    contact: model.contact,
    activity: {
      experienceYears: model.activity.experienceYears,
      workExperiences: model.activity.workExperiences,
      diplomas: model.activity.diplomas,
      specialties: model.activity.specialties,
    },
    modalities: model.modalities,
  }
  // Sanitize phone (store null instead of empty string at top-level phone column)
  // Build international phone (prefix + raw) if raw present
  let sanitizedPhone: string | null = null
  if (model.contact.phone && model.contact.phone.trim().length) {
    const raw = model.contact.phone.replace(/\D+/g, '')
    const selected =
      phoneIndicatives.find((p) => p.code === phoneIndicative.value) || phoneIndicatives[0]
    const normalized = raw.replace(/^0+/, '')
    sanitizedPhone = `${selected.prefix}${normalized}`
  }
  // Persist (placeholder): update coaches table JSON columns or separate columns.
  // Determine update filter: RLS policy allows update when auth.jwt().email = email.
  // Prefer using email for the filter, fallback to id if provided and policy supports it.
  if (props.initialCoachId || model.contact.email) {
    // Map availabilityDays (strings like 'Lundi') to simple abbreviations or keep full; store also as text[] legacy
    const availabilityArray = payload.modalities.availabilityDays || []
    let builder = supabase.from('coaches').update({
      updated_at: new Date().toISOString(),
      first_name: payload.personal.firstName,
      last_name: payload.personal.lastName,
      languages: payload.personal.languages,
      specialties: model.activity.specialties,
      certifications: model.activity.diplomas.map((d) => d.title),
      experience_years: payload.activity.experienceYears,
      experience: payload.activity.experienceYears,
      hourly_rate: model.hourlyRate,
      availability: availabilityArray,
      phone: sanitizedPhone, // NEW: keep phone column in sync with profile_contact.phone
      profile_personal: payload.personal,
      profile_contact: payload.contact,
      profile_activity: payload.activity,
      modalities: payload.modalities,
      bio: model.bio,
    })
    if (model.contact.email) {
      builder = builder.eq('email', model.contact.email)
    } else if (props.initialCoachId) {
      builder = builder.eq('id', props.initialCoachId)
    }
    const { data, error } = await builder.select('id').maybeSingle()
    if (error) {
      console.error('Save error', error)
      alert('Erreur lors de la sauvegarde du profil: ' + error.message)
      isSaving.value = false
      return
    }
    if (!data) {
      console.warn('Save executed, but no matching row found for filter.')
      alert(
        "Aucune ligne mise à jour. Vérifiez que l'email correspond bien au coach connecté et que le profil existe.",
      )
      isSaving.value = false
      return
    }
  }
  emit('saved', payload)
  saveMessage.value = 'Profil enregistré avec succès.'
  saveSuccess.value = true
  if (saveSuccessTimeout) window.clearTimeout(saveSuccessTimeout)
  saveSuccessTimeout = window.setTimeout(() => {
    saveSuccess.value = false
  }, 4000)
  isSaving.value = false
}

// --- Hydration of existing profile from DB (for page refresh) ---
const isHydrated = ref(false)
const isHydrating = ref(false)
const hydrateError = ref<string | null>(null)

async function hydrateFromDatabase() {
  if (isHydrated.value || isHydrating.value) return
  isHydrating.value = true
  hydrateError.value = null
  try {
    let builder = supabase
      .from('coaches')
      .select(
        'id,email,first_name,last_name,languages,specialties,certifications,experience_years,hourly_rate,availability,profile_personal,profile_contact,profile_activity,modalities,bio,avatar_url',
      )
    if (model.contact.email) {
      builder = builder.eq('email', model.contact.email)
    } else if (props.initialCoachId) {
      builder = builder.eq('id', props.initialCoachId)
    }
    const { data, error } = await builder.maybeSingle<CoachDbRow>()
    if (error) {
      hydrateError.value = error.message
      return
    }
    if (!data) return
    // Personal
    currentCoachId.value = data.id
    // Pricing
    if (typeof data.hourly_rate === 'number') {
      model.hourlyRate = Number(data.hourly_rate)
    }
    const p: Partial<CoachProfilePayload['personal']> = data.profile_personal || {}
    model.personal.firstName = p.firstName ?? data.first_name ?? model.personal.firstName
    model.personal.lastName = p.lastName ?? data.last_name ?? model.personal.lastName
    model.personal.age = p.age ?? model.personal.age
    model.personal.gender = p.gender ?? model.personal.gender
    model.personal.territory = (p.territory as CountryType) ?? model.personal.territory
    model.personal.city = p.city ?? model.personal.city
    // Bio
    if (typeof data.bio === 'string') {
      model.bio = data.bio
    }
    // Languages: prefer JSONB personal.languages else legacy languages column
    const hydratedLangs: string[] = p.languages || data.languages || []
    languagesList.value = [...new Set(hydratedLangs)]
    model.personal.languagesRaw = languagesList.value.join(', ')

    // Contact
    const c: Partial<CoachProfilePayload['contact']> = data.profile_contact || {}
    // Phone: if stored in +<prefix><digits> format, split to keep only digits in UI and set indicative accordingly
    if (c.phone && typeof c.phone === 'string') {
      const matched = phoneIndicatives.find((p) => c.phone?.startsWith(p.prefix))
      if (matched) {
        phoneIndicative.value = matched.code
        model.contact.phone = c.phone.substring(matched.prefix.length)
      } else {
        // fallback keep digits only
        model.contact.phone = c.phone.replace(/[^0-9]/g, '')
      }
    }
    model.contact.website = c.website ?? model.contact.website
    model.contact.instagram = c.instagram ?? model.contact.instagram
    model.contact.facebook = c.facebook ?? model.contact.facebook

    // Activity
    const a: Partial<CoachProfilePayload['activity']> = data.profile_activity || {}
    model.activity.experienceYears =
      a.experienceYears ?? data.experience_years ?? model.activity.experienceYears
    // Work experiences
    model.activity.workExperiences = Array.isArray(a.workExperiences)
      ? [...a.workExperiences]
      : model.activity.workExperiences
    // Diplomas
    if (Array.isArray(a.diplomas)) {
      model.activity.diplomas = (a.diplomas as DiplomaLike[])
        .filter((d) => !!d && typeof d.title === 'string' && d.title.trim().length > 0)
        .map((d) => ({
          id: d.id && d.id.length ? d.id : generateId(),
          title: d.title as string,
          status: d.status || 'pending',
          proofFileName: d.proofFileName,
          proofFilePath: d.proofFilePath,
          proofFileUrl: d.proofFileUrl,
          rejectionNote: d.rejectionNote,
        }))
    }
    // Specialties (prefer JSON activity, fallback to legacy column)
    model.activity.specialties = Array.isArray(a.specialties)
      ? [...a.specialties]
      : data.specialties || model.activity.specialties

    // Modalities
    if (data.modalities) {
      const m: Partial<ModalitiesData> = data.modalities
      // Shallow merge respecting existing structure
      if (Array.isArray(m.availabilityDays)) {
        model.modalities.availabilityDays = [...m.availabilityDays]
      }
      if (m.locations) {
        const locationKeys = Object.keys(model.modalities.locations) as Array<
          keyof typeof model.modalities.locations
        >
        for (const key of locationKeys) {
          const incoming = (m.locations as Record<string, Partial<ModalitiesLocationsEntry>>)[key]
          if (incoming) {
            model.modalities.locations[key].enabled =
              incoming.enabled ?? model.modalities.locations[key].enabled
            model.modalities.locations[key].details =
              incoming.details ?? model.modalities.locations[key].details
          }
        }
      }
      if (m.freeTrial) {
        model.modalities.freeTrial.enabled =
          m.freeTrial.enabled ?? model.modalities.freeTrial.enabled
        model.modalities.freeTrial.details =
          m.freeTrial.details ?? model.modalities.freeTrial.details
      }
      if (typeof m.cancellationPolicy === 'string') {
        model.modalities.cancellationPolicy = m.cancellationPolicy
      }
    }
    isHydrated.value = true
    // Avatar hydration (fallback to gender default)
    avatarUrl.value = data.avatar_url || defaultAvatarForGender(model.personal.gender)
  } catch (e) {
    const err = e as Error
    hydrateError.value = err?.message || String(e)
  } finally {
    isHydrating.value = false
  }
}

// Re-hydrate if email prop becomes available later (e.g., async fetch by parent)
watch(
  () => model.contact.email,
  (val) => {
    if (val && !isHydrated.value) hydrateFromDatabase()
  },
)
</script>

<template>
  <div class="space-y-10">
    <!-- Avatar / Profile Photo (optional) -->
    <section
      v-if="props.showAvatarSection !== false"
      id="profile-photo-section"
      class="bg-white p-6 rounded-xl shadow-sm space-y-4"
    >
      <header class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-gray-900">Photo de profil</h2>
          <p class="text-sm text-gray-500 mt-1">Ajoutez ou modifiez votre photo professionnelle.</p>
        </div>
        <div v-if="avatarUrl" class="text-xs text-gray-500 hidden sm:block">
          Formats optimisés (miniatures générées automatiquement)
        </div>
      </header>
      <div class="flex items-start gap-6 flex-col sm:flex-row">
        <div
          class="relative w-28 h-28 rounded-full border bg-gray-50 overflow-hidden flex items-center justify-center"
        >
          <img
            v-if="avatarPreviewUrl"
            :src="avatarPreviewUrl"
            class="w-full h-full object-cover"
            alt="Aperçu temporaire"
          />
          <img
            v-else-if="avatarUrl"
            :src="avatarUrl"
            class="w-full h-full object-cover"
            alt="Photo actuelle"
          />
          <img
            v-else
            :src="model.personal.gender === 'female' ? femaleDefaultAvatar : maleDefaultAvatar"
            class="w-20 h-20 object-contain opacity-80"
            alt="Avatar par défaut"
          />
          <div
            v-if="isUploadingAvatar"
            class="absolute inset-0 bg-white/70 flex items-center justify-center"
          >
            <svg
              class="animate-spin h-6 w-6 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
          </div>
        </div>
        <div class="flex-1 space-y-3">
          <label
            class="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-md border text-sm bg-white hover:bg-gray-50"
          >
            <ArrowUpTrayIcon class="w-4 h-4 text-gray-500" />
            <span>{{ pendingAvatarFile ? 'Sélection...' : 'Choisir une image' }}</span>
            <input type="file" accept="image/*" class="hidden" @change="handleAvatarFile" />
          </label>
          <p class="text-[11px] text-gray-500 leading-snug">
            JPG / PNG. Téléversement automatique dès sélection. Une image carrée et lumineuse
            améliore la confiance des clients.
          </p>
          <div
            v-if="avatarUploadMessage"
            class="text-xs"
            :class="avatarUploadMessage.startsWith('Erreur') ? 'text-red-600' : 'text-green-600'"
          >
            {{ avatarUploadMessage }}
          </div>
        </div>
      </div>
    </section>
    <!-- Personal Info -->
    <section id="personal-section" class="bg-white p-6 rounded-xl shadow-sm space-y-6">
      <header>
        <h2 class="text-xl font-bold text-gray-900">Informations personnelles</h2>
        <p class="text-sm text-gray-500 mt-1">Identité et localisation.</p>
      </header>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700">Prénom</label>
          <input
            v-model="model.personal.firstName"
            class="mt-1 w-full rounded-md border-gray-300 dark:text-gray-900"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Nom</label>
          <input
            v-model="model.personal.lastName"
            class="dark:text-gray-900 mt-1 w-full rounded-md border-gray-300"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Âge</label>
          <input
            type="number"
            v-model.number="model.personal.age"
            class="dark:text-gray-900 mt-1 w-full rounded-md border-gray-300"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Genre</label>
          <select
            v-model="model.personal.gender"
            class="dark:text-gray-900 mt-1 w-full rounded-md border-gray-300"
          >
            <option value="">Sélectionner</option>
            <option v-for="g in GENDER_OPTIONS" :key="g.value" :value="g.value">
              {{ g.label }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Territoire</label>
          <select
            v-model="model.personal.territory"
            class="dark:text-gray-900 mt-1 w-full rounded-md border-gray-300"
          >
            <option value="">Sélectionner</option>
            <option v-for="t in TERRITORY_KEYS" :key="t" :value="t">
              {{ getCountryLabel(t) }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Ville</label>
          <select
            v-model="model.personal.city"
            class="dark:text-gray-900 mt-1 w-full rounded-md border-gray-300"
            :disabled="!model.personal.territory"
          >
            <option value="">
              {{ model.personal.territory ? 'Sélectionner' : 'Choisir un territoire' }}
            </option>
            <option v-for="c in cityOptions" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700">Langues parlées</label>
          <div class="mt-1 flex flex-wrap gap-2">
            <span
              v-for="lang in languages"
              :key="lang"
              class="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium"
            >
              {{ lang }}
              <button
                type="button"
                class="ml-1 text-blue-600 hover:text-blue-900"
                @click="removeLanguage(lang)"
              >
                ×
              </button>
            </span>
          </div>
          <select
            class="mt-2 w-full rounded-md border-gray-300 dark:text-gray-900"
            @change="
              (e: Event) => {
                const v = (e.target as HTMLSelectElement).value
                addLanguage(v)
                ;(e.target as HTMLSelectElement).value = ''
              }
            "
          >
            <option value="">Ajouter une langue</option>
            <option
              v-for="opt in LANGUAGE_OPTIONS"
              :key="opt"
              :value="opt"
              :disabled="languages.includes(opt)"
            >
              {{ opt }}
            </option>
          </select>
        </div>
      </div>
    </section>

    <!-- Contact -->
    <section id="contact-section" class="bg-white p-6 rounded-xl shadow-sm space-y-6">
      <header>
        <h2 class="text-xl font-bold text-gray-900">Contact</h2>
        <p class="text-sm text-gray-500 mt-1">Comment les clients peuvent vous trouver.</p>
      </header>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700">Email</label>
          <input
            v-model="model.contact.email"
            type="email"
            class="mt-1 w-full rounded-md border-gray-300 bg-gray-100 text-gray-600 cursor-not-allowed"
            disabled
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Téléphone</label>
          <div class="relative mt-1" ref="profilePhoneSelectorRef">
            <div
              class="flex items-center w-full border border-gray-300 rounded-md bg-white overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition"
            >
              <button
                type="button"
                @click="toggleProfilePhoneMenu"
                class="flex items-center gap-1 h-10 px-2 focus:outline-none select-none"
                aria-haspopup="listbox"
                :aria-expanded="showProfileIndicativeMenu ? 'true' : 'false'"
              >
                <span class="text-base leading-none">{{
                  profileSelectedPhoneIndicative.flag
                }}</span>
                <svg
                  class="w-4 h-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6" />
                </svg>
              </button>
              <span class="h-6 w-px bg-gray-200" aria-hidden="true"></span>
              <span class="px-2 text-sm text-gray-700 min-w-[52px]">{{
                profileSelectedPhoneIndicative.prefix
              }}</span>
              <input
                v-model="model.contact.phone"
                @input="handleProfilePhoneRawInput"
                type="tel"
                maxlength="10"
                pattern="[0-9]*"
                class="flex-1 min-w-0 h-10 px-2 border-0 focus:ring-0 focus:outline-none bg-transparent text-sm truncate dark:text-gray-900"
                placeholder="601020304"
                inputmode="numeric"
                autocomplete="tel"
              />
            </div>
            <ul
              v-if="showProfileIndicativeMenu"
              :class="[
                'absolute z-40 w-60 bg-white border border-gray-200 rounded-md shadow-lg overflow-auto focus:outline-none py-1',
                profileOpenAbove ? 'bottom-full mb-1 max-h-72' : 'top-full mt-1 max-h-72',
              ]"
              role="listbox"
            >
              <li v-for="opt in phoneIndicatives" :key="opt.code" role="option">
                <button
                  type="button"
                  @click="selectProfilePhoneIndicative(opt.code)"
                  class="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-blue-50 dark:text-gray-900"
                  :class="opt.code === phoneIndicative ? 'bg-blue-100 font-medium' : ''"
                >
                  <span class="text-base leading-none">{{ opt.flag }}</span>
                  <span>{{ opt.prefix }}</span>
                  <span class="text-xs text-gray-500 ml-auto">{{ opt.label }}</span>
                </button>
              </li>
            </ul>
            <p class="mt-1 text-[11px] text-gray-500">
              Format international enregistré automatiquement.
            </p>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Site web</label>
          <div
            class="relative mt-1 flex items-center w-full border border-gray-300 rounded-md bg-white overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition"
          >
            <span class="pl-2 pr-1 text-gray-500 flex items-center" aria-hidden="true">
              <GlobeAltIcon class="w-5 h-5" />
            </span>
            <input
              v-model="model.contact.website"
              type="url"
              placeholder="https://votre-site.com"
              class="flex-1 min-w-0 h-10 px-2 border-0 focus:ring-0 focus:outline-none bg-transparent text-sm dark:text-gray-900"
              autocomplete="url"
            />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Instagram</label>
          <div
            class="relative mt-1 flex items-center w-full border border-gray-300 rounded-md bg-white overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition"
          >
            <span class="pl-2 pr-1 text-pink-600 flex items-center" aria-hidden="true">
              <!-- Simple Instagram glyph -->
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M7 2C4.243 2 2 4.243 2 7v10c0 2.757 2.243 5 5 5h10c2.757 0 5-2.243 5-5V7c0-2.757-2.243-5-5-5H7zm10 2a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h10zm-5 3.75A5.255 5.255 0 0 0 6.75 13 5.255 5.255 0 0 0 12 18.25 5.255 5.255 0 0 0 17.25 13 5.255 5.255 0 0 0 12 7.75zm0 2A3.255 3.255 0 0 1 15.25 13 3.255 3.255 0 0 1 12 16.25 3.255 3.255 0 0 1 8.75 13 3.255 3.255 0 0 1 12 9.75zM17.5 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"
                />
              </svg>
            </span>
            <input
              v-model="model.contact.instagram"
              type="text"
              placeholder="@votrecompte"
              class="flex-1 min-w-0 h-10 px-2 border-0 focus:ring-0 focus:outline-none bg-transparent text-sm dark:text-gray-900"
              autocomplete="off"
            />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Facebook</label>
          <div
            class="relative mt-1 flex items-center w-full border border-gray-300 rounded-md bg-white overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition"
          >
            <span class="pl-2 pr-1 text-blue-600 flex items-center" aria-hidden="true">
              <!-- Facebook "f" logo -->
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path
                  d="M22 12.07C22 6.48 17.52 2 11.93 2 6.35 2 1.87 6.48 1.87 12.07c0 4.93 3.58 9.02 8.26 9.86v-6.98H7.9v-2.88h2.23v-2.2c0-2.2 1.31-3.42 3.32-3.42.96 0 1.96.17 1.96.17v2.16h-1.1c-1.08 0-1.42.67-1.42 1.36v1.93h2.42l-.39 2.88h-2.03v6.98c4.68-.84 8.26-4.93 8.26-9.86z"
                />
              </svg>
            </span>
            <input
              v-model="model.contact.facebook"
              type="text"
              placeholder="Page ou profil"
              class="flex-1 min-w-0 h-10 px-2 border-0 focus:ring-0 focus:outline-none bg-transparent text-sm dark:text-gray-900"
              autocomplete="off"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Bio -->
    <section id="bio-section" class="bg-white p-6 rounded-xl shadow-sm space-y-6">
      <header>
        <h2 class="text-xl font-bold text-gray-900">Biographie</h2>
        <p class="text-sm text-gray-500 mt-1">
          Aidez vos clients à mieux vous conniatre. Parlez de vous, de vos expériences et
          compétences. N'hésitez pas à mettre le paquet!
        </p>
      </header>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Votre biographie</label>
        <textarea
          v-model="model.bio"
          rows="6"
          class="dark:text-gray-900 w-full rounded-md border-gray-300 text-sm"
          placeholder="Présentez votre parcours, vos valeurs, votre manière de coacher..."
        ></textarea>
        <p class="text-[11px] text-gray-500 mt-1">
          Astuce: racontez une histoire qui montre votre impact.
        </p>
      </div>
    </section>

    <!-- Coach Activity (redesigned) -->
    <section id="activity-section" class="bg-white p-6 rounded-xl shadow-sm space-y-6">
      <header>
        <h2 class="text-xl font-bold text-gray-900">Activité de coach</h2>
        <p class="text-sm text-gray-500 mt-1">Expérience, diplômes et spécialités.</p>
      </header>
      <div class="space-y-6">
        <!-- Row 3: Specialties full width -->
        <div class="p-4 border rounded-lg bg-gray-50 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold text-gray-800">Spécialités</h3>
          </div>
          <div>
            <p class="dark:text-gray-900 italic text-xs pt-0 pb-3">
              Sélectionnez jusqu'à 4 spécialités qui vous correspondent le mieux. <br />
              Ces spécialités seront visibles sur votre profile publique.
            </p>
          </div>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="s in model.activity.specialties"
              :key="s"
              class="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium"
            >
              {{ s }}
              <button
                type="button"
                class="ml-1 text-green-600 hover:text-green-900"
                @click="removeSpecialty(s)"
              >
                ×
              </button>
            </span>
          </div>
          <div class="space-y-2" ref="specialtyDropdownEl">
            <div class="relative">
              <input
                v-model="specialtySearch"
                type="text"
                placeholder="Rechercher / ajouter une spécialité..."
                class="dark:text-gray-900 w-full rounded-md border-gray-300 text-sm pr-8"
                @focus="openSpecialtyDropdown()"
                @input="showSpecialtyDropdown = true"
              />
              <button
                v-if="specialtySearch"
                type="button"
                class="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-gray-600"
                @click="specialtySearch = ''"
              >
                ×
              </button>
              <!-- Dropdown Panel -->
              <div
                v-if="showSpecialtyDropdown"
                class="absolute z-20 mt-1 w-full max-h-72 overflow-auto rounded-md border bg-white shadow-lg text-sm"
              >
                <div v-if="!hasSpecialtyMatches" class="px-3 py-2 text-xs text-gray-500 italic">
                  Aucune spécialité trouvée
                </div>
                <template v-for="group in filteredSpecialtyGroups" :key="group.category">
                  <div v-if="group.specialties.length" class="py-1">
                    <div
                      class="px-3 pt-2 pb-1 text-[11px] font-semibold text-gray-500 uppercase tracking-wide"
                    >
                      {{ group.category }}
                    </div>
                    <button
                      v-for="opt in group.specialties"
                      :key="opt"
                      type="button"
                      class="w-full text-left px-3 py-1.5 hover:bg-blue-50 flex items-center justify-between disabled:opacity-40 disabled:cursor-not-allowed"
                      :disabled="
                        model.activity.specialties.includes(opt) ||
                        (model.activity.specialties.length >= 4 &&
                          !model.activity.specialties.includes(opt))
                      "
                      @click="selectSpecialty(opt)"
                    >
                      <span
                        :class="[
                          'text-xs',
                          model.activity.specialties.includes(opt)
                            ? 'text-gray-400 line-through'
                            : model.activity.specialties.length >= 4
                              ? 'text-gray-400'
                              : 'text-gray-700',
                        ]"
                        >{{ opt }}</span
                      >
                      <span
                        v-if="model.activity.specialties.includes(opt)"
                        class="text-[10px] text-gray-400"
                        >Ajouté</span
                      >
                    </button>
                  </div>
                </template>
              </div>
            </div>
            <p class="text-[11px] text-gray-500 flex items-center justify-between">
              <span>
                Recherchez par nom ou faites défiler les catégories, puis cliquez pour ajouter.
              </span>
              <span class="ml-4 text-gray-600 font-medium"
                >{{ model.activity.specialties.length }} / 4</span
              >
            </p>
          </div>
        </div>
        <!-- Row 1: Experience Years (1/4) + Work Experiences (3/4) -->
        <div class="grid gap-6 md:grid-cols-4">
          <div class="p-4 border rounded-lg bg-gray-50 space-y-3">
            <label class="block text-sm font-medium text-gray-700">Années d'expérience</label>
            <div class="relative">
              <input
                type="number"
                v-model.number="model.activity.experienceYears"
                class="w-full pr-12 rounded-md border-gray-300 dark:text-gray-900 no-spinner"
              />
              <span
                class="absolute inset-y-0 right-3 flex items-center text-sm text-gray-500 select-none pointer-events-none"
                >ans</span
              >
            </div>
          </div>
          <div class="md:col-span-3 p-4 border rounded-lg bg-gray-50 space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-medium text-gray-700">Expériences professionnelles</h3>
            </div>
            <div v-if="model.activity.workExperiences.length" class="flex flex-col gap-2">
              <div
                v-for="(exp, idx) in model.activity.workExperiences"
                :key="idx"
                class="group flex items-start justify-between gap-3 rounded-md bg-white border px-3 py-2 text-xs"
              >
                <span class="flex-1 leading-snug">{{ exp }}</span>
                <button
                  type="button"
                  @click="removeWorkExperience(idx)"
                  class="opacity-60 hover:opacity-100 text-gray-500"
                >
                  <XMarkIcon class="w-4 h-4" />
                </button>
              </div>
            </div>
            <div class="flex gap-2">
              <input
                v-model="model.activity.newWorkExp"
                placeholder="Ajouter (ex: Coach en salle...)"
                class="dark:text-gray-900 flex-1 rounded-md border-gray-300 text-xs"
              />
              <button
                type="button"
                @click="addWorkExperience"
                class="px-3 py-1.5 rounded bg-blue-600 text-white text-xs font-medium hover:bg-blue-700"
              >
                +
              </button>
            </div>
            <p class="text-[11px] text-gray-500">
              Ajoutez des expériences clés (emplois, missions freelances...).
            </p>
          </div>
        </div>
        <!-- Row 2: Diplomas full width -->
        <div class="p-4 border rounded-lg bg-gray-50 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold text-gray-800">Diplômes & Certifications</h3>
          </div>
          <div>
            <p class="dark:text-gray-900 italic text-xs pt-0 pb-3">
              Sélectionnez un diplôme dans la liste, ou un saisissez diplôme personnalisé, puis
              importez une photo de votre diplôme. <br />
              Après validation, vos diplômes et certifications seront visible sur votre profile
              publique.
            </p>
          </div>
          <div class="space-y-2">
            <select
              v-model="selectedDiplomaOption"
              @change="addDiplomaFromSelect"
              class="dark:text-gray-900 w-full rounded-md border-gray-300 text-sm"
            >
              <option value="">Ajouter un diplôme</option>
              <option
                v-for="opt in ALL_CERTIFICATIONS"
                :key="opt"
                :value="opt"
                :disabled="model.activity.diplomas.some((d) => d.title === opt)"
              >
                {{ opt }}
              </option>
            </select>
            <div class="flex gap-2">
              <input
                v-model="model.activity.newDiplomaTitle"
                placeholder="Diplôme personnalisé"
                class="dark:text-gray-900 flex-1 rounded-md border-gray-300 text-sm"
              />
              <button
                type="button"
                @click="addDiploma"
                class="px-3 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
              >
                Ajouter
              </button>
            </div>
            <p class="text-[11px] text-gray-500">
              Téléversez votre diplome pour accélérer la validation.
            </p>
          </div>
          <ul class="space-y-3 max-h-72 overflow-auto pr-1" v-if="model.activity.diplomas.length">
            <li
              v-for="d in model.activity.diplomas"
              :key="d.id"
              class="bg-white border rounded-lg p-3 flex flex-col gap-2"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="flex flex-col">
                  <span class="text-sm font-medium text-gray-800">{{ d.title }}</span>
                  <span
                    class="text-[11px] mt-0.5 inline-flex items-center rounded-full px-2 py-0.5"
                    :class="{
                      'bg-yellow-100 text-yellow-700': d.status === 'pending',
                      'bg-green-100 text-green-700': d.status === 'approved',
                      'bg-red-100 text-red-700': d.status === 'rejected',
                    }"
                    >{{ d.status }}</span
                  >
                </div>
                <button @click="removeDiploma(d.id)" class="text-gray-400 hover:text-red-500">
                  <XMarkIcon class="w-4 h-4" />
                </button>
              </div>
              <div v-if="!d.proofFileUrl">
                <label
                  class="inline-flex items-center gap-1.5 text-xs cursor-pointer text-blue-600 hover:underline"
                >
                  <ArrowUpTrayIcon class="w-4 h-4" />
                  <span>Importer une photo de votre diplome</span>
                  <input
                    type="file"
                    class="hidden"
                    accept="image/*,.pdf"
                    @change="
                      (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0]
                        if (file) uploadDiplomaProof(d, file)
                      }
                    "
                  />
                </label>
                <div
                  v-if="d.proofFilePath || d.proofFileName"
                  class="mt-1 text-[11px] text-gray-600 flex items-center gap-2"
                >
                  <span
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-green-50 text-green-700 border border-green-200"
                    v-if="d._uploadSuccess"
                  >
                    Fichier chargé:
                    <strong class="font-medium truncate max-w-[140px]">{{
                      d.proofFileName
                    }}</strong>
                  </span>
                  <span
                    v-else
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200"
                  >
                    Fichier:
                    <strong class="font-medium truncate max-w-[140px]">{{
                      d.proofFileName
                    }}</strong>
                  </span>
                  <span class="text-[10px] text-gray-500"
                    >(N'oubliez pas d'enregistrer le profil ci‑dessous)</span
                  >
                </div>
              </div>
              <div v-else class="text-xs text-gray-600 break-all">
                Preuve:
                <a :href="d.proofFileUrl" target="_blank" class="text-blue-600 underline">{{
                  d.proofFileName
                }}</a>
              </div>
              <div
                v-if="d.status === 'rejected' && d.rejectionNote"
                class="text-[11px] text-red-600 bg-red-50 border border-red-200 rounded p-2"
              >
                Raison du refus: {{ d.rejectionNote }}
              </div>
            </li>
          </ul>
          <div v-else class="text-xs text-gray-500 italic">Aucun diplôme ajouté.</div>
        </div>
      </div>
    </section>

    <!-- Modalités Générales des Cours -->
    <section id="modalities-section" class="bg-white p-6 rounded-xl shadow-sm space-y-6">
      <header>
        <h2 class="text-xl font-bold text-gray-900">Modalités générales des cours</h2>
        <p class="text-sm text-gray-500 mt-1">
          Définissez les conditions générales de vos cours. Ces informations sont les premières que
          vos clients verront.
        </p>
      </header>
      <!-- Hourly Rate -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tarif horaire (€ / h)</label>
          <input
            type="number"
            min="0"
            step="1"
            v-model.number="model.hourlyRate"
            class="dark:text-gray-900 no-spinner rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ex: 50"
          />
          <p class="text-[11px] text-gray-500 mt-1">
            Indiquez votre tarif de base pour une séance individuelle d'une heure.
          </p>
        </div>
      </div>
      <!-- Availability Days -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2"
          >Jours habituels de disponibilité</label
        >
        <div class="flex flex-wrap gap-2">
          <button
            v-for="d in weekDays"
            :key="d"
            type="button"
            @click="
              model.modalities.availabilityDays = model.modalities.availabilityDays.includes(d)
                ? model.modalities.availabilityDays.filter((x: string) => x !== d)
                : [...model.modalities.availabilityDays, d]
            "
            :class="[
              'px-3 py-1 rounded-full text-xs font-medium border transition',
              model.modalities.availabilityDays.includes(d)
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400',
            ]"
          >
            {{ d.slice(0, 3) }}
          </button>
        </div>
      </div>
      <!-- Locations -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div v-for="(loc, key) in model.modalities.locations" :key="key" class="space-y-2">
          <label class="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              v-model="loc.enabled"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-600"
            />
            <span class="text-sm font-medium text-gray-800">
              {{
                key === 'atHome'
                  ? 'À domicile'
                  : key === 'visio'
                    ? 'Visio'
                    : key === 'publicSpaces'
                      ? 'Espaces publics'
                      : 'Salle de sport'
              }}
            </span>
          </label>
          <textarea
            v-if="loc.enabled"
            v-model="loc.details"
            rows="2"
            class="dark:text-gray-900 w-full text-sm rounded border-gray-300"
            placeholder="Détails / conditions"
          ></textarea>
        </div>
      </div>
      <!-- Free Trial -->
      <div class="space-y-2">
        <label class="inline-flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            v-model="model.modalities.freeTrial.enabled"
            class="rounded border-gray-300 text-blue-600 focus:ring-blue-600"
          />
          <span class="text-sm font-medium text-gray-800">Premier cours gratuit</span>
        </label>
        <textarea
          v-if="model.modalities.freeTrial.enabled"
          v-model="model.modalities.freeTrial.details"
          rows="2"
          class="dark:text-gray-900 w-full text-sm rounded border-gray-300"
          placeholder="Conditions / format de la séance d'essai"
        ></textarea>
      </div>
      <!-- Cancellation Policy -->
      <div>
        <label class="block text-sm font-medium text-gray-700">Politique d'annulation</label>
        <textarea
          v-model="model.modalities.cancellationPolicy"
          rows="3"
          class="dark:text-gray-900 mt-1 w-full text-sm rounded border-gray-300"
          placeholder="Détails de votre politique"
        ></textarea>
      </div>
    </section>

    <div class="flex justify-end">
      <div class="relative flex flex-col items-end gap-2">
        <button
          @click="save"
          type="button"
          :disabled="isSaving"
          class="px-5 py-2.5 rounded-md font-medium text-sm shadow-sm flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed text-white bg-blue-600 hover:bg-blue-700"
        >
          <svg
            v-if="isSaving"
            class="animate-spin h-4 w-4 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
          <span>{{ isSaving ? 'Enregistrement...' : 'Enregistrer' }}</span>
        </button>
        <transition name="fade">
          <div
            v-if="saveSuccess"
            class="flex items-center gap-2 text-xs px-3 py-2 rounded-md bg-green-50 text-green-700 border border-green-200 shadow-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              class="h-4 w-4"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                clip-rule="evenodd"
              />
            </svg>
            <span>{{ saveMessage }}</span>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Remove number input spinners (Chrome, Safari, Edge) */
.no-spinner::-webkit-outer-spin-button,
.no-spinner::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
/* Firefox */
.no-spinner[type='number'] {
  -moz-appearance: textfield;
}
/* Phone selector dropdown layering fix inside profile editor */
[data-coach-profile-phone] {
  position: relative;
}
</style>
