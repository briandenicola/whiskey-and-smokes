import { ref } from 'vue'

export function useCamera() {
  const photos = ref<File[]>([])
  const previews = ref<string[]>([])

  function addFromInput(event: Event) {
    const input = event.target as HTMLInputElement
    if (!input.files) return

    for (const file of Array.from(input.files)) {
      photos.value.push(file)
      previews.value.push(URL.createObjectURL(file))
    }
    input.value = ''
  }

  function removePhoto(index: number) {
    URL.revokeObjectURL(previews.value[index])
    photos.value.splice(index, 1)
    previews.value.splice(index, 1)
  }

  function clearPhotos() {
    previews.value.forEach(url => URL.revokeObjectURL(url))
    photos.value = []
    previews.value = []
  }

  return { photos, previews, addFromInput, removePhoto, clearPhotos }
}
