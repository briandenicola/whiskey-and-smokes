import axios from 'axios'
import api from './api'
import type { User } from './users'

export interface RegisterRequest {
  email: string
  password: string
  displayName: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  refreshToken: string
  expiresAt: string
  user: User
}

const TOKEN_KEY = 'whiskey_and_smokes_token'
const REFRESH_TOKEN_KEY = 'whiskey_and_smokes_refresh_token'
const EXPIRES_AT_KEY = 'whiskey_and_smokes_expires_at'
const USER_KEY = 'whiskey_and_smokes_user'

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function getStoredRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function getStoredExpiresAt(): string | null {
  return localStorage.getItem(EXPIRES_AT_KEY)
}

export function getStoredUser(): User | null {
  const data = localStorage.getItem(USER_KEY)
  if (!data) return null
  try {
    return JSON.parse(data)
  } catch {
    localStorage.removeItem(USER_KEY)
    return null
  }
}

export function storeAuth(auth: AuthResponse) {
  localStorage.setItem(TOKEN_KEY, auth.token)
  localStorage.setItem(REFRESH_TOKEN_KEY, auth.refreshToken)
  localStorage.setItem(EXPIRES_AT_KEY, auth.expiresAt)
  localStorage.setItem(USER_KEY, JSON.stringify(auth.user))
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(EXPIRES_AT_KEY)
  localStorage.removeItem(USER_KEY)
}

// ---------------------------------------------------------------------------
// Shared single-flight token refresh
// ---------------------------------------------------------------------------
// Only one refresh call can be in-flight at a time within this tab.
// All callers (timer, interceptor) await the same promise.
let refreshPromise: Promise<AuthResponse | null> | null = null

/**
 * Attempt to refresh the access token. Deduplicates concurrent calls so only
 * one network request is made at a time. Returns the new AuthResponse on
 * success, or null on failure.
 *
 * Only clears stored auth on a definitive 401 from the refresh endpoint.
 * Transient errors (network, 5xx) return null without clearing — the caller
 * can retry later or let the 401-interceptor handle it on the next API call.
 */
export function refreshAccessToken(): Promise<AuthResponse | null> {
  if (refreshPromise) return refreshPromise

  refreshPromise = doRefreshWithRetry().finally(() => {
    refreshPromise = null
  })
  return refreshPromise
}

const MAX_REFRESH_RETRIES = 2
const RETRY_BASE_MS = 1_000

async function doRefreshWithRetry(): Promise<AuthResponse | null> {
  const originalToken = getStoredToken()
  const originalRefresh = getStoredRefreshToken()
  if (!originalToken || !originalRefresh) return null

  for (let attempt = 0; attempt <= MAX_REFRESH_RETRIES; attempt++) {
    // Before retrying, check if another tab already refreshed successfully
    const currentToken = getStoredToken()
    if (attempt > 0 && currentToken && currentToken !== originalToken) {
      // Another tab (or a concurrent call) already got a new token
      return {
        token: currentToken,
        refreshToken: getStoredRefreshToken()!,
        expiresAt: getStoredExpiresAt()!,
        user: getStoredUser()!,
      }
    }

    try {
      // Re-read refresh token each attempt — may have been updated by storage event
      const accessToken = getStoredToken() ?? originalToken
      const refreshToken = getStoredRefreshToken() ?? originalRefresh

      const { data } = await axios.post<AuthResponse>('/api/auth/refresh', {
        accessToken,
        refreshToken,
      })

      storeAuth(data)
      return data
    } catch (err: unknown) {
      const status = axios.isAxiosError(err) ? err.response?.status : undefined

      // Definitive auth failure — don't retry
      if (status === 401 || status === 400) {
        clearAuth()
        return null
      }

      // Transient error — retry after backoff (unless last attempt)
      if (attempt < MAX_REFRESH_RETRIES) {
        await new Promise((r) => setTimeout(r, RETRY_BASE_MS * (attempt + 1)))
      }
    }
  }

  // All retries exhausted with transient errors — don't clear auth,
  // the token might still be valid or the network might recover.
  return null
}

export const authApi = {
  register: (data: RegisterRequest) =>
    api.post<AuthResponse>('/auth/register', data),

  login: (data: LoginRequest) =>
    api.post<AuthResponse>('/auth/login', data),

  entraLogin: (accessToken: string) =>
    api.post<AuthResponse>('/auth/entra', { accessToken }),
}
