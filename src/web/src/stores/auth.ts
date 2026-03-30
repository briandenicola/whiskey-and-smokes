import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi, storeAuth, clearAuth, getStoredToken, getStoredUser, type RegisterRequest, type LoginRequest } from '../services/auth'
import { usersApi, type User } from '../services/users'
import router from '../router'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(getStoredToken())
  const isLoading = ref(true)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  function initialize() {
    const storedUser = getStoredUser()
    if (storedUser && token.value) {
      user.value = storedUser
      loadUser()
    }
    isLoading.value = false
  }

  async function register(data: RegisterRequest) {
    error.value = null
    try {
      const response = await authApi.register(data)
      storeAuth(response.data)
      token.value = response.data.token
      user.value = response.data.user
      router.push('/')
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Registration failed'
      throw e
    }
  }

  async function login(data: LoginRequest) {
    error.value = null
    try {
      const response = await authApi.login(data)
      storeAuth(response.data)
      token.value = response.data.token
      user.value = response.data.user
      router.push('/')
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Login failed'
      throw e
    }
  }

  function logout() {
    clearAuth()
    token.value = null
    user.value = null
    router.push('/login')
  }

  async function loadUser() {
    try {
      const response = await usersApi.getMe()
      user.value = response.data
    } catch (e) {
      console.error('Failed to load user', e)
    }
  }

  return { user, isLoading, error, isAuthenticated, isAdmin, initialize, register, login, logout, loadUser }
})
