import api from './api';
export const capturesApi = {
    getUploadUrl: (fileName) => api.get('/captures/upload-url', { params: { fileName } }),
    create: (data) => api.post('/captures', data),
    get: (id) => api.get(`/captures/${id}`),
    reprocess: (id) => api.post(`/captures/${id}/reprocess`),
    list: (continuationToken) => api.get('/captures', { params: { continuationToken } }),
};
