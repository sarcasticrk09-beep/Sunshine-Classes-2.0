import { createClient } from '@supabase/supabase-js';

const isStaging = process.env.APP_ENV === 'staging';

// When in staging, strictly use staging environment variables and prevent touching production
const supabaseUrl = isStaging
  ? (process.env.STAGING_SUPABASE_URL || '')
  : (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);

const supabaseServiceKey = isStaging
  ? (process.env.STAGING_SUPABASE_SERVICE_ROLE_KEY || '')
  : process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAnonKey = isStaging
  ? (process.env.STAGING_SUPABASE_ANON_KEY || '')
  : (process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY);

export const isSupabaseServerConfigured = !!(supabaseUrl && (supabaseServiceKey || supabaseAnonKey));

let supabaseServerClient: any = null;

if (isStaging && !supabaseUrl) {
  console.warn('[Supabase Server] APP_ENV=staging is set, but STAGING_SUPABASE_URL is not provided. Refusing to connect to production.');
}

if (isSupabaseServerConfigured) {
  try {
    // Prefer service role key for backend admin operations, fall back to anon key
    const finalKey = supabaseServiceKey || supabaseAnonKey!;
    supabaseServerClient = createClient(supabaseUrl!, finalKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    console.log(`[Supabase Server] Successfully initialized backend Supabase client (using ${supabaseServiceKey ? 'Service Role Key' : 'Anon Key'}).`);
  } catch (error) {
    console.error('[Supabase Server] Failed to initialize backend Supabase client:', error);
  }
} else {
  console.warn(
    '[Supabase Server] SUPABASE_URL and either SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY are missing from server environment variables. ' +
    'The server is running in hybrid fallback mode.'
  );

  supabaseServerClient = new Proxy({} as any, {
    get: (target, prop) => {
      return (...args: any[]) => {
        const errorMsg = `[Supabase Server Call Error] Server-side Supabase is not configured yet. Checked property: "${String(prop)}". Please define SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.`;
        console.error(errorMsg);
        
        return Promise.resolve({
          data: null,
          error: {
            message: errorMsg,
            details: 'Missing server-side environment variables.',
            hint: 'Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your local .env file or server environment.',
            code: 'MISSING_ENV_VARS'
          }
        });
      };
    }
  });
}

export const supabaseServer = supabaseServerClient;
export { supabaseUrl, supabaseAnonKey, supabaseServiceKey };
