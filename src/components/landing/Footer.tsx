import React, { useState } from 'react';
import { 
  Phone, 
  MapPin, 
  Mail, 
  Clock, 
  Facebook, 
  Instagram, 
  GraduationCap, 
  BookOpen, 
  ShoppingBag, 
  Award, 
  LogIn, 
  ExternalLink 
} from 'lucide-react';
import { WhatsAppIcon } from '../WhatsAppIcon';
import SunshineLogo from '../SunshineLogo';
import { useNavigate } from 'react-router-dom';
import { LegalDocumentsModal } from '../legal/LegalDocumentsModal';

interface FooterProps {
  setActiveSection: (sec: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveSection }) => {
  const navigate = useNavigate();
  const [legalModalTab, setLegalModalTab] = useState<'privacy' | 'terms' | null>(null);

  const handleNavClick = (sectionId: string) => {
    setActiveSection(sectionId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRouteClick = (path: string) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-24 xl:pb-16 border-t border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Dedicated Bottom Contact Strip to Connect */}
        <div 
          id="footer-bottom-contact-strip"
          className="rounded-2xl bg-gradient-to-r from-amber-500/15 via-slate-800/90 to-blue-500/15 border border-slate-700/80 p-5 sm:p-7 shadow-xl"
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            
            {/* Left: Contact Info & Badge */}
            <div className="space-y-2 max-w-xl text-left">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10px] font-black uppercase tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span>Admission & Support Desk</span>
              </div>
              <h3 className="font-display font-black text-lg sm:text-xl text-white tracking-tight">
                Connect with Sunshine Classes Pihani
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Have questions regarding batch timings, syllabus, study material, or fee concessions? Reach our counselors directly or visit our campus opposite Subhash Park.
              </p>
            </div>

            {/* Right: Connect Action Buttons Strip */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              
              {/* Voice Call */}
              <a
                id="btn-footer-contact-call"
                href="tel:+918707738284"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-3 shadow-md transition-all cursor-pointer min-h-[44px]"
                title="Call Admission Desk"
              >
                <Phone size={16} className="text-slate-950" />
                <span>Call 8707738284</span>
              </a>

              {/* WhatsApp Hotline */}
              <a
                id="btn-footer-contact-whatsapp"
                href="https://wa.me/919161586254?text=Hello!%20I%20want%20to%20connect%20with%20Sunshine%20Classes."
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-4 py-3 shadow-md transition-all cursor-pointer min-h-[44px]"
                title="Chat on WhatsApp"
              >
                <WhatsAppIcon size={16} className="text-white" />
                <span>WhatsApp 9161586254</span>
              </a>

              {/* Inquire / Helpdesk Page */}
              <button
                id="btn-footer-contact-inquire"
                onClick={() => handleNavClick('contact')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs px-4 py-3 transition-all cursor-pointer min-h-[44px]"
              >
                <MapPin size={16} className="text-amber-400" />
                <span>Campus / Helpdesk</span>
              </button>

            </div>

          </div>
        </div>

        {/* Main Footer Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5 text-xs">
          
          {/* Brand & About Column */}
          <div className="lg:col-span-2 space-y-4 pr-0 lg:pr-6">
            <button
              id="footer-logo-btn"
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-2 cursor-pointer text-left focus:outline-none"
              title="Sunshine Classes Home"
            >
              <SunshineLogo size="md" showText={true} textColor="light" textSubTitle="Pihani, Hardoi" />
            </button>
            <p className="text-slate-400 text-xs leading-relaxed font-normal">
              Sunshine Classes is Pihani's premier academic institute providing structured coaching for Classes 1 to 10. We focus on conceptual clarity, board exam strategies, and individual merit development.
            </p>
            
            {/* Contact Details Quick Callouts */}
            <div className="space-y-2 pt-2 text-slate-300">
              <div className="flex items-start gap-2">
                <MapPin size={15} className="text-amber-500 shrink-0 mt-0.5" />
                <span>Mohalla Mishrana, Opposite Subhash Park, Pihani, Hardoi, UP - 241406</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={15} className="text-amber-500 shrink-0" />
                <span>Office Hours: 10:00 AM - 07:00 PM (Mon-Sun)</span>
              </div>
            </div>

            {/* Social Channels */}
            <div className="flex items-center gap-3 pt-2">
              <a
                id="footer-social-call"
                href="tel:+918707738284"
                className="h-9 w-9 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-white flex items-center justify-center transition-all cursor-pointer text-slate-300"
                title="Call Desk"
              >
                <Phone size={15} />
              </a>
              <a
                id="footer-social-whatsapp"
                href="https://wa.me/919161586254?text=Hello!%20I%20want%20to%20inquire%20about%20Sunshine%20Classes."
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-xl bg-slate-800 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition-all cursor-pointer text-slate-300"
                title="WhatsApp Hotline"
              >
                <WhatsAppIcon size={15} />
              </a>
              <a
                id="footer-social-facebook"
                href="https://facebook.com/sunshineclassespihani"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-xl bg-slate-800 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all cursor-pointer text-slate-300"
                title="Facebook Page"
              >
                <Facebook size={15} />
              </a>
              <a
                id="footer-social-instagram"
                href="https://instagram.com/sunshineclassespihani"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-xl bg-slate-800 hover:bg-pink-600 hover:text-white flex items-center justify-center transition-all cursor-pointer text-slate-300"
                title="Instagram Profile"
              >
                <Instagram size={15} />
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="space-y-3">
            <h4 className="font-display font-black text-xs uppercase tracking-wider text-amber-400">
              Quick Links
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button onClick={() => handleNavClick('home')} className="hover:text-white transition-colors cursor-pointer text-left">
                  Home Page
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('courses')} className="hover:text-white transition-colors cursor-pointer text-left">
                  Tuition Courses
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('admissions')} className="hover:text-white transition-colors cursor-pointer text-left">
                  Admissions Portal
                </button>
              </li>
              <li>
                <button onClick={() => handleRouteClick('/resources')} className="hover:text-white transition-colors cursor-pointer text-left">
                  Study Material Hub
                </button>
              </li>
              <li>
                <button onClick={() => handleRouteClick('/books')} className="hover:text-white transition-colors cursor-pointer text-left">
                  Sunshine Store
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('results')} className="hover:text-white transition-colors cursor-pointer text-left">
                  Board Toppers & Merit
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('about')} className="hover:text-white transition-colors cursor-pointer text-left">
                  About Sunshine Classes
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('contact')} className="hover:text-white transition-colors cursor-pointer text-left">
                  Contact & Location
                </button>
              </li>
            </ul>
          </div>

          {/* Student Resources Column */}
          <div className="space-y-3">
            <h4 className="font-display font-black text-xs uppercase tracking-wider text-amber-400">
              Student Resources
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button onClick={() => handleRouteClick('/resources')} className="hover:text-white transition-colors cursor-pointer text-left">
                  Chapter Wise Notes
                </button>
              </li>
              <li>
                <button onClick={() => handleRouteClick('/resources')} className="hover:text-white transition-colors cursor-pointer text-left">
                  10-Year Board PYQs
                </button>
              </li>
              <li>
                <button onClick={() => handleRouteClick('/resources')} className="hover:text-white transition-colors cursor-pointer text-left">
                  Math Formula Sheets
                </button>
              </li>
              <li>
                <button onClick={() => handleRouteClick('/resources')} className="hover:text-white transition-colors cursor-pointer text-left">
                  Science Worksheets
                </button>
              </li>
              <li>
                <button onClick={() => handleRouteClick('/resources')} className="hover:text-white transition-colors cursor-pointer text-left">
                  Sample Practice Papers
                </button>
              </li>
              <li>
                <button onClick={() => handleRouteClick('/resources')} className="hover:text-white transition-colors cursor-pointer text-left">
                  NCERT PDF Downloads
                </button>
              </li>
            </ul>
          </div>

          {/* Sunshine Store & Portals Column */}
          <div className="space-y-3">
            <h4 className="font-display font-black text-xs uppercase tracking-wider text-amber-400">
              Store & Portals
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button onClick={() => handleRouteClick('/books')} className="hover:text-white transition-colors cursor-pointer text-left">
                  NCERT Textbooks
                </button>
              </li>
              <li>
                <button onClick={() => handleRouteClick('/books')} className="hover:text-white transition-colors cursor-pointer text-left">
                  Practice Test Workbooks
                </button>
              </li>
              <li>
                <button onClick={() => handleRouteClick('/books')} className="hover:text-white transition-colors cursor-pointer text-left">
                  Science Lab Manuals
                </button>
              </li>
              <li>
                <button onClick={() => handleRouteClick('/books')} className="hover:text-white transition-colors cursor-pointer text-left">
                  Stationery & Supplies
                </button>
              </li>
              <li className="pt-2 border-t border-slate-800">
                <button
                  id="btn-footer-student-portal"
                  onClick={() => handleRouteClick('/login/student')}
                  className="hover:text-amber-400 font-bold transition-colors cursor-pointer text-left flex items-center gap-1.5"
                >
                  <LogIn size={13} className="text-brand-blue" />
                  <span>Student Portal</span>
                </button>
              </li>
              <li>
                <button
                  id="btn-footer-admin-portal"
                  onClick={() => handleRouteClick('/login/admin')}
                  className="hover:text-amber-400 font-bold transition-colors cursor-pointer text-left flex items-center gap-1.5"
                >
                  <LogIn size={13} className="text-amber-400" />
                  <span>Administration Portal</span>
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright & Disclaimer */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 text-center sm:text-left">
          <div>
            © {new Date().getFullYear()} Sunshine Classes Pihani. All Rights Reserved.
          </div>
          <div className="flex items-center gap-4">
            <button
              id="btn-footer-privacy-policy"
              onClick={() => setLegalModalTab('privacy')}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              id="btn-footer-terms-of-admission"
              onClick={() => setLegalModalTab('terms')}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Terms of Admission
            </button>
            <button
              id="btn-footer-helpdesk"
              onClick={() => handleNavClick('contact')}
              className="hover:text-slate-400 transition-colors cursor-pointer"
            >
              Helpdesk & Support
            </button>
          </div>
        </div>

      </div>

      <LegalDocumentsModal
        isOpen={!!legalModalTab}
        onClose={() => setLegalModalTab(null)}
        initialTab={legalModalTab || 'terms'}
      />
    </footer>
  );
};
