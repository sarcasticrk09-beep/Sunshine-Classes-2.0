import React from 'react';
import { 
  MapPin, 
  Clock, 
  Phone, 
  ExternalLink, 
  ArrowRight,
  MessageCircle,
  Sparkles
} from 'lucide-react';

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

interface ContactSectionProps {
  onNavigateSection?: (section: string) => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ onNavigateSection }) => {
  return (
    <div className="space-y-0">
      
      {/* SECTION 11: CONTACT PREVIEW */}
      <section id="contact-preview" className="py-10 sm:py-16 bg-slate-50/80 dark:bg-slate-950 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
          
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1.5">
              <MapPin size={14} />
              <span>Visit Campus & Helpdesk</span>
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Reach Sunshine Classes Office
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Visit our campus in Pihani, call our reception desk, or connect with us on WhatsApp for instant guidance.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
            
            {/* Call Us Card */}
            <a
              id="card-contact-phone"
              href="tel:+918707738284"
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-3 hover:border-amber-400 transition-all shadow-xs text-center group flex flex-col items-center cursor-pointer"
            >
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Phone size={22} />
              </div>
              <div>
                <h3 className="font-display font-black text-base text-slate-900 dark:text-white">
                  Call Admission Desk
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  8707738284 / 9161586254
                </p>
              </div>
              <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 inline-flex items-center gap-1 pt-1">
                <span>Call Directly</span>
                <ArrowRight size={13} />
              </span>
            </a>

            {/* WhatsApp Card */}
            <a
              id="card-contact-whatsapp"
              href="https://wa.me/919161586254?text=Hello!%20I%20want%20to%20inquire%20about%20Sunshine%20Classes%20tuitions."
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/20 dark:bg-emerald-950/20 p-6 space-y-3 hover:border-emerald-400 transition-all shadow-xs text-center group flex flex-col items-center cursor-pointer"
            >
              <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <WhatsAppIcon size={22} />
              </div>
              <div>
                <h3 className="font-display font-black text-base text-slate-900 dark:text-white">
                  Chat on WhatsApp
                </h3>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1 font-medium">
                  Instant reply within 15 minutes
                </p>
              </div>
              <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1 pt-1">
                <span>Start WhatsApp Chat</span>
                <ArrowRight size={13} />
              </span>
            </a>

            {/* Visit Campus Card */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-3 shadow-xs text-center flex flex-col items-center">
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <MapPin size={22} />
              </div>
              <div>
                <h3 className="font-display font-black text-base text-slate-900 dark:text-white">
                  Visit Campus Pihani
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium leading-snug">
                  Mohalla Mishrana, Opp. Subhash Park, Pihani
                </p>
              </div>
              <a
                id="btn-campus-map-link"
                href="https://maps.app.goo.gl/Z7BuSwoBFkvghk5e8"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-extrabold text-blue-600 dark:text-blue-400 inline-flex items-center gap-1 pt-1 hover:underline"
              >
                <span>View Google Maps</span>
                <ExternalLink size={12} />
              </a>
            </div>

          </div>

          {/* Contact Page Navigation CTA */}
          <div className="text-center pt-2">
            <button
              id="btn-homepage-contact-us-full"
              onClick={() => onNavigateSection ? onNavigateSection('contact') : (window.location.href = '#contact')}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-extrabold text-xs px-6 py-3 shadow-xs transition-all cursor-pointer min-h-[44px]"
            >
              <span>Open Helpdesk & Full Contact Page</span>
              <ArrowRight size={15} className="text-amber-500" />
            </button>
          </div>

        </div>
      </section>

      {/* SECTION 12: CTA BANNER */}
      <section id="cta-banner" className="py-12 sm:py-16 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px]"></div>
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          
          <div className="space-y-2 max-w-2xl mx-auto">
            <h2 className="font-display text-2xl sm:text-4xl font-black tracking-tight drop-shadow-xs">
              Ready to Start Your Learning Journey?
            </h2>
            <p className="text-xs sm:text-base text-amber-50 font-medium">
              Join Sunshine Classes today. Secure your slot in our small batch tuitions and master NCERT concepts with confidence.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2">
            <button
              id="btn-cta-banner-enroll-now"
              onClick={() => onNavigateSection ? onNavigateSection('admissions') : (window.location.href = '#admissions')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-black text-white font-black text-xs sm:text-sm px-8 py-3.5 shadow-xl transition-all cursor-pointer min-h-[48px]"
            >
              <span>Enroll Now for 2026-27</span>
              <ArrowRight size={16} className="text-amber-400" />
            </button>

            <button
              id="btn-cta-banner-contact-us"
              onClick={() => onNavigateSection ? onNavigateSection('contact') : (window.location.href = '#contact')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-extrabold text-xs sm:text-sm px-8 py-3.5 border border-white/40 transition-all cursor-pointer min-h-[48px]"
            >
              <span>Contact Us</span>
              <MessageCircle size={16} />
            </button>
          </div>

        </div>
      </section>

    </div>
  );
};
