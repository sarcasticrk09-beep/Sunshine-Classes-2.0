import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cookie, X, ArrowRight, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CookieConsentBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const consent = localStorage.getItem('sunshine_cookie_consent');
      if (!consent) {
        // Small timeout to allow initial render smoothly
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // In case localStorage is blocked
    }
  }, []);

  const handleAcceptAll = () => {
    try {
      localStorage.setItem('sunshine_cookie_consent', 'all');
      localStorage.setItem('sunshine_cookie_consent_date', new Date().toISOString());
    } catch {}
    setIsVisible(false);
  };

  const handleEssentialOnly = () => {
    try {
      localStorage.setItem('sunshine_cookie_consent', 'essential');
      localStorage.setItem('sunshine_cookie_consent_date', new Date().toISOString());
    } catch {}
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      id="cookie-consent-banner"
      role="region"
      aria-label="Cookie preferences and privacy consent"
      className="fixed bottom-16 sm:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 sm:p-5 transition-all duration-300 text-slate-800 dark:text-slate-200 animate-in fade-in slide-in-from-bottom-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Cookie size={20} />
          </div>
          <div>
            <h2 className="font-display font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-tight">
              Cookie & Privacy Notice
            </h2>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Sunshine Classes Pihani</p>
          </div>
        </div>

        <button
          id="btn-dismiss-cookie-banner"
          onClick={handleEssentialOnly}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors cursor-pointer"
          title="Close notice (essential cookies only)"
        >
          <X size={16} />
        </button>
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-300 mt-2.5 leading-relaxed">
        We use essential cookies and anonymized analytics to deliver safe student logins, maintain your theme preferences, and optimize study material downloads.
      </p>

      <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <button
          id="btn-view-privacy-from-banner"
          onClick={() => {
            navigate('/privacy');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
        >
          <span>Read Privacy Policy</span>
          <ArrowRight size={11} />
        </button>

        <div className="flex items-center gap-2">
          <button
            id="btn-cookie-essential-only"
            onClick={handleEssentialOnly}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
          >
            Essential Only
          </button>
          <button
            id="btn-cookie-accept-all"
            onClick={handleAcceptAll}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black transition-all shadow-xs inline-flex items-center gap-1 cursor-pointer"
          >
            <Check size={13} />
            <span>Accept All</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
