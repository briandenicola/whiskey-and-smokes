<script setup lang="ts">
import { ref, inject, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useItemsStore } from '../stores/items'
import { RefreshKey } from '../composables/refreshKey'

const router = useRouter()
const itemsStore = useItemsStore()
const activeFilter = ref<string | undefined>()
const activeTab = ref<'collection' | 'wishlist'>('collection')
const registerRefresh = inject(RefreshKey)

// Wishlist add form
const showAddForm = ref(false)
const newName = ref('')
const newType = ref('whiskey')
const newBrand = ref('')
const newNotes = ref('')
const isAdding = ref(false)

registerRefresh?.(async () => {
  if (activeTab.value === 'wishlist') {
    await itemsStore.loadWishlist(activeFilter.value, true)
  } else {
    await itemsStore.loadItems(activeFilter.value, true)
  }
})

const typeFilters = [
  { label: 'All', value: undefined },
  { label: 'Whiskey', value: 'whiskey' },
  { label: 'Wine', value: 'wine' },
  { label: 'Cocktail', value: 'cocktail' },
  { label: 'Cigar', value: 'cigar' },
]

const typeOptions = [
  { label: 'Whiskey', value: 'whiskey' },
  { label: 'Wine', value: 'wine' },
  { label: 'Cocktail', value: 'cocktail' },
  { label: 'Cigar', value: 'cigar' },
]

function setFilter(value?: string) {
  activeFilter.value = value
  if (activeTab.value === 'wishlist') {
    itemsStore.loadWishlist(value, true)
  } else {
    itemsStore.loadItems(value, true)
  }
}

function switchTab(tab: 'collection' | 'wishlist') {
  activeTab.value = tab
  activeFilter.value = undefined
  if (tab === 'wishlist') {
    itemsStore.loadWishlist(undefined, true)
  } else {
    itemsStore.loadItems(undefined, true)
  }
}

async function addWishlistItem() {
  if (!newName.value.trim()) return
  isAdding.value = true
  try {
    await itemsStore.createWishlistItem({
      name: newName.value.trim(),
      type: newType.value,
      brand: newBrand.value.trim() || undefined,
      notes: newNotes.value.trim() || undefined,
    })
    newName.value = ''
    newBrand.value = ''
    newNotes.value = ''
    showAddForm.value = false
  } finally {
    isAdding.value = false
  }
}

async function convertItem(id: string) {
  const item = await itemsStore.convertWishlistItem(id)
  router.push(`/items/${item.id}`)
}

async function deleteItem(id: string) {
  await itemsStore.deleteItem(id)
}

const displayItems = computed(() =>
  activeTab.value === 'wishlist' ? itemsStore.wishlistItems : itemsStore.items
)

const isLoadingList = computed(() =>
  activeTab.value === 'wishlist' ? itemsStore.isLoadingWishlist : itemsStore.isLoading
)

onMounted(() => {
  itemsStore.loadItems(undefined, true)
})
</script>

<template>
  <div class="p-4 max-w-lg mx-auto">
    <!-- Collection / Wishlist toggle -->
    <div class="flex bg-stone-900 border border-stone-800 rounded-xl p-1 mb-4">
      <button
        @click="switchTab('collection')"
        class="flex-1 py-2 rounded-lg text-sm font-medium transition-colors"
        :class="activeTab === 'collection' ? 'bg-amber-700 text-white' : 'text-stone-400 hover:text-stone-200'"
      >
        Collection
      </button>
      <button
        @click="switchTab('wishlist')"
        class="flex-1 py-2 rounded-lg text-sm font-medium transition-colors"
        :class="activeTab === 'wishlist' ? 'bg-amber-700 text-white' : 'text-stone-400 hover:text-stone-200'"
      >
        Wishlist
      </button>
    </div>

    <!-- Type filters -->
    <div class="flex gap-2 mb-4 overflow-x-auto pb-2">
      <button
        v-for="filter in typeFilters"
        :key="filter.label"
        @click="setFilter(filter.value)"
        class="shrink-0 px-3 py-1.5 rounded-full text-sm border transition-colors"
        :class="activeFilter === filter.value
          ? 'bg-amber-700 border-amber-600 text-white'
          : 'bg-stone-900 border-stone-700 text-stone-400 hover:border-stone-600'"
      >
        {{ filter.label }}
      </button>
    </div>

    <!-- Wishlist: Add button + form -->
    <div v-if="activeTab === 'wishlist'" class="mb-4">
      <button
        v-if="!showAddForm"
        @click="showAddForm = true"
        class="w-full bg-stone-900 border border-dashed border-stone-700 rounded-xl p-3 text-stone-400 hover:border-stone-500 hover:text-stone-300 transition-colors text-sm"
      >
        + Add to wishlist
      </button>

      <div v-else class="bg-stone-900 border border-stone-800 rounded-xl p-4 space-y-3">
        <input
          v-model="newName"
          placeholder="Name (required)"
          class="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5 text-stone-100 text-sm placeholder-stone-600 focus:outline-none focus:border-amber-700"
        />

        <div class="flex gap-2">
          <button
            v-for="opt in typeOptions"
            :key="opt.value"
            @click="newType = opt.value"
            class="px-3 py-1.5 rounded-full text-xs border transition-colors"
            :class="newType === opt.value
              ? 'bg-amber-700 border-amber-600 text-white'
              : 'bg-stone-800 border-stone-700 text-stone-400'"
          >
            {{ opt.label }}
          </button>
        </div>

        <input
          v-model="newBrand"
          placeholder="Brand (optional)"
          class="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5 text-stone-100 text-sm placeholder-stone-600 focus:outline-none focus:border-amber-700"
        />

        <input
          v-model="newNotes"
          placeholder="Notes (optional)"
          class="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5 text-stone-100 text-sm placeholder-stone-600 focus:outline-none focus:border-amber-700"
        />

        <div class="flex gap-2">
          <button
            @click="addWishlistItem"
            :disabled="isAdding || !newName.trim()"
            class="flex-1 bg-amber-700 hover:bg-amber-600 disabled:bg-stone-700 disabled:text-stone-500 text-white py-2.5 rounded-xl text-sm font-medium"
          >
            {{ isAdding ? 'Adding...' : 'Add' }}
          </button>
          <button
            @click="showAddForm = false"
            class="px-4 py-2.5 bg-stone-800 text-stone-400 rounded-xl text-sm hover:bg-stone-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="isLoadingList && !displayItems.length" class="text-stone-500 text-center py-12">
      Loading...
    </div>

    <!-- Empty states -->
    <div v-else-if="!displayItems.length" class="text-stone-500 text-center py-12">
      <p v-if="activeTab === 'wishlist'">No wishlist items yet. Add something you want to try.</p>
      <p v-else>No items yet. Capture something first!</p>
    </div>

    <!-- Item list -->
    <div v-else class="space-y-3">
      <!-- Collection items -->
      <template v-if="activeTab === 'collection'">
        <router-link
          v-for="item in displayItems"
          :key="item.id"
          :to="`/items/${item.id}`"
          class="block bg-stone-900 border border-stone-800 rounded-xl p-4 hover:border-stone-700 transition-colors"
        >
          <div class="flex items-start gap-3">
            <img
              v-if="item.photoUrls.length"
              :src="item.photoUrls[0]"
              class="w-16 h-16 object-cover rounded-lg shrink-0"
            />
            <div v-else class="w-16 h-16 bg-stone-800 rounded-lg shrink-0 flex items-center justify-center text-xs text-stone-500 uppercase">
              {{ item.type }}
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-xs px-2 py-0.5 rounded-full bg-stone-800 text-stone-400">{{ item.type }}</span>
                <span v-if="item.status === 'ai-draft'" class="text-xs text-amber-500">AI Draft</span>
              </div>
              <h3 class="font-medium text-stone-100 truncate">{{ item.name }}</h3>
              <p v-if="item.brand" class="text-sm text-stone-500 truncate">{{ item.brand }}</p>
              <div v-if="item.userRating" class="mt-1 text-amber-500 text-sm">
                {{ '\u2605'.repeat(item.userRating) }}{{ '\u2606'.repeat(5 - item.userRating) }}
              </div>
            </div>
          </div>
        </router-link>
      </template>

      <!-- Wishlist items -->
      <template v-else>
        <div
          v-for="item in displayItems"
          :key="item.id"
          class="bg-stone-900 border border-stone-800 rounded-xl p-4"
        >
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 bg-stone-800 rounded-lg shrink-0 flex items-center justify-center text-xs text-stone-500 uppercase">
              {{ item.type.slice(0, 1) }}
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-xs px-2 py-0.5 rounded-full bg-stone-800 text-stone-400">{{ item.type }}</span>
              </div>
              <h3 class="font-medium text-stone-100 truncate">{{ item.name }}</h3>
              <p v-if="item.brand" class="text-sm text-stone-500 truncate">{{ item.brand }}</p>
              <p v-if="item.userNotes" class="text-xs text-stone-600 mt-1 truncate">{{ item.userNotes }}</p>
            </div>
          </div>

          <div class="flex gap-2 mt-3">
            <button
              @click="convertItem(item.id)"
              class="flex-1 bg-amber-700 hover:bg-amber-600 text-white py-2 rounded-xl text-sm font-medium transition-colors"
            >
              Add to Collection
            </button>
            <button
              @click="deleteItem(item.id)"
              class="px-4 py-2 bg-stone-800 text-red-400 hover:bg-stone-700 rounded-xl text-sm transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
