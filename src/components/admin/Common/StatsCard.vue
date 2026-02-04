<template>
  <div
    class="bg-white dark:bg-gray-800 overflow-hidden rounded-lg shadow"
    :class="{ 'cursor-pointer hover:shadow-md transition-shadow': clickable }"
    @click="handleClick"
  >
    <div class="p-5">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <div
            class="w-8 h-8 rounded-md flex items-center justify-center text-lg"
            :class="iconClasses"
          >
            {{ icon }}
          </div>
        </div>
        <div class="ml-5 w-0 flex-1">
          <dl>
            <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
              {{ title }}
            </dt>
            <dd class="flex items-baseline">
              <div class="text-2xl font-semibold text-gray-900 dark:text-white">
                {{ formatValue(value) }}
              </div>
              <div
                v-if="change"
                class="ml-2 flex items-baseline text-sm font-semibold"
                :class="changeColor"
              >
                <svg
                  class="w-3 h-3 flex-shrink-0 self-center"
                  :class="changeIcon"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    v-if="change > 0"
                    fill-rule="evenodd"
                    d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                    clip-rule="evenodd"
                  />
                  <path
                    v-else
                    fill-rule="evenodd"
                    d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span class="sr-only">{{ change > 0 ? 'Increased' : 'Decreased' }} by</span>
                {{ Math.abs(change) }}%
              </div>
            </dd>
            <dd v-if="subtitle" class="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {{ subtitle }}
            </dd>
          </dl>
        </div>
      </div>
    </div>
    <div v-if="trend" class="bg-gray-50 dark:bg-gray-700/50 px-5 py-3">
      <div class="text-sm">
        <a
          href="#"
          class="font-medium text-cyan-700 dark:text-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-300"
        >
          {{ trend }}
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  title: string
  value: number | string
  icon: string
  subtitle?: string
  change?: number
  trend?: string
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'indigo' | 'purple' | 'pink'
  clickable?: boolean
}>()

const emit = defineEmits<{
  click: []
}>()

const handleClick = () => {
  if (props.clickable) {
    emit('click')
  }
}

const iconClasses = computed(() => {
  const color = props.color || 'blue'
  const colorMap = {
    blue: 'bg-blue-500 text-white',
    green: 'bg-green-500 text-white',
    yellow: 'bg-yellow-500 text-white',
    red: 'bg-red-500 text-white',
    indigo: 'bg-indigo-500 text-white',
    purple: 'bg-purple-500 text-white',
    pink: 'bg-pink-500 text-white',
  }
  return colorMap[color]
})

const changeColor = computed(() => {
  if (!props.change) return ''
  return props.change > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
})

const changeIcon = computed(() => {
  if (!props.change) return ''
  return props.change > 0 ? 'transform rotate-0' : 'transform rotate-180'
})

const formatValue = (value: number | string) => {
  if (typeof value === 'number') {
    return value.toLocaleString()
  }
  return value
}
</script>
