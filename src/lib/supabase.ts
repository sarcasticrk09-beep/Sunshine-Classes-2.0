import { createClient } from '@supabase/supabase-js';

const metaEnv = (import.meta as any).env || {};

// Check environment variables first, then localStorage for runtime configurability
const envUrl = metaEnv.VITE_SUPABASE_URL || '';
const envAnonKey = metaEnv.VITE_SUPABASE_ANON_KEY || '';

const localUrl = typeof window !== 'undefined' ? localStorage.getItem('sunshine_supabase_url') || '' : '';
const localAnonKey = typeof window !== 'undefined' ? localStorage.getItem('sunshine_supabase_anon_key') || '' : '';

export const supabaseUrl = envUrl || localUrl;
export const supabaseAnonKey = envAnonKey || localAnonKey;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

let supabaseClient: any = null;

// Helper to determine if running under HTTPS (e.g. Railway, Cloud Run, custom domain)
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

