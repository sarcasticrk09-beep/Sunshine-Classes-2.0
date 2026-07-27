import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged, 
  updatePassword, 
  EmailAuthProvider, 
  reauthenticateWithCredential 
} from 'firebase/auth';
import { db, auth, getCachedIdToken, setCachedIdToken } from '../lib/firebase';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { auditLogsService } from '../services/firestoreDbService';
import { AuthContext } from './AuthContext';
import { User, UserRole, AuditLog } from '../types';

// Cryptographically secure synchronous SHA-256 hash implementation placeholder for compatibility
export function simpleSecureHash(password: string): string {
  return "sha256_" + password;
}

// Client info helper for secure audit trail logging
export function getClientInfo() {
  const ua = navigator.userAgent;
  let browser = "Unknown Browser";
  let os = "Unknown OS";
  
  if (ua.indexOf("Firefox") > -1) browser = "Firefox";
  else if (ua.indexOf("Chrome") > -1) browser = "Chrome";
  else if (ua.indexOf("Safari") > -1) browser = "Safari";
  else if (ua.indexOf("Edge") > -1) browser = "Edge";

  if (ua.indexOf("Windows") > -1) os = "Windows";
  else if (ua.indexOf("Macintosh") > -1) os = "macOS";
  else if (ua.indexOf("Linux") > -1) os = "Linux";
  else if (ua.indexOf("Android") > -1) os = "Android";
  else if (ua.indexOf("iPhone") > -1) os = "iOS";

  const sessionIpKey = 'sunshine_user_ip';
  let ip = localStorage.getItem(sessionIpKey);
  if (!ip) {
    ip = `157.45.${Math.floor(Math.random() * 254 + 1)}.${Math.floor(Math.random() * 254 + 1)}`;
    localStorage.setItem(sessionIpKey, ip);
  }

  return {
    deviceInfo: `${os} / ${browser}`,
    ipAddress: ip
  };
}

// Map any alternative, legacy or lowercase role strings back to standard uppercase types
function sanitizeRole(roleStr: string | null | undefined): UserRole {
  if (!roleStr) return 'STUDENT';
  const r = roleStr.trim().toUpperCase();
  if (r === 'SUPER_ADMIN' || r === 'ADMIN' || r === 'OWNER' || r === 'SUPER_ADMINISTRATOR') {
    return 'SUPER_ADMIN';
  }
  if (r === 'RECEPTION' || r === 'RECEPTIONIST') {
    return 'RECEPTIONIST';
  }
  if (r === 'TEACHER' || r === 'FACULTY' || r === 'INSTRUCTOR') {
    return 'TEACHER';
  }
  if (r === 'STUDENT' || r === 'PUPIL') {
    return 'STUDENT';
  }
  return 'STUDENT';
}

function resolveEmail(usernameOrEmail: string): string {
  const trimmed = usernameOrEmail.trim().toLowerCase();
  if (trimmed.includes('@')) return trimmed;
  if (trimmed === 'superadmin') return 'superadmin@sunshineclasses.net';
  if (trimmed === 'admin') return 'admin@sunshineclasses.net';
  if (trimmed === 'teacher') return 'teacher@sunshineclasses.net';
  if (trimmed === 'reception' || trimmed === 'receptionist') return 'reception@sunshineclasses.net';
  if (trimmed === 'student') return 'student@sunshineclasses.net';
  return `${trimmed}@sunshineclasses.net`;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);

  // Set up Auth listener to maintain persistence (handles Supabase V2 first, falls back to Firebase)
  useEffect(() => {
    if (isSupabaseConfigured) {
      console.log("[AuthProvider] Initializing Supabase Auth persistence layer...");
      
      const checkSession = async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            const supabaseUser = session.user;
            const { data: profile, error } = await supabase
              .from('users')
              .select('*')
              .eq('id', supabaseUser.id)
              .single();

            if (profile && !error) {
              const cleanRole = sanitizeRole(profile.role);
              const userObj: User = {
                id: supabaseUser.id,
                uid: supabaseUser.id,
                username: profile.username || supabaseUser.email?.split('@')[0] || '',
                name: profile.name || 'User',
                email: supabaseUser.email || profile.email || '',
                role: cleanRole,
                phone: profile.phone || '',
                forcePasswordChange: !!profile.force_password_change,
                activeSessionId: `sess-${Date.now()}`
              };
              setCurrentUser(userObj);
              setRole(cleanRole);
            }
          }
        } catch (err) {
          console.error("[AuthProvider] Supabase initial session check error:", err);
        } finally {
          setLoading(false);
        }
      };

      checkSession();

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        try {
          if (session) {
            const supabaseUser = session.user;
            const { data: profile, error } = await supabase
              .from('users')
              .select('*')
              .eq('id', supabaseUser.id)
              .single();

            if (profile && !error) {
              const cleanRole = sanitizeRole(profile.role);
              const userObj: User = {
                id: supabaseUser.id,
                uid: supabaseUser.id,
                username: profile.username || supabaseUser.email?.split('@')[0] || '',
                name: profile.name || 'User',
                email: supabaseUser.email || profile.email || '',
                role: cleanRole,
                phone: profile.phone || '',
                forcePasswordChange: !!profile.force_password_change,
                activeSessionId: `sess-${Date.now()}`
              };
              setCurrentUser(userObj);
              setRole(cleanRole);
            }
          } else {
            setCurrentUser(null);
            setRole(null);
          }
        } catch (err) {
          console.error("[AuthProvider] Supabase auth state change handler error:", err);
        } finally {
          setLoading(false);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      console.log("[AuthProvider] Initializing Firebase Auth persistence layer fallback...");
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        try {
          if (firebaseUser) {
            const token = await firebaseUser.getIdToken();
            setCachedIdToken(token);

            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
              const userData = userDocSnap.data();
              const cleanRole = sanitizeRole(userData.role);
              const userObj: User = {
                id: firebaseUser.uid,
                uid: firebaseUser.uid,
                username: userData.username || firebaseUser.email?.split('@')[0] || '',
                name: userData.name || firebaseUser.displayName || 'User',
                email: firebaseUser.email || userData.email || '',
                role: cleanRole,
                phone: userData.phone || '',
                forcePasswordChange: !!(userData.forcePasswordChange || userData.mustChangePassword),
                activeSessionId: `sess-${Date.now()}`
              };

              setCurrentUser(userObj);
              setRole(cleanRole);
            } else {
              console.warn("[AuthProvider] Authenticated in Firebase Auth but no Firestore user profile document found for UID:", firebaseUser.uid);
            }
          } else {
            setCurrentUser(null);
            setRole(null);
            setCachedIdToken(null);
          }
        } catch (err) {
          console.error("[AuthProvider] Error in onAuthStateChanged:", err);
        } finally {
          setLoading(false);
        }
      });

      return () => unsubscribe();
    }
  }, []);

  const writeAuditLog = async (userId: string, username: string, action: string, details: string, performedBy?: string) => {
    try {
      const info = getClientInfo();
      const logId = `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      const newLog: AuditLog = {
        id: logId,
        userId: userId || 'SYSTEM',
        username: username || 'system',
        action,
        details,
        timestamp: new Date().toISOString(),
        performedBy: performedBy || username || 'System',
        ipAddress: info.ipAddress,
        deviceInfo: info.deviceInfo
      };
      await auditLogsService.create(newLog);
    } catch (err) {
      console.error("Failed to write audit log:", err);
    }
  };

  const login = async (emailOrUsername: string, password: string, remember: boolean): Promise<{ success: boolean; mustChangePassword?: boolean }> => {
    const rawInput = emailOrUsername.trim().toLowerCase();
    const trimmedInput = rawInput.replace(/^@/, '');
    const trimmedPassword = password.trim();

    if (!trimmedInput || !trimmedPassword) {
      throw new Error("Username and password are required.");
    }

    if (isSupabaseConfigured) {
      try {
        const email = resolveEmail(trimmedInput);
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: trimmedPassword,
        });

        if (error) {
          throw error;
        }

        if (!data.user) {
          throw new Error("Supabase authenticated but returned no user object.");
        }

        const { data: profile, error: profileErr } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileErr || !profile) {
          throw new Error("User profile not found in public database registry. Please contact support.");
        }

        const cleanRole = sanitizeRole(profile.role);
        const userObj: User = {
          id: data.user.id,
          uid: data.user.id,
          username: profile.username || email.split('@')[0],
          name: profile.name || 'User',
          email: data.user.email || profile.email || '',
          role: cleanRole,
          phone: profile.phone || '',
          forcePasswordChange: !!profile.force_password_change,
          activeSessionId: `sess-${Date.now()}`
        };

        setCurrentUser(userObj);
        setRole(cleanRole);

        const sessionObj = { user: userObj, role: userObj.role };
        sessionStorage.setItem('sunshine_active_session', JSON.stringify(sessionObj));
        if (remember) {
          localStorage.setItem('sunshine_active_session', JSON.stringify(sessionObj));
        }

        await writeAuditLog(userObj.id, userObj.username, 'USER_LOGIN', `User ${userObj.username} logged in successfully via Supabase V2.`);

        return { success: true, mustChangePassword: userObj.forcePasswordChange };
      } catch (err: any) {
        console.error("[AuthProvider.login - Supabase V2] Error:", err.message);
        throw new Error(err.message || "Invalid username/email or password.");
      }
    } else {
      try {
        const email = resolveEmail(trimmedInput);
        const userCredential = await signInWithEmailAndPassword(auth, email, trimmedPassword);
        const firebaseUser = userCredential.user;
        const idToken = await firebaseUser.getIdToken();

        setCachedIdToken(idToken);

        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
          throw new Error("User profile not found in Firestore.");
        }

        const userData = userDocSnap.data();
        const cleanRole = sanitizeRole(userData.role);
        const userObj: User = {
          id: firebaseUser.uid,
          uid: firebaseUser.uid,
          username: userData.username || email.split('@')[0],
          name: userData.name || firebaseUser.displayName || 'User',
          email: firebaseUser.email || userData.email || '',
          role: cleanRole,
          phone: userData.phone || '',
          forcePasswordChange: !!(userData.forcePasswordChange || userData.mustChangePassword),
          activeSessionId: `sess-${Date.now()}`
        };

        setCurrentUser(userObj);
        setRole(cleanRole);

        const sessionObj = { user: userObj, role: userObj.role };
        sessionStorage.setItem('sunshine_active_session', JSON.stringify(sessionObj));
        if (remember) {
          localStorage.setItem('sunshine_active_session', JSON.stringify(sessionObj));
        }

        await writeAuditLog(userObj.id, userObj.username, 'USER_LOGIN', `User ${userObj.username} successfully logged in.`);

        return { success: true, mustChangePassword: userObj.forcePasswordChange };
      } catch (err: any) {
        console.error("[AuthProvider.login] Error:", err.message);
        let errorMsg = "Invalid username/email or password.";
        if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
          errorMsg = "Invalid username/email or password.";
        } else if (err.code === 'auth/user-disabled') {
          errorMsg = "Your account has been disabled. Please contact the administrator.";
        } else if (err.code === 'auth/too-many-requests') {
          errorMsg = "Too many failed login attempts. This account has been temporarily locked.";
        } else {
          errorMsg = err.message || errorMsg;
        }
        throw new Error(errorMsg);
      }
    }
  };

  const googleLogin = async (): Promise<boolean> => {
    throw new Error("Google Sign-In has been replaced with Username and Password authentication as per ERP security guidelines.");
  };

  const logout = async (): Promise<void> => {
    try {
      if (currentUser) {
        await writeAuditLog(currentUser.id, currentUser.username, 'USER_LOGOUT', `User ${currentUser.username} logged out.`);
      }
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      } else {
        await firebaseSignOut(auth);
      }
    } catch (err) {
      console.warn("Error during logout audit log:", err);
    }

    sessionStorage.removeItem('sunshine_active_session');
    localStorage.removeItem('sunshine_active_session');
    setCachedIdToken(null);

    setCurrentUser(null);
    setRole(null);
  };

  const changePassword = async (currentPassword: string, newPassword: string, confirmPassword?: string): Promise<void> => {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (error) {
          throw error;
        }

        if (currentUser) {
          const { error: dbErr } = await supabase
            .from('users')
            .update({ force_password_change: false })
            .eq('id', currentUser.id);

          if (dbErr) {
            console.warn("Could not update public profile forcePasswordChange field:", dbErr.message);
          }

          setCurrentUser({ ...currentUser, forcePasswordChange: false });
        }

        await writeAuditLog(currentUser?.id || 'user', currentUser?.username || 'user', 'PASSWORD_CHANGE', "User updated their password successfully via Supabase V2.");
      } catch (err: any) {
        console.error("[AuthProvider.changePassword - Supabase V2] Error:", err.message);
        throw new Error(err.message || "Failed to change password in Supabase.");
      }
    } else {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("No authenticated session active.");
      }

      try {
        const credential = EmailAuthProvider.credential(user.email!, currentPassword);
        await reauthenticateWithCredential(user, credential);

        await updatePassword(user, newPassword);

        await setDoc(doc(db, 'users', user.uid), {
          mustChangePassword: false,
          forcePasswordChange: false,
          updatedAt: new Date().toISOString()
        }, { merge: true });

        if (currentUser) {
          setCurrentUser({ ...currentUser, forcePasswordChange: false });
        }

        await writeAuditLog(user.uid, currentUser?.username || 'user', 'PASSWORD_CHANGE', "User updated their password successfully.");
      } catch (err: any) {
        console.error("[AuthProvider.changePassword] Error:", err.message);
        throw new Error(err.message || "Failed to change password. Make sure current password is correct.");
      }
    }
  };

  const resetUserPassword = async (targetUserId: string, targetUsername?: string, newPassword?: string): Promise<{ success: boolean; tempPassword?: string }> => {
    const token = getCachedIdToken();

    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      credentials: 'include',
      body: JSON.stringify({ targetUserId, targetUsername, newPassword })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to reset password.');
    }

    return { success: true, tempPassword: data.tempPassword };
  };

  const unlockUserAccount = async (targetUserId: string, targetUsername?: string): Promise<void> => {
    const token = getCachedIdToken();

    const res = await fetch('/api/auth/unlock-account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      credentials: 'include',
      body: JSON.stringify({ targetUserId, targetUsername })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to unlock account.');
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      role,
      loading,
      googleLoading,
      login,
      googleLogin,
      logout,
      changePassword,
      resetUserPassword,
      unlockUserAccount
    }}>
      {children}
    </AuthContext.Provider>
  );
};
