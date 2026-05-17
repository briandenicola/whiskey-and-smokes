import api from './api'

export interface RecommendationRequest {
  preferences?: string
  menuPhoto?: string
  itemTypes?: string[]
  limit?: number
}

export interface RecommendedItem {
  name: string
  type: string
  brand?: string
  category?: string
  confidence: number
  reason: string
  similarToItemId?: string
  matchedFromMenu: boolean
}

export interface RecommendationResponse {
  recommendations: RecommendedItem[]
  reasoning?: string
  basedOnItems: string[]
  extractedMenuItems?: string[]
}

export interface UserRatingProfile {
  userId: string
  topRatedItems: Array<{
    itemId: string
    name: string
    type: string
    brand?: string
    category?: string
    rating: number
    details?: string
    aiSummary?: string
  }>
  itemTypePreferences: Record<
    string,
    {
      count: number
      averageRating: number
      topRated: string[]
    }
  >
  averageRating: number
  totalRatedItems: number
}

export const recommendationsApi = {
  getRecommendations: (request: RecommendationRequest) =>
    api.post<RecommendationResponse>('/recommendations', request),

  getUserProfile: () => api.get<UserRatingProfile>('/recommendations/profile'),

  extractMenuItems: (photoUrl: string) =>
    api.post<string[]>('/recommendations/extract-menu', { photoUrl }),
}
