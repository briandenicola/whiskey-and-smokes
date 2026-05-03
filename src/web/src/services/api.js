import axios from 'axios';
import { getStoredToken, refreshAccessToken } from './auth';
const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});
// Attach JWT token to requests
api.interceptors.request.use((config) => {
    const token = getStoredToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
// Handle 401 responses — attempt silent refresh before redirecting to login.
// All concurrent 401s share the same refresh call via refreshAccessToken().
api.interceptors.response.use((response) => response, async (error) => {
    const originalRequest = error.config;
    const url = originalRequest?.url ?? '';
    const isAuthEndpoint = url.includes('/auth/');
    if (error.response?.status !== 401 || isAuthEndpoint || originalRequest._retry) {
        return Promise.reject(error);
    }
    originalRequest._retry = true;
    const result = await refreshAccessToken();
    if (result) {
        originalRequest.headers.Authorization = `Bearer ${result.token}`;
        return api(originalRequest);
    }
    // Refresh failed — check if auth was definitively cleared (401/400 from server)
    if (!getStoredToken()) {
        window.location.href = '/login';
    }
    return Promise.reject(error);
});
export default api;
