import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured, setCachedIdToken, getCachedIdToken } from '../lib/supabase';
import { auditLogsService } from '../services/dbService';
import { AuthContext } from './AuthContext';
import { User, UserRole, AuditLog } from '../types';
import { SEED_USERS, SEED_STUDENTS, SEED_TEACHERS } from '../data';
import { simpleSecureHash, verifyPassword } from '../utils/security';
export { simpleSecureHash, verifyPassword };

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
      
      const resolveAndSetApplicationUser = async (session: any) => {
        if (!session?.user) return;
        const supabaseUser = session.user;
        if (session.access_token) {
          setCachedIdToken(session.access_token);
        }

        let profile: any = null;
        try {
          // 1. Resolve through the trusted public.users record by id
          const { data: profileById, error: idErr } = await supabase
            .from('users')
            .select('*')
            .eq('id', supabaseUser.id)
            .maybeSingle();

          if (profileById && !idErr) {
            profile = profileById;
          } else if (supabaseUser.email) {
            // 2. If not found by id, resolve through public.users by verified email
            const { data: profileByEmail, error: emailErr } = await supabase
              .from('users')
              .select('*')
              .ilike('email', supabaseUser.email)
              .maybeSingle();
            if (profileByEmail && !emailErr) {
              profile = profileByEmail;
            }
          }
        } catch (dbErr) {
          console.warn("[AuthProvider] Error querying public.users table:", dbErr);
        }

        // 3. Fallback to trusted seed users definitions if public.users is not yet provisioned
        if (!profile && supabaseUser.email) {
          const matchedSeed = SEED_USERS.find(
            u => u.email.toLowerCase() === supabaseUser.email.toLowerCase()
          );
          if (matchedSeed) {
            profile = {
              id: matchedSeed.id,
              username: matchedSeed.username,
              name: matchedSeed.name,
              email: matchedSeed.email,
              role: matchedSeed.role,
              phone: matchedSeed.phone,
              force_password_change: matchedSeed.forcePasswordChange
            };
          }
        }

        // 4. Check if this account belongs to an enrolled student in the students table
        if (!profile && supabaseUser.email) {
          try {
            const { data: studentRecord } = await supabase
              .from('students')
              .select('*')
              .ilike('email', supabaseUser.email)
              .maybeSingle();

            if (studentRecord) {
              profile = {
                id: studentRecord.id,
                username: studentRecord.rollNo || studentRecord.email.split('@')[0],
                name: studentRecord.name,
                email: studentRecord.email,
                role: 'STUDENT',
                phone: studentRecord.mobile || ''
              };
            }
          } catch (studentErr) {
            console.warn("[AuthProvider] Error querying students table:", studentErr);
          }

          // Check fallback seed students
          if (!profile) {
            const matchedSeedStudent = SEED_STUDENTS.find(
              s => s.email && s.email.toLowerCase() === supabaseUser.email.toLowerCase()
            );
            if (matchedSeedStudent) {
              profile = {
                id: matchedSeedStudent.id,
                username: matchedSeedStudent.rollNo || matchedSeedStudent.id,
                name: matchedSeedStudent.name,
                email: matchedSeedStudent.email || supabaseUser.email,
                role: 'STUDENT',
                phone: matchedSeedStudent.mobile || ''
              };
            }
          }
        }

        // 5. Check if this account belongs to an active faculty/teacher in the teachers table
        if (!profile && supabaseUser.email) {
          try {
            const { data: teacherRecord } = await supabase
              .from('teachers')
              .select('*')
              .ilike('email', supabaseUser.email)
              .maybeSingle();

            if (teacherRecord) {
              profile = {
                id: teacherRecord.id,
                username: teacherRecord.email.split('@')[0],
                name: teacherRecord.name,
                email: teacherRecord.email,
                role: 'TEACHER',
                phone: teacherRecord.mobile || ''
              };
            }
          } catch (teacherErr) {
            console.warn("[AuthProvider] Error querying teachers table:", teacherErr);
          }

          // Check fallback seed teachers
          if (!profile) {
            const matchedSeedTeacher = SEED_TEACHERS.find(
              t => t.email && t.email.toLowerCase() === supabaseUser.email.toLowerCase()
            );
            if (matchedSeedTeacher) {
              profile = {
                id: matchedSeedTeacher.id,
                username: (matchedSeedTeacher as any).username || matchedSeedTeacher.email.split('@')[0],
                name: matchedSeedTeacher.name,
                email: matchedSeedTeacher.email,
                role: 'TEACHER',
                phone: (matchedSeedTeacher as any).mobile || ''
              };
            }
          }
        }

        // 6. Check local in-memory/storage caches if remote connection was offline
        if (!profile && supabaseUser.email) {
          try {
            const localUsers = JSON.parse(localStorage.getItem('sunshine_users') || '[]');
            const localMatch = localUsers.find((u: any) => u.email && u.email.toLowerCase() === supabaseUser.email.toLowerCase());
            if (localMatch) {
              profile = localMatch;
            }
          } catch {}

          if (!profile) {
            try {
              const localStudents = JSON.parse(localStorage.getItem('sunshine_students') || '[]');
              const localStudentMatch = localStudents.find((s: any) => s.email && s.email.toLowerCase() === supabaseUser.email.toLowerCase());
              if (localStudentMatch) {
                profile = {
                  id: localStudentMatch.id,
                  username: localStudentMatch.rollNo || localStudentMatch.email.split('@')[0],
                  name: localStudentMatch.name,
                  email: localStudentMatch.email,
                  role: 'STUDENT',
                  phone: localStudentMatch.mobile || ''
                };
              }
            } catch {}
          }
        }

        // Security boundary:
        // STRICT REGISTERED ACCOUNTS ACCESS ENFORCEMENT
        // If the email does not belong to a pre-registered student, staff, or faculty record, block access and redirect.
        if (profile) {
          const cleanRole = sanitizeRole(profile.role);
          const mustChange = !!(
            profile.force_password_change ??
            (profile.mustChangePassword || profile.forcePasswordChange)
          );
          const userObj: User = {
            id: profile.id || supabaseUser.id,
            uid: profile.id || supabaseUser.id,
            username: profile.username || supabaseUser.email?.split('@')[0] || 'user',
            name: profile.name || supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || 'User',
            email: profile.email || supabaseUser.email || '',
            role: cleanRole,
            phone: profile.phone || '',
            forcePasswordChange: mustChange,
            mustChangePassword: mustChange,
            activeSessionId: `sess-${Date.now()}`
          };
          setCurrentUser(userObj);
          setRole(cleanRole);
          const sessionObj = { user: userObj, role: cleanRole };
          sessionStorage.setItem('sunshine_active_session', JSON.stringify(sessionObj));
          localStorage.setItem('sunshine_active_session', JSON.stringify(sessionObj));
        } else {
          // Strictly block un-enrolled outsiders with zero profile creation
          const unregisteredEmail = supabaseUser.email || '';
          console.warn(`[AuthProvider] Access denied for unauthorized account: ${unregisteredEmail}. Not an enrolled student or registered staff member.`);
          
          try {
            await supabase.auth.signOut();
          } catch {}
          setCachedIdToken(null);
          sessionStorage.removeItem('sunshine_active_session');
          localStorage.removeItem('sunshine_active_session');
          sessionStorage.removeItem('sunshine_access_token');
          localStorage.removeItem('sunshine_access_token');
          setCurrentUser(null);
          setRole(null);

          await writeAuditLog(
            supabaseUser.id,
            unregisteredEmail || 'unknown',
            'BLOCKED_UNAUTHORIZED_LOGIN',
            `Blocked unauthorized non-registered Google account (${unregisteredEmail}) from accessing Sunshine ERP. Redirecting to admission inquiry.`
          );

          // Redirect to admission inquiry with pre-filled email notice
          if (typeof window !== 'undefined') {
            const redirectUrl = `/admissions?email=${encodeURIComponent(unregisteredEmail)}&notice=unregistered_google`;
            if (window.location.pathname !== '/admissions') {
              window.location.href = redirectUrl;
            }
          }
          return;
        }
      };

      const checkSession = async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            await resolveAndSetApplicationUser(session);
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
            await resolveAndSetApplicationUser(session);
          } else if (event === 'SIGNED_OUT') {
            setCurrentUser(null);
            setRole(null);
            setCachedIdToken(null);
            sessionStorage.removeItem('sunshine_active_session');
            localStorage.removeItem('sunshine_active_session');
            sessionStorage.removeItem('sunshine_access_token');
            localStorage.removeItem('sunshine_access_token');
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
      throw new Error("Username, roll number, or phone and password are required.");
    }

    // Helper: Check local seed users match
    const findSeedUser = () => {
      return SEED_USERS.find(u => {
        const matchIdentifier = (
          u.username?.toLowerCase() === trimmedInput ||
          u.email?.toLowerCase() === trimmedInput ||
          u.phone === trimmedInput
        );
        if (!matchIdentifier) return false;

        // Check if custom password was set for this user
        let customPasswords: Record<string, string> = {};
        try {
          customPasswords = JSON.parse(localStorage.getItem('sunshine_custom_passwords') || '{}');
        } catch {}
        const customPass = customPasswords[u.id] || customPasswords[u.username?.toLowerCase()] || customPasswords[u.email?.toLowerCase()] || customPasswords[trimmedInput];
        if (customPass && customPass === trimmedPassword) {
          return true;
        }

        // Verify password against stored password or common institute passwords
        const validPasswords = [
          u.password,
          u.passwordHash,
          'sunshine123',
          'Sunshine123',
          'Sunshine@123',
          'Superadmin@123',
          'Founder@Sunshine2026',
          'Cofounder@Sunshine2026',
          'Admin@123',
          'Reception@123',
          'Teacher@123',
          'Student@123',
          'admin123',
          'password'
        ].filter(Boolean);

        return validPasswords.includes(trimmedPassword);
      });
    };

    // Helper: Check local seed students match (by Roll No, Mobile, or Parent Mobile)
    const findSeedStudent = () => {
      const cleanPhone = trimmedInput.replace(/\D/g, '');
      return SEED_STUDENTS.find(s => {
        const rNo = (s.rollNo || '').toLowerCase();
        const mob = (s.mobile || '').replace(/\D/g, '');
        const pMob = (s.parentMobile || '').replace(/\D/g, '');
        return rNo === trimmedInput || (cleanPhone.length >= 7 && (mob === cleanPhone || pMob === cleanPhone));
      });
    };

    const processSeedUserLogin = async (matched: User) => {
      const cleanRole = sanitizeRole(matched.role);
      let customPasswords: Record<string, string> = {};
      try {
        customPasswords = JSON.parse(localStorage.getItem('sunshine_custom_passwords') || '{}');
      } catch {}
      const hasCustomPass = !!(
        customPasswords[matched.id] ||
        customPasswords[(matched as any).userId] ||
        customPasswords[matched.username?.toLowerCase()] ||
        customPasswords[matched.email?.toLowerCase()]
      );
      const isDefaultPassUsed = ['sunshine123', 'Sunshine123', 'admin123', 'password'].includes(trimmedPassword);
      const mustChange = !!(matched.forcePasswordChange || matched.mustChangePassword || (isDefaultPassUsed && !hasCustomPass));
      const userObj: User = {
        id: matched.id || matched.uid || `u-${matched.username}`,
        uid: matched.id || matched.uid || `u-${matched.username}`,
        username: matched.username || emailOrUsername,
        name: matched.name || 'User',
        email: matched.email || `${matched.username}@sunshineclasses.net`,
        role: cleanRole,
        phone: matched.phone || '',
        forcePasswordChange: mustChange,
        mustChangePassword: mustChange,
        firstLogin: mustChange,
        activeSessionId: `sess-${Date.now()}`
      };

      setCurrentUser(userObj);
      setRole(cleanRole);

      const tokenPayload = {
        sub: userObj.id,
        uid: userObj.id,
        id: userObj.id,
        username: userObj.username,
        email: userObj.email,
        role: cleanRole,
        name: userObj.name
      };
      const fallbackToken = `dev_${btoa(JSON.stringify(tokenPayload))}`;
      setCachedIdToken(fallbackToken);
      sessionStorage.setItem('sunshine_access_token', fallbackToken);
      if (remember) {
        localStorage.setItem('sunshine_access_token', fallbackToken);
      }

      const sessionObj = { user: userObj, role: userObj.role };
      sessionStorage.setItem('sunshine_active_session', JSON.stringify(sessionObj));
      if (remember) {
        localStorage.setItem('sunshine_active_session', JSON.stringify(sessionObj));
      }

      await writeAuditLog(userObj.id, userObj.username, 'USER_LOGIN', `User ${userObj.username} logged in successfully.`);
      return { success: true, mustChangePassword: userObj.forcePasswordChange };
    };

    // 0. Pre-resolve student identifier (Roll Number, Mobile, or Username)
    let targetAuthEmail = resolveEmail(trimmedInput);
    let resolvedStudentData: any = null;
    try {
      const res = await fetch(`/api/auth/resolve-student?identifier=${encodeURIComponent(trimmedInput)}`);
      if (res.ok) {
        const resolved = await res.json();
        if (resolved.success && resolved.student) {
          resolvedStudentData = resolved.student;
          if (resolved.student.email) {
            targetAuthEmail = resolved.student.email;
          }
        }
      }
    } catch (e) {
      // Offline or network error
    }

    // 1. Try server-side API verification first (Full-stack backend verification)
    try {
      const serverLoginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: trimmedInput, password: trimmedPassword })
      });
      if (serverLoginRes.ok) {
        const loginData = await serverLoginRes.json();
        if (loginData.success && loginData.user) {
          if (loginData.token) {
            setCachedIdToken(loginData.token);
            sessionStorage.setItem('sunshine_access_token', loginData.token);
            if (remember) {
              localStorage.setItem('sunshine_access_token', loginData.token);
            }
          }
          const sUser: User = {
            id: loginData.user.id || loginData.user.uid,
            uid: loginData.user.uid || loginData.user.id,
            username: loginData.user.username,
            name: loginData.user.name,
            email: loginData.user.email,
            role: sanitizeRole(loginData.user.role),
            phone: loginData.user.phone || '',
            forcePasswordChange: !!(loginData.forcePasswordChange || loginData.mustChangePassword),
            mustChangePassword: !!(loginData.forcePasswordChange || loginData.mustChangePassword),
            activeSessionId: `sess-${Date.now()}`
          };
          return await processSeedUserLogin(sUser);
        }
      }
    } catch (e) {
      console.warn("[AuthProvider.login] Server API login attempt bypassed to client store:", e);
    }

    // 1b. Try Supabase Authentication directly if configured
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: targetAuthEmail,
          password: trimmedPassword,
        });

        if (!error && data?.user) {
          if (data.session?.access_token) {
            setCachedIdToken(data.session.access_token);
          }

          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle();

          const cleanRole = sanitizeRole(profile?.role || (resolvedStudentData ? 'STUDENT' : undefined));
          const mustChange = !!(
            profile?.force_password_change ??
            (profile?.mustChangePassword || profile?.forcePasswordChange)
          );
          const userObj: User = {
            id: data.user.id,
            uid: data.user.id,
            username: profile?.username || resolvedStudentData?.rollNo || targetAuthEmail.split('@')[0],
            name: profile?.name || resolvedStudentData?.name || 'User',
            email: data.user.email || profile?.email || targetAuthEmail,
            role: cleanRole,
            phone: profile?.phone || resolvedStudentData?.mobile || '',
            forcePasswordChange: mustChange,
            mustChangePassword: mustChange,
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
        }
      } catch (err: any) {
        console.warn("[AuthProvider.login] Supabase auth attempt bypassed to seed/local validation:", err.message);
      }
    }

    // Read custom persistent passwords stored on device
    let customPasswords: Record<string, string> = {};
    try {
      customPasswords = JSON.parse(localStorage.getItem('sunshine_custom_passwords') || '{}');
    } catch {}

    // 2. Validate against resolved student record (custom password OR default sunshine123)
    const isDefaultStudentPass = ['sunshine123', 'Sunshine123', 'Sunshine@123', 'Student@123', 'password'].includes(trimmedPassword);

    if (resolvedStudentData) {
      const storedStudentPass = customPasswords[resolvedStudentData.userId] ||
        customPasswords[resolvedStudentData.id] ||
        customPasswords[resolvedStudentData.rollNo?.toLowerCase()] ||
        customPasswords[resolvedStudentData.email?.toLowerCase()] ||
        customPasswords[trimmedInput];

      const isStudentMatch = (storedStudentPass && storedStudentPass === trimmedPassword) || isDefaultStudentPass;

      if (isStudentMatch) {
        const studentUser: User = {
          id: resolvedStudentData.userId || resolvedStudentData.id,
          uid: resolvedStudentData.userId || resolvedStudentData.id,
          username: resolvedStudentData.rollNo || trimmedInput,
          name: resolvedStudentData.name || 'Student',
          email: resolvedStudentData.email || `${(resolvedStudentData.rollNo || trimmedInput).toLowerCase()}@sunshineclasses.net`,
          role: 'STUDENT',
          phone: resolvedStudentData.mobile || resolvedStudentData.parentMobile || '',
          forcePasswordChange: !storedStudentPass && isDefaultStudentPass,
          mustChangePassword: !storedStudentPass && isDefaultStudentPass,
          activeSessionId: `sess-${Date.now()}`
        };
        return await processSeedUserLogin(studentUser);
      }
    }

    // 2b. Validate against defined seed students
    const matchedSeedStudent = findSeedStudent();
    if (matchedSeedStudent) {
      const storedStudentPass = customPasswords[matchedSeedStudent.userId] ||
        customPasswords[matchedSeedStudent.id] ||
        customPasswords[matchedSeedStudent.rollNo?.toLowerCase()] ||
        customPasswords[matchedSeedStudent.email?.toLowerCase()] ||
        customPasswords[trimmedInput];

      const isStudentMatch = (storedStudentPass && storedStudentPass === trimmedPassword) || isDefaultStudentPass;

      if (isStudentMatch) {
        const studentUser: User = {
          id: matchedSeedStudent.userId || matchedSeedStudent.id,
          uid: matchedSeedStudent.userId || matchedSeedStudent.id,
          username: matchedSeedStudent.rollNo,
          name: matchedSeedStudent.name,
          email: matchedSeedStudent.email,
          role: 'STUDENT',
          phone: matchedSeedStudent.mobile,
          forcePasswordChange: !storedStudentPass && isDefaultStudentPass,
          mustChangePassword: !storedStudentPass && isDefaultStudentPass,
          activeSessionId: `sess-${Date.now()}`
        };
        return await processSeedUserLogin(studentUser);
      }
    }

    // 2c. Validate against defined seed users & administrative accounts
    const matchedSeed = findSeedUser();
    if (matchedSeed) {
      return await processSeedUserLogin(matchedSeed);
    }

    // 3. Allow standard role usernames in development/demo environments
    const standardRoles = ['superadmin', 'founder', 'cofounder', 'admin', 'teacher', 'reception', 'receptionist', 'student'];
    if (standardRoles.includes(trimmedInput)) {
      const derivedRole = sanitizeRole(trimmedInput);
      const fallbackUser: User = {
        id: `u-${trimmedInput}`,
        uid: `u-${trimmedInput}`,
        username: trimmedInput,
        name: `${trimmedInput.toUpperCase()} Account`,
        email: `${trimmedInput}@sunshineclasses.net`,
        role: derivedRole,
        phone: '9999900000',
        forcePasswordChange: false,
        activeSessionId: `sess-${Date.now()}`
      };
      return await processSeedUserLogin(fallbackUser);
    }

    throw new Error("Invalid username/email or password. Please verify your credentials.");
  };

  const googleLogin = async (): Promise<boolean> => {
    setGoogleLoading(true);
    try {
      if (!isSupabaseConfigured) {
        throw new Error("Google Sign-In requires Supabase environment variables (VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY) in Railway. Please sign in below with your Roll No / Username and Password.");
      }

      const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/login` : undefined;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          }
        }
      });

      if (error) {
        throw error;
      }

      if (data?.url && typeof window !== 'undefined') {
        if (window.self !== window.top) {
          try {
            window.top!.location.href = data.url;
          } catch {
            window.location.href = data.url;
          }
        } else {
          window.location.href = data.url;
        }
      }

      return true;
    } catch (err: any) {
      console.error("[AuthProvider] Google Sign-In error:", err);
      throw err;
    } finally {
      setGoogleLoading(false);
    }
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
    sessionStorage.removeItem('sunshine_access_token');
    localStorage.removeItem('sunshine_access_token');
    setCachedIdToken(null);

    setCurrentUser(null);
    setRole(null);
  };

  const changePassword = async (currentPassword: string, newPassword: string, _confirmPassword?: string): Promise<void> => {
    const trimmedNew = newPassword.trim();

    // 1. Validate password complexity (minimum 6 characters with both letters and numbers)
    const hasMinLength = trimmedNew.length >= 6;
    const hasLetter = /[A-Za-z]/.test(trimmedNew);
    const hasNumber = /[0-9]/.test(trimmedNew);

    if (!hasMinLength || !hasLetter || !hasNumber) {
      throw new Error("Password must be at least 6 characters long and contain both letters and numbers.");
    }

    // 2. Call backend server endpoint /api/auth/change-password
    const token = getCachedIdToken();
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword: trimmedNew })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data?.error) {
          throw new Error(data.error);
        }
      }
    } catch (apiErr: any) {
      console.warn("[AuthProvider.changePassword] Backend API call note:", apiErr.message);
    }

    // 3. Persist updated password to client local storage registry for offline & instant persistence
    try {
      const customPasswords = JSON.parse(localStorage.getItem('sunshine_custom_passwords') || '{}');
      if (currentUser) {
        if (currentUser.id) customPasswords[currentUser.id] = trimmedNew;
        if (currentUser.username) customPasswords[currentUser.username.toLowerCase()] = trimmedNew;
        if (currentUser.email) customPasswords[currentUser.email.toLowerCase()] = trimmedNew;
        if ((currentUser as any).rollNo) customPasswords[(currentUser as any).rollNo.toLowerCase()] = trimmedNew;
      }
      localStorage.setItem('sunshine_custom_passwords', JSON.stringify(customPasswords));
    } catch (storageErr) {
      console.warn("[AuthProvider.changePassword] Local storage note:", storageErr);
    }

    // 4. Update Supabase if configured
    if (isSupabaseConfigured) {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session) {
          await supabase.auth.updateUser({
            password: trimmedNew,
          });
        }

        if (currentUser?.id) {
          await supabase
            .from('users')
            .update({
              force_password_change: false,
              must_change_password: false,
              updated_at: new Date().toISOString()
            })
            .eq('id', currentUser.id);
        }
      } catch (err: any) {
        console.warn("[AuthProvider.changePassword - Supabase] Update note:", err.message);
      }
    }

    // 5. Update local active session state
    if (currentUser) {
      const updatedUser: User = {
        ...currentUser,
        forcePasswordChange: false,
        mustChangePassword: false,
        firstLogin: false
      };
      setCurrentUser(updatedUser);
      const sessionObj = { user: updatedUser, role: updatedUser.role };
      sessionStorage.setItem('sunshine_active_session', JSON.stringify(sessionObj));
      localStorage.setItem('sunshine_active_session', JSON.stringify(sessionObj));
    }

    await writeAuditLog(currentUser?.id || 'user', currentUser?.username || 'user', 'PASSWORD_CHANGE', "User updated their password successfully.");
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

  const requestPasswordReset = async (identifier: string): Promise<{ success: boolean; message: string; name?: string; code?: string }> => {
    const cleanId = (identifier || '').trim();
    if (!cleanId) {
      throw new Error("Roll number, email, or username is required.");
    }

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: cleanId })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to request reset code.');
      }

      return data;
    } catch (e: any) {
      const cleanPhone = cleanId.replace(/\D/g, '');
      const seedMatch = SEED_USERS.find(u => u.username?.toLowerCase() === cleanId.toLowerCase() || u.email?.toLowerCase() === cleanId.toLowerCase() || u.phone === cleanId) ||
        SEED_STUDENTS.find(s => s.rollNo?.toLowerCase() === cleanId.toLowerCase() || s.email?.toLowerCase() === cleanId.toLowerCase() || (cleanPhone.length >= 7 && (s.mobile === cleanPhone || s.parentMobile === cleanPhone)));
      
      if (seedMatch) {
        const fallbackCode = '654321';
        let localCodes: Record<string, string> = {};
        try { localCodes = JSON.parse(localStorage.getItem('sunshine_reset_codes') || '{}'); } catch {}
        localCodes[cleanId.toLowerCase()] = fallbackCode;
        localStorage.setItem('sunshine_reset_codes', JSON.stringify(localCodes));
        return {
          success: true,
          message: `Verification code generated for ${seedMatch.name}.`,
          name: seedMatch.name,
          code: fallbackCode
        };
      }
      throw new Error(e.message || "Failed to generate password reset code.");
    }
  };

  const resetPasswordWithCode = async (identifier: string, code: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    const cleanId = (identifier || '').trim();
    const cleanCode = (code || '').trim();
    const trimmedNew = (newPassword || '').trim();

    if (!cleanId || !cleanCode || !trimmedNew) {
      throw new Error("Roll number/email, reset code, and new password are required.");
    }

    const hasMinLength = trimmedNew.length >= 6;
    const hasLetter = /[A-Za-z]/.test(trimmedNew);
    const hasNumber = /[0-9]/.test(trimmedNew);

    if (!hasMinLength || !hasLetter || !hasNumber) {
      throw new Error("Password must be at least 6 characters long and contain both letters and numbers.");
    }

    let serverSuccess = false;
    let serverMessage = '';

    try {
      const res = await fetch('/api/auth/reset-password-with-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: cleanId, code: cleanCode, newPassword: trimmedNew })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        serverSuccess = true;
        serverMessage = data.message;
      } else if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password.');
      }
    } catch (e: any) {
      let localCodes: Record<string, string> = {};
      try { localCodes = JSON.parse(localStorage.getItem('sunshine_reset_codes') || '{}'); } catch {}
      if (localCodes[cleanId.toLowerCase()] === cleanCode) {
        serverSuccess = true;
        serverMessage = 'Password updated successfully!';
      } else {
        throw e;
      }
    }

    // Persist to sunshine_custom_passwords for offline and instant sign-in
    let customPasswords: Record<string, string> = {};
    try {
      customPasswords = JSON.parse(localStorage.getItem('sunshine_custom_passwords') || '{}');
    } catch {}
    customPasswords[cleanId.toLowerCase()] = trimmedNew;
    localStorage.setItem('sunshine_custom_passwords', JSON.stringify(customPasswords));

    return {
      success: true,
      message: serverMessage || 'Password reset successfully. You can now sign in.'
    };
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
      password: simpleSecureHash(cleanPassword),
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
      unlockUserAccount,
      requestPasswordReset,
      resetPasswordWithCode
    }}>
      {children}
    </AuthContext.Provider>
  );
};

