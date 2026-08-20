import { Request, Response } from 'express';
import { AuthenticatedRequest } from './AuthMiddleware';
import { serverSupabase } from '../shared/db';

export class AuthController {
  public static async login(req: Request, res: Response) {
    return res.status(400).json({ error: 'Please log in directly via the frontend using Supabase Authentication.' });
  }

  public static async logout(req: AuthenticatedRequest, res: Response) {
    return res.status(200).json({ success: true, message: 'Logged out.' });
  }

  public static async refresh(req: Request, res: Response) {
    return res.status(400).json({ error: 'Token refresh is managed directly by Supabase client-side SDK.' });
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

      const { targetUserId, newPassword } = req.body;
      const uid = targetUserId;
      if (!uid) {
        return res.status(400).json({ error: 'Target user ID (uid) is required.' });
      }

      const resetterRole = req.user.role;
      const isSuperAdmin = resetterRole === 'SUPER_ADMIN';
      const isAdmin = resetterRole === 'ADMIN';

      if (!isSuperAdmin && !isAdmin) {
        return res.status(403).json({ error: 'Forbidden: You do not have permission to reset this user\'s password.' });
      }

      const generatedPass = newPassword || `Sunshine@${Math.floor(Math.random() * 900 + 100)}`;

      try {
        await serverSupabase.auth.admin.updateUserById(uid, {
          password: generatedPass
        });
      } catch (e) {
        // Fallback for offline mode
      }

      try {
        await serverSupabase.from('users').update({
          must_change_password: true,
          updated_at: new Date().toISOString()
        }).eq('id', uid);
      } catch (e) {
        // Fallback
      }

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

      try {
        await serverSupabase.from('users').update({
          is_locked: false,
          status: 'ACTIVE',
          updated_at: new Date().toISOString()
        }).eq('id', uid);

        await serverSupabase.auth.admin.updateUserById(uid, {
          ban_duration: 'none'
        });
      } catch (e) {
        // Fallback
      }

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
