<script setup lang="ts">
import { onMounted } from 'vue'
import { useCapturesStore } from '../stores/captures'

const capturesStore = useCapturesStore()

onMounted(() => {
  capturesStore.loadCaptures(true)
})

function statusColor(status: string) {
  switch (status) {
    case 'completed': return 'text-green-400'
    case 'processing': return 'text-amber-400'
    case 'failed': return 'text-red-400'
    default: return 'text-stone-400'
  }
}

function statusIcon(status: string) {
  switch (status) {
    case 'completed': return '✅'
    case 'processing': return '⏳'
    case 'failed': return '❌'
    default: return '🔄'
  }
}
</script>

<template>
  <div class="p-4 max-w-lg mx-auto">
    <h2 class="text-xl font-semibold mb-4">Capture History</h2>

    <div v-if="capturesStore.isLoading && !capturesStore.captures.length" class="text-stone-500 text-center py-12">
      Loading...
    </div>

    <div v-else-if="!capturesStore.captures.length" class="text-stone-500 text-center py-12">
      <p class="text-4xl mb-3">📸</p>
      <p>No captures yet. Head to Capture to get started!</p>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="capture in capturesStore.captures"
        :key="capture.id"
        class="bg-stone-900 border border-stone-800 rounded-xl p-4"
      >
        <div class="flex items-start justify-between mb-2">
          <span :class="statusColor(capture.status)" class="text-sm">
            {{ statusIcon(capture.status) }} {{ capture.status }}
          </span>
          <span class="text-xs text-stone-600">
            {{ new Date(capture.createdAt).toLocaleDateString() }}
          </span>
        </div>

        <div v-if="capture.photos.length" class="flex gap-1 mb-2 overflow-x-auto">
          <img
            v-for="(photo, i) in capture.photos.slice(0, 4)"
            :key="i"
            :src="photo"
            class="w-12 h-12 object-cover rounded"
          />
          <span v-if="capture.photos.length > 4" class="text-stone-500 text-xs self-center ml-1">
            +{{ capture.photos.length - 4 }}
          </span>
        </div>

        <p v-if="capture.userNote" class="text-sm text-stone-400 line-clamp-2">
          {{ capture.userNote }}
        </p>

        <div v-if="capture.itemIds.length" class="mt-2">
          <router-link
            v-for="itemId in capture.itemIds"
            :key="itemId"
            :to="`/items/${itemId}`"
            class="text-xs text-amber-500 hover:text-amber-400 mr-2"
          >
            View item →
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
