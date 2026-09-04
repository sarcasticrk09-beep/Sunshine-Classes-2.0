import React, { useState } from 'react';
import { Home, BookOpen, ShoppingBag, LogIn, PhoneCall, Phone, MapPin, X, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';

const WhatsAppIcon = ({ className = "w-5 h-5", size = 20 }: { className?: string; size?: number }) => (
  <svg 
    viewBox="0 0 24 24" 
    width={size} 
    height={size} 
    fill="currentColor" 
    className={className}
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.572-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.99c-.001 5.45-4.436 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

interface MobileBottomNavProps {
  activeSection: string;
  setActiveSection: (sec: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeSection,
  setActiveSection
}) => {
  const navigate = useNavigate();
  const [showContactSheet, setShowContactSheet] = useState(false);

  const handleNavClick = (sectionId: string) => {
    setActiveSection(sectionId);
    setShowContactSheet(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRouteClick = (path: string) => {
    navigate(path);
    setShowContactSheet(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* On-Demand Quick Connect Bottom Sheet for Mobile (Never overlaps permanently) */}
      <AnimatePresence>
        {showContactSheet && (
          <>
            <motion.div
              id="backdrop-mobile-contact-sheet"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowContactSheet(false)}
              className="xl:hidden fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs"
            />
            
            <motion.div
              id="sheet-mobile-connect"
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="xl:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 rounded-t-3xl shadow-2xl p-4 sm:p-6 max-h-[85vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <PhoneCall size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Connect with Sunshine Classes</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Opposite Subhash Park, Pihani</p>
                  </div>
                </div>
                <button
                  id="btn-mobile-sheet-close"
                  onClick={() => setShowContactSheet(false)}
                  className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                  aria-label="Close connect sheet"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Instant Call & WhatsApp 2-Column Action System */}
              <div className="grid grid-cols-2 gap-2.5 pt-4">
                
                {/* 1-Tap Voice Call */}
                <a
                  id="btn-mobile-sheet-call"
                  href="tel:+918707738284"
                  className="flex flex-col items-center justify-center gap-1.5 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 hover:bg-amber-100/60 active:scale-[0.98] transition-all cursor-pointer text-center min-h-[72px]"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-slate-950 shadow-xs">
                    <Phone size={18} />
                  </div>
                  <div>
                    <span className="block text-xs font-black text-slate-900 dark:text-white">Call Desk</span>
                    <span className="block text-[10px] font-bold text-amber-700 dark:text-amber-400">8707738284</span>
                  </div>
                </a>

                {/* 1-Tap WhatsApp */}
                <a
                  id="btn-mobile-sheet-whatsapp"
                  href="https://wa.me/919161586254?text=Hello!%20I%20want%20to%20inquire%20about%20Sunshine%20Classes%20tuitions."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center gap-1.5 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100/60 active:scale-[0.98] transition-all cursor-pointer text-center min-h-[72px]"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                    <WhatsAppIcon size={18} className="text-white" />
                  </div>
                  <div>
                    <span className="block text-xs font-black text-slate-900 dark:text-white">WhatsApp</span>
                    <span className="block text-[10px] font-bold text-emerald-700 dark:text-emerald-400">Instant Reply</span>
                  </div>
                </a>

              </div>

              {/* Secondary Actions */}
              <div className="space-y-2 pt-3">
                
                {/* Campus Directions */}
                <a
                  id="btn-mobile-sheet-map"
                  href="https://maps.app.goo.gl/Z7BuSwoBFkvghk5e8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-amber-500 shrink-0" />
                    <span>Open Campus Map (Pihani)</span>
                  </div>
                  <ArrowUpRight size={14} className="text-slate-400" />
                </a>

                {/* Full Contact & Inquiry Page Link */}
                <button
                  id="btn-mobile-sheet-full-contact"
                  onClick={() => handleNavClick('contact')}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-extrabold transition-all cursor-pointer min-h-[44px]"
                >
                  <span>Open Full Contact & Inquiry Form</span>
                </button>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
              activeSection === 'home' && !showContactSheet
                ? 'text-amber-600 dark:text-amber-400 font-extrabold bg-amber-500/10'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Home size={18} className={activeSection === 'home' && !showContactSheet ? 'stroke-[2.5]' : 'stroke-2'} />
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

          {/* 5. Contact / Connect Quick Action */}
          <button
            id="btn-mobile-bottom-contact"
            onClick={() => setShowContactSheet(!showContactSheet)}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer min-h-[44px] ${
              showContactSheet || activeSection === 'contact'
                ? 'text-amber-600 dark:text-amber-400 font-extrabold bg-amber-500/10'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <PhoneCall size={18} className={showContactSheet || activeSection === 'contact' ? 'stroke-[2.5]' : 'stroke-2'} />
            <span className="text-[10px] tracking-tight mt-0.5">Contact</span>
          </button>

        </div>
      </nav>
    </>
  );
};
