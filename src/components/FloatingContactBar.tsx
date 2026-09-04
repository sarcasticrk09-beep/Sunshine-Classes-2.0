import React, { useState } from 'react';
import { Phone, MapPin, Instagram, Youtube, Facebook, ChevronUp, Share2, X } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { motion, AnimatePresence } from 'motion/react';

export const FloatingContactBar: React.FC = () => {
  const [isSocialsOpen, setIsSocialsOpen] = useState(false);

  return (
    <aside 
      id="floating-contact-bar-container"
      aria-label="Contact and Social channels"
      className="fixed bottom-[58px] sm:bottom-6 left-2 sm:left-6 z-40 pointer-events-auto max-w-[calc(100vw-16px)]"
    >
      <div className="flex flex-col items-start gap-1.5 sm:gap-2">
        
        {/* Expandable Socials Tray (Mobile & Desktop) */}
        <AnimatePresence>
          {isSocialsOpen && (
            <motion.div
              id="tray-floating-socials"
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-xl"
            >
              {/* Instagram */}
              <a
                id="btn-floating-instagram"
                href="https://instagram.com/sunshineclassespihani"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 hover:opacity-90 text-white transition-all shadow-xs cursor-pointer"
                title="Follow Sunshine Classes on Instagram (@sunshineclassespihani)"
                aria-label="Instagram page"
              >
                <Instagram size={16} />
              </a>

              {/* YouTube */}
              <a
                id="btn-floating-youtube"
                href="https://youtube.com/@sunshineclassespihani"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 hover:bg-red-700 text-white transition-all shadow-xs cursor-pointer"
                title="Watch Sunshine Classes on YouTube"
                aria-label="YouTube channel"
              >
                <Youtube size={16} />
              </a>

              {/* Facebook */}
              <a
                id="btn-floating-facebook"
                href="https://facebook.com/sunshineclassespihani"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-xs cursor-pointer"
                title="Visit Sunshine Classes on Facebook"
                aria-label="Facebook page"
              >
                <Facebook size={16} />
              </a>

              {/* Google Maps Directions */}
              <a
                id="btn-floating-campus"
                href="https://maps.app.goo.gl/Z7BuSwoBFkvghk5e8"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 px-2.5 items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all shadow-xs cursor-pointer"
                title="Campus directions (Mohalla Mishrana, Opp. Subhash Park, Pihani)"
                aria-label="Campus location on Google Maps"
              >
                <MapPin size={14} className="text-amber-500 shrink-0" />
                <span className="hidden sm:inline">Pihani Campus</span>
              </a>

              {/* Close tray */}
              <button
                id="btn-floating-close-socials"
                onClick={() => setIsSocialsOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                aria-label="Close social channels tray"
              >
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Floating Quick Contact Strip */}
        <div 
          id="main-floating-contact-strip"
          className="flex items-center gap-1 sm:gap-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-1 sm:p-1.5 rounded-full shadow-xl border border-amber-500/30"
        >
          {/* Live Desk Indicator - Desktop/Tablet */}
          <div className="hidden md:flex items-center gap-1 pl-2.5 pr-1 text-[11px] font-black uppercase text-amber-600 dark:text-amber-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Desk</span>
          </div>

          {/* 1-Tap Voice Call with phone number clearly visible on desktop, compact on mobile */}
          <a
            id="btn-floating-call"
            href="tel:+918707738284"
            className="flex h-8 sm:h-10 items-center justify-center gap-1 sm:gap-1.5 rounded-full bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 px-2.5 sm:px-4 text-[11px] sm:text-xs font-black transition-all shadow-xs active:scale-[0.98] cursor-pointer min-h-[32px] sm:min-h-[40px] shrink-0"
            title="Call Admission Desk directly at 8707738284"
            aria-label="Call Admission Desk directly at 8707738284"
          >
            <Phone size={13} className="text-slate-950 shrink-0 stroke-[2.5]" /> 
            <span>Call<span className="hidden sm:inline font-extrabold tracking-tight">&nbsp;8707738284</span></span>
          </a>
          
          {/* 1-Tap WhatsApp Button - Compact on mobile */}
          <a
            id="btn-floating-whatsapp"
            href="https://wa.me/919161586254?text=Hello!%20I%20want%20to%20inquire%20about%20Sunshine%20Classes%20tuitions%20and%20admissions."
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-8 sm:h-10 items-center justify-center gap-1 sm:gap-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white px-2.5 sm:px-3.5 text-[11px] sm:text-xs font-black transition-all shadow-xs active:scale-[0.98] cursor-pointer min-h-[32px] sm:min-h-[40px] shrink-0"
            title="Chat on WhatsApp (9161586254)"
            aria-label="Chat on WhatsApp at 9161586254"
          >
            <WhatsAppIcon size={14} className="text-white shrink-0" />
            <span>WhatsApp</span>
          </a>

          {/* Direct Social Media Toggle Button */}
          <button
            id="btn-floating-toggle-socials"
            onClick={() => setIsSocialsOpen(!isSocialsOpen)}
            className={`flex h-8 sm:h-10 items-center justify-center gap-1 px-2 sm:px-3 rounded-full text-[11px] sm:text-xs font-bold transition-all shadow-xs cursor-pointer min-h-[32px] sm:min-h-[40px] border ${
              isSocialsOpen 
                ? 'bg-slate-800 text-white border-slate-700' 
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
            }`}
            title="Open Social Channels (Instagram, YouTube, Facebook, Maps)"
            aria-label="Open Social Channels"
          >
            <Share2 size={12} className="text-pink-500" />
            <span className="hidden sm:inline text-[11px] font-extrabold">Socials</span>
            <ChevronUp size={11} className={`transition-transform duration-200 ${isSocialsOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

      </div>
    </aside>
  );
};
