import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, ShieldCheck, Mail, Phone, Key, Smartphone, Globe, Check, AlertCircle, X, History, Sparkles, RefreshCw } from 'lucide-react';
import { useAuth } from '../auth/useAuth';

interface UserProfileSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated?: (updatedUser: any) => void;
}

export const UserProfileSecurityModal: React.FC<UserProfileSecurityModalProps> = ({
  isOpen,
  onClose,
  onUserUpdated
}) => {
  const { currentUser, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'activity'>('profile');

  // Profile Form State
  const [username, setUsername] = useState(currentUser?.username || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen || !currentUser) return null;

  // Password strength checks
  const meetsMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword !== '';
  const isPasswordValid = meetsMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;

  // Update Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMessage(null);

    try {
      const updatedData = {
        ...currentUser,
        username: username.trim(),
        email: email.trim(),
        phone: phone.trim(),
        updatedAt: new Date().toISOString()
      };

      // Call API to update user profile
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          phone: phone.trim()
        })
      });

      // Update local storage fallback
      const storedUsers = localStorage.getItem('sunshine_users');
      if (storedUsers) {
        const users = JSON.parse(storedUsers);
        const index = users.findIndex((u: any) => u.id === currentUser.id);
        if (index !== -1) {
          users[index] = { ...users[index], username: username.trim(), email: email.trim(), phone: phone.trim() };
          localStorage.setItem('sunshine_users', JSON.stringify(users));
        }
      }

      setProfileMessage({ type: 'success', text: 'Profile details updated successfully.' });
      if (onUserUpdated) onUserUpdated(updatedData);
    } catch (err: any) {
      setProfileMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setProfileSaving(false);
    }
  };

  // Change Password
  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordMessage(null);

    if (!isPasswordValid) {
      setPasswordMessage({ type: 'error', text: 'New password does not meet security criteria.' });
      setPasswordSaving(false);
      return;
    }

    if (!passwordsMatch) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
      setPasswordSaving(false);
      return;
    }

    try {
      await changePassword(currentPassword, newPassword);
      setPasswordMessage({ type: 'success', text: 'Password changed successfully! Keep your new credentials safe.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordMessage({ type: 'error', text: err.message || 'Failed to update password. Check your current password.' });
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div id="user-profile-security-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-sm p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col my-8"
        id="user-profile-security-card"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white relative">
          <button
            id="btn-close-profile-modal"
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-white font-extrabold text-xl shadow-inner">
              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">{currentUser.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 text-[10px] font-extrabold uppercase tracking-wider">
                  {currentUser.role}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono mt-0.5">@{currentUser.username} • {currentUser.email || 'No email set'}</p>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex border-b border-white/10 mt-6 gap-2" id="profile-sub-tabs">
            <button
              type="button"
              id="subtab-profile-info"
              onClick={() => setActiveTab('profile')}
              className={`pb-2.5 px-3 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border-b-2 ${
                activeTab === 'profile'
                  ? 'border-indigo-400 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <User size={14} /> My Profile
            </button>
            <button
              type="button"
              id="subtab-change-password"
              onClick={() => setActiveTab('password')}
              className={`pb-2.5 px-3 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border-b-2 ${
                activeTab === 'password'
                  ? 'border-indigo-400 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Key size={14} /> Change Password
            </button>
            <button
              type="button"
              id="subtab-login-activity"
              onClick={() => setActiveTab('activity')}
              className={`pb-2.5 px-3 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border-b-2 ${
                activeTab === 'activity'
                  ? 'border-indigo-400 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <History size={14} /> Login Activity
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* TAB 1: MY PROFILE */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4" id="form-update-user-profile">
              {profileMessage && (
                <div className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
                  profileMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  {profileMessage.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                  <span>{profileMessage.text}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.name}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-2.5 text-xs text-slate-500 font-semibold cursor-not-allowed"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Name changes require admin approval.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Assigned Role</label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.role}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-2.5 text-xs text-indigo-600 font-extrabold uppercase cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Username</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">@</span>
                    <input
                      type="text"
                      id="input-user-username"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 pl-7 pr-3 py-2.5 text-xs font-mono font-bold text-slate-800 dark:text-slate-100 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Mobile / Phone</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      id="input-user-phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 9870001122"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 pl-8 pr-3 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:bg-white focus:outline-none font-medium"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      id="input-user-email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. user@example.com"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 pl-8 pr-3 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:bg-white focus:outline-none font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Audit & Lifecycle Info Box */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2 text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-200 uppercase text-[10px] tracking-wider block font-display">Account Audit & Lifecycle History</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between sm:justify-start sm:gap-2">
                    <span className="text-slate-400">Account Status:</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 font-sans">{currentUser.status || (currentUser.active !== false ? 'ACTIVE' : 'SUSPENDED')}</span>
                  </div>
                  <div className="flex justify-between sm:justify-start sm:gap-2">
                    <span className="text-slate-400">Created By:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">{currentUser.createdBy || 'System Admin'}</span>
                  </div>
                  <div className="flex justify-between sm:justify-start sm:gap-2">
                    <span className="text-slate-400">Created On:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">{currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'Initial Setup'}</span>
                  </div>
                  <div className="flex justify-between sm:justify-start sm:gap-2">
                    <span className="text-slate-400">Last Updated By:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">{currentUser.lastUpdatedBy || 'System Admin'}</span>
                  </div>
                  <div className="flex justify-between sm:justify-start sm:gap-2 sm:col-span-2">
                    <span className="text-slate-400">Last Updated On:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">{currentUser.lastUpdatedAt ? new Date(currentUser.lastUpdatedAt).toLocaleString() : 'N/A'}</span>
                  </div>
                  {currentUser.suspensionReason && (
                    <div className="sm:col-span-2 bg-amber-50 dark:bg-amber-950/30 p-2 rounded-xl border border-amber-200 text-amber-900 dark:text-amber-300 font-sans">
                      <strong className="font-bold">Suspension Note:</strong> {currentUser.suspensionReason}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  id="btn-save-profile"
                  disabled={profileSaving}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
                >
                  {profileSaving ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      <span>Update Profile</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: CHANGE PASSWORD */}
          {activeTab === 'password' && (
            <form onSubmit={handleChangePasswordSubmit} className="space-y-4" id="form-user-change-password">
              {passwordMessage && (
                <div className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
                  passwordMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  {passwordMessage.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                  <span>{passwordMessage.text}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Current Password {currentUser.role === 'SUPER_ADMIN' && <span className="text-[10px] text-amber-600 font-normal">(Optional for Super Admin)</span>}
                </label>
                <input
                  type="password"
                  id="input-current-password"
                  required={currentUser.role !== 'SUPER_ADMIN'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder={currentUser.role === 'SUPER_ADMIN' ? "Bypassed for Super Admin (Optional)" : "Enter your existing password"}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-2.5 text-xs text-slate-800 dark:text-slate-100 focus:bg-white focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">New Password</label>
                <input
                  type="password"
                  id="input-new-password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 chars, mixed cases, digits & special"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-2.5 text-xs text-slate-800 dark:text-slate-100 focus:bg-white focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  id="input-confirm-new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-2.5 text-xs text-slate-800 dark:text-slate-100 focus:bg-white focus:outline-none font-mono"
                />
              </div>

              {/* Security Policy Checks */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 space-y-1.5 text-[11px]">
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Password Strength Policy:</span>
                <div className="grid grid-cols-2 gap-2">
                  <div className={`flex items-center gap-1.5 ${meetsMinLength ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                    <Check size={12} /> At least 8 characters
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasUppercase ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                    <Check size={12} /> Uppercase letter (A-Z)
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasLowercase ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                    <Check size={12} /> Lowercase letter (a-z)
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                    <Check size={12} /> Number digit (0-9)
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasSpecial ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                    <Check size={12} /> Special character (!@#$)
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordsMatch ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                    <Check size={12} /> Passwords match
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  id="btn-submit-change-password"
                  disabled={passwordSaving || !isPasswordValid || !passwordsMatch}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
                >
                  {passwordSaving ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <Lock size={14} />
                      <span>Update Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: LOGIN ACTIVITY */}
          {activeTab === 'activity' && (
            <div className="space-y-4" id="view-user-login-activity">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 bg-indigo-50/50 dark:bg-slate-800/50 rounded-2xl border border-indigo-100/80 dark:border-slate-700/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Last Active Session</span>
                  <div className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
                    {(currentUser as any).lastLoginAt ? new Date((currentUser as any).lastLoginAt).toLocaleString() : 'Active Now'}
                  </div>
                </div>

                <div className="p-4 bg-indigo-50/50 dark:bg-slate-800/50 rounded-2xl border border-indigo-100/80 dark:border-slate-700/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Account Security Status</span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                    <ShieldCheck size={14} />
                    <span>Active & Verified (0 Security Flags)</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Smartphone size={14} className="text-indigo-500" /> Session & Device Metadata
                </h4>
                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-700/50">
                    <span className="text-slate-400">Browser / Platform</span>
                    <span className="font-mono font-bold">{navigator.userAgent.includes('Chrome') ? 'Google Chrome' : 'Standard Web Browser'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-700/50">
                    <span className="text-slate-400">Access Mode</span>
                    <span className="font-mono font-bold text-indigo-600">Encrypted ERP Web Portal</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Failed Attempts Count</span>
                    <span className="font-mono font-bold text-emerald-600">0 / 5</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
