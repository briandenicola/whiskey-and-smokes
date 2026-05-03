import api from './api';
export const itemsApi = {
    list: (type, continuationToken, status) => api.get('/items', { params: { type, continuationToken, status } }),
    get: (id) => api.get(`/items/${id}`),
    update: (id, data) => api.put(`/items/${id}`, data),
    delete: (id) => api.delete(`/items/${id}`),
    createWishlistItem: (data) => api.post('/items/wishlist', data),
    extractWishlistFromUrl: (url) => api.post('/items/wishlist/from-url', { url }),
    convertWishlistItem: (id) => api.post(`/items/${id}/convert`),
    getSuggestions: () => api.get('/items/suggestions'),
    getPhotoUploadUrl: (id, fileName) => api.get(`/items/${id}/photos/upload-url`, { params: { fileName } }),
    addPhoto: (id, blobUrl) => api.post(`/items/${id}/photos`, { blobUrl }),
    removePhoto: (id, blobUrl) => api.delete(`/items/${id}/photos`, { data: { blobUrl } }),
};
