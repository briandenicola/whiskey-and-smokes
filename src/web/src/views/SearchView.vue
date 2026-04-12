<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import Fuse, { type IFuseOptions } from 'fuse.js'
import { itemsApi, type Item } from '../services/items'
import { venuesApi, type Venue } from '../services/venues'
import StarRating from '../components/common/StarRating.vue'

const router = useRouter()

const query = ref('')
const isLoading = ref(false)
const hasSearched = ref(false)

const allItems = ref<Item[]>([])
const allVenues = ref<Venue[]>([])
const activeTab = ref<'all' | 'items' | 'venues'>('all')

let itemsFuse: Fuse<Item> | null = null
let venuesFuse: Fuse<Venue> | null = null

const itemFuseOptions: IFuseOptions<Item> = {
  keys: [
    { name: 'name', weight: 0.3 },
    { name: 'brand', weight: 0.15 },
    { name: 'type', weight: 0.1 },
    { name: 'category', weight: 0.1 },
    { name: 'venue.name', weight: 0.1 },
    { name: 'userNotes', weight: 0.1 },
    { name: 'aiSummary', weight: 0.05 },
    { name: 'tags', weight: 0.1 },
  ],
  threshold: 0.4,
  ignoreLocation: true,
  includeScore: true,
}

const venueFuseOptions: IFuseOptions<Venue> = {
  keys: [
    { name: 'name', weight: 0.3 },
    { name: 'type', weight: 0.1 },
    { name: 'address', weight: 0.15 },
    { name: 'labels', weight: 0.25 },
    { name: 'website', weight: 0.05 },
  ],
  threshold: 0.4,
  ignoreLocation: true,
  includeScore: true,
}

async function loadData() {
  if (allItems.value.length && allVenues.value.length) return
  isLoading.value = true
  try {
    const [itemsResp, venuesResp] = await Promise.all([
      itemsApi.list(undefined, undefined, undefined),
      venuesApi.list(),
    ])
    allItems.value = itemsResp.data.items
    allVenues.value = venuesResp.data.items

    // Load all pages for items
    let token = itemsResp.data.continuationToken
    while (token) {
      const more = await itemsApi.list(undefined, token, undefined)
      allItems.value.push(...more.data.items)
      token = more.data.continuationToken ?? undefined
    }

    // Load all pages for venues
    let vToken = venuesResp.data.continuationToken
    while (vToken) {
      const more = await venuesApi.list(undefined, vToken)
      allVenues.value.push(...more.data.items)
      vToken = more.data.continuationToken ?? undefined
    }

    itemsFuse = new Fuse(allItems.value, itemFuseOptions)
    venuesFuse = new Fuse(allVenues.value, venueFuseOptions)
  } finally {
    isLoading.value = false
  }
}

loadData()

const itemResults = computed(() => {
  if (!query.value.trim() || !itemsFuse) return []
  return itemsFuse.search(query.value.trim(), { limit: 20 })
})

const venueResults = computed(() => {
  if (!query.value.trim() || !venuesFuse) return []
  return venuesFuse.search(query.value.trim(), { limit: 20 })
})

const totalResults = computed(() => itemResults.value.length + venueResults.value.length)

const displayedItems = computed(() =>
  activeTab.value === 'venues' ? [] : itemResults.value
)
const displayedVenues = computed(() =>
  activeTab.value === 'items' ? [] : venueResults.value
)

let searchTimeout: ReturnType<typeof setTimeout> | undefined
watch(query, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    hasSearched.value = query.value.trim().length > 0
  }, 150)
})

function navigateToItem(item: Item) {
  router.push(`/items/${item.id}`)
}

function navigateToVenue(venue: Venue) {
  router.push(`/venues/${venue.id}`)
}

const searchInput = ref<HTMLInputElement | null>(null)
</script>

<template>
  <div class="p-4 max-w-lg mx-auto">
    <h2 class="text-xl font-bold text-white mb-4">Search</h2>

    <!-- Search input -->
    <div class="relative mb-4">
      <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#96BEE6]/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        ref="searchInput"
        v-model="query"
        type="search"
        placeholder="Search items, venues, labels..."
        class="w-full bg-[#0a2a52] border border-[#1e407c]/50 rounded-xl pl-11 pr-4 py-3 text-white text-sm placeholder-[#4a7aa5] focus:outline-none focus:border-[#1e407c]"
        autofocus
      />
      <button
        v-if="query"
        @click="query = ''; searchInput?.focus()"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-[#96BEE6]/70 hover:text-white/80"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="text-[#96BEE6]/70 text-center py-12">Loading data...</div>

    <!-- Tab filter -->
    <div v-else-if="hasSearched" class="mb-4">
      <div class="flex rounded-lg bg-[#0a2a52] p-0.5 mb-3">
        <button
          @click="activeTab = 'all'"
          :class="['flex-1 py-1.5 text-xs font-medium rounded-md transition-colors', activeTab === 'all' ? 'bg-[#1e407c] text-white' : 'text-[#96BEE6] hover:text-white/80']"
        >
          All ({{ totalResults }})
        </button>
        <button
          @click="activeTab = 'items'"
          :class="['flex-1 py-1.5 text-xs font-medium rounded-md transition-colors', activeTab === 'items' ? 'bg-[#1e407c] text-white' : 'text-[#96BEE6] hover:text-white/80']"
        >
          Items ({{ itemResults.length }})
        </button>
        <button
          @click="activeTab = 'venues'"
          :class="['flex-1 py-1.5 text-xs font-medium rounded-md transition-colors', activeTab === 'venues' ? 'bg-[#1e407c] text-white' : 'text-[#96BEE6] hover:text-white/80']"
        >
          Venues ({{ venueResults.length }})
        </button>
      </div>

      <!-- No results -->
      <div v-if="!totalResults" class="text-[#96BEE6]/70 text-center py-12">
        <p>No results found for "{{ query }}"</p>
        <p class="text-xs mt-1">Try different keywords or check your spelling</p>
      </div>

      <!-- Results -->
      <div class="space-y-2">
        <!-- Venue results -->
        <template v-if="displayedVenues.length">
          <p v-if="activeTab === 'all'" class="text-xs text-[#96BEE6]/70 uppercase tracking-wider mt-2 mb-1">Venues</p>
          <button
            v-for="result in displayedVenues"
            :key="'v-' + result.item.id"
            @click="navigateToVenue(result.item)"
            class="w-full text-left bg-[#041e3e] border border-[#0a2a52] rounded-xl p-3 hover:border-[#1e407c]/50 transition-colors"
          >
            <div class="flex items-start gap-3">
              <img v-if="result.item.photoUrls.length" :src="result.item.photoUrls[0]" class="w-12 h-12 object-cover rounded-lg shrink-0" />
              <div v-else class="w-12 h-12 bg-[#0a2a52] rounded-lg shrink-0 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-[#4a7aa5]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-0.5">
                  <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-[#0a2a52] text-[#96BEE6] capitalize">{{ result.item.type }}</span>
                  <span class="text-[10px] text-[#1e407c]">Venue</span>
                </div>
                <h4 class="font-medium text-white truncate text-sm">{{ result.item.name }}</h4>
                <p v-if="result.item.address" class="text-xs text-[#96BEE6]/70 truncate">{{ result.item.address }}</p>
                <div v-if="result.item.labels?.length" class="flex flex-wrap gap-1 mt-1">
                  <span v-for="label in result.item.labels.slice(0, 3)" :key="label" class="text-[10px] px-1.5 py-0.5 rounded-full bg-[#1e407c]/30 text-[#96BEE6]/80">{{ label }}</span>
                </div>
              </div>
              <div v-if="result.item.rating" class="shrink-0">
                <StarRating :rating="result.item.rating" size="sm" />
              </div>
            </div>
          </button>
        </template>

        <!-- Item results -->
        <template v-if="displayedItems.length">
          <p v-if="activeTab === 'all'" class="text-xs text-[#96BEE6]/70 uppercase tracking-wider mt-3 mb-1">Collection</p>
          <button
            v-for="result in displayedItems"
            :key="'i-' + result.item.id"
            @click="navigateToItem(result.item)"
            class="w-full text-left bg-[#041e3e] border border-[#0a2a52] rounded-xl p-3 hover:border-[#1e407c]/50 transition-colors"
          >
            <div class="flex items-start gap-3">
              <img v-if="result.item.photoUrls?.length" :src="result.item.photoUrls[0]" class="w-12 h-12 object-cover rounded-lg shrink-0" />
              <div v-else class="w-12 h-12 bg-[#0a2a52] rounded-lg shrink-0 flex items-center justify-center">
                <span class="text-xs text-[#96BEE6]/70 capitalize">{{ result.item.type.slice(0, 3) }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-0.5">
                  <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-[#0a2a52] text-[#96BEE6] capitalize">{{ result.item.type }}</span>
                </div>
                <h4 class="font-medium text-white truncate text-sm">{{ result.item.name }}</h4>
                <p v-if="result.item.brand" class="text-xs text-[#96BEE6]/70 truncate">{{ result.item.brand }}</p>
                <p v-if="result.item.venue?.name" class="text-xs text-[#4a7aa5]/60 truncate">{{ result.item.venue.name }}</p>
              </div>
              <div v-if="result.item.userRating" class="shrink-0">
                <StarRating :rating="result.item.userRating" size="sm" />
              </div>
            </div>
          </button>
        </template>
      </div>
    </div>

    <!-- Initial state hints -->
    <div v-else class="text-[#96BEE6]/70 text-center py-12 space-y-3">
      <p>Search across your collection and venues</p>
      <div class="text-xs space-y-1 text-[#4a7aa5]/60">
        <p>Try: "old fashioned", "speakeasy", "chocolate cake"</p>
        <p>Search by name, type, brand, tags, venue, or label</p>
      </div>
    </div>
  </div>
</template>
