import api from './api';
export const thoughtsApi = {
    getForTarget: (targetType, targetId, targetUserId) => api.get(`/thoughts/${targetType}/${targetId}`, { params: { targetUserId } }),
    create: (data) => api.post('/thoughts', data),
    update: (id, data) => api.put(`/thoughts/${id}`, data),
    remove: (id) => api.delete(`/thoughts/${id}`),
    mine: () => api.get('/thoughts/mine'),
    onMyItems: () => api.get('/thoughts/on-my-items'),
};
