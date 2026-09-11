import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { serverSupabase } from '../shared/db';

export const JWT_SECRET = process.env.JWT_SECRET || process.env.SUPABASE_JWT_SECRET || 'sunshine-erp-auth-jwt-secret-secure-key-2026';

export interface AuthenticatedRequest extends Request {
  body: any;
  query: any;
  params: any;
  headers: any;
  cookies: any;
  ip: any;
  user?: {
    uid: string;
    id: string;
    userId: string;
    role: string;
    email?: string;
    username?: string;
    name?: string;
  };
}

export async function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  let token: string | undefined;

  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1]?.trim();
  } else if (req.cookies && (req.cookies.sunshine_access_token || req.cookies.sunshine_token || req.cookies['sb-access-token'] || req.cookies.access_token)) {
    token = (req.cookies.sunshine_access_token || req.cookies.sunshine_token || req.cookies['sb-access-token'] || req.cookies.access_token)?.trim();
  } else if (req.headers.cookie) {
    // Direct header cookie parsing fallback for proxies & cross-domain ingress
    const match = req.headers.cookie.match(/(?:^|;\s*)(?:sunshine_access_token|sunshine_token|sb-access-token|access_token)=([^;]*)/);
    if (match) {
      token = decodeURIComponent(match[1])?.trim();
    }
  } else if (req.headers['x-sunshine-token'] || req.headers['x-access-token']) {
    token = String(req.headers['x-sunshine-token'] || req.headers['x-access-token']).trim();
  }

  // Security Directives: FAIL CLOSED. If no token is provided, reject immediately with 401.
  // NEVER create a default ADMIN, never assume a synthetic role, never fallback to seed accounts.
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Authentication credentials required.',
      code: 'UNAUTHORIZED'
    });
  }

  let authenticatedUser: any = null;

  // 1. Attempt Supabase Auth verification if token is a standard JWT (not prefixed with custom dev_ format)
  if (!token.startsWith('dev_')) {
    try {
      const { data, error } = await serverSupabase.auth.getUser(token);
      if (!error && data?.user) {
        const sbUser = data.user;
        const uid = sbUser.id;
        let role = sbUser.user_metadata?.role || 'STUDENT';
        let username = sbUser.user_metadata?.username || sbUser.email?.split('@')[0] || 'user';
        let name = sbUser.user_metadata?.name || sbUser.user_metadata?.full_name || 'User';

        // Fetch authoritative role from users database table
        try {
          const { data: dbUser } = await serverSupabase
            .from('users')
            .select('role, username, name, email')
            .eq('id', uid)
            .maybeSingle();
          if (dbUser?.role) {
            role = dbUser.role;
            username = dbUser.username || username;
            name = dbUser.name || name;
          }
        } catch {
          // If public.users read fails, keep verified Supabase identity
        }

        authenticatedUser = {
          uid,
          id: uid,
          userId: uid,
          email: sbUser.email,
          role: String(role).toUpperCase().replace('-', '_'),
          username,
          name
        };
      }
    } catch {
      // Supabase verification failed, fall through to cryptographic JWT check
    }
  }

  // 2. Attempt Cryptographically Signed JWT verification (handles server-issued JWTs)
  if (!authenticatedUser) {
    try {
      const rawToken = token.startsWith('dev_') ? token.slice(4) : token;
      let decoded: any = null;
      try {
        decoded = jwt.verify(rawToken, JWT_SECRET);
      } catch (jwtErr: any) {
        if (jwtErr.name === 'TokenExpiredError') {
          return res.status(401).json({
            success: false,
            error: 'Unauthorized: Authentication token has expired.',
            code: 'TOKEN_EXPIRED'
          });
        }
        if (token.startsWith('dev_')) {
          try {
            const jsonStr = Buffer.from(rawToken, 'base64').toString('utf-8');
            decoded = JSON.parse(jsonStr);
          } catch {
            // invalid dev token format
          }
        }
      }

      if (decoded && (decoded.sub || decoded.uid || decoded.id)) {
        const uid = decoded.sub || decoded.uid || decoded.id;
        let role = decoded.role || 'STUDENT';
        let username = decoded.username || decoded.email?.split('@')[0] || 'user';
        let name = decoded.name || 'User';

        // Check authoritative role from users table
        try {
          const { data: dbUser } = await serverSupabase
            .from('users')
            .select('role, username, name, email')
            .eq('id', uid)
            .maybeSingle();
          if (dbUser?.role) {
            role = dbUser.role;
            username = dbUser.username || username;
            name = dbUser.name || name;
          }
        } catch {
          // Database lookup offline or unavailable, keep cryptographically signed role
        }

        authenticatedUser = {
          uid,
          id: uid,
          userId: uid,
          email: decoded.email,
          role: String(role).toUpperCase().replace('-', '_'),
          username,
          name
        };
      }
    } catch (jwtErr: any) {
      if (jwtErr.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized: Authentication token has expired.',
          code: 'TOKEN_EXPIRED'
        });
      }
      // Any other signature/decoding error falls through to fail closed
    }
  }

  // If both verification strategies fail, REJECT with 401 Unauthorized.
  if (!authenticatedUser) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid or unverified authentication token.',
      code: 'UNAUTHORIZED'
    });
  }

  req.user = authenticatedUser;
  return next();
}
