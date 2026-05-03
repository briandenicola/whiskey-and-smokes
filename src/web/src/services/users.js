import api from './api';
export const usersApi = {
    getMe: () => api.get('/users/me'),
    updateMe: (data) => api.put('/users/me', data),
    // API Keys
    listApiKeys: () => api.get('/users/me/api-keys'),
    createApiKey: (name) => api.post('/users/me/api-keys', { name }),
    revokeApiKey: (keyId) => api.delete(`/users/me/api-keys/${keyId}`),
    // Admin - Users
    listUsers: () => api.get('/admin/users'),
    updateRole: (userId, role) => api.put(`/admin/users/${userId}/role`, { role }),
    resetPassword: (userId, newPassword) => api.put(`/admin/users/${userId}/password`, { newPassword }),
    deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
    // Admin - Prompts
    listPrompts: () => api.get('/admin/prompts'),
    updatePrompt: (id, content) => api.put(`/admin/prompts/${id}`, { content }),
    // Admin - Logging
    getLoggingSettings: () => api.get('/admin/logging'),
    updateLoggingSettings: (settings) => api.put('/admin/logging', settings),
    changePassword: (data) => api.put('/users/me/password', data),
    exportData: () => api.get('/users/me/export', { responseType: 'blob' }),
    getStats: () => api.get('/users/me/stats'),
    getDashboard: () => api.get('/users/me/dashboard'),
    getRatingDistribution: () => api.get('/users/me/stats/ratings-distribution'),
    // Admin - Foundry
    getFoundryStatus: () => api.get('/admin/foundry'),
    testFoundryConnectivity: () => api.post('/admin/foundry/test'),
};
