import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  GraduationCap, 
  ShoppingBag, 
  PhoneCall, 
  ArrowLeft, 
  Search, 
  Compass,
  FileQuestion,
  HelpCircle
} from 'lucide-react';
import SunshineLogo from './SunshineLogo';

interface NotFoundPageProps {
  onNavigateToHome?: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigateToHome }) => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    if (onNavigateToHome) {
      onNavigateToHome();
    } else {
      navigate('/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div id="page-not-found-container" className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between text-slate-800 dark:text-slate-200 transition-colors duration-300">
      
      {/* Top Simple Header */}
      <header className="border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <button
          id="btn-404-logo-home"
          onClick={handleGoHome}
          className="flex items-center gap-2.5 cursor-pointer focus:outline-none"
          title="Back to Sunshine Classes Home"
        >
          <SunshineLogo size="sm" showText={true} textSubTitle="Pihani, Hardoi" />
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            id="btn-404-header-home"
            onClick={handleGoHome}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer"
          >
            <Home size={14} className="text-amber-500" />
            <span>Home</span>
          </button>
          
          <a
            id="btn-404-header-whatsapp"
            href="https://wa.me/919161586254?text=Hello!%20I%20got%20lost%20on%20the%20Sunshine%20Classes%20website."
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-xs"
          >
            <PhoneCall size={14} />
            <span className="hidden sm:inline">WhatsApp Help</span>
          </a>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12 relative overflow-hidden">
        
        {/* Subtle Ambient Background Gradients */}
        <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

        <div className="max-w-2xl w-full text-center space-y-6 sm:space-y-8 relative z-10 py-8">
          
          {/* 404 Eyebrow and Graphic Badge */}
          <div className="inline-flex flex-col items-center">
            <div className="relative">
              <span className="font-display font-black text-7xl sm:text-9xl text-slate-200 dark:text-slate-800/80 tracking-tighter select-none">
                404
              </span>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-lg backdrop-blur-xs animate-bounce">
                  <FileQuestion size={36} className="sm:w-10 sm:h-10" />
                </div>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-xs font-extrabold mt-1">
              <Compass size={13} />
              <span>Page Not Found • पृष्ठ उपलब्ध नहीं है</span>
            </div>
          </div>

          {/* Headline & Description */}
          <div className="space-y-2.5 max-w-lg mx-auto">
            <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
              Looks like this page took a study break!
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              The link you clicked might be outdated, mistyped, or the page may have been moved. Let's get you back to the right classroom or resource.
            </p>
          </div>

          {/* Quick Hub Navigation Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-xl mx-auto text-left pt-2">
            
            {/* Card 1: Courses */}
            <button
              id="btn-404-nav-courses"
              onClick={() => { navigate('/courses'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-md transition-all cursor-pointer flex items-start gap-3 group"
            >
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <GraduationCap size={20} />
              </div>
              <div>
                <h3 className="font-display font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                  Tuition Programs
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Classes 1 to 10 CBSE & UP Board
                </p>
              </div>
            </button>

            {/* Card 2: Study Material */}
            <button
              id="btn-404-nav-resources"
              onClick={() => { navigate('/resources'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer flex items-start gap-3 group"
            >
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <BookOpen size={20} />
              </div>
              <div>
                <h3 className="font-display font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                  Study Material & Notes
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Free NCERT PDFs & Formula Sheets
                </p>
              </div>
            </button>

            {/* Card 3: Admissions */}
            <button
              id="btn-404-nav-admissions"
              onClick={() => { navigate('/admissions'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all cursor-pointer flex items-start gap-3 group"
            >
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Search size={20} />
              </div>
              <div>
                <h3 className="font-display font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                  Admissions Portal
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Session 2026-27 Enrollment
                </p>
              </div>
            </button>

            {/* Card 4: Sunshine Store */}
            <button
              id="btn-404-nav-store"
              onClick={() => { navigate('/books'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-md transition-all cursor-pointer flex items-start gap-3 group"
            >
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <ShoppingBag size={20} />
              </div>
              <div>
                <h3 className="font-display font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                  Sunshine Book Store
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Textbooks & School Stationery
                </p>
              </div>
            </button>

          </div>

          {/* Primary Action Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              id="btn-404-return-home"
              onClick={handleGoHome}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm px-6 py-3.5 shadow-md active:scale-95 transition-all cursor-pointer min-h-[44px]"
            >
              <ArrowLeft size={16} />
              <span>Return to Homepage</span>
            </button>

            <a
              id="btn-404-call-helpdesk"
              href="tel:+918707738284"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-extrabold text-xs sm:text-sm px-6 py-3.5 transition-all cursor-pointer min-h-[44px]"
            >
              <PhoneCall size={16} className="text-emerald-500" />
              <span>Call Campus Helpdesk (8707738284)</span>
            </a>
          </div>

        </div>

      </main>

      {/* Bottom Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 px-4 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>© {new Date().getFullYear()} Sunshine Classes Pihani, Hardoi (UP) 241406. All rights reserved.</p>
      </footer>

    </div>
  );
};
