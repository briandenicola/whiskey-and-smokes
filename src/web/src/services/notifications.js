import api from './api';
export const notificationsApi = {
    list: (limit = 50) => api.get('/notifications', { params: { limit } }),
    unreadCount: () => api.get('/notifications/unread-count'),
    markRead: (id) => api.put(`/notifications/${id}/read`),
    markAllRead: () => api.put('/notifications/read-all'),
};
