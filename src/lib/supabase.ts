import { createClient } from '@supabase/supabase-js';
import { SyncService } from '../services/SyncService';

const metaEnv = (import.meta as any).env || {};

// Check environment variables first, then localStorage for runtime configurability
const envUrl = metaEnv.VITE_SUPABASE_URL || '';
const envAnonKey = metaEnv.VITE_SUPABASE_ANON_KEY || '';

const localUrl = typeof window !== 'undefined' ? localStorage.getItem('sunshine_supabase_url') || '' : '';
const localAnonKey = typeof window !== 'undefined' ? localStorage.getItem('sunshine_supabase_anon_key') || '' : '';

export const supabaseUrl = envUrl || localUrl;
export const supabaseAnonKey = envAnonKey || localAnonKey;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// ============================================================================
// Cookie and Token Session Helpers
// ============================================================================

function isSecureContext(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.protocol === 'https:';
}

export function setAuthCookie(name: string, value: string, days: number = 7): void {
  if (typeof document === 'undefined') return;
  const isSecure = isSecureContext();
  const maxAge = value ? days * 24 * 60 * 60 : 0;
  const secureFlag = isSecure ? '; Secure' : '';
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

// In-memory token storage (JWT Bearer tokens for authenticated API requests)
let cachedIdToken: string | null = null;
let cachedAccessToken: string | null = null;

export const getCachedIdToken = (): string | null => {
  if (cachedIdToken) return cachedIdToken;
  if (typeof window !== 'undefined') {
    const stored = sessionStorage.getItem('sunshine_access_token') || 
                   localStorage.getItem('sunshine_access_token') ||
                   getAuthCookie('sunshine_access_token') ||
                   getAuthCookie('sunshine_token');
    if (stored) {
      cachedIdToken = stored;
      return stored;
    }
  }
  return null;
};

export const setCachedIdToken = (token: string | null): void => {
  cachedIdToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      sessionStorage.setItem('sunshine_access_token', token);
      localStorage.setItem('sunshine_access_token', token);
      setAuthCookie('sunshine_access_token', token, 7);
    } else {
      sessionStorage.removeItem('sunshine_access_token');
      localStorage.removeItem('sunshine_access_token');
      clearAuthCookie('sunshine_access_token');
      clearAuthCookie('sunshine_token');
    }
  }
};

export const getCachedAccessToken = (): string | null => cachedAccessToken || getCachedIdToken();
export const setCachedAccessToken = (token: string | null): void => {
  cachedAccessToken = token;
  setCachedIdToken(token);
};
export const clearCachedAccessToken = (): void => {
  cachedAccessToken = null;
  setCachedIdToken(null);
};

// ============================================================================
// Supabase Client Initialization
// ============================================================================

let supabaseClient: any = null;

if (isSupabaseConfigured) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    console.log('[Supabase Client] Successfully initialized Supabase client with URL:', supabaseUrl);

    // Synchronize initial session token
    supabaseClient.auth.getSession().then(({ data }: any) => {
      if (data?.session?.access_token) {
        setCachedIdToken(data.session.access_token);
      }
    }).catch(() => {});

    // Listen to token changes
    supabaseClient.auth.onAuthStateChange((_event: string, session: any) => {
      if (session?.access_token) {
        setCachedIdToken(session.access_token);
      } else {
        setCachedIdToken(null);
      }
    });
  } catch (error) {
    console.error('[Supabase Client] Failed to initialize Supabase client:', error);
  }
} else {
  console.warn(
    '[Supabase Client] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not configured yet. ' +
    'Please configure Supabase variables in .env or the Admin Settings to connect your live database.'
  );

  // Provide a graceful Proxy fallback so calls don't crash when Supabase is initializing
  supabaseClient = new Proxy({} as any, {
    get: (target, prop) => {
      if (prop === 'auth') {
        return {
          getSession: async () => ({ data: { session: null }, error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
          signInWithPassword: async () => ({ data: { user: null, session: null }, error: new Error('Supabase is not configured. Please set your Supabase URL & Anon Key in settings.') }),
          signUp: async () => ({ data: { user: null, session: null }, error: new Error('Supabase is not configured.') }),
          signOut: async () => ({ error: null }),
          updateUser: async () => ({ data: { user: null }, error: new Error('Supabase is not configured.') }),
          getUser: async () => ({ data: { user: null }, error: null }),
          signInWithOAuth: async () => ({ data: null, error: new Error('Supabase OAuth is not configured.') })
        };
      }
      if (prop === 'storage') {
        return {
          from: (_bucket: string) => ({
            upload: async () => ({ data: null, error: new Error('Supabase Storage is not configured.') }),
            getPublicUrl: (path: string) => ({ data: { publicUrl: path } }),
            download: async () => ({ data: null, error: new Error('Supabase Storage is not configured.') }),
            remove: async () => ({ data: null, error: null }),
            list: async () => ({ data: [], error: null })
          })
        };
      }

      return (...args: any[]) => {
        return {
          select: () => ({
            eq: () => ({ single: async () => ({ data: null, error: null }), maybeSingle: async () => ({ data: null, error: null }) }),
            single: async () => ({ data: null, error: null }),
            maybeSingle: async () => ({ data: null, error: null }),
            order: () => ({ limit: async () => ({ data: [], error: null }) }),
            then: (resolve: any) => resolve({ data: [], error: null })
          }),
          insert: () => ({ select: () => ({ single: async () => ({ data: args[0], error: null }) }), then: (resolve: any) => resolve({ data: args[0], error: null }) }),
          upsert: () => ({ select: () => ({ single: async () => ({ data: args[0], error: null }) }), then: (resolve: any) => resolve({ data: args[0], error: null }) }),
          update: () => ({ eq: () => ({ select: () => ({ single: async () => ({ data: args[0], error: null }) }), then: (resolve: any) => resolve({ data: args[0], error: null }) }) }),
          delete: () => ({ eq: async () => ({ data: null, error: null }) }),
        };
      };
    }
  });
}

export const supabase = supabaseClient;

// ============================================================================
// Supabase Authentication Wrappers & Compatibility Handlers
// ============================================================================

export const browserLocalPersistence = 'LOCAL';
export const browserSessionPersistence = 'SESSION';
export const inMemoryPersistence = 'NONE';
export const indexedDBLocalPersistence = 'INDEXEDDB';

let currentPersistenceMode: string = browserLocalPersistence;

export async function setPersistence(_authObj: any, persistence: string): Promise<void> {
  currentPersistenceMode = persistence;
  if (typeof window !== 'undefined' && persistence === browserSessionPersistence) {
    localStorage.removeItem('sunshine_access_token');
  }
}

type AuthStateListener = (user: any) => void;
const authListeners: Set<AuthStateListener> = new Set();

export function onAuthStateChanged(_authObj: any, callback: AuthStateListener): () => void {
  authListeners.add(callback);
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
      console.warn('[Supabase Auth] Listener callback error:', e);
    }
  });
}

export const auth = {
  currentUser: null as any,
  signOut: async () => {
    clearCachedAccessToken();
    notifyAuthStateChange(null);
    try {
      await supabase.auth.signOut();
    } catch (e) {}
  }
};

export function getAuth() {
  return auth;
}

export const db = {} as any;

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

// ============================================================================
// Supabase Unified Storage Operations
// ============================================================================

export interface SupabaseStorageUploadOptions {
  bucket?: string;
  folder?: string;
  upsert?: boolean;
  contentType?: string;
}

export interface SupabaseStorageUploadResult {
  url: string;
  path: string;
  bucket: string;
  name: string;
  size?: number;
  type?: string;
}

const DEFAULT_STORAGE_BUCKET = 'sunshine-media';

/**
 * Upload a file, image, or document to Supabase Storage
 */
export async function uploadToSupabaseStorage(
  file: File | Blob,
  fileName: string,
  options: SupabaseStorageUploadOptions = {}
): Promise<SupabaseStorageUploadResult> {
  const bucket = options.bucket || DEFAULT_STORAGE_BUCKET;
  const folder = options.folder ? `${options.folder.replace(/\/+$/, '')}/` : '';
  const cleanName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filePath = `${folder}${Date.now()}_${cleanName}`;

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
        upsert: options.upsert !== undefined ? options.upsert : true,
        contentType: options.contentType || (file instanceof File ? file.type : 'application/octet-stream')
      });

      if (error) {
        console.warn(`[Supabase Storage] Upload error to bucket "${bucket}":`, error.message);
        throw error;
      }

      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data?.path || filePath);
      return {
        url: urlData.publicUrl,
        path: data?.path || filePath,
        bucket,
        name: cleanName,
        size: (file as any).size,
        type: (file as any).type
      };
    } catch (e: any) {
      console.warn('[Supabase Storage] Falling back to base64 DataURL:', e.message);
    }
  }

  // Graceful fallback to DataURL for offline / unconfigured environments
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      resolve({
        url: dataUrl,
        path: filePath,
        bucket,
        name: cleanName,
        size: (file as any).size,
        type: (file as any).type
      });
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Retrieve public URL for a file in Supabase Storage
 */
export function getSupabaseStoragePublicUrl(path: string, bucket: string = DEFAULT_STORAGE_BUCKET): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  if (!isSupabaseConfigured) return path;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data?.publicUrl || path;
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFromSupabaseStorage(path: string, bucket: string = DEFAULT_STORAGE_BUCKET): Promise<boolean> {
  if (!isSupabaseConfigured || !path) return true;
  try {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    return !error;
  } catch (e) {
    console.warn('[Supabase Storage] Delete error:', e);
    return false;
  }
}

/**
 * List files in a Supabase Storage bucket/folder
 */
export async function listSupabaseStorageFiles(folder: string = '', bucket: string = DEFAULT_STORAGE_BUCKET): Promise<any[]> {
  if (!isSupabaseConfigured) return [];
  try {
    const { data, error } = await supabase.storage.from(bucket).list(folder);
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.warn('[Supabase Storage] List error:', e);
    return [];
  }
}

// ============================================================================
// Generic Document & Collection Persistence Helpers via SyncService
// ============================================================================

export async function fetchCollection<T>(collectionName: string): Promise<T[]> {
  return await SyncService.list<T>(collectionName);
}

export async function saveDocument(collectionName: string, id: string, data: any): Promise<void> {
  await SyncService.set(collectionName, id, data, { merge: true });
}

export async function addDocument(collectionName: string, data: any): Promise<string> {
  const newId = data.id || `doc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  await SyncService.set(collectionName, newId, { ...data, id: newId });
  return newId;
}

export async function seedDatabaseIfEmpty(
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

export const seedFirestoreIfEmpty = seedDatabaseIfEmpty;
