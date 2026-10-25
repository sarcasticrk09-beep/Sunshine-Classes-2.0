import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/useAuth';
import { useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Shield, RefreshCw, AlertCircle, Key, UserCheck, Lock, X, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import SunshineLogo from '../components/SunshineLogo';

interface LoginProps {
  onBackToWebsite?: () => void;
}

export const Login: React.FC<LoginProps> = ({ onBackToWebsite }) => {
  const {
    login,
    registerStudentUser,
    googleLogin,
    googleLoading,
    currentUser,
    changePassword,
    requestPasswordReset,
    resetPasswordWithCode
  } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isStudentPortal = location.pathname.includes('/student');
  const isAdminPortal = location.pathname.includes('/admin');

  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot-password'>('login');

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activationSuccess, setActivationSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [googleLoginStep, setGoogleLoginStep] = useState<string>('');

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('activated') === 'true') {
      setActivationSuccess(true);
      const emailParam = searchParams.get('email');
      if (emailParam) {
        setEmail(emailParam);
      }
    }
  }, [location.search]);

  // Registration Form State (Phase 1)
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regParentName, setRegParentName] = useState('');
  const [regParentMobile, setRegParentMobile] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regLoading, setRegLoading] = useState(false);

  // States for forced password change (firstLogin === true)
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [passChanging, setPassChanging] = useState<boolean>(false);
  const [passError, setPassError] = useState<string | null>(null);
  const [skippedForcePass, setSkippedForcePass] = useState<boolean>(false);
  const [forcePassSuccess, setForcePassSuccess] = useState<string | null>(null);

  // Forgot Password Workflow States
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotIdentifier, setForgotIdentifier] = useState<string>('');
  const [forgotCode, setForgotCode] = useState<string>('');
  const [forgotNewPassword, setForgotNewPassword] = useState<string>('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState<string>('');
  const [showForgotNewPassword, setShowForgotNewPassword] = useState<boolean>(false);
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState<boolean>(false);
  const [forgotLoading, setForgotLoading] = useState<boolean>(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);
  const [issuedDemoCode, setIssuedDemoCode] = useState<string | null>(null);

  const handleForgotSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotLoading) return;
    setForgotError(null);
    setForgotSuccess(null);
    const cleanId = forgotIdentifier.trim();
    if (!cleanId) {
      setForgotError('Please enter your Roll Number, Mobile, or Email.');
      return;
    }
    setForgotLoading(true);
    try {
      if (requestPasswordReset) {
        const res = await requestPasswordReset(cleanId);
        setForgotStep(2);
        if (res.code) {
          setIssuedDemoCode(res.code);
          setForgotCode(res.code);
        }
        setForgotSuccess(res.message || 'Verification code issued successfully.');
      }
    } catch (err: any) {
      setForgotError(err.message || 'Failed to send verification code.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleForgotResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotLoading) return;
    setForgotError(null);
    setForgotSuccess(null);

    if (forgotNewPassword.length < 6) {
      setForgotError('Password must be at least 6 characters long.');
      return;
    }
    const hasLetters = /[a-zA-Z]/.test(forgotNewPassword);
    const hasNumbers = /[0-9]/.test(forgotNewPassword);
    if (!hasLetters || !hasNumbers) {
      setForgotError('Password must contain both letters and numbers.');
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('Passwords do not match.');
      return;
    }

    setForgotLoading(true);
    try {
      if (resetPasswordWithCode) {
        const res = await resetPasswordWithCode(forgotIdentifier, forgotCode, forgotNewPassword);
        setForgotSuccess(res.message || 'Password reset successfully! Returning to sign in...');
        setPassword(forgotNewPassword);
        setEmail(forgotIdentifier);
        setTimeout(() => {
          setAuthMode('login');
          setForgotStep(1);
          setForgotCode('');
          setForgotNewPassword('');
          setForgotConfirmPassword('');
          setForgotSuccess(null);
        }, 1200);
      }
    } catch (err: any) {
      setForgotError(err.message || 'Failed to reset password.');
    } finally {
      setForgotLoading(false);
    }
  };

  // Secure Role-Based Redirection Engine
  const redirectToRoleDashboard = (userRole: string) => {
    const role = (userRole || '').toUpperCase();
    if (role === 'STUDENT') {
      navigate('/student/dashboard');
    } else if (role === 'TEACHER') {
      navigate('/teacher/dashboard');
    } else if (role === 'RECEPTIONIST' || role === 'RECEPTION') {
      navigate('/receptionist/dashboard');
    } else {
      // ADMIN, SUPER_ADMIN, ACCOUNTANT, COUNSELLOR
      navigate('/admin/dashboard');
    }
  };

  useEffect(() => {
    if (currentUser) {
      const needsPasswordPrompt = !skippedForcePass && (
        (currentUser as any).firstLogin === true ||
        currentUser.forcePasswordChange === true ||
        currentUser.mustChangePassword === true
      );
      if (!needsPasswordPrompt) {
        redirectToRoleDashboard(currentUser.role);
      }
    }
  }, [currentUser, skippedForcePass, navigate]);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regLoading) return;
    setError(null);
    setRegLoading(true);
    try {
      if (!registerStudentUser) {
        throw new Error("Registration system unavailable.");
      }
      await registerStudentUser({
        name: regName,
        phone: regPhone,
        parentName: regParentName,
        parentMobile: regParentMobile,
        email: regEmail,
        password: regPassword
      });
      navigate('/student/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setRegLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);
    try {
      await login(email.trim(), password, rememberMe);
      const activeSession = JSON.parse(sessionStorage.getItem('sunshine_active_session') || localStorage.getItem('sunshine_active_session') || '{}');
      const activeRole = activeSession?.user?.role || currentUser?.role;
      if (activeRole) {
        redirectToRoleDashboard(activeRole);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (username: string, pass: string) => {
    if (loading) return;
    setError(null);
    setLoading(true);
    setEmail(username);
    setPassword(pass);
    try {
      await login(username, pass, rememberMe);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    setGoogleLoginStep('Google Sign-In Initiated');
    console.log('[Google Sign-In] Google Sign-In Initiated');
    try {
      setGoogleLoginStep('Contacting Google authentication server...');
      console.log('[Google Sign-In] Contacting Supabase Auth');
      
      const success = await googleLogin();
      
      if (success) {
        setGoogleLoginStep('User session verified successfully.');
        console.log('[Google Sign-In] Supabase session verified');
        setTimeout(() => {
          setGoogleLoginStep('User profile checked. Access granted.');
          console.log('[Google Sign-In] User profile checked');
        }, 500);
      } else {
        setGoogleLoginStep('');
      }
    } catch (err: any) {
      console.error("[Google Sign-In] Google login failed:", err);
      setError(err.message || 'Google Sign-In failed.');
      setGoogleLoginStep('');
    } finally {
      setLoading(false);
    }
  };

  const handleForceChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    if (newPassword.length < 6) {
      setPassError('Password must be at least 6 characters long.');
      return;
    }
    const hasLetters = /[a-zA-Z]/.test(newPassword);
    const hasNumbers = /[0-9]/.test(newPassword);
    if (!hasLetters || !hasNumbers) {
      setPassError('Password must contain both letters and numbers.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError('New passwords do not match.');
      return;
    }
    setPassChanging(true);
    try {
      await changePassword(password || 'sunshine123', newPassword);
      setForcePassSuccess('Password updated successfully! Redirecting...');
      setTimeout(() => {
        setSkippedForcePass(true);
        if (currentUser) {
          redirectToRoleDashboard(currentUser.role);
        }
      }, 700);
    } catch (err: any) {
      setPassError(err.message || 'Failed to update passcode.');
    } finally {
      setPassChanging(false);
    }
  };

  // If user is authenticated with initial password, prompt to update password (with skip option)
  const isPromptPasswordChange = !!(
    currentUser &&
    !skippedForcePass &&
    ((currentUser as any).firstLogin === true ||
      currentUser.forcePasswordChange === true ||
      currentUser.mustChangePassword === true)
  );

  if (isPromptPasswordChange) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans selection:bg-amber-100">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-xl p-8 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-amber-500 to-brand-orange"></div>
          
          {/* Close / Return to Home Button */}
          <button
            id="btn-close-force-pass"
            type="button"
            onClick={() => {
              if (onBackToWebsite) {
                onBackToWebsite();
              } else {
                navigate('/');
              }
            }}
            className="absolute top-4 right-4 z-20 h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer shadow-xs border border-slate-200/80"
            title="Return to Home Page"
            aria-label="Close and return to home page"
          >
            <X size={18} />
          </button>

          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Key className="h-12 w-12 text-amber-500 animate-bounce" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Configure Secure Passcode</h2>
            <p className="text-xs text-slate-500 font-semibold mt-1.5 leading-relaxed">
              To protect academic records and your personal account, please configure a secure personal passcode.
            </p>
          </div>

          {forcePassSuccess && (
            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-start gap-2.5 text-xs text-emerald-700 font-semibold leading-relaxed">
              <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-600" />
              <span>{forcePassSuccess}</span>
            </div>
          )}

          {passError && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-100 flex items-start gap-2.5 text-xs text-rose-600 font-semibold leading-relaxed">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{passError}</span>
            </div>
          )}

          <form onSubmit={handleForceChangePassword} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">New Password</label>
              <div className="relative">
                <input
                  id="force-new-password"
                  type={showNewPassword ? "text" : "password"}
                  required
                  placeholder="At least 6 chars with letters and numbers"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-3.5 pr-10 py-2.5 text-xs text-slate-800 outline-none focus:border-brand-blue focus:bg-white transition-all font-semibold"
                />
                <button
                  type="button"
                  id="btn-toggle-force-new-pass"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  title={showNewPassword ? "Hide password" : "Show password"}
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">Confirm New Password</label>
              <div className="relative">
                <input
                  id="force-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-3.5 pr-10 py-2.5 text-xs text-slate-800 outline-none focus:border-brand-blue focus:bg-white transition-all font-semibold"
                />
                <button
                  type="button"
                  id="btn-toggle-force-confirm-pass"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  title={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              id="btn-force-submit"
              type="submit"
              disabled={passChanging}
              className="w-full rounded-xl bg-amber-500 hover:bg-amber-600 text-white py-2.5 text-xs font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {passChanging ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Updating Passcode...</span>
                </>
              ) : (
                <span>Update Password & Continue</span>
              )}
            </button>

            <button
              id="btn-skip-force-password"
              type="button"
              disabled={passChanging}
              onClick={() => {
                setSkippedForcePass(true);
                if (currentUser) {
                  redirectToRoleDashboard(currentUser.role);
                }
              }}
              className="w-full rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 py-2.5 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-slate-200/80"
            >
              Skip for Now & Continue to Portal
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans selection:bg-amber-100">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-xl p-8 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-400 to-brand-orange"></div>
        
        {/* Close / Return to Home Button */}
        <button
          id="btn-close-login"
          type="button"
          onClick={() => {
            if (onBackToWebsite) {
              onBackToWebsite();
            } else {
              navigate('/');
            }
          }}
          className="absolute top-4 right-4 z-20 h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer shadow-xs border border-slate-200/80"
          title="Return to Home Page"
          aria-label="Close and return to home page"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <SunshineLogo size={42} showText={true} />
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight mt-3">
            {authMode === 'forgot-password'
              ? 'Password Recovery'
              : authMode === 'register' 
              ? 'Create Student Account' 
              : isStudentPortal 
              ? 'Student Portal' 
              : isAdminPortal 
              ? 'Administration Portal' 
              : 'Sunshine ERP Portal'}
          </h2>
          <p className="text-xs text-slate-400 font-extrabold uppercase tracking-widest mt-0.5">
            {authMode === 'forgot-password'
              ? 'Self-Service Credential Reset'
              : authMode === 'register' 
              ? 'Register in under 1 minute' 
              : isStudentPortal 
              ? 'Student & Parent Access Terminal' 
              : isAdminPortal 
              ? 'Internal Staff Access Terminal' 
              : 'Secure ERP Access'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        {!isAdminPortal && authMode !== 'forgot-password' && (
          <div className="flex p-1 bg-slate-100 rounded-2xl mb-6">
            <button
              id="tab-mode-login"
              type="button"
              onClick={() => { setAuthMode('login'); setError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                authMode === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In
            </button>
            <button
              id="tab-mode-register"
              type="button"
              onClick={() => { setAuthMode('register'); setError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                authMode === 'register' ? 'bg-brand-blue text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              New Student Register
            </button>
          </div>
        )}

        {authMode === 'forgot-password' && (
          <div className="flex items-center justify-between p-2 bg-slate-50 border border-slate-100 rounded-2xl mb-6">
            <span className="text-xs font-bold text-slate-700 pl-2">Need to sign in instead?</span>
            <button
              id="tab-return-login"
              type="button"
              onClick={() => { setAuthMode('login'); setError(null); setForgotError(null); }}
              className="py-1 px-3 text-xs font-bold rounded-xl bg-white text-brand-blue border border-slate-200 hover:bg-slate-50 shadow-2xs transition-all cursor-pointer"
            >
              ← Back to Sign In
            </button>
          </div>
        )}

        {activationSuccess && (
          <div id="login-activation-success-alert" className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start justify-between gap-2.5 text-xs text-emerald-800 font-semibold leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="flex items-start gap-2.5">
              <UserCheck size={16} className="shrink-0 mt-0.5 text-emerald-600" />
              <span>🎉 Account activated successfully! Your email verification is complete. You can now log in below.</span>
            </div>
            <button
              id="btn-dismiss-activation-success"
              type="button"
              onClick={() => setActivationSuccess(false)}
              className="text-emerald-500 hover:text-emerald-700 p-0.5 rounded-lg transition-colors cursor-pointer font-bold"
              title="Dismiss message"
            >
              ×
            </button>
          </div>
        )}

        {error && (
          <div id="login-error-alert" className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-100 flex flex-col gap-2.5 text-xs text-rose-600 font-semibold leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="flex items-start justify-between gap-2.5">
              <div className="flex items-start gap-2.5">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
              <button
                id="btn-dismiss-login-error"
                type="button"
                onClick={() => setError(null)}
                className="text-rose-400 hover:text-rose-600 p-0.5 rounded-lg transition-colors cursor-pointer shrink-0"
                title="Dismiss message"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {authMode === 'register' ? (
          /* PHASE 1 REGISTRATION FORM */
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">Full Name *</label>
              <input
                id="reg-full-name"
                type="text"
                required
                disabled={regLoading}
                placeholder="e.g. Rahul Verma"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-brand-blue focus:bg-white focus:ring-2 focus:ring-brand-blue/10 transition-all font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">Student Mobile *</label>
                <input
                  id="reg-phone"
                  type="tel"
                  required
                  maxLength={10}
                  disabled={regLoading}
                  placeholder="10-digit number"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-brand-blue focus:bg-white transition-all font-semibold"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">Parent Mobile *</label>
                <input
                  id="reg-parent-mobile"
                  type="tel"
                  required
                  maxLength={10}
                  disabled={regLoading}
                  placeholder="10-digit number"
                  value={regParentMobile}
                  onChange={(e) => setRegParentMobile(e.target.value.replace(/\D/g, ''))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-brand-blue focus:bg-white transition-all font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">Parent / Guardian Name *</label>
              <input
                id="reg-parent-name"
                type="text"
                required
                disabled={regLoading}
                placeholder="e.g. Ramesh Chandra Verma"
                value={regParentName}
                onChange={(e) => setRegParentName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-brand-blue focus:bg-white transition-all font-semibold"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">Email Address (Optional)</label>
              <input
                id="reg-email"
                type="email"
                disabled={regLoading}
                placeholder="student@example.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-brand-blue focus:bg-white transition-all font-semibold"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">Password *</label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showRegPassword ? "text" : "password"}
                  required
                  minLength={6}
                  disabled={regLoading}
                  placeholder="Create strong password (min 6 chars)"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-3.5 pr-10 py-2.5 text-xs text-slate-800 outline-none focus:border-brand-blue focus:bg-white transition-all font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              id="btn-submit-registration"
              type="submit"
              disabled={regLoading}
              className="w-full rounded-xl bg-brand-blue hover:bg-brand-blue-hover text-white py-3 text-xs font-extrabold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              {regLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-white" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Create Account & Continue →</span>
              )}
            </button>
          </form>
        ) : authMode === 'forgot-password' ? (
          /* FORGOT PASSWORD WORKFLOW */
          <div className="space-y-4">
            <div className="text-center mb-1">
              <h3 className="text-base font-extrabold text-slate-800 tracking-tight">
                {forgotStep === 1 ? 'Find Your Account' : 'Set New Password'}
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {forgotStep === 1 
                  ? 'Enter your registered Roll Number, Mobile, or Email to receive a 6-digit recovery code.' 
                  : `Enter the 6-digit verification code sent for ${forgotIdentifier}`}
              </p>
            </div>

            {forgotSuccess && (
              <div id="forgot-success-alert" className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-start gap-2.5 text-xs text-emerald-800 font-semibold leading-relaxed animate-in fade-in duration-200">
                <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-600" />
                <span>{forgotSuccess}</span>
              </div>
            )}

            {forgotError && (
              <div id="forgot-error-alert" className="p-3.5 rounded-2xl bg-rose-50 border border-rose-100 flex items-start gap-2.5 text-xs text-rose-600 font-semibold leading-relaxed animate-in fade-in duration-200">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotStep === 1 ? (
              <form onSubmit={handleForgotSendCode} className="space-y-3.5">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">Roll No, Mobile, or Email</label>
                  <input
                    id="forgot-identifier-input"
                    type="text"
                    required
                    disabled={forgotLoading}
                    placeholder="e.g. SC-101, 9876543210, or student@example.com"
                    value={forgotIdentifier}
                    onChange={(e) => setForgotIdentifier(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-brand-blue focus:bg-white focus:ring-2 focus:ring-brand-blue/10 transition-all font-semibold"
                  />
                </div>

                <div className="flex gap-2.5 pt-1">
                  <button
                    id="btn-back-to-login"
                    type="button"
                    disabled={forgotLoading}
                    onClick={() => {
                      setAuthMode('login');
                      setForgotError(null);
                      setForgotSuccess(null);
                    }}
                    className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    id="btn-send-reset-code"
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 rounded-xl bg-brand-blue hover:bg-brand-blue-hover text-white py-2.5 text-xs font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {forgotLoading ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Sending Code...</span>
                      </>
                    ) : (
                      <span>Send Recovery Code</span>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleForgotResetPassword} className="space-y-3.5">
                {issuedDemoCode && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/60 text-[11px] text-amber-900 font-medium flex items-center justify-between">
                    <span>Active Code: <strong className="font-mono text-xs font-bold tracking-wider">{issuedDemoCode}</strong></span>
                    <button
                      type="button"
                      id="btn-copy-reset-code"
                      onClick={() => setForgotCode(issuedDemoCode)}
                      className="text-[10px] text-amber-800 hover:text-amber-950 underline font-bold cursor-pointer"
                    >
                      Fill Code
                    </button>
                  </div>
                )}

                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">6-Digit Verification Code</label>
                  <input
                    id="forgot-code-input"
                    type="text"
                    required
                    maxLength={6}
                    disabled={forgotLoading}
                    placeholder="Enter 6-digit code"
                    value={forgotCode}
                    onChange={(e) => setForgotCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-center tracking-widest font-mono text-base rounded-xl border border-slate-200 bg-slate-50 py-2 text-slate-800 outline-none focus:border-brand-blue focus:bg-white transition-all font-bold"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">New Password</label>
                  <div className="relative">
                    <input
                      id="forgot-new-password"
                      type={showForgotNewPassword ? "text" : "password"}
                      required
                      minLength={6}
                      disabled={forgotLoading}
                      placeholder="Min 6 chars with letters & numbers"
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-3.5 pr-10 py-2.5 text-xs text-slate-800 outline-none focus:border-brand-blue focus:bg-white transition-all font-semibold"
                    />
                    <button
                      type="button"
                      id="btn-toggle-forgot-new-pass"
                      onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                    >
                      {showForgotNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">Confirm New Password</label>
                  <div className="relative">
                    <input
                      id="forgot-confirm-password"
                      type={showForgotConfirmPassword ? "text" : "password"}
                      required
                      minLength={6}
                      disabled={forgotLoading}
                      placeholder="Re-enter new password"
                      value={forgotConfirmPassword}
                      onChange={(e) => setForgotConfirmPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-3.5 pr-10 py-2.5 text-xs text-slate-800 outline-none focus:border-brand-blue focus:bg-white transition-all font-semibold"
                    />
                    <button
                      type="button"
                      id="btn-toggle-forgot-confirm-pass"
                      onClick={() => setShowForgotConfirmPassword(!showForgotConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                    >
                      {showForgotConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-1">
                  <button
                    id="btn-forgot-back-step1"
                    type="button"
                    disabled={forgotLoading}
                    onClick={() => {
                      setForgotStep(1);
                      setForgotError(null);
                    }}
                    className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    id="btn-submit-reset-password"
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 rounded-xl bg-brand-blue hover:bg-brand-blue-hover text-white py-2.5 text-xs font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {forgotLoading ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <span>Reset & Log In</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          /* LOGIN FORM */
          <>
        <form onSubmit={handlePasswordLogin} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">Roll No, Mobile, or Username</label>
              <span className="text-[10px] text-slate-400 font-medium">Students & Parents</span>
            </div>
            <input
              id="auth-email"
              type="text"
              required
              disabled={loading}
              placeholder="e.g. SC-101, 9876543210, or student username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-brand-blue focus:bg-white focus:ring-2 focus:ring-brand-blue/10 transition-all font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">Account Password</label>
              <button
                type="button"
                id="btn-forgot-password"
                onClick={() => {
                  setAuthMode('forgot-password');
                  setForgotIdentifier(email);
                  setForgotError(null);
                  setForgotSuccess(null);
                  setForgotStep(1);
                }}
                className="text-[11px] font-bold text-brand-blue hover:text-brand-blue-hover hover:underline transition-colors cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <input
                id="auth-password"
                type={showPassword ? "text" : "password"}
                required
                disabled={loading}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-3.5 pr-10 py-2.5 text-xs text-slate-800 outline-none focus:border-brand-blue focus:bg-white focus:ring-2 focus:ring-brand-blue/10 transition-all font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                id="btn-toggle-login-pass"
                disabled={loading}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 disabled:opacity-50 cursor-pointer"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center py-0.5 select-none">
            <input
              id="auth-remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-brand-blue focus:ring-brand-blue cursor-pointer accent-brand-blue"
            />
            <label
              htmlFor="auth-remember-me"
              className="ml-2 text-xs text-slate-600 font-bold cursor-pointer hover:text-slate-800 transition-colors"
            >
              Remember Me on this device
            </label>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            {onBackToWebsite && (
              <button
                id="btn-back-website"
                type="button"
                onClick={() => {
                  if (onBackToWebsite) {
                    onBackToWebsite();
                  } else {
                    navigate('/');
                  }
                }}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
              >
                Website Home
              </button>
            )}
            <button
              id="btn-auth-submit"
              type="submit"
              disabled={loading}
              className={`flex-1 rounded-xl text-white py-2.5 text-xs font-bold shadow-md transition-all relative overflow-hidden flex items-center justify-center gap-2 ${
                loading 
                  ? 'bg-brand-blue/90 cursor-wait' 
                  : 'bg-brand-blue hover:bg-brand-blue-hover active:scale-[0.99] cursor-pointer'
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw id="icon-login-progress-spinner" className="h-3.5 w-3.5 animate-spin text-white shrink-0" />
                  <span id="txt-login-progress-label">Loading...</span>
                  <div id="login-button-progress-bar" className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 overflow-hidden">
                    <motion.div
                      id="login-button-progress-fill"
                      initial={{ x: '-100%' }}
                      animate={{ x: '100%' }}
                      transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                      className="h-full w-1/2 bg-white rounded-full shadow-xs"
                    />
                  </div>
                </>
              ) : (
                <span>Login</span>
              )}
            </button>
          </div>
        </form>

        <div className="relative flex py-4 items-center">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-4 text-slate-400 text-[10px] font-bold uppercase">Or</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        <button
          id="btn-google-auth"
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading || googleLoading}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 py-2.5 text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-75 disabled:cursor-wait"
        >
          {googleLoading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin text-brand-blue" />
              <span className="text-brand-blue">Handshaking with Google...</span>
            </>
          ) : (
            <>
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.37 0 3.402 2.659 1.492 6.551l3.774 3.214z"
                />
                <path
                  fill="#34A853"
                  d="M16.04 15.345c-1.077.733-2.43 1.164-4.04 1.164-2.955 0-5.46-2-6.355-4.697l-3.805 3.19C3.714 20.254 7.545 23 12 23c3.082 0 5.864-1.018 7.91-2.764l-3.87-2.89z"
                />
                <path
                  fill="#4285F4"
                  d="M23.49 12.273c0-.818-.082-1.609-.227-2.373H12v4.509h6.464c-.277 1.482-1.114 2.736-2.373 3.582l3.87 2.891c2.264-2.091 3.53-5.173 3.53-8.609z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.685 11.812A6.974 6.974 0 0 1 5.645 10c0-.627.087-1.232.227-1.813L2.097 4.973A11.954 11.954 0 0 0 0 10c0 1.79.4 3.49 1.11 5.027l4.575-3.215z"
                />
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </button>

        {googleLoginStep && (
          <div className="mt-2.5 text-center text-[10px] font-bold text-brand-blue tracking-wide uppercase animate-pulse flex items-center justify-center gap-1">
            <RefreshCw className="h-3 w-3 animate-spin" />
            <span>{googleLoginStep}</span>
          </div>
        )}

        <p className="mt-2.5 text-center text-[10.5px] font-medium text-slate-400">
          Google Sign-In is enabled for registered students, parents, and faculty.
        </p>
      </>
    )}
      </div>
    </div>
  );
};
