<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useItemsStore } from '../stores/items'
import { itemsApi, type Item } from '../services/items'

const route = useRoute()
const router = useRouter()
const itemsStore = useItemsStore()

const item = ref<Item | null>(null)
const isEditing = ref(false)
const isSaving = ref(false)
const editRating = ref(0)
const editNotes = ref('')

onMounted(async () => {
  const { data } = await itemsApi.get(route.params.id as string)
  item.value = data
  editRating.value = data.userRating ?? 0
  editNotes.value = data.userNotes ?? ''
})

async function save() {
  if (!item.value) return
  isSaving.value = true
  try {
    const updated = await itemsStore.updateItem(item.value.id, {
      userRating: editRating.value || undefined,
      userNotes: editNotes.value || undefined,
      status: 'reviewed',
    })
    item.value = updated
    isEditing.value = false
  } finally {
    isSaving.value = false
  }
}

async function deleteItem() {
  if (!item.value || !confirm('Delete this item?')) return
  await itemsStore.deleteItem(item.value.id)
  router.push('/items')
}
</script>

<template>
  <div v-if="!item" class="p-4 text-stone-500 text-center py-12">Loading...</div>

  <div v-else class="p-4 max-w-lg mx-auto">
    <!-- Back -->
    <button @click="router.back()" class="text-stone-400 hover:text-stone-200 text-sm mb-4">
      ← Back
    </button>

    <!-- Photos -->
    <div v-if="item.photoUrls.length" class="mb-4 -mx-4">
      <div class="flex gap-2 overflow-x-auto px-4 pb-2">
        <img
          v-for="(url, i) in item.photoUrls"
          :key="i"
          :src="url"
          class="h-48 object-cover rounded-xl"
        />
      </div>
    </div>

    <!-- Header -->
    <div class="mb-4">
      <span class="text-xs px-2 py-0.5 rounded-full bg-stone-800 text-stone-400">{{ item.type }}</span>
      <span v-if="item.status === 'ai-draft'" class="text-xs text-amber-500 ml-2">AI Draft — tap edit to review</span>
      <h2 class="text-2xl font-bold mt-2">{{ item.name }}</h2>
      <p v-if="item.brand" class="text-stone-400">{{ item.brand }}</p>
      <p v-if="item.category" class="text-sm text-stone-500">{{ item.category }}</p>
    </div>

    <!-- AI Summary -->
    <div v-if="item.aiSummary" class="bg-stone-900 border border-stone-800 rounded-xl p-4 mb-4">
      <p class="text-xs text-amber-500 mb-1">🤖 AI Summary</p>
      <p class="text-sm text-stone-300">{{ item.aiSummary }}</p>
      <p v-if="item.aiConfidence" class="text-xs text-stone-600 mt-2">
        Confidence: {{ Math.round(item.aiConfidence * 100) }}%
      </p>
    </div>

    <!-- Venue -->
    <div v-if="item.venue" class="mb-4">
      <p class="text-sm text-stone-500">📍 {{ item.venue.name }}</p>
      <p v-if="item.venue.address" class="text-xs text-stone-600">{{ item.venue.address }}</p>
    </div>

    <!-- Rating & Notes (view/edit) -->
    <div v-if="!isEditing" class="space-y-3">
      <div v-if="item.userRating" class="text-amber-500 text-lg">
        {{ '★'.repeat(item.userRating) }}{{ '☆'.repeat(5 - item.userRating) }}
      </div>
      <p v-if="item.userNotes" class="text-stone-300 text-sm">{{ item.userNotes }}</p>

      <div class="flex gap-3 pt-4">
        <button
          @click="isEditing = true"
          class="flex-1 bg-amber-700 hover:bg-amber-600 text-white py-3 rounded-xl font-medium"
        >
          {{ item.status === 'ai-draft' ? 'Review & Rate' : 'Edit' }}
        </button>
        <button
          @click="deleteItem"
          class="px-4 bg-stone-800 hover:bg-stone-700 text-red-400 py-3 rounded-xl"
        >
          🗑️
        </button>
      </div>
    </div>

    <!-- Edit mode -->
    <div v-else class="space-y-4">
      <!-- Star rating -->
      <div>
        <label class="block text-sm text-stone-400 mb-2">Rating</label>
        <div class="flex gap-1">
          <button
            v-for="star in 5"
            :key="star"
            @click="editRating = star"
            class="text-3xl transition-colors"
            :class="star <= editRating ? 'text-amber-500' : 'text-stone-700'"
          >★</button>
        </div>
      </div>

      <!-- Notes -->
      <div>
        <label class="block text-sm text-stone-400 mb-2">Your Notes</label>
        <textarea
          v-model="editNotes"
          rows="4"
          placeholder="What did you think? Flavor notes, pairing, occasion..."
          class="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-700 resize-none"
        />
      </div>

      <div class="flex gap-3">
        <button
          @click="save"
          :disabled="isSaving"
          class="flex-1 bg-amber-700 hover:bg-amber-600 disabled:bg-stone-700 text-white py-3 rounded-xl font-medium"
        >
          {{ isSaving ? 'Saving...' : 'Save' }}
        </button>
        <button @click="isEditing = false" class="px-6 bg-stone-800 hover:bg-stone-700 text-stone-300 py-3 rounded-xl">
          Cancel
        </button>
      </div>
    </div>

    <!-- Tags -->
    <div v-if="item.tags.length" class="mt-4 flex gap-2 flex-wrap">
      <span v-for="tag in item.tags" :key="tag" class="text-xs bg-stone-800 text-stone-400 px-2 py-1 rounded-full">
        {{ tag }}
      </span>
    </div>
  </div>
</template>
