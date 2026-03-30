import { defineStore } from 'pinia'
import { ref } from 'vue'
import { itemsApi, type Item, type UpdateItemRequest } from '../services/items'

export const useItemsStore = defineStore('items', () => {
  const items = ref<Item[]>([])
  const isLoading = ref(false)
  const continuationToken = ref<string | undefined>()

  async function loadItems(type?: string, reset = false) {
    if (reset) {
      items.value = []
      continuationToken.value = undefined
    }

    isLoading.value = true
    try {
      const response = await itemsApi.list(type, continuationToken.value)
      items.value.push(...response.data.items)
      continuationToken.value = response.data.continuationToken ?? undefined
    } finally {
      isLoading.value = false
    }
  }

  async function updateItem(id: string, data: UpdateItemRequest) {
    const response = await itemsApi.update(id, data)
    const index = items.value.findIndex(i => i.id === id)
    if (index !== -1) {
      items.value[index] = response.data
    }
    return response.data
  }

  async function deleteItem(id: string) {
    await itemsApi.delete(id)
    items.value = items.value.filter(i => i.id !== id)
  }

  return { items, isLoading, loadItems, updateItem, deleteItem }
})
