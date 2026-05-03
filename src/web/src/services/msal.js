import { PublicClientApplication } from '@azure/msal-browser';
import api from './api';
let msalInstance = null;
let entraConfig = null;
export async function initializeMsal() {
    try {
        const response = await api.get('/auth/entra/config');
        entraConfig = response.data;
        const msalConfig = {
            auth: {
                clientId: entraConfig.clientId,
                authority: entraConfig.authority,
                redirectUri: window.location.origin,
                postLogoutRedirectUri: window.location.origin,
            },
            cache: {
                cacheLocation: 'localStorage',
            },
        };
        msalInstance = new PublicClientApplication(msalConfig);
        await msalInstance.initialize();
        return true;
    }
    catch {
        // Entra ID not configured — that's fine, local auth only
        return false;
    }
}
export function isEntraConfigured() {
    return msalInstance !== null && entraConfig !== null;
}
export async function loginWithEntra() {
    if (!msalInstance || !entraConfig) {
        throw new Error('Entra ID is not configured');
    }
    const result = await msalInstance.loginPopup({
        scopes: entraConfig.scopes,
    });
    return result;
}
export async function logoutEntra() {
    if (msalInstance) {
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length > 0) {
            await msalInstance.logoutPopup({
                account: accounts[0],
            });
        }
    }
}
