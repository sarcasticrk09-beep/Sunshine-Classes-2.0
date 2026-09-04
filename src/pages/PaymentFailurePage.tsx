import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  XCircle, 
  RefreshCw, 
  Phone, 
  Home, 
  ArrowLeft, 
  AlertCircle, 
  Building2, 
  ShieldAlert,
  CreditCard,
  MessageCircle
} from 'lucide-react';
import SunshineLogo from '../components/SunshineLogo';

export const PaymentFailurePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as any) || {};
  const queryParams = new URLSearchParams(location.search);

  const studentName = queryParams.get('student') || state.studentName || 'Student';
  const amount = queryParams.get('amount') || state.amount || '0';
  const month = queryParams.get('month') || state.month || 'Current Cycle';
  const failureReason = queryParams.get('reason') || state.reason || 'Payment authorization was timed out or declined by your bank / UPI provider.';
  const transactionId = queryParams.get('txnId') || state.transactionId || 'TXN-FAIL-' + Date.now().toString().slice(-6);

  return (
    <div id="page-payment-failure-container" className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between text-slate-800 dark:text-slate-200 transition-colors duration-300">
      
      {/* Top Header */}
      <header className="border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <Link
          id="btn-failure-logo-home"
          to="/"
          className="flex items-center gap-2.5 focus:outline-none"
          title="Back to Sunshine Classes Home"
        >
          <SunshineLogo size="sm" showText={true} textSubTitle="Fee Payment Notice" />
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            id="btn-failure-header-fees"
            onClick={() => navigate('/fees')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer"
          >
            <CreditCard size={14} className="text-amber-500" />
            <span className="hidden xs:inline">Fees Portal</span>
          </button>
          
          <a
            id="btn-failure-header-call"
            href="tel:+918707738284"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all shadow-xs"
          >
            <Phone size={13} className="stroke-[2.5]" />
            <span className="hidden sm:inline">Helpdesk 8707738284</span>
          </a>
        </div>
      </header>

      {/* Main Payment Failure Body */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900/40 shadow-2xl p-6 sm:p-8 relative overflow-hidden text-center space-y-6">
          
          {/* Top Red Accent Stripe */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-rose-600 via-red-500 to-amber-500"></div>

          {/* Status Badge & Icon */}
          <div className="flex flex-col items-center gap-3 pt-2">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 text-rose-500 flex items-center justify-center shadow-inner">
              <XCircle size={40} className="stroke-[2.5]" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-xs font-black uppercase tracking-wider">
              <ShieldAlert size={14} />
              <span>Payment Not Completed</span>
            </div>
          </div>

          {/* Title & Explanation */}
          <div className="space-y-2">
            <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Transaction Interrupted or Declined
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
              No money has been debited from your student ledger. If amount was deducted by your bank, it will be automatically refunded within 24–48 hours by your payment provider.
            </p>
          </div>

          {/* Attempted Transaction Summary Box */}
          <div className="bg-slate-50 dark:bg-slate-850 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 text-left space-y-2.5 text-xs">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-750 pb-2">
              <span className="text-slate-400 font-bold">Candidate:</span>
              <span className="font-extrabold text-slate-800 dark:text-slate-200">{studentName}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-750 pb-2">
              <span className="text-slate-400 font-bold">Billing Month:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{month}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-750 pb-2">
              <span className="text-slate-400 font-bold">Attempted Amount:</span>
              <span className="font-black text-rose-600 dark:text-rose-400 text-sm">₹{amount}</span>
            </div>
            <div className="flex justify-between items-start pt-1">
              <span className="text-slate-400 font-bold shrink-0">Reason:</span>
              <span className="font-medium text-slate-600 dark:text-slate-300 text-right pl-4">{failureReason}</span>
            </div>
          </div>

          {/* Resolution Options */}
          <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 rounded-xl border border-amber-200/80 dark:border-amber-800/40 text-left flex items-start gap-2.5">
            <Building2 size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-[11px] space-y-1">
              <span className="font-black text-amber-800 dark:text-amber-300 block">Can't pay online? Pay in cash or via reception QR:</span>
              <p className="text-amber-700 dark:text-amber-400/90 leading-relaxed">
                Parents and students can pay tuition fees directly at our Pihani campus counter from 08:00 AM to 06:30 PM, Monday through Saturday.
              </p>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              id="btn-payment-failure-retry"
              onClick={() => navigate('/fees')}
              className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
            >
              <RefreshCw size={14} />
              <span>Retry Payment</span>
            </button>

            <button
              id="btn-payment-failure-home"
              onClick={() => navigate('/')}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-black text-xs transition-all shadow-sm active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 border border-slate-700"
            >
              <Home size={14} />
              <span>Back to Homepage</span>
            </button>
          </div>

          {/* Secondary Action Contacts */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs border-t border-slate-100 dark:border-slate-800">
            <a
              id="btn-payment-failure-whatsapp"
              href="https://wa.me/919161586254?text=Hello!%20My%20fee%20payment%20failed%20on%20the%20portal."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer py-1.5 px-2"
            >
              <MessageCircle size={14} />
              <span>WhatsApp Accounts Help</span>
            </a>

            <a
              id="btn-payment-failure-call"
              href="tel:+918707738284"
              className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-bold hover:text-amber-500 cursor-pointer py-1.5 px-2"
            >
              <Phone size={13} />
              <span>Desk: 8707738284</span>
            </a>
          </div>

        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 py-4 px-4 text-center text-xs text-slate-400 dark:text-slate-500">
        <p>Sunshine Classes ERP Accounts Desk • Station Road, Pihani, Hardoi</p>
      </footer>

    </div>
  );
};
