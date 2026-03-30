import api from './api'

export interface GeoLocation {
  latitude: number
  longitude: number
}

export interface CreateCaptureRequest {
  photos: string[]
  userNote?: string
  location?: GeoLocation
}

export interface WorkflowStep {
  stepId: string
  agentName: string
  status: 'pending' | 'running' | 'complete' | 'error'
  summary?: string
  detail?: string
  timestamp: string
}

export interface CaptureResponse {
  id: string
  status: string
  photos: string[]
  userNote?: string
  location?: GeoLocation
  itemIds: string[]
  workflowSteps: WorkflowStep[]
  processingError?: string
  createdAt: string
}

export interface UploadUrlResponse {
  uploadUrl: string
  blobUrl: string
}

export const capturesApi = {
  getUploadUrl: (fileName: string) =>
    api.get<UploadUrlResponse>('/captures/upload-url', { params: { fileName } }),

  create: (data: CreateCaptureRequest) =>
    api.post<CaptureResponse>('/captures', data),

  get: (id: string) =>
    api.get<CaptureResponse>(`/captures/${id}`),

  list: (continuationToken?: string) =>
    api.get<{ items: CaptureResponse[]; continuationToken?: string; hasMore: boolean }>(
      '/captures', { params: { continuationToken } }
    ),
}
