import { PublicClientApplication, type Configuration, type AuthenticationResult } from '@azure/msal-browser'
import api from './api'

interface EntraConfig {
  clientId: string
  authority: string
  scopes: string[]
}

let msalInstance: PublicClientApplication | null = null
let entraConfig: EntraConfig | null = null

export async function initializeMsal(): Promise<boolean> {
  try {
    const response = await api.get<EntraConfig>('/auth/entra/config')
    entraConfig = response.data

    const msalConfig: Configuration = {
      auth: {
        clientId: entraConfig.clientId,
        authority: entraConfig.authority,
        redirectUri: window.location.origin,
        postLogoutRedirectUri: window.location.origin,
      },
      cache: {
        cacheLocation: 'localStorage',
      },
    }

    msalInstance = new PublicClientApplication(msalConfig)
    await msalInstance.initialize()
    return true
  } catch {
    // Entra ID not configured — that's fine, local auth only
    return false
  }
}

export function isEntraConfigured(): boolean {
  return msalInstance !== null && entraConfig !== null
}

export async function loginWithEntra(): Promise<AuthenticationResult> {
  if (!msalInstance || !entraConfig) {
    throw new Error('Entra ID is not configured')
  }

  const result = await msalInstance.loginPopup({
    scopes: entraConfig.scopes,
  })

  return result
}

export async function logoutEntra(): Promise<void> {
  if (msalInstance) {
    const accounts = msalInstance.getAllAccounts()
    if (accounts.length > 0) {
      await msalInstance.logoutPopup({
        account: accounts[0],
      })
    }
  }
}
