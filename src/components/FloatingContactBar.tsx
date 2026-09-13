import React, { useState, useEffect, useRef } from 'react';
import { Phone, MapPin, Instagram, Youtube, Facebook, X, ExternalLink } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router-dom';

export const FloatingContactBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close when user clicks outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Internal dashboards don't need the public marketing contact widget
  const isDashboardRoute = /^\/(admin|teacher|student|reception)/.test(location.pathname);
  if (isDashboardRoute) return null;

  return (
    <aside 
      id="floating-contact-widget"
      aria-label="Quick contact channels"
      className="fixed bottom-[74px] xl:bottom-6 left-4 xl:left-6 z-40 pointer-events-auto"
      ref={popoverRef}
    >
      {/* Expanded Contact Card Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="card-floating-contact-popover"
            initial={{ opacity: 0, y: 16, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.92 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="mb-3 w-[300px] sm:w-[320px] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
                <div>
                  <h3 className="text-xs font-black tracking-wide uppercase">Sunshine Admission Desk</h3>
                  <p className="text-[10px] text-emerald-100 font-medium">Quick Support & Enquiries</p>
                </div>
              </div>
              <button
                id="btn-floating-close-card"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-emerald-100 hover:text-white hover:bg-emerald-700/60 transition-colors cursor-pointer"
                aria-label="Close contact card"
              >
                <X size={16} />
              </button>
            </div>

            {/* Direct Contact Actions */}
            <div className="p-3 space-y-2">
              {/* Direct Voice Call Option */}
              <a
                id="btn-floating-call-desk"
                href="tel:+918707738284"
                className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 hover:bg-amber-100/80 dark:hover:bg-amber-900/60 transition-all group cursor-pointer"
                title="Call 8707738284"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 text-slate-950 shadow-xs shrink-0">
                    <Phone size={16} className="stroke-[2.5]" />
                  </div>
                  <div className="text-left">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">Voice Call</span>
                    <span className="block text-sm font-black text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      8707738284
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-tight shrink-0 shadow-xs">
                  Call Now
                </span>
              </a>

              {/* Direct WhatsApp Option */}
              <a
                id="btn-floating-chat-whatsapp"
                href="https://wa.me/919161586254?text=Hello!%20I%20want%20to%20inquire%20about%20Sunshine%20Classes%20tuitions%20and%20admissions."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/60 transition-all group cursor-pointer"
                title="WhatsApp 9161586254"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs shrink-0">
                    <WhatsAppIcon size={18} className="fill-white" />
                  </div>
                  <div className="text-left">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">WhatsApp Chat</span>
                    <span className="block text-sm font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      9161586254
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-emerald-600 text-white text-[10px] font-black uppercase tracking-tight shrink-0 shadow-xs">
                  Chat Now
                </span>
              </a>
            </div>

            {/* Location & Social Links Footer */}
            <div className="px-3 pb-3 pt-1 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/40">
              {/* Campus Location */}
              <a
                id="btn-floating-open-maps"
                href="https://maps.app.goo.gl/Z7BuSwoBFkvghk5e8"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between py-1.5 px-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition-colors text-[11px] font-medium"
                title="View campus location on Google Maps"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <MapPin size={13} className="text-amber-500 shrink-0" />
                  <span className="truncate">Opp. Subhash Park, Pihani</span>
                </div>
                <ExternalLink size={11} className="text-slate-400 shrink-0" />
              </a>

              {/* Social Channels */}
              <div className="flex items-center justify-between pt-2 mt-1 border-t border-slate-200/60 dark:border-slate-800/60">
                <span className="text-[10px] font-bold text-slate-400">Follow us:</span>
                <div className="flex items-center gap-1.5">
                  <a
                    id="btn-floating-instagram"
                    href="https://instagram.com/sunshineclassespihani"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 text-white shadow-xs hover:opacity-90 transition-opacity"
                    title="Instagram"
                    aria-label="Instagram"
                  >
                    <Instagram size={13} />
                  </a>
                  <a
                    id="btn-floating-youtube"
                    href="https://youtube.com/@sunshineclassespihani"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-600 text-white shadow-xs hover:bg-red-700 transition-colors"
                    title="YouTube"
                    aria-label="YouTube"
                  >
                    <Youtube size={13} />
                  </a>
                  <a
                    id="btn-floating-facebook"
                    href="https://facebook.com/sunshineclassespihani"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs hover:bg-blue-700 transition-colors"
                    title="Facebook"
                    aria-label="Facebook"
                  >
                    <Facebook size={13} />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <div className="flex items-center gap-2">
        <motion.button
          id="btn-floating-contact-trigger"
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          className="relative flex h-12 w-12 sm:h-13 sm:w-13 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-2xl ring-4 ring-emerald-500/20 focus:outline-none cursor-pointer"
          title="Call & WhatsApp Sunshine Classes"
          aria-label="Open contact options for Call and WhatsApp"
        >
          {isOpen ? (
            <X size={22} className="stroke-[2.5]" />
          ) : (
            <>
              <WhatsAppIcon size={24} className="fill-white" />
              {/* Corner badge with phone icon */}
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-slate-950 shadow-xs border-2 border-white dark:border-slate-900">
                <Phone size={10} className="stroke-[3]" />
              </span>
            </>
          )}
        </motion.button>

        {/* Subtle pill badge on desktop to make contact channels instantly clear */}
        {!isOpen && (
          <span 
            onClick={() => setIsOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-200 text-xs font-bold shadow-lg border border-slate-200 dark:border-slate-800 backdrop-blur-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="text-amber-600 dark:text-amber-400">Call</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-emerald-600 dark:text-emerald-400">WhatsApp</span>
          </span>
        )}
      </div>
    </aside>
  );
};
