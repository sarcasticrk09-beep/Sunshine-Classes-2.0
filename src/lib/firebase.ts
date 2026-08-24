/// <reference types="vite/client" />
import { SyncService } from "../services/SyncService";
import { supabase } from "./supabase";

// Standard Firebase Auth Persistence Types
export const browserLocalPersistence = 'LOCAL';
export const browserSessionPersistence = 'SESSION';
export const inMemoryPersistence = 'NONE';
export const indexedDBLocalPersistence = 'INDEXEDDB';

let currentPersistenceMode: string = browserLocalPersistence;

// Helper to determine if running under HTTPS (e.g. Railway, Cloud Run, custom domain)
function isSecureContext(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.protocol === 'https:';
}

// Cross-domain cookie helper for session tokens
export function setAuthCookie(name: string, value: string, days: number = 7): void {
  if (typeof document === 'undefined') return;
  const isSecure = isSecureContext();
  const maxAge = value ? days * 24 * 60 * 60 : 0;
  const secureFlag = isSecure ? '; Secure' : '';
  // SameSite=Lax ensures cookies are sent on top-level navigations across domains/subdomains
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax${secureFlag}`;
}

export function getAuthCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

export function clearAuthCookie(name: string): void {
  if (typeof document === 'undefined') return;
  const isSecure = isSecureContext();
  const secureFlag = isSecure ? '; Secure' : '';
  document.cookie = `${name}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${secureFlag}`;
}

// In-memory token storage with storage & cookie synchronization
let cachedAccessToken: string | null = null;
let cachedIdToken: string | null = null;

export const getCachedAccessToken = (): string | null => {
  if (cachedAccessToken) return cachedAccessToken;
  if (typeof window !== 'undefined') {
    const token = sessionStorage.getItem('sunshine_access_token') || 
                  localStorage.getItem('sunshine_access_token') ||
                  getAuthCookie('sunshine_access_token') ||
                  getAuthCookie('sunshine_token');
    if (token) {
      cachedAccessToken = token;
      return token;
    }
  }
  return null;
};

export const setCachedAccessToken = (token: string | null): void => {
  cachedAccessToken = token;
  setCachedIdToken(token);
};

export function clearCachedAccessToken(): void {
  cachedAccessToken = null;
  setCachedIdToken(null);
}

export const getCachedIdToken = (): string | null => {
  if (cachedIdToken) return cachedIdToken;
  if (typeof window !== 'undefined') {
    const token = sessionStorage.getItem('sunshine_access_token') || 
                  localStorage.getItem('sunshine_access_token') ||
                  getAuthCookie('sunshine_access_token') ||
                  getAuthCookie('sunshine_token');
    if (token) {
      cachedIdToken = token;
      return token;
    }
  }
  return null;
};

export const setCachedIdToken = (token: string | null): void => {
  cachedIdToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      if (currentPersistenceMode === browserLocalPersistence) {
        localStorage.setItem('sunshine_access_token', token);
      }
      sessionStorage.setItem('sunshine_access_token', token);
      setAuthCookie('sunshine_access_token', token, 7);
    } else {
      sessionStorage.removeItem('sunshine_access_token');
      localStorage.removeItem('sunshine_access_token');
      clearAuthCookie('sunshine_access_token');
      clearAuthCookie('sunshine_token');
    }
  }
};

export async function setPersistence(_authObj: any, persistence: string): Promise<void> {
  currentPersistenceMode = persistence;
  if (typeof window !== 'undefined' && persistence === browserSessionPersistence) {
    localStorage.removeItem('sunshine_access_token');
  }
}

// Authentication state listeners for Firebase Auth compatibility
type AuthStateListener = (user: any) => void;
const authListeners: Set<AuthStateListener> = new Set();

export function onAuthStateChanged(_authObj: any, callback: AuthStateListener): () => void {
  authListeners.add(callback);
  // Initial check from active session
  if (typeof window !== 'undefined') {
    try {
      const activeSession = sessionStorage.getItem('sunshine_active_session') || localStorage.getItem('sunshine_active_session');
      if (activeSession) {
        const parsed = JSON.parse(activeSession);
        callback(parsed?.user || null);
      } else {
        callback(null);
      }
    } catch {
      callback(null);
    }
  }
  return () => {
    authListeners.delete(callback);
  };
}

export function notifyAuthStateChange(user: any): void {
  authListeners.forEach((listener) => {
    try {
      listener(user);
    } catch (e) {
      console.warn('[Firebase Auth] Listener callback error:', e);
    }
  });
}

export const auth = {
  currentUser: null as any,
  signOut: async () => {
    clearCachedAccessToken();
    notifyAuthStateChange(null);
    await supabase.auth.signOut();
  }
};

export function getAuth() {
  return auth;
}

export const db = {} as any;

/**
 * Generic helper to fetch all items in a collection.
 */
export async function fetchCollection<T>(collectionName: string): Promise<T[]> {
  return await SyncService.list<T>(collectionName);
}

/**
 * Generic helper to save or update an item in a collection by ID.
 */
export async function saveDocument(collectionName: string, id: string, data: any): Promise<void> {
  await SyncService.set(collectionName, id, data, { merge: true });
}

/**
 * Generic helper to add a new document.
 */
export async function addDocument(collectionName: string, data: any): Promise<string> {
  const newId = data.id || `doc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  await SyncService.set(collectionName, newId, { ...data, id: newId });
  return newId;
}

/**
 * Seeds collection with default local SEED data if collection is currently empty.
 */
export async function seedFirestoreIfEmpty(
  collectionName: string, 
  seedData: any[]
): Promise<boolean> {
  try {
    const list = await SyncService.list(collectionName);
    if (list.length === 0 && seedData.length > 0) {
      for (const item of seedData) {
        const id = item.id || `seed-${Math.random().toString(36).substr(2, 9)}`;
        await SyncService.set(collectionName, id, item);
      }
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error seeding collection ${collectionName}:`, error);
    return false;
  }
}

export async function googleSignIn(): Promise<any> {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google'
  });
  if (error) throw error;
  return data;
}

export async function googleSignInForGmail(): Promise<{ user: { email?: string }; accessToken: string }> {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      scopes: 'https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly'
    }
  });
  if (error) throw error;
  const token = (data as any)?.session?.provider_token || (data as any)?.session?.access_token || '';
  const email = (data as any)?.session?.user?.email || '';
  if (token) {
    setCachedAccessToken(token);
  }
  return { user: { email }, accessToken: token };
}

