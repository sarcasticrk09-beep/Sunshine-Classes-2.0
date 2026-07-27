import { createClient } from '@supabase/supabase-js';

const metaEnv = (import.meta as any).env || {};

const supabaseUrl = metaEnv.VITE_SUPABASE_URL;
const supabaseAnonKey = metaEnv.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

let supabaseClient: any = null;

if (isSupabaseConfigured) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    console.log('[Supabase Client] Successfully initialized Supabase client.');
  } catch (error) {
    console.error('[Supabase Client] Failed to initialize Supabase client:', error);
  }
} else {
  console.warn(
    '[Supabase Client] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing from environment variables. ' +
    'The application is running in hybrid fallback mode. Please configure Supabase variables in .env to connect to your live database.'
  );

  // Provide a graceful Proxy fallback so that accessing 'supabase' properties doesn't throw immediate errors on load.
  supabaseClient = new Proxy({} as any, {
    get: (target, prop) => {
      return (...args: any[]) => {
        const errorMsg = `[Supabase Call Error] Supabase is not configured yet. Checked property: "${String(prop)}". Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your env variables.`;
        console.error(errorMsg);
        
        // Return a mock Promise that resolves with a structured error for standard queries
        return Promise.resolve({
          data: null,
          error: {
            message: errorMsg,
            details: 'Missing environment variables.',
            hint: 'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your local .env file.',
            code: 'MISSING_ENV_VARS'
          }
        });
      };
    }
  });
}

export const supabase = supabaseClient;
