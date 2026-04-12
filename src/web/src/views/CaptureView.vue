<script setup lang="ts">
import { ref, inject } from 'vue'
import { useCamera } from '../composables/useCamera'
import { useLocation } from '../composables/useLocation'
import { useCapturesStore } from '../stores/captures'
import { capturesApi } from '../services/captures'
import { RefreshKey } from '../composables/refreshKey'

const { photos, previews, addFromInput, removePhoto, clearPhotos } = useCamera()
const { location, isLocating, requestLocation } = useLocation()
const capturesStore = useCapturesStore()
const registerRefresh = inject(RefreshKey)

registerRefresh?.(async () => { requestLocation() })

const userNote = ref('')
const isSubmitting = ref(false)
const showSuccess = ref(false)
const lastCaptureId = ref<string | null>(null)

// Auto-request location on mount
requestLocation()

async function uploadPhotos(): Promise<string[]> {
  const urls: string[] = []

  for (const photo of photos.value) {
    const { data } = await capturesApi.getUploadUrl(photo.name)

    const headers: Record<string, string> = {
      'Content-Type': photo.type,
    }

    // Add Azure blob header for SAS uploads, auth header for local dev uploads
    if (data.uploadUrl.includes('blob.core.windows.net') || data.uploadUrl.includes('devstoreaccount')) {
      headers['x-ms-blob-type'] = 'BlockBlob'
    } else {
      // Local dev upload — needs JWT auth
      const token = localStorage.getItem('whiskey_and_smokes_token')
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }

    await fetch(data.uploadUrl, {
      method: 'PUT',
      headers,
      body: photo,
    })

    urls.push(data.blobUrl)
  }

  return urls
}

async function submit() {
  if (photos.value.length === 0 && !userNote.value.trim()) return

  isSubmitting.value = true
  try {
    const photoUrls = await uploadPhotos()

    const capture = await capturesStore.createCapture({
      photos: photoUrls,
      userNote: userNote.value || undefined,
      location: location.value || undefined,
    })

    // Reset form
    clearPhotos()
    userNote.value = ''
    lastCaptureId.value = capture.id
    showSuccess.value = true
    setTimeout(() => { showSuccess.value = false }, 8000)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="p-4 max-w-lg mx-auto">

    <!-- Success toast -->
    <div v-if="showSuccess" class="bg-green-900/50 border border-green-700 text-green-300 px-4 py-3 rounded-xl mb-4 text-sm flex items-center justify-between">
      <span>Captured successfully. Processing your entry.</span>
      <router-link
        v-if="lastCaptureId"
        :to="`/history/${lastCaptureId}`"
        class="text-[#96BEE6] hover:text-[#96BEE6] font-medium ml-3 whitespace-nowrap"
      >View progress</router-link>
    </div>

    <!-- Photo Capture -->
    <div class="mb-6">
      <label class="block text-sm text-[#96BEE6] mb-2">Photos</label>

      <!-- Photo previews -->
      <div v-if="previews.length" class="flex gap-2 mb-3 overflow-x-auto pb-2">
        <div v-for="(preview, index) in previews" :key="index" class="relative shrink-0">
          <img :src="preview" class="w-20 h-20 object-cover rounded-lg" />
          <button
            @click="removePhoto(index)"
            class="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
          >×</button>
        </div>
      </div>

      <!-- Camera / Gallery buttons -->
      <div class="flex gap-3">
        <label class="flex-1 bg-[#0a2a52] hover:bg-[#1e407c] border border-[#1e407c]/50 rounded-xl py-4 flex flex-col items-center cursor-pointer transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 mb-1 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <circle cx="12" cy="13" r="3" />
          </svg>
          <span class="text-xs text-[#96BEE6]">Camera</span>
          <input type="file" accept="image/*" capture="environment" multiple @change="addFromInput" class="hidden" />
        </label>

        <label class="flex-1 bg-[#0a2a52] hover:bg-[#1e407c] border border-[#1e407c]/50 rounded-xl py-4 flex flex-col items-center cursor-pointer transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 mb-1 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span class="text-xs text-[#96BEE6]">Gallery</span>
          <input type="file" accept="image/*" multiple @change="addFromInput" class="hidden" />
        </label>
      </div>
    </div>

    <!-- Quick Note -->
    <div class="mb-6">
      <label class="block text-sm text-[#96BEE6] mb-2">Quick Note <span class="text-[#4a7aa5]/60">(optional)</span></label>
      <textarea
        v-model="userNote"
        placeholder="Amazing old fashioned here, also tried a Lagavulin 16..."
        rows="5"
        class="w-full bg-[#0a2a52] border border-[#1e407c]/50 rounded-xl px-4 py-3 text-white placeholder-[#4a7aa5] focus:outline-none focus:border-[#1e407c] resize-none"
      />
    </div>

    <!-- Location indicator -->
    <div class="mb-6 flex items-center gap-2 text-sm">
      <span v-if="isLocating" class="text-[#96BEE6]/70">Getting location...</span>
      <span v-else-if="location" class="text-green-500">Location captured</span>
      <span v-else class="text-[#4a7aa5]/60">Location unavailable</span>
    </div>

    <!-- Submit -->
    <button
      @click="submit"
      :disabled="isSubmitting || (photos.length === 0 && !userNote.trim())"
      class="w-full bg-[#1e407c] hover:bg-[#2a5299] disabled:bg-[#1e407c] disabled:text-[#96BEE6]/70 text-white font-semibold py-4 rounded-xl transition-colors text-lg"
    >
      {{ isSubmitting ? 'Uploading...' : 'Capture' }}
    </button>
  </div>
</template>
