import { Request, Response } from 'express';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { AuthenticatedRequest } from './AuthMiddleware';

export class AuthController {
  public static async login(req: Request, res: Response) {
    return res.status(400).json({ error: 'Please log in directly via the frontend using Firebase Authentication.' });
  }

  public static async logout(req: AuthenticatedRequest, res: Response) {
    return res.status(200).json({ success: true, message: 'Logged out.' });
  }

  public static async refresh(req: Request, res: Response) {
    return res.status(400).json({ error: 'Token refresh is managed directly by Firebase client-side SDK.' });
  }

  public static async me(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }
    return res.status(200).json({ success: true, user: req.user });
  }

  public static async changePassword(req: AuthenticatedRequest, res: Response) {
    return res.status(200).json({ success: true, message: 'Password changed successfully.' });
  }

  public static async resetPassword(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized.' });
      }

      const { targetUserId, targetUsername, newPassword } = req.body;
      const uid = targetUserId;
      if (!uid) {
        return res.status(400).json({ error: 'Target user ID (uid) is required.' });
      }

      const db = getFirestore();
      const userDoc = await db.collection('users').doc(uid).get();
      if (!userDoc.exists) {
        return res.status(404).json({ error: 'Target user not found.' });
      }

      const userData = userDoc.data();
      const resetterRole = req.user.role;
      const targetRole = userData?.role;

      const isSuperAdmin = resetterRole === 'SUPER_ADMIN';
      const isAdmin = resetterRole === 'ADMIN';
      let allowed = false;
      if (isSuperAdmin) {
        allowed = true;
      } else if (isAdmin) {
        allowed = targetRole === 'TEACHER' || targetRole === 'RECEPTIONIST' || targetRole === 'STUDENT';
      }

      if (!allowed) {
        return res.status(403).json({ error: 'Forbidden: You do not have permission to reset this user\'s password.' });
      }

      const generatedPass = newPassword || `Sunshine@${Math.floor(Math.random() * 900 + 100)}`;

      await getAuth().updateUser(uid, {
        password: generatedPass
      });

      await db.collection('users').doc(uid).set({
        mustChangePassword: true,
        forcePasswordChange: true,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      return res.status(200).json({
        success: true,
        message: 'Password reset successfully.',
        tempPassword: generatedPass,
        mustChangePassword: true
      });
    } catch (err: any) {
      console.error('[AuthController.resetPassword] Error:', err);
      return res.status(500).json({ error: err.message || 'Failed to reset password.' });
    }
  }

  public static async unlockAccount(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized.' });
      }

      const role = req.user.role;
      if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
        return res.status(403).json({ error: 'Forbidden: Only administrators can unlock accounts.' });
      }

      const { targetUserId } = req.body;
      const uid = targetUserId;
      if (!uid) {
        return res.status(400).json({ error: 'Target user ID is required.' });
      }

      const db = getFirestore();
      
      await db.collection('users').doc(uid).set({
        isLocked: false,
        status: 'ACTIVE',
        updatedAt: new Date().toISOString()
      }, { merge: true });

      await getAuth().updateUser(uid, {
        disabled: false
      });

      return res.status(200).json({
        success: true,
        message: 'Account unlocked successfully.'
      });
    } catch (err: any) {
      console.error('[AuthController.unlockAccount] Error:', err);
      return res.status(500).json({ error: err.message || 'Failed to unlock account.' });
    }
  }
}
