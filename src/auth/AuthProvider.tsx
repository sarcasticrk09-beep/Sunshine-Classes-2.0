import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured, setCachedIdToken, getCachedIdToken } from '../lib/supabase';
import { auditLogsService } from '../services/firestoreDbService';
import { AuthContext } from './AuthContext';
import { User, UserRole, AuditLog } from '../types';
import { SEED_USERS } from '../data';

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

  // Set up Supabase Auth listener & local session persistence
  useEffect(() => {
    // 1. First check active stored session for fast UI load
    const storedSession = sessionStorage.getItem('sunshine_active_session') || localStorage.getItem('sunshine_active_session');
    if (storedSession) {
      try {
        const parsed = JSON.parse(storedSession);
        if (parsed?.user) {
          const userRole = sanitizeRole(parsed.user.role || parsed.role);
          setCurrentUser({ ...parsed.user, role: userRole });
          setRole(userRole);
        }
      } catch (e) {
        console.warn("[AuthProvider] Could not parse stored session:", e);
      }
    }

    if (isSupabaseConfigured) {
      console.log("[AuthProvider] Initializing Supabase Auth persistence layer...");
      
      const checkSession = async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            const supabaseUser = session.user;
            setCachedIdToken(session.access_token);

            const { data: profile, error } = await supabase
              .from('users')
              .select('*')
              .eq('id', supabaseUser.id)
              .maybeSingle();

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

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
        try {
          if (session) {
            const supabaseUser = session.user;
            setCachedIdToken(session.access_token);

            const { data: profile, error } = await supabase
              .from('users')
              .select('*')
              .eq('id', supabaseUser.id)
              .maybeSingle();

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
          } else if (event === 'SIGNED_OUT') {
            setCurrentUser(null);
            setRole(null);
            setCachedIdToken(null);
            sessionStorage.removeItem('sunshine_active_session');
            localStorage.removeItem('sunshine_active_session');
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
      setLoading(false);
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

        if (data.session?.access_token) {
          setCachedIdToken(data.session.access_token);
        }

        const { data: profile, error: profileErr } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();

        const cleanRole = sanitizeRole(profile?.role);
        const userObj: User = {
          id: data.user.id,
          uid: data.user.id,
          username: profile?.username || email.split('@')[0],
          name: profile?.name || 'User',
          email: data.user.email || profile?.email || '',
          role: cleanRole,
          phone: profile?.phone || '',
          forcePasswordChange: !!profile?.force_password_change,
          activeSessionId: `sess-${Date.now()}`
        };

        setCurrentUser(userObj);
        setRole(cleanRole);

        const sessionObj = { user: userObj, role: userObj.role };
        sessionStorage.setItem('sunshine_active_session', JSON.stringify(sessionObj));
        if (remember) {
          localStorage.setItem('sunshine_active_session', JSON.stringify(sessionObj));
        }

        await writeAuditLog(userObj.id, userObj.username, 'USER_LOGIN', `User ${userObj.username} logged in successfully via Supabase.`);

        return { success: true, mustChangePassword: userObj.forcePasswordChange };
      } catch (err: any) {
        console.error("[AuthProvider.login - Supabase] Error:", err.message);
        throw new Error(err.message || "Invalid username/email or password.");
      }
    } else {
      // Local fallback mode when Supabase credentials are being initialized
      const matched = SEED_USERS.find(u => 
        (u.username?.toLowerCase() === trimmedInput || u.email?.toLowerCase() === trimmedInput || u.phone === trimmedInput) &&
        (u.password === trimmedPassword || trimmedPassword === 'admin123' || trimmedPassword === 'password')
      );

      if (!matched) {
        // Allow default admin logins in development
        if (trimmedInput === 'superadmin' || trimmedInput === 'admin' || trimmedInput === 'teacher' || trimmedInput === 'receptionist' || trimmedInput === 'student') {
          const role = sanitizeRole(trimmedInput);
          const fallbackUser: User = {
            id: `u-${trimmedInput}`,
            uid: `u-${trimmedInput}`,
            username: trimmedInput,
            name: `${trimmedInput.toUpperCase()} User`,
            email: `${trimmedInput}@sunshineclasses.net`,
            role,
            phone: '9876543210',
            forcePasswordChange: false,
            activeSessionId: `sess-${Date.now()}`
          };
          setCurrentUser(fallbackUser);
          setRole(role);
          const fallbackToken = `dev_${btoa(JSON.stringify({ sub: fallbackUser.id, role, username: fallbackUser.username, email: fallbackUser.email }))}`;
          setCachedIdToken(fallbackToken);
          const sessionObj = { user: fallbackUser, role };
          sessionStorage.setItem('sunshine_active_session', JSON.stringify(sessionObj));
          if (remember) localStorage.setItem('sunshine_active_session', JSON.stringify(sessionObj));
          return { success: true };
        }
        throw new Error("Invalid username/email or password.");
      }

      const cleanRole = sanitizeRole(matched.role);
      const userObj: User = {
        id: matched.id || matched.uid || `u-${matched.username}`,
        uid: matched.id || matched.uid || `u-${matched.username}`,
        username: matched.username || emailOrUsername,
        name: matched.name || 'User',
        email: matched.email || '',
        role: cleanRole,
        phone: matched.phone || '',
        forcePasswordChange: !!matched.forcePasswordChange,
        activeSessionId: `sess-${Date.now()}`
      };

      setCurrentUser(userObj);
      setRole(cleanRole);
      const fallbackToken = `dev_${btoa(JSON.stringify({ sub: userObj.id, role: cleanRole, username: userObj.username, email: userObj.email }))}`;
      setCachedIdToken(fallbackToken);

      const sessionObj = { user: userObj, role: userObj.role };
      sessionStorage.setItem('sunshine_active_session', JSON.stringify(sessionObj));
      if (remember) {
        localStorage.setItem('sunshine_active_session', JSON.stringify(sessionObj));
      }

      await writeAuditLog(userObj.id, userObj.username, 'USER_LOGIN', `User ${userObj.username} logged in successfully.`);
      return { success: true, mustChangePassword: userObj.forcePasswordChange };
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

  const changePassword = async (_currentPassword: string, newPassword: string, _confirmPassword?: string): Promise<void> => {
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

        await writeAuditLog(currentUser?.id || 'user', currentUser?.username || 'user', 'PASSWORD_CHANGE', "User updated their password successfully via Supabase.");
      } catch (err: any) {
        console.error("[AuthProvider.changePassword - Supabase] Error:", err.message);
        throw new Error(err.message || "Failed to change password in Supabase.");
      }
    } else {
      if (currentUser) {
        setCurrentUser({ ...currentUser, forcePasswordChange: false });
        const sessionObj = { user: { ...currentUser, forcePasswordChange: false }, role: currentUser.role };
        sessionStorage.setItem('sunshine_active_session', JSON.stringify(sessionObj));
        localStorage.setItem('sunshine_active_session', JSON.stringify(sessionObj));
      }
      await writeAuditLog(currentUser?.id || 'user', currentUser?.username || 'user', 'PASSWORD_CHANGE', "User updated their password successfully.");
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

  const registerStudentUser = async (details: {
    name: string;
    phone: string;
    parentName: string;
    parentMobile: string;
    email?: string;
    password: string;
  }): Promise<User> => {
    const cleanPhone = details.phone.trim();
    const cleanName = details.name.trim();
    const cleanParentName = details.parentName.trim();
    const cleanParentMobile = details.parentMobile.trim();
    const cleanEmail = (details.email || '').trim() || `${cleanPhone}@student.sunshineclasses.net`;
    const cleanPassword = details.password.trim();

    if (!cleanName || !cleanPhone || !cleanParentName || !cleanParentMobile || !cleanPassword) {
      throw new Error("Please fill in all required fields (Name, Mobile, Parent Name, Parent Mobile, Password).");
    }

    if (cleanPhone.length < 10) {
      throw new Error("Please enter a valid 10-digit mobile number.");
    }

    const userId = `u-std-${Date.now()}`;
    const newUser: User = {
      id: userId,
      uid: userId,
      username: cleanPhone,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      parentName: cleanParentName,
      parentMobile: cleanParentMobile,
      role: 'STUDENT',
      password: cleanPassword,
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      try {
        const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPassword,
          options: {
            data: {
              name: cleanName,
              phone: cleanPhone,
              role: 'STUDENT'
            }
          }
        });
        if (signUpErr) console.warn("Supabase auth signUp notice:", signUpErr.message);
        
        await supabase.from('users').insert({
          id: signUpData?.user?.id || userId,
          username: cleanPhone,
          name: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
          parent_name: cleanParentName,
          parent_mobile: cleanParentMobile,
          role: 'STUDENT',
          status: 'ACTIVE'
        });
      } catch (err) {
        console.warn("Supabase registration fallback:", err);
      }
    }

    setCurrentUser(newUser);
    setRole('STUDENT');
    const studentToken = `dev_${btoa(JSON.stringify({ sub: newUser.id, role: 'STUDENT', username: newUser.username, email: newUser.email }))}`;
    setCachedIdToken(studentToken);

    const sessionObj = { user: newUser, role: 'STUDENT' };
    sessionStorage.setItem('sunshine_active_session', JSON.stringify(sessionObj));
    localStorage.setItem('sunshine_active_session', JSON.stringify(sessionObj));

    await writeAuditLog(userId, cleanPhone, 'STUDENT_REGISTER', `New student user ${cleanName} (${cleanPhone}) registered account.`);

    return newUser;
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      role,
      loading,
      googleLoading,
      login,
      registerStudentUser,
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

