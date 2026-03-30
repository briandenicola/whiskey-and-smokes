import api from './api'

export interface User {
  id: string
  displayName: string
  email: string
  role: string
  preferences: {
    favoriteTypes: string[]
    defaultView: string
  }
  createdAt: string
  updatedAt: string
}

export const usersApi = {
  getMe: () => api.get<User>('/users/me'),

  updateMe: (data: { displayName?: string; preferences?: User['preferences'] }) =>
    api.put<User>('/users/me', data),

  // Admin
  listUsers: () => api.get<User[]>('/admin/users'),

  updateRole: (userId: string, role: string) =>
    api.put<User>(`/admin/users/${userId}/role`, { role }),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/users/me/password', data),
}
