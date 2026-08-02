import { Request, Response, NextFunction } from 'express';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

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

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && (req.cookies.sunshine_token || req.cookies.sunshine_access_token)) {
    token = req.cookies.sunshine_token || req.cookies.sunshine_access_token;
  }

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token.' });
  }

  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    
    // Fetch role and details from Firestore
    const userDoc = await getFirestore().collection('users').doc(decodedToken.uid).get();
    const userData = userDoc.exists ? userDoc.data() : null;

    req.user = {
      uid: decodedToken.uid,
      id: decodedToken.uid,
      userId: decodedToken.uid,
      email: decodedToken.email,
      role: userData?.role || 'STUDENT',
      username: userData?.username || decodedToken.email?.split('@')[0] || 'user',
      name: userData?.name || decodedToken.name || 'User',
    };
    
    next();
  } catch (err: any) {
    console.error('[authMiddleware] Token verification failed:', err.message);
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired Firebase ID Token.' });
  }
}
