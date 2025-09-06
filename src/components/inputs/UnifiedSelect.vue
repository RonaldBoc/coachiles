<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, computed, nextTick } from 'vue'

interface OptionItem {
  value: string
  label: string
  disabled?: boolean
}

const props = defineProps<{
  modelValue: string | number | null
  options: OptionItem[]
  placeholder?: string
  disabled?: boolean
  maxHeightClass?: string // override dropdown max height (non-teleport mode)
  teleport?: boolean // render dropdown in body to escape overflow
  dropdownOffset?: number // gap in px between trigger and dropdown
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: string | number | null): void
  (e: 'change', v: string | number | null): void
}>()

const open = ref(false)
const triggerRef = ref<HTMLElement | null>(null)
const listRef = ref<HTMLElement | null>(null)
const activeIndex = ref(-1)
const internalValue = ref(props.modelValue)
const dropdownStyle = ref<Record<string, string>>({})
const placement = ref<'below' | 'above'>('below')

function computePosition() {
  if (!props.teleport) return
  const el = triggerRef.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const viewportH = window.innerHeight
  const offset = props.dropdownOffset ?? 4
  const spaceBelow = viewportH - rect.bottom
  const spaceAbove = rect.top
  // Decide placement
  placement.value = spaceBelow >= 200 || spaceBelow >= spaceAbove ? 'below' : 'above'
  const maxHeight =
    placement.value === 'below'
      ? Math.min(spaceBelow - offset - 8, 320)
      : Math.min(spaceAbove - offset - 8, 320)
  const top = placement.value === 'below' ? rect.bottom + offset : rect.top - offset
  // If above, anchor bottom via transform translateY(-100%) for smoother layout
  dropdownStyle.value = {
    position: 'fixed',
    left: rect.left + 'px',
    width: rect.width + 'px',
    top: placement.value === 'below' ? top + 'px' : top + 'px',
    maxHeight: Math.max(maxHeight, 120) + 'px',
    zIndex: '9999',
    transform: placement.value === 'above' ? 'translateY(-100%)' : 'none',
  }
}

function attachAutoPosition() {
  if (!props.teleport) return
  window.addEventListener('scroll', computePosition, true)
  window.addEventListener('resize', computePosition)
}
function detachAutoPosition() {
  if (!props.teleport) return
  window.removeEventListener('scroll', computePosition, true)
  window.removeEventListener('resize', computePosition)
}

watch(
  () => props.modelValue,
  (v) => {
    internalValue.value = v
  },
)

function toggle() {
  if (props.disabled) return
  open.value = !open.value
  if (open.value) {
    nextTick(() => {
      const idx = props.options.findIndex((o) => o.value === internalValue.value)
      activeIndex.value = idx >= 0 ? idx : -1
      listRef.value?.focus({ preventScroll: true })
      computePosition()
      attachAutoPosition()
    })
  } else {
    detachAutoPosition()
  }
}

function close() {
  open.value = false
  activeIndex.value = -1
  detachAutoPosition()
}

function onSelect(idx: number) {
  const opt = props.options[idx]
  if (!opt || opt.disabled) return
  internalValue.value = opt.value
  emit('update:modelValue', opt.value)
  emit('change', opt.value)
  close()
  triggerRef.value?.focus()
}

function move(delta: number) {
  if (!open.value) return
  const enabled = props.options.map((o, i) => ({ o, i })).filter((x) => !x.o.disabled)
  if (!enabled.length) return
  let current = enabled.findIndex((x) => x.o.value === props.options[activeIndex.value]?.value)
  if (current === -1) current = 0
  current = (current + delta + enabled.length) % enabled.length
  activeIndex.value = enabled[current].i
  const el = listRef.value?.querySelector<HTMLElement>(`[data-opt="${activeIndex.value}"]`)
  el?.scrollIntoView({ block: 'nearest' })
}

function handleKeyOnTrigger(e: KeyboardEvent) {
  if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
    e.preventDefault()
    if (!open.value) {
      toggle()
      if (e.key === 'ArrowDown') move(1)
      if (e.key === 'ArrowUp') move(-1)
    } else if (['Enter', ' '].includes(e.key)) {
      if (activeIndex.value >= 0) onSelect(activeIndex.value)
    }
  }
}

function handleKeyOnList(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    e.preventDefault()
    close()
    triggerRef.value?.focus()
  } else if (e.key === 'ArrowDown') {
    e.preventDefault()
    move(1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    move(-1)
  } else if (e.key === 'Home') {
    e.preventDefault()
    activeIndex.value = 0
  } else if (e.key === 'End') {
    e.preventDefault()
    activeIndex.value = props.options.length - 1
  } else if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    if (activeIndex.value >= 0) onSelect(activeIndex.value)
  }
}

function handleClickOutside(e: MouseEvent) {
  if (!open.value) return
  const t = e.target as Node
  if (triggerRef.value && triggerRef.value.contains(t)) return
  if (listRef.value && listRef.value.contains(t)) return
  close()
}

onMounted(() => {
  window.addEventListener('mousedown', handleClickOutside)
})
onBeforeUnmount(() => {
  window.removeEventListener('mousedown', handleClickOutside)
  detachAutoPosition()
})

const selectedLabel = computed(() => {
  const found = props.options.find((o) => o.value === internalValue.value)
  return found?.label || props.placeholder || 'Sélectionner'
})
</script>

<template>
  <div class="relative">
    <!-- Trigger (visual consistency with native select) -->
    <button
      ref="triggerRef"
      type="button"
      class="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 h-10 flex items-center justify-between text-sm text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-60"
      :class="{ 'text-gray-400': !internalValue }"
      :aria-expanded="open ? 'true' : 'false'"
      :disabled="disabled"
      @click="toggle"
      @keydown="handleKeyOnTrigger"
    >
      <span class="truncate" :class="internalValue ? 'text-gray-700' : 'text-gray-400'">{{
        selectedLabel
      }}</span>
      <svg
        class="w-4 h-4 ml-2 text-gray-500 shrink-0"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6" />
      </svg>
    </button>
    <!-- Dropdown (teleported or local) -->
    <Teleport v-if="teleport && open" to="body">
      <ul
        ref="listRef"
        tabindex="-1"
        role="listbox"
        class="rounded-md border bg-white shadow-lg text-sm overflow-auto focus:outline-none py-1"
        :class="!teleport ? maxHeightClass || 'max-h-72 absolute z-20 mt-1 w-full' : ''"
        :style="teleport ? dropdownStyle : undefined"
        @keydown="handleKeyOnList"
      >
        <li
          v-for="(opt, idx) in options"
          :key="opt.value"
          :data-opt="idx"
          role="option"
          :aria-selected="opt.value === internalValue"
        >
          <button
            type="button"
            class="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-blue-50"
            :class="[
              opt.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
              idx === activeIndex ? 'bg-blue-100' : '',
            ]"
            :disabled="opt.disabled"
            @click="onSelect(idx)"
            @mouseenter="activeIndex = idx"
          >
            <span
              class="text-xs truncate"
              :class="opt.value === internalValue ? 'font-medium text-gray-800' : 'text-gray-700'"
              >{{ opt.label }}</span
            >
            <span v-if="opt.value === internalValue" class="ml-auto text-[10px] text-blue-600"
              >Sélectionné</span
            >
          </button>
        </li>
        <li v-if="!options.length" class="px-3 py-2 text-xs text-gray-500 italic">Aucune option</li>
      </ul>
    </Teleport>
    <ul
      v-else-if="open"
      ref="listRef"
      tabindex="-1"
      role="listbox"
      class="absolute z-20 mt-1 w-full rounded-md border bg-white shadow-lg text-sm overflow-auto focus:outline-none py-1"
      :class="maxHeightClass || 'max-h-72'"
      @keydown="handleKeyOnList"
    >
      <li
        v-for="(opt, idx) in options"
        :key="opt.value"
        :data-opt="idx"
        role="option"
        :aria-selected="opt.value === internalValue"
      >
        <button
          type="button"
          class="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-blue-50"
          :class="[
            opt.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
            idx === activeIndex ? 'bg-blue-100' : '',
          ]"
          :disabled="opt.disabled"
          @click="onSelect(idx)"
          @mouseenter="activeIndex = idx"
        >
          <span
            class="text-xs truncate"
            :class="opt.value === internalValue ? 'font-medium text-gray-800' : 'text-gray-700'"
            >{{ opt.label }}</span
          >
          <span v-if="opt.value === internalValue" class="ml-auto text-[10px] text-blue-600"
            >Sélectionné</span
          >
        </button>
      </li>
      <li v-if="!options.length" class="px-3 py-2 text-xs text-gray-500 italic">Aucune option</li>
    </ul>
  </div>
</template>

<style scoped>
/* Simple fade (optional) could be added */
</style>
