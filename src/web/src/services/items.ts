import api from './api'

export interface Item {
  id: string
  userId: string
  captureId: string
  type: string
  name: string
  brand?: string
  category?: string
  details?: Record<string, unknown>
  venue?: {
    name: string
    address?: string
    placeId?: string
  }
  photoUrls: string[]
  aiConfidence?: number
  aiSummary?: string
  userRating?: number
  userNotes?: string
  tags: string[]
  status: string
  createdAt: string
  updatedAt: string
}

export interface UpdateItemRequest {
  name?: string
  brand?: string
  category?: string
  userRating?: number
  userNotes?: string
  tags?: string[]
  status?: string
}

export const itemsApi = {
  list: (type?: string, continuationToken?: string) =>
    api.get<{ items: Item[]; continuationToken?: string; hasMore: boolean }>(
      '/items', { params: { type, continuationToken } }
    ),

  get: (id: string) =>
    api.get<Item>(`/items/${id}`),

  update: (id: string, data: UpdateItemRequest) =>
    api.put<Item>(`/items/${id}`, data),

  delete: (id: string) =>
    api.delete(`/items/${id}`),
}
