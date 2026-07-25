import React from 'react';
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

interface FooterProps {
  setActiveSection: (sec: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveSection }) => {
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
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-24 xl:pb-16 border-t border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        
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
                <button onClick={() => handleRouteClick('/login')} className="hover:text-amber-400 font-bold transition-colors cursor-pointer text-left flex items-center gap-1">
                  <LogIn size={13} className="text-blue-400" />
                  <span>Student Portal Login</span>
                </button>
              </li>
              <li>
                <button onClick={() => handleRouteClick('/login')} className="hover:text-amber-400 font-bold transition-colors cursor-pointer text-left flex items-center gap-1">
                  <LogIn size={13} className="text-amber-400" />
                  <span>Teacher Portal Login</span>
                </button>
              </li>
              <li>
                <button onClick={() => handleRouteClick('/login')} className="hover:text-amber-400 font-bold transition-colors cursor-pointer text-left flex items-center gap-1">
                  <LogIn size={13} className="text-emerald-400" />
                  <span>Admin Portal Login</span>
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
            <button onClick={() => handleNavClick('about')} className="hover:text-slate-400 transition-colors">
              Privacy Policy
            </button>
            <button onClick={() => handleNavClick('about')} className="hover:text-slate-400 transition-colors">
              Terms of Admission
            </button>
            <button onClick={() => handleNavClick('contact')} className="hover:text-slate-400 transition-colors">
              Helpdesk & Support
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
