// @ts-nocheck
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ActivationPayload {
  uid: string;
  email: string;
  exp: number; // Unix timestamp in seconds
}

// Verify HMAC token
async function verifyHmacToken(tokenStr: string, secret: string): Promise<ActivationPayload | null> {
  try {
    const parts = tokenStr.split('.');
    if (parts.length !== 2) return null;

    const [payloadB64, signature] = parts;
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);

    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const payloadData = encoder.encode(payloadB64);
    
    // Decode base64 signature
    const binarySig = Uint8Array.from(atob(signature.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));

    const isValid = await crypto.subtle.verify('HMAC', key, binarySig, payloadData);
    if (!isValid) return null;

    const payloadJson = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'));
    const payload: ActivationPayload = JSON.parse(payloadJson);

    // Check expiration (24 hours window)
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      console.warn('[ActivateUser Edge Function] Token expired for user:', payload.uid);
      return null;
    }

    return payload;
  } catch (err) {
    console.error('[ActivateUser Edge Function] Token verification error:', err);
    return null;
  }
}

serve(async (req: Request) => {
  // Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    const redirectParam = url.searchParams.get('redirect') || 'true';

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Activation token is required.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const secretKey = Deno.env.get('ACTIVATION_JWT_SECRET') || serviceRoleKey || 'sunshine_activation_secret_key_2026';

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('[ActivateUser Edge Function] Missing Supabase environment variables.');
      return new Response(
        JSON.stringify({ error: 'Server configuration error.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify token
    const verifiedPayload = await verifyHmacToken(token, secretKey);
    if (!verifiedPayload) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired activation link. Please request a new verification email.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { uid, email } = verifiedPayload;

    // Initialize administrative Supabase client
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false }
    });

    // 1. Confirm user email in Supabase Auth
    try {
      await supabaseAdmin.auth.admin.updateUserById(uid, {
        email_confirm: true,
        user_metadata: { is_active: true, email_verified: true }
      });
    } catch (authErr) {
      console.warn('[ActivateUser Edge Function] Auth admin update notice:', authErr);
    }

    // 2. Update public users table (is_active = true, email_verified = true, status = 'ACTIVE')
    const { error: dbError } = await supabaseAdmin
      .from('users')
      .update({
        is_active: true,
        email_verified: true,
        status: 'ACTIVE',
        active: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', uid);

    if (dbError) {
      console.error('[ActivateUser Edge Function] DB update error:', dbError);
      // Fallback update by email
      await supabaseAdmin
        .from('users')
        .update({ is_active: true, email_verified: true, status: 'ACTIVE', active: true })
        .eq('email', email);
    }

    // Log security audit trail
    try {
      await supabaseAdmin.from('audit_logs').insert({
        id: `log-act-${Date.now()}`,
        user_id: uid,
        username: email,
        action: 'EMAIL_ACTIVATION_SUCCESS',
        details: `User email (${email}) successfully activated via secure Edge Function link.`,
        timestamp: new Date().toISOString()
      });
    } catch {}

    // If request specifies redirect, redirect to login page with activated banner
    if (redirectParam === 'true') {
      const appDomain = Deno.env.get('APP_URL') || 'https://sunshineclasses.net';
      const redirectUrl = `${appDomain}/login?activated=true&email=${encodeURIComponent(email)}`;
      return Response.redirect(redirectUrl, 302);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Account for ${email} activated successfully.`,
        uid
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('[ActivateUser Edge Function] Unhandled error:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error during account activation.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
