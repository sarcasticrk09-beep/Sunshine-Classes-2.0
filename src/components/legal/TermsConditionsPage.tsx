import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Award, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  CreditCard,
  Printer
} from 'lucide-react';
import SunshineLogo from '../SunshineLogo';

export const TermsConditionsPage: React.FC = () => {
  const navigate = useNavigate();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="terms-conditions-page" className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-300">
      
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            id="btn-terms-back"
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
            title="Go Back"
          >
            <ArrowLeft size={16} />
          </button>
          <button
            id="btn-terms-logo-home"
            onClick={() => navigate('/')}
            className="cursor-pointer focus:outline-none flex items-center gap-2"
          >
            <SunshineLogo size="sm" showText={true} textSubTitle="Pihani, Hardoi" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-print-terms-page"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer text-slate-700 dark:text-slate-300"
          >
            <Printer size={14} />
            <span className="hidden sm:inline">Print Terms</span>
          </button>
          <button
            id="btn-terms-home-nav"
            onClick={() => navigate('/')}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black transition-all shadow-xs cursor-pointer"
          >
            Home
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        
        {/* Title Banner */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white border border-white/30 text-xs font-black">
              <Award size={14} />
              <span>Academic Regulations & Student Code of Conduct</span>
            </div>
            <h1 className="font-display text-2xl sm:text-4xl font-black tracking-tight">
              Terms of Admission & Code of Conduct
            </h1>
            <p className="text-xs sm:text-sm text-amber-100 max-w-2xl leading-relaxed">
              Guidelines, financial terms, fee payment schedules, attendance requirements, and disciplinary standards governing students and parents enrolled at Sunshine Classes Pihani.
            </p>
            <div className="pt-2 text-[11px] text-amber-200 font-medium">
              Academic Session 2026–2027 • Approved by Sunshine Classes Management
            </div>
          </div>
        </div>

        {/* Essential Rules Grid (13 Strict Articles) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="font-display font-black text-lg text-slate-900 dark:text-white">
                Institutional Rules & Student Charter
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                13 foundational rules applicable to all enrolled students from Class 1 to Class 10.
              </p>
            </div>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full">
              13 Directives
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            
            {/* Rule 1 */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs items-center justify-center">1</span>
                <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Punctuality & Arrival</h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Students must reach the campus at least 5 minutes before their scheduled batch timing. Late entry disturbs ongoing lectures and may lead to denial of entry for that session.
              </p>
            </div>

            {/* Rule 2 */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs items-center justify-center">2</span>
                <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Mandatory Attendance</h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Regular attendance is compulsory. Minimum 85% attendance is required for sitting in end-of-term institute mock board exams. No fee adjustments or discounts are granted for student absences.
              </p>
            </div>

            {/* Rule 3 */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs items-center justify-center">3</span>
                <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Academic Work & Homework</h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                All daily practice problem sheets (DPPs), NCERT textbook exercises, and weekly mock test papers must be submitted on time. Repeated non-submission triggers parent notification.
              </p>
            </div>

            {/* Rule 4 */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs items-center justify-center">4</span>
                <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Campus Respect & Discipline</h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Students must maintain high standards of decorum and show utmost respect towards teaching faculty, administrative assistants, and fellow classmates at all times.
              </p>
            </div>

            {/* Rule 5 */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs items-center justify-center">5</span>
                <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Mobile Phone Regulations</h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Mobile phones brought to the campus must remain switched off or on silent mode inside classrooms. Unauthorized phone use during lectures will result in temporary confiscation.
              </p>
            </div>

            {/* Rule 6 */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs items-center justify-center">6</span>
                <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Monthly Fee Deadlines</h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Monthly tuition fees must be deposited within the first 5 days of each calendar month. Payments can be submitted via cash at reception desk or via digital UPI QR on our portal.
              </p>
            </div>

            {/* Rule 7 */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs items-center justify-center">7</span>
                <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Non-Refundable Policy</h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Tuition fees and store material charges once paid are strictly non-refundable and non-transferable under any circumstances once the batch tenure has commenced.
              </p>
            </div>

            {/* Rule 8 */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs items-center justify-center">8</span>
                <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Fee Arrears & Access Suspension</h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Unresolved fee dues exceeding 15 days from due date will result in temporary suspension of ERP portal access, study material downloads, and classroom attendance.
              </p>
            </div>

            {/* Rule 9 */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs items-center justify-center">9</span>
                <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Advance Billing Plans</h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Parents opting for Quarterly (3 Months), Half-Yearly (6 Months), or Annual fee payments in advance are eligible for institution promotional concessions.
              </p>
            </div>

            {/* Rule 10 */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs items-center justify-center">10</span>
                <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Institute Property Safety</h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Any deliberate physical breakage or digital tampering with institute furniture, smart display screens, or library books will be billed directly to the student’s guardian.
              </p>
            </div>

            {/* Rule 11 */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs items-center justify-center">11</span>
                <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Schedule & Faculty Rights</h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                The academic management reserves the prerogative to reassign batch timings, classroom halls, or subject teachers when required for academic enhancement.
              </p>
            </div>

            {/* Rule 12 */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs items-center justify-center">12</span>
                <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Disciplinary Termination</h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Admission may be revoked unilaterally in cases of severe indiscipline, bullying, exam malpractice, or persistent defiance of institute staff directives.
              </p>
            </div>

            {/* Rule 13 (Full Width Final Clause) */}
            <div className="p-4 sm:col-span-2 rounded-2xl border border-amber-300 dark:border-amber-700/80 bg-amber-500/10 space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs items-center justify-center">13</span>
                <h3 className="font-bold text-amber-900 dark:text-amber-300 text-xs uppercase tracking-wider">Final Authority Clause</h3>
              </div>
              <p className="text-xs text-slate-700 dark:text-amber-100 font-medium leading-relaxed">
                The decision of the SUNSHINE CLASSES Management and Advisory Board shall be definitive, final, and binding on all students and parents in all academic, operational, and financial deliberations.
              </p>
            </div>

          </div>

        </div>

        {/* Official Campus Contact Info */}
        <div className="p-6 rounded-3xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <MapPin size={16} className="text-amber-500" />
            <span>Sunshine Classes Campus Office</span>
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Mohalla Mishrana, Opposite Subhash Park, Pihani, Hardoi, Uttar Pradesh - 241406
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-700 dark:text-slate-300 font-semibold">
            <span className="flex items-center gap-1"><Phone size={13} className="text-indigo-500" /> +91 8707738284 / 9161586254</span>
            <span className="flex items-center gap-1"><Mail size={13} className="text-amber-500" /> contact@sunshineclasses.org</span>
            <span className="flex items-center gap-1"><Globe size={13} className="text-emerald-500" /> sunshineclasses.net</span>
          </div>
        </div>

        {/* Back navigation CTA */}
        <div className="text-center pt-4">
          <button
            id="btn-terms-return-home-bottom"
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
