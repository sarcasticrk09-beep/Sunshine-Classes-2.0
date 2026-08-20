import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Lock, 
  FileText, 
  CheckCircle2, 
  Users, 
  Database,
  Printer
} from 'lucide-react';
import SunshineLogo from '../SunshineLogo';

export const PrivacyPolicyPage: React.FC = () => {
  const navigate = useNavigate();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="privacy-policy-page" className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-300">
      
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            id="btn-privacy-back"
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
            title="Go Back"
          >
            <ArrowLeft size={16} />
          </button>
          <button
            id="btn-privacy-logo-home"
            onClick={() => navigate('/')}
            className="cursor-pointer focus:outline-none flex items-center gap-2"
          >
            <SunshineLogo size="sm" showText={true} textSubTitle="Pihani, Hardoi" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-print-privacy-page"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer text-slate-700 dark:text-slate-300"
          >
            <Printer size={14} />
            <span className="hidden sm:inline">Print Policy</span>
          </button>
          <button
            id="btn-privacy-home-nav"
            onClick={() => navigate('/')}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black transition-all shadow-xs cursor-pointer"
          >
            Home
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        
        {/* Title Section */}
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-indigo-800/60">
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-black">
              <ShieldCheck size={14} />
              <span>Official Institutional Privacy Policy</span>
            </div>
            <h1 className="font-display text-2xl sm:text-4xl font-black tracking-tight">
              Privacy Policy & Data Protection
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200 max-w-2xl leading-relaxed">
              Sunshine Classes is committed to protecting the privacy, identity, and personal records of our students, parents, and website visitors in accordance with applicable Indian data privacy regulations.
            </p>
            <div className="pt-2 text-[11px] text-slate-400 font-medium">
              Academic Session 2026–2027 • Effective Date: January 1, 2026
            </div>
          </div>
        </div>

        {/* Policy Highlights Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5 shadow-xs">
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Lock size={16} />
            </div>
            <h2 className="font-display font-bold text-xs sm:text-sm text-slate-900 dark:text-white">Zero Data Selling</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Student & parent phone numbers are never shared or sold to third-party telemarketers.</p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5 shadow-xs">
            <div className="h-8 w-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Database size={16} />
            </div>
            <h2 className="font-display font-bold text-xs sm:text-sm text-slate-900 dark:text-white">Encrypted ERP Storage</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Academic marks, attendance records, and payment logs are protected with secure SSL encryption.</p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5 shadow-xs">
            <div className="h-8 w-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Users size={16} />
            </div>
            <h2 className="font-display font-bold text-xs sm:text-sm text-slate-900 dark:text-white">Parent Access Rights</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Parents have complete rights to view, verify, and request updates to their ward's academic records.</p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          
          {/* Section 1 */}
          <section className="space-y-3 pb-6 border-b border-slate-100 dark:border-slate-800">
            <h2 className="font-display font-black text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <span className="flex h-6 w-6 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs items-center justify-center font-black">1</span>
              <span>Information We Collect</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              When enrolling for tuition batches, submitting admission forms, purchasing books from Sunshine Store, or interacting with our web portal, we may collect the following categories of information:
            </p>
            <ul className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 space-y-2 list-disc pl-5">
              <li><strong>Student Credentials:</strong> Full Name, Date of Birth, Gender, Class/Grade (1st to 10th), School Name, and Passport-size Photograph.</li>
              <li><strong>Parent / Guardian Details:</strong> Father’s Name, Mother’s Name, Residential Address, Primary Parent Mobile Number, and WhatsApp Number.</li>
              <li><strong>Academic Progress Logs:</strong> Attendance logs, weekly test scores, mock exam marks, teacher remarks, homework submissions, and batch allocations.</li>
              <li><strong>Financial Transactions:</strong> Fee payment records, UPI transaction IDs, invoice numbers, billing history, and digital receipt logs.</li>
              <li><strong>Website Technical Telemetry:</strong> Anonymized browser type, device category, IP address, and cookie identifiers for service performance and security.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3 pb-6 border-b border-slate-100 dark:border-slate-800">
            <h2 className="font-display font-black text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <span className="flex h-6 w-6 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs items-center justify-center font-black">2</span>
              <span>How We Use Your Information</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Sunshine Classes uses the collected information strictly for legitimate educational, administrative, and communicative purposes, including:
            </p>
            <ul className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 space-y-2 list-disc pl-5">
              <li>Allocating unique Student Roll Numbers and managing batch rosters for Classes 1 to 10.</li>
              <li>Transmitting automated SMS/WhatsApp alerts for attendance, fee reminders, test results, and holiday announcements.</li>
              <li>Generating verified, tamper-proof GST and tuition fee receipts with verifiable QR codes.</li>
              <li>Providing authenticated access to the Sunshine ERP Student Portal and Study Material Download Hub.</li>
              <li>Ensuring campus security, discipline, and student safety during operational coaching hours.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 pb-6 border-b border-slate-100 dark:border-slate-800">
            <h2 className="font-display font-black text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <span className="flex h-6 w-6 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs items-center justify-center font-black">3</span>
              <span>Cookies & Web Analytics Policy</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Our website uses essential session cookies and Google Analytics 4 (GA4) telemetry to optimize loading speed, preserve your dark/light theme choice, remember login sessions, and measure page navigation efficiency. You can manage or disable non-essential cookies at any time via your browser settings or our on-site cookie consent banner.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 pb-6 border-b border-slate-100 dark:border-slate-800">
            <h2 className="font-display font-black text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <span className="flex h-6 w-6 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs items-center justify-center font-black">4</span>
              <span>Data Retention & Security Safeguards</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              We implement industry-standard physical, electronic, and procedural safeguards to preserve the confidentiality and integrity of student records. Data is stored on secure cloud database servers with automated encrypted daily backups. Academic records are preserved for the duration of the student's active enrollment plus the statutory record-keeping period.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="font-display font-black text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <span className="flex h-6 w-6 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs items-center justify-center font-black">5</span>
              <span>Contact Our Privacy Grievance Officer</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              If you have any questions, concerns, or requests regarding this Privacy Policy or your ward's personal data records, please reach our administrative office:
            </p>
            
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <MapPin size={15} className="text-amber-500" />
                <span>Sunshine Classes Campus Helpdesk</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400">
                Mohalla Mishrana, Opposite Subhash Park, Pihani, Hardoi, Uttar Pradesh - 241406
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-1 text-slate-700 dark:text-slate-300 font-semibold">
                <span className="flex items-center gap-1"><Phone size={13} className="text-indigo-500" /> +91 8707738284 / 9161586254</span>
                <span className="flex items-center gap-1"><Mail size={13} className="text-amber-500" /> contact@sunshineclasses.org</span>
                <span className="flex items-center gap-1"><Globe size={13} className="text-emerald-500" /> sunshineclasses.net</span>
              </div>
            </div>
          </section>

        </div>

        {/* Back navigation CTA */}
        <div className="text-center pt-4">
          <button
            id="btn-privacy-return-home-bottom"
            onClick={() => { navigate('/'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-md cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Return to Sunshine Classes Homepage</span>
          </button>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>© {new Date().getFullYear()} Sunshine Classes Pihani, Hardoi. All rights reserved.</p>
      </footer>

    </div>
  );
};
