import React from 'react';
import { Home, BookOpen, ShoppingBag, LogIn, PhoneCall } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MobileBottomNavProps {
  activeSection: string;
  setActiveSection: (sec: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeSection,
  setActiveSection
}) => {
  const navigate = useNavigate();

  const handleNavClick = (sectionId: string) => {
    setActiveSection(sectionId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRouteClick = (path: string) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav 
      id="mobile-bottom-navigation" 
      aria-label="Mobile quick bottom navigation"
      className="xl:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/90 dark:border-slate-800/90 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-2 py-1.5 transition-all"
    >
      <div className="mx-auto max-w-lg grid grid-cols-5 gap-1 text-center">
        
        {/* 1. Home */}
        <button
          id="btn-mobile-bottom-home"
          onClick={() => handleNavClick('home')}
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer min-h-[44px] ${
            activeSection === 'home'
              ? 'text-amber-600 dark:text-amber-400 font-extrabold bg-amber-500/10'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Home size={18} className={activeSection === 'home' ? 'stroke-[2.5]' : 'stroke-2'} />
          <span className="text-[10px] tracking-tight mt-0.5">Home</span>
        </button>

        {/* 2. Study Material */}
        <button
          id="btn-mobile-bottom-notes"
          onClick={() => handleRouteClick('/resources')}
          className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer min-h-[44px] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
        >
          <BookOpen size={18} className="stroke-2" />
          <span className="text-[10px] tracking-tight mt-0.5">Study Material</span>
        </button>

        {/* 3. Sunshine Store */}
        <button
          id="btn-mobile-bottom-store"
          onClick={() => handleRouteClick('/store')}
          className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer min-h-[44px] text-amber-600 dark:text-amber-400 font-bold"
        >
          <ShoppingBag size={18} className="stroke-2 text-amber-500" />
          <span className="text-[10px] tracking-tight mt-0.5">Store</span>
        </button>

        {/* 4. Login */}
        <button
          id="btn-mobile-bottom-login"
          onClick={() => handleRouteClick('/login')}
          className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer min-h-[44px] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
        >
          <LogIn size={18} className="stroke-2 text-blue-500" />
          <span className="text-[10px] tracking-tight mt-0.5">Login</span>
        </button>

        {/* 5. Contact */}
        <button
          id="btn-mobile-bottom-contact"
          onClick={() => handleNavClick('contact')}
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer min-h-[44px] ${
            activeSection === 'contact'
              ? 'text-amber-600 dark:text-amber-400 font-extrabold bg-amber-500/10'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <PhoneCall size={18} className={activeSection === 'contact' ? 'stroke-[2.5]' : 'stroke-2'} />
          <span className="text-[10px] tracking-tight mt-0.5">Contact</span>
        </button>

      </div>
    </nav>
  );
};
