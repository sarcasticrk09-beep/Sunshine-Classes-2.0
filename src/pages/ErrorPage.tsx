import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  Phone, 
  ArrowLeft, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  ShieldAlert, 
  WifiOff, 
  LogIn,
  MessageCircle
} from 'lucide-react';
import SunshineLogo from '../components/SunshineLogo';

export interface ErrorPageProps {
  defaultStatusCode?: string | number;
  defaultTitle?: string;
  defaultMessage?: string;
  errorDetails?: string;
  onRetry?: () => void;
}

export const ErrorPage: React.FC<ErrorPageProps> = ({
  defaultStatusCode,
  defaultTitle,
  defaultMessage,
  errorDetails: directErrorDetails,
  onRetry
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as any) || {};

  // Extract from query params or location state or props
  const queryParams = new URLSearchParams(location.search);
  const statusCode = 
    defaultStatusCode || 
    queryParams.get('code') || 
    state.statusCode || 
    '500';

  const title = 
    defaultTitle || 
    queryParams.get('title') || 
    state.title || 
    'Something went wrong';

  const message = 
    defaultMessage || 
    queryParams.get('msg') || 
    queryParams.get('message') || 
    state.message || 
    'The system encountered an unexpected issue while processing your request. Your account and records remain secure.';

  const errorDetails = 
    directErrorDetails || 
    state.errorDetails || 
    queryParams.get('details') || 
    `Timestamp: ${new Date().toISOString()}\nPath: ${location.pathname}\nCode: ${statusCode}`;

  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopyDetails = () => {
    navigator.clipboard.writeText(errorDetails);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReload = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const isNetworkError = statusCode === 'ERR_NETWORK' || statusCode === 'OFFLINE';

  return (
    <div id="page-error-container" className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between text-slate-800 dark:text-slate-200 transition-colors duration-300">
      
      {/* Top Header */}
      <header className="border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <Link
          id="btn-error-logo-home"
          to="/"
          className="flex items-center gap-2.5 focus:outline-none"
          title="Back to Sunshine Classes Home"
        >
          <SunshineLogo size="sm" showText={true} textSubTitle="Pihani, Hardoi" />
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            id="btn-error-header-home"
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer"
          >
            <Home size={14} className="text-amber-500" />
            <span className="hidden xs:inline">Home</span>
          </button>
          
          <a
            id="btn-error-header-whatsapp"
            href="https://wa.me/919161586254?text=Hello!%20I%20encountered%20an%20error%20on%20the%20Sunshine%20Classes%20portal."
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs"
          >
            <MessageCircle size={14} />
            <span className="hidden sm:inline">WhatsApp Helpdesk</span>
          </a>
        </div>
      </header>

      {/* Main Error Body */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-rose-200/80 dark:border-rose-900/40 shadow-2xl p-6 sm:p-8 relative overflow-hidden text-center space-y-6">
          
          {/* Top colored accent stripe */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-rose-500 via-amber-500 to-red-600"></div>

          {/* Status Badge & Icon */}
          <div className="flex flex-col items-center gap-3 pt-2">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 text-rose-500 flex items-center justify-center shadow-inner">
              {isNetworkError ? (
                <WifiOff size={36} className="animate-pulse" />
              ) : (
                <AlertTriangle size={36} className="animate-bounce" />
              )}
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-[11px] font-black uppercase tracking-wider">
              <ShieldAlert size={13} />
              <span>Error Code: {statusCode}</span>
            </div>
          </div>

          {/* Title and Message */}
          <div className="space-y-2">
            <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
              {message}
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              id="btn-error-retry"
              type="button"
              onClick={handleReload}
              className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
            >
              <RefreshCw size={15} />
              <span>Try Again / Reload</span>
            </button>

            <button
              id="btn-error-home"
              type="button"
              onClick={() => navigate('/')}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-black text-xs transition-all shadow-sm active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 border border-slate-700"
            >
              <Home size={15} />
              <span>Return to Homepage</span>
            </button>
          </div>

          {/* Secondary Support Links */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1 text-xs border-t border-slate-100 dark:border-slate-800">
            <button
              id="btn-error-back"
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-bold cursor-pointer py-1.5 px-2"
            >
              <ArrowLeft size={13} />
              <span>Previous Page</span>
            </button>

            <button
              id="btn-error-login"
              type="button"
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold hover:underline cursor-pointer py-1.5 px-2"
            >
              <LogIn size={13} />
              <span>ERP Portal Login</span>
            </button>

            <a
              id="btn-error-call-helpdesk"
              href="tel:+918707738284"
              className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-bold hover:text-amber-500 cursor-pointer py-1.5 px-2"
            >
              <Phone size={13} />
              <span>Call Helpdesk (8707738284)</span>
            </a>
          </div>

          {/* Technical Diagnostic Accordion */}
          {errorDetails && (
            <div className="text-left border border-slate-200 dark:border-slate-800 rounded-2xl p-3 bg-slate-50 dark:bg-slate-850 text-xs">
              <button
                id="btn-error-toggle-details"
                type="button"
                onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                className="w-full flex items-center justify-between font-bold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
              >
                <span>Diagnostic Information</span>
                {showTechnicalDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {showTechnicalDetails && (
                <div className="mt-2.5 pt-2.5 border-t border-slate-200 dark:border-slate-750 space-y-2">
                  <pre className="text-[11px] font-mono text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 p-2.5 rounded-xl overflow-x-auto whitespace-pre-wrap max-h-36">
                    {errorDetails}
                  </pre>
                  <button
                    id="btn-error-copy-details"
                    type="button"
                    onClick={handleCopyDetails}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copied ? 'Copied to Clipboard!' : 'Copy Diagnostic Logs'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      {/* Bottom Simple Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 py-4 px-4 text-center text-xs text-slate-400 dark:text-slate-500">
        <p>Sunshine Classes ERP Technical Incident Center • Pihani, Hardoi, Uttar Pradesh</p>
      </footer>

    </div>
  );
};
