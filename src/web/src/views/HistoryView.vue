<script setup lang="ts">
import { inject, onMounted } from 'vue'
import { useCapturesStore } from '../stores/captures'
import { RefreshKey } from '../composables/refreshKey'

const capturesStore = useCapturesStore()
const registerRefresh = inject(RefreshKey)

registerRefresh?.(() => capturesStore.loadCaptures(true))

onMounted(() => {
  capturesStore.loadCaptures(true)
})

function statusColor(status: string) {
  switch (status) {
    case 'completed': return 'text-green-400'
    case 'processing': return 'text-[#96BEE6]'
    case 'failed': return 'text-red-400'
    default: return 'text-[#96BEE6]'
  }
}

function statusLabel(status: string) {
  switch (status) {
    case 'completed': return 'Complete'
    case 'processing': return 'Processing'
    case 'failed': return 'Failed'
    default: return 'Pending'
  }
}
</script>

<template>
  <div class="p-4 max-w-lg mx-auto">
    <h2 class="text-xl font-semibold mb-4">Capture History</h2>

    <div v-if="capturesStore.isLoading && !capturesStore.captures.length" class="text-[#96BEE6]/70 text-center py-12">
      Loading...
    </div>

    <div v-else-if="!capturesStore.captures.length" class="text-[#96BEE6]/70 text-center py-12">
      <p>No captures yet. Head to Capture to get started!</p>
    </div>

    <div v-else class="space-y-3">
      <router-link
        v-for="capture in capturesStore.captures"
        :key="capture.id"
        :to="`/history/${capture.id}`"
        class="block bg-[#041e3e] border border-[#0a2a52] rounded-xl p-4 hover:border-[#1e407c]/50 transition-colors"
      >
        <div class="flex items-start justify-between mb-2">
          <span :class="statusColor(capture.status)" class="text-sm">
            {{ statusLabel(capture.status) }}
          </span>
          <span class="text-xs text-[#4a7aa5]/60">
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
          <span v-if="capture.photos.length > 4" class="text-[#96BEE6]/70 text-xs self-center ml-1">
            +{{ capture.photos.length - 4 }}
          </span>
        </div>

        <p v-if="capture.userNote" class="text-sm text-[#96BEE6] line-clamp-2">
          {{ capture.userNote }}
        </p>

        <div class="flex items-center justify-between mt-2">
          <span v-if="capture.workflowSteps?.length" class="text-xs text-[#4a7aa5]/60">
            {{ capture.workflowSteps.length }} workflow step(s)
          </span>
          <span v-if="capture.itemIds.length" class="text-xs text-[#96BEE6]">
            {{ capture.itemIds.length }} item(s) →
          </span>
        </div>
      </router-link>
    </div>
  </div>
</template>
