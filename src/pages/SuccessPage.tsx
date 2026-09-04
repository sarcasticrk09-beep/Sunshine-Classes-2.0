import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  Printer, 
  Share2, 
  Home, 
  ArrowRight, 
  Download, 
  Copy, 
  Check, 
  ShieldCheck, 
  FileText, 
  Calendar, 
  Phone, 
  CreditCard, 
  BookOpen, 
  GraduationCap, 
  ShoppingBag,
  ExternalLink,
  MessageCircle
} from 'lucide-react';
import SunshineLogo from '../components/SunshineLogo';

export type SuccessType = 'payment' | 'admission' | 'store' | 'contact' | 'security' | 'general';

export interface SuccessPageProps {
  defaultType?: SuccessType;
  defaultTitle?: string;
  defaultMessage?: string;
}

export const SuccessPage: React.FC<SuccessPageProps> = ({
  defaultType,
  defaultTitle,
  defaultMessage
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as any) || {};
  const queryParams = new URLSearchParams(location.search);

  const type: SuccessType = (defaultType || queryParams.get('type') || state.type || 'general') as SuccessType;

  // Dynamic context fields
  const refId = queryParams.get('receiptId') || queryParams.get('id') || state.receiptId || state.id || state.refId || 'SUN-' + Math.floor(100000 + Math.random() * 900000);
  const studentName = queryParams.get('student') || queryParams.get('name') || state.studentName || state.name || 'Enrolled Student';
  const studentClass = queryParams.get('class') || state.class || 'Class 10 (Secondary)';
  const amount = queryParams.get('amount') || state.amount || '0';
  const month = queryParams.get('month') || state.month || 'Current Academic Cycle';
  const paymentMethod = queryParams.get('method') || state.paymentMethod || 'Online Transfer';
  const phone = queryParams.get('phone') || state.phone || '';
  const batch = queryParams.get('batch') || state.batch || 'Morning Batch (07:00 AM - 09:30 AM)';

  const [copied, setCopied] = useState<boolean>(false);

  const handleCopyRef = () => {
    navigator.clipboard.writeText(refId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `*Sunshine Classes Confirmation Slip*\n` +
      `Type: ${type.toUpperCase()}\n` +
      `Reference ID: ${refId}\n` +
      `Name: ${studentName}\n` +
      `Class: ${studentClass}\n` +
      (type === 'payment' ? `Amount: ₹${amount}\nMonth: ${month}\n` : '') +
      `Official Portal: https://sunshineclassespihani.com`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  // Type configs
  const getHeaderConfig = () => {
    switch (type) {
      case 'payment':
        return {
          badge: 'Payment Successful',
          title: defaultTitle || 'Tuition Fee Payment Received',
          description: defaultMessage || 'Your payment has been successfully recorded in the Sunshine ERP Cloud ledger and verified with an authorized cryptographic receipt.',
          icon: CreditCard,
          sealLabel: 'AUTHENTICATED FEE RECEIPT',
          actionText: 'Return to Fees Portal',
          actionUrl: '/fees'
        };
      case 'admission':
        return {
          badge: 'Admission Application Submitted',
          title: defaultTitle || 'Enrollment Form Received',
          description: defaultMessage || 'Your student admission application has been registered with Sunshine Classes Academic Administration for the 2026–27 session.',
          icon: GraduationCap,
          sealLabel: 'OFFICIAL ENROLLMENT SLIP',
          actionText: 'Go to Admissions Portal',
          actionUrl: '/admissions'
        };
      case 'store':
        return {
          badge: 'Order / Request Received',
          title: defaultTitle || 'Bookstore Item Request Confirmed',
          description: defaultMessage || 'Your study material & bookstore reservation has been confirmed. You can collect physical items from our campus bookstore counter.',
          icon: ShoppingBag,
          sealLabel: 'STORE RESERVATION PASS',
          actionText: 'Continue Browsing Store',
          actionUrl: '/store'
        };
      case 'contact':
        return {
          badge: 'Inquiry Submitted',
          title: defaultTitle || 'Message Received by Reception Desk',
          description: defaultMessage || 'Thank you for reaching out to Sunshine Classes. Our admission and counseling desk will contact you within 2 working hours.',
          icon: FileText,
          sealLabel: 'INQUIRY ACKNOWLEDGMENT',
          actionText: 'Back to Homepage',
          actionUrl: '/'
        };
      case 'security':
        return {
          badge: 'Security Credentials Updated',
          title: defaultTitle || 'Account Security Update Completed',
          description: defaultMessage || 'Your access credentials have been securely updated. All active sessions have been encrypted.',
          icon: ShieldCheck,
          sealLabel: 'SECURITY AUDIT PASSED',
          actionText: 'Proceed to Login',
          actionUrl: '/login'
        };
      default:
        return {
          badge: 'Operation Successful',
          title: defaultTitle || 'Action Completed Successfully',
          description: defaultMessage || 'Your request was processed cleanly without error and synchronized with the Sunshine ERP system.',
          icon: CheckCircle2,
          sealLabel: 'CONFIRMED BY SUNSHINE ERP',
          actionText: 'Return to Home',
          actionUrl: '/'
        };
    }
  };

  const config = getHeaderConfig();
  const IconComponent = config.icon;

  return (
    <div id="page-success-container" className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between text-slate-800 dark:text-slate-200 transition-colors duration-300 print:bg-white print:text-black">
      
      {/* Top Header - Hidden on Print */}
      <header className="border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between print:hidden">
        <Link
          id="btn-success-logo-home"
          to="/"
          className="flex items-center gap-2.5 focus:outline-none"
          title="Sunshine Classes Home"
        >
          <SunshineLogo size="sm" showText={true} textSubTitle="Official Confirmation" />
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            id="btn-success-header-home"
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer"
          >
            <Home size={14} className="text-amber-500" />
            <span className="hidden xs:inline">Home</span>
          </button>

          <button
            id="btn-success-header-print"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Printer size={14} className="text-amber-400" />
            <span className="hidden sm:inline">Print Slip</span>
          </button>
        </div>
      </header>

      {/* Main Success Content Body */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-emerald-200 dark:border-emerald-900/40 shadow-2xl p-6 sm:p-10 relative overflow-hidden space-y-6 print:border-none print:shadow-none print:p-0">
          
          {/* Top Emerald Accent Stripe - Hidden on Print */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500 print:hidden"></div>

          {/* Verification Badge */}
          <div className="text-center space-y-3 pt-2">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 size={40} className="stroke-[2.5]" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-black uppercase tracking-wider">
              <ShieldCheck size={14} />
              <span>{config.badge}</span>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {config.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed print:text-black">
              {config.description}
            </p>
          </div>

          {/* OFFICIAL RECEIPT / SLIP CARD */}
          <div 
            id="official-slip-preview" 
            className="rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850 p-5 sm:p-6 space-y-5 relative overflow-hidden print:border print:border-slate-400 print:bg-white print:text-black"
          >
            {/* Header of Slip */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-750 pb-4 text-center sm:text-left">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                  {config.sealLabel}
                </span>
                <h3 className="font-display font-black text-base sm:text-lg text-slate-900 dark:text-white print:text-black">
                  Sunshine Classes Digital ERP Slip
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">Station Road, Pihani, Hardoi, U.P. • Helpline: 8707738284</p>
              </div>

              {/* Ref ID Badge */}
              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-center shrink-0">
                <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Reference No.</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-black text-sm text-slate-900 dark:text-amber-400 print:text-black">{refId}</span>
                  <button
                    id="btn-success-copy-ref"
                    onClick={handleCopyRef}
                    className="text-slate-400 hover:text-amber-500 cursor-pointer p-0.5 print:hidden"
                    title="Copy Reference Number"
                  >
                    {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Slip Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div className="bg-white dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800 print:border-slate-300">
                <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Candidate / Student</span>
                <span className="font-extrabold text-slate-900 dark:text-white text-sm block mt-0.5 print:text-black">{studentName}</span>
                <span className="text-slate-500 text-[11px] block">{studentClass}</span>
              </div>

              <div className="bg-white dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800 print:border-slate-300">
                <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Issue Date & Time</span>
                <span className="font-extrabold text-slate-900 dark:text-white text-sm block mt-0.5 print:text-black">
                  {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
                <span className="text-slate-500 text-[11px] block">
                  {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST
                </span>
              </div>

              {type === 'payment' && (
                <>
                  <div className="bg-white dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800 print:border-slate-300">
                    <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Fee Billing Cycle</span>
                    <span className="font-extrabold text-slate-900 dark:text-white text-sm block mt-0.5 print:text-black">{month}</span>
                    <span className="text-slate-500 text-[11px] block">Method: {paymentMethod}</span>
                  </div>

                  <div className="bg-emerald-50/80 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 print:border-slate-300">
                    <span className="text-emerald-800 dark:text-emerald-400 block text-[10px] font-black uppercase tracking-wider">Amount Paid</span>
                    <span className="font-display font-black text-emerald-700 dark:text-emerald-300 text-xl block mt-0.5 print:text-black">
                      ₹{amount}
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 text-[10px] font-bold block">Status: CLEARED & CREDITED</span>
                  </div>
                </>
              )}

              {type === 'admission' && (
                <>
                  <div className="bg-white dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800 print:border-slate-300">
                    <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Allotted Batch / Timing</span>
                    <span className="font-extrabold text-slate-900 dark:text-white text-xs block mt-0.5 print:text-black">{batch}</span>
                    <span className="text-slate-500 text-[10px] block">Pihani Campus Classroom</span>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-200 dark:border-amber-800 print:border-slate-300">
                    <span className="text-amber-800 dark:text-amber-400 block text-[10px] font-black uppercase tracking-wider">Admission Status</span>
                    <span className="font-extrabold text-amber-700 dark:text-amber-300 text-xs block mt-0.5 print:text-black">
                      ACTIVE APPLICANT
                    </span>
                    <span className="text-amber-600 dark:text-amber-400 text-[10px] block">Orientation at reception desk</span>
                  </div>
                </>
              )}
            </div>

            {/* Authenticity Footer Note */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-750 text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
                <span>Digitally signed & verified by Sunshine Classes Cloud Database.</span>
              </div>
              
              {type === 'payment' && (
                <Link
                  id="link-success-verify-receipt"
                  to={`/verify/receipt/${refId}`}
                  className="text-amber-600 dark:text-amber-400 font-bold hover:underline inline-flex items-center gap-1 print:hidden"
                >
                  <span>Verify Online</span>
                  <ExternalLink size={11} />
                </Link>
              )}
            </div>
          </div>

          {/* Action Buttons Row - Hidden on Print */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 print:hidden">
            <button
              id="btn-success-primary-action"
              onClick={() => navigate(config.actionUrl)}
              className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{config.actionText}</span>
              <ArrowRight size={14} />
            </button>

            <button
              id="btn-success-print-action"
              onClick={handlePrint}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-black text-xs transition-all shadow-sm active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 border border-slate-700"
            >
              <Printer size={14} className="text-amber-400" />
              <span>Print Official Slip / Receipt</span>
            </button>
          </div>

          {/* Secondary Options: WhatsApp Share and Support - Hidden on Print */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs border-t border-slate-100 dark:border-slate-800 print:hidden">
            <button
              id="btn-success-whatsapp-share"
              onClick={handleShareWhatsApp}
              className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer py-1.5 px-2"
            >
              <MessageCircle size={14} />
              <span>Share Slip on WhatsApp</span>
            </button>

            <a
              id="btn-success-call-desk"
              href="tel:+918707738284"
              className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-bold hover:text-amber-500 cursor-pointer py-1.5 px-2"
            >
              <Phone size={13} />
              <span>Desk Helpline: 8707738284</span>
            </a>

            <button
              id="btn-success-back-home"
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-bold cursor-pointer py-1.5 px-2"
            >
              <Home size={13} />
              <span>Return Home</span>
            </button>
          </div>

        </div>
      </main>

      {/* Bottom Footer - Hidden on Print */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 py-4 px-4 text-center text-xs text-slate-400 dark:text-slate-500 print:hidden">
        <p>Sunshine Classes ERP Digital Ledger • Pihani, Hardoi (U.P.)</p>
      </footer>

    </div>
  );
};
