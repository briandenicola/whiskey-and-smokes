import api from './api';
export const venuesApi = {
    list: (type, continuationToken) => api.get('/venues', { params: { type, continuationToken } }),
    get: (id) => api.get(`/venues/${id}`),
    create: (data) => api.post('/venues', data),
    update: (id, data) => api.put(`/venues/${id}`, data),
    delete: (id) => api.delete(`/venues/${id}`),
    getItems: (id, continuationToken) => api.get(`/venues/${id}/items`, { params: { continuationToken } }),
    getPhotoUploadUrl: (id, fileName) => api.get(`/venues/${id}/photos/upload-url`, { params: { fileName } }),
    addPhoto: (id, blobUrl) => api.post(`/venues/${id}/photos`, { blobUrl }),
    removePhoto: (id, blobUrl) => api.delete(`/venues/${id}/photos`, { data: { blobUrl } }),
    createFromUrl: (url) => api.post('/venues/from-url', { url }),
};
