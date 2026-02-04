<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
    <!-- Header -->
    <div
      v-if="title || $slots.header || showSearch || showFilters"
      class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-4"
    >
      <div class="flex items-center space-x-4">
        <h3 v-if="title" class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ title }}
        </h3>
        <slot name="header"></slot>
      </div>

      <div class="flex items-center space-x-3">
        <!-- Search -->
        <div v-if="showSearch" class="relative">
          <input
            type="search"
            :placeholder="searchPlaceholder"
            class="block w-64 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white pl-10 pr-4 py-2 text-sm"
            v-model="searchValue"
            @input="$emit('search', searchValue)"
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

        <slot name="actions"></slot>
      </div>
    </div>

    <!-- Filters -->
    <div
      v-if="showFilters && (filters.length > 0 || $slots.filters)"
      class="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700"
    >
      <div class="flex flex-wrap items-center gap-3">
        <!-- Predefined filters -->
        <div v-for="filter in filters" :key="filter.key" class="flex items-center space-x-2">
          <label :for="filter.key" class="text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ filter.label }}
          </label>
          <select
            :id="filter.key"
            v-model="filterValues[filter.key]"
            @change="onFilterChange"
            class="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm py-1 px-2"
          >
            <option value="">All</option>
            <option v-for="option in filter.options" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>

        <!-- Custom filters slot -->
        <slot name="filters"></slot>

        <!-- Clear filters -->
        <button
          v-if="hasActiveFilters"
          @click="clearFilters"
          class="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline"
        >
          Clear filters
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <!-- Headers -->
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <!-- Bulk select checkbox -->
              <th v-if="allowBulkSelect" class="w-4 px-4 py-3">
                <input
                  type="checkbox"
                  :checked="allSelected"
                  :indeterminate="someSelected"
                  @change="toggleSelectAll"
                  class="rounded border-gray-300 dark:border-gray-600"
                />
              </th>

              <th
                v-for="column in columns"
                :key="column.key"
                :class="[
                  'px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider',
                  column.sortable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600' : '',
                ]"
                @click="column.sortable ? toggleSort(column.key) : null"
              >
                <div class="flex items-center space-x-1">
                  <span>{{ column.label }}</span>
                  <svg
                    v-if="column.sortable"
                    class="w-4 h-4"
                    :class="getSortIconClass(column.key)"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M8 9l4-4 4 4m0 6l-4 4-4-4"
                    />
                  </svg>
                </div>
              </th>
            </tr>
          </thead>

          <!-- Body -->
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <slot name="body" :data="sortedData" :selected="selectedItems">
              <!-- Default row rendering -->
              <tr
                v-for="item in paginatedData"
                :key="getItemId(item)"
                class="hover:bg-gray-50 dark:hover:bg-gray-700"
                :class="{
                  'bg-blue-50 dark:bg-blue-900/20': selectedItems.includes(getItemId(item)),
                }"
              >
                <!-- Bulk select checkbox -->
                <td v-if="allowBulkSelect" class="px-4 py-3">
                  <input
                    type="checkbox"
                    :checked="selectedItems.includes(getItemId(item))"
                    @change="toggleSelect(getItemId(item))"
                    class="rounded border-gray-300 dark:border-gray-600"
                  />
                </td>

                <!-- Data cells -->
                <td
                  v-for="column in columns"
                  :key="column.key"
                  class="px-4 py-3 text-sm text-gray-900 dark:text-gray-300"
                  :class="column.cellClass"
                >
                  <slot
                    :name="`cell-${column.key}`"
                    :item="item"
                    :value="getNestedValue(item, column.key)"
                  >
                    {{ getNestedValue(item, column.key) }}
                  </slot>
                </td>
              </tr>

              <!-- Empty state -->
              <tr v-if="sortedData.length === 0">
                <td
                  :colspan="columnCount"
                  class="px-4 py-12 text-center text-gray-500 dark:text-gray-400"
                >
                  <div class="flex flex-col items-center space-y-3">
                    <svg
                      class="w-12 h-12 text-gray-300 dark:text-gray-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1"
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m-2 0v3a1 1 0 001 1h1.5"
                      />
                    </svg>
                    <p class="text-lg font-medium">{{ emptyMessage }}</p>
                  </div>
                </td>
              </tr>
            </slot>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Footer with pagination -->
    <div
      v-if="showPagination && sortedData.length > pageSize"
      class="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700"
    >
      <div class="flex items-center justify-between">
        <div class="text-sm text-gray-700 dark:text-gray-300">
          Showing {{ startItem }} to {{ endItem }} of {{ total }} results
        </div>
        <div class="flex items-center space-x-2">
          <button
            @click="previousPage"
            :disabled="currentPage === 1"
            class="px-3 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Previous
          </button>
          <span class="text-sm text-gray-700 dark:text-gray-300">
            Page {{ currentPage }} of {{ totalPages }}
          </span>
          <button
            @click="nextPage"
            :disabled="currentPage === totalPages"
            class="px-3 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- Bulk actions bar -->
    <div
      v-if="allowBulkSelect && selectedItems.length > 0"
      class="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-4 z-50"
    >
      <span class="text-sm font-medium">{{ selectedItems.length }} selected</span>
      <div class="flex items-center space-x-2">
        <slot name="bulk-actions" :selected="selectedItems"></slot>
        <button @click="clearSelection" class="text-indigo-200 hover:text-white text-sm">
          Clear
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, reactive } from 'vue'

interface Column {
  key: string
  label: string
  sortable?: boolean
  cellClass?: string
}

interface Filter {
  key: string
  label: string
  options: { value: string; label: string }[]
}

const props = withDefaults(
  defineProps<{
    data: any[]
    columns: Column[]
    title?: string
    showSearch?: boolean
    showFilters?: boolean
    showPagination?: boolean
    allowBulkSelect?: boolean
    searchPlaceholder?: string
    emptyMessage?: string
    pageSize?: number
    filters?: Filter[]
    idKey?: string
  }>(),
  {
    searchPlaceholder: 'Search...',
    emptyMessage: 'No data found',
    pageSize: 20,
    idKey: 'id',
    filters: () => [],
  },
)

const emit = defineEmits<{
  search: [query: string]
  filter: [filters: Record<string, any>]
  sort: [column: string, direction: 'asc' | 'desc' | null]
  select: [items: string[]]
  rowClick: [item: any]
}>()

// Local state
const searchValue = ref('')
const filterValues = reactive<Record<string, any>>({})
const selectedItems = ref<string[]>([])
const currentPage = ref(1)
const sortColumn = ref<string | null>(null)
const sortDirection = ref<'asc' | 'desc' | null>(null)

// Computed
const columnCount = computed(() => props.columns.length + (props.allowBulkSelect ? 1 : 0))

const hasActiveFilters = computed(() => {
  return Object.values(filterValues).some((value) => value !== '' && value != null)
})

const sortedData = computed(() => {
  const result = [...props.data]

  if (sortColumn.value && sortDirection.value) {
    result.sort((a, b) => {
      const aVal = getNestedValue(a, sortColumn.value!)
      const bVal = getNestedValue(b, sortColumn.value!)

      if (aVal < bVal) return sortDirection.value === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection.value === 'asc' ? 1 : -1
      return 0
    })
  }

  return result
})

const total = computed(() => sortedData.value.length)
const totalPages = computed(() => Math.ceil(total.value / props.pageSize))
const startItem = computed(() => (currentPage.value - 1) * props.pageSize + 1)
const endItem = computed(() => Math.min(currentPage.value * props.pageSize, total.value))

const paginatedData = computed(() => {
  if (!props.showPagination) return sortedData.value

  const start = (currentPage.value - 1) * props.pageSize
  const end = start + props.pageSize
  return sortedData.value.slice(start, end)
})

const allSelected = computed(() => {
  const pageItemIds = paginatedData.value.map((item) => getItemId(item))
  return pageItemIds.length > 0 && pageItemIds.every((id) => selectedItems.value.includes(id))
})

const someSelected = computed(() => {
  const pageItemIds = paginatedData.value.map((item) => getItemId(item))
  return pageItemIds.some((id) => selectedItems.value.includes(id)) && !allSelected.value
})

// Methods
const getItemId = (item: any): string => {
  return item[props.idKey] || item.id || String(item)
}

const getNestedValue = (obj: any, path: string) => {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

const toggleSort = (column: string) => {
  if (sortColumn.value === column) {
    if (sortDirection.value === 'asc') {
      sortDirection.value = 'desc'
    } else if (sortDirection.value === 'desc') {
      sortColumn.value = null
      sortDirection.value = null
    } else {
      sortDirection.value = 'asc'
    }
  } else {
    sortColumn.value = column
    sortDirection.value = 'asc'
  }

  emit('sort', sortColumn.value || '', sortDirection.value)
}

const getSortIconClass = (column: string) => {
  if (sortColumn.value !== column || !sortColumn.value) return 'text-gray-400'
  if (sortDirection.value === 'asc') return 'text-indigo-600 transform rotate-180'
  if (sortDirection.value === 'desc') return 'text-indigo-600'
  return 'text-gray-400'
}

const toggleSelect = (itemId: string) => {
  const index = selectedItems.value.indexOf(itemId)
  if (index > -1) {
    selectedItems.value.splice(index, 1)
  } else {
    selectedItems.value.push(itemId)
  }
  emit('select', selectedItems.value)
}

const toggleSelectAll = () => {
  const pageItemIds = paginatedData.value.map((item) => getItemId(item))

  if (allSelected.value) {
    // Deselect all page items
    selectedItems.value = selectedItems.value.filter((id) => !pageItemIds.includes(id))
  } else {
    // Select all page items
    pageItemIds.forEach((id) => {
      if (!selectedItems.value.includes(id)) {
        selectedItems.value.push(id)
      }
    })
  }

  emit('select', selectedItems.value)
}

const clearSelection = () => {
  selectedItems.value = []
  emit('select', selectedItems.value)
}

const onFilterChange = () => {
  emit('filter', { ...filterValues })
}

const clearFilters = () => {
  Object.keys(filterValues).forEach((key) => {
    filterValues[key] = ''
  })
  emit('filter', { ...filterValues })
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

// Watch for external data changes
watch(
  () => props.data,
  () => {
    // Reset pagination when data changes
    currentPage.value = 1
    // Clear selection when data changes
    selectedItems.value = []
  },
)
</script>
