import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  X, 
  Sun, 
  Moon, 
  ChevronDown, 
  BookOpen, 
  ShoppingBag, 
  GraduationCap, 
  Award, 
  LogIn, 
  Phone, 
  Info,
  UserCheck,
  Shield,
  Layers,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import SunshineLogo from '../SunshineLogo';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  activeSection: string;
  setActiveSection: (sec: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenSupportForm?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeSection,
  setActiveSection,
  theme,
  onToggleTheme,
  onOpenSupportForm
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  // Scroll detection for compact sticky header behavior
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (sectionId: string) => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
    setActiveSection(sectionId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRouteClick = (path: string) => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Grouped Navigation Data Structures
  const coursesDropdown = [
    { label: 'Class 6 Tuition', desc: 'NCERT Foundation & Basics', action: () => handleNavClick('courses') },
    { label: 'Class 7 Tuition', desc: 'Concept Building & Practice', action: () => handleNavClick('courses') },
    { label: 'Class 8 Tuition', desc: 'Middle School Excellence', action: () => handleNavClick('courses') },
    { label: 'Class 9 Foundation', desc: 'Board Exam Preparation', action: () => handleNavClick('courses') },
    { label: 'Class 10 Board Batch', desc: 'High Scoring Special Batch', action: () => handleNavClick('courses') }
  ];

  const admissionsDropdown = [
    { label: 'Admission Process', desc: 'Step-by-step registration guide', action: () => handleNavClick('admissions') },
    { label: 'Online Admission Form', desc: 'Apply digitally in 2 minutes', action: () => handleNavClick('admissions') },
    { label: 'Fee Structure', desc: 'Affordable monthly fee details', action: () => handleNavClick('courses') },
    { label: 'Admissions FAQ', desc: 'Common parent queries answered', action: () => handleNavClick('admissions') }
  ];

  const resourcesDropdown = [
    { label: 'Study Material', desc: 'Comprehensive PDF notes', action: () => handleRouteClick('/resources') },
    { label: 'Chapter Notes', desc: 'Detailed NCERT summaries', action: () => handleRouteClick('/resources') },
    { label: 'PYQs & Board Papers', desc: 'Last 10 year solved papers', action: () => handleRouteClick('/resources') },
    { label: 'Formula Sheets', desc: 'Math & Physics quick revision', action: () => handleRouteClick('/resources') },
    { label: 'Worksheets', desc: 'Practice problem sets', action: () => handleRouteClick('/resources') },
    { label: 'Practice Papers', desc: 'Mock tests & sample papers', action: () => handleRouteClick('/resources') }
  ];

  const storeDropdown = [
    { label: '🛒 Sunshine Store Home', desc: 'All Books & Student Essentials', action: () => handleRouteClick('/store') },
    { label: 'Books', desc: 'NCERT & reference textbooks', action: () => handleRouteClick('/store') },
    { label: 'Study Material', desc: 'Printed notes & study kits', action: () => handleRouteClick('/store') },
    { label: 'Practice Papers', desc: 'Printed mock exam packages', action: () => handleRouteClick('/store') },
    { label: 'Notebooks & Registers', desc: 'Spiral notebooks & practice sheets', action: () => handleRouteClick('/store') },
    { label: 'Stationery & Geometry', desc: 'Pens, highlighters & geometry kits', action: () => handleRouteClick('/store') },
    { label: 'Student Essentials', desc: 'Study lamps, timers & desk accessories', action: () => handleRouteClick('/store') }
  ];

  const resultsDropdown = [
    { label: 'Board Toppers', desc: 'Class 10 merit list holders', action: () => handleNavClick('results') },
    { label: 'Success Stories', desc: 'Student testimonials & journeys', action: () => handleNavClick('results') },
    { label: 'Academic Achievements', desc: 'District rankings & honours', action: () => handleNavClick('results') }
  ];

  const aboutDropdown = [
    { label: 'About Sunshine Classes', desc: 'Our legacy of educational excellence', action: () => handleNavClick('about') },
    { label: 'Our Mission & Vision', desc: 'Empowering students in Pihani', action: () => handleNavClick('about') },
    { label: 'Faculty & Mentors', desc: 'Experienced teaching staff', action: () => handleNavClick('about') },
    { label: 'Campus Infrastructure', desc: 'Safe & disciplined classroom setup', action: () => handleNavClick('about') },
    { label: 'Frequently Asked Questions', desc: 'General queries & answers', action: () => handleNavClick('about') }
  ];

  const loginDropdown = [
    { label: 'Student Login', desc: 'Access homework, tests & fees', icon: <UserCheck size={16} className="text-blue-500" />, action: () => handleRouteClick('/login') },
    { label: 'Teacher Login', desc: 'Manage marks, attendance & notes', icon: <GraduationCap size={16} className="text-amber-500" />, action: () => handleRouteClick('/login') },
    { label: 'Admin Login', desc: 'System control & reports', icon: <Shield size={16} className="text-emerald-500" />, action: () => handleRouteClick('/login') }
  ];

  return (
    <header className={`sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-all duration-300 ${isScrolled ? 'shadow-md h-16' : 'h-18 sm:h-20'}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-3">
        
        {/* Brand Logo & Name */}
        <button
          id="nav-logo-btn"
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2 cursor-pointer text-left focus:outline-none shrink-0"
          title="Sunshine Classes Home"
        >
          <SunshineLogo size="sm" showText={true} textSubTitle="Pihani, Hardoi" />
        </button>

        {/* Desktop Grouped Navigation Menu */}
        <nav className="hidden xl:flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-200">
          
          {/* Home */}
          <button
            id="btn-nav-home"
            onClick={() => handleNavClick('home')}
            className={`px-3 py-2 rounded-xl transition-all cursor-pointer ${
              activeSection === 'home'
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            Home
          </button>

          {/* Courses Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setActiveDropdown('courses')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button
              id="btn-nav-courses"
              onClick={() => handleNavClick('courses')}
              className={`px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                activeSection === 'courses'
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span>Courses</span>
              <ChevronDown size={13} className={`transition-transform duration-200 ${activeDropdown === 'courses' ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {activeDropdown === 'courses' && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 mt-1 w-60 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-xl z-50 space-y-0.5"
                >
                  {coursesDropdown.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={item.action}
                      className="w-full p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors cursor-pointer block"
                    >
                      <div className="font-bold text-xs text-slate-800 dark:text-white">{item.label}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">{item.desc}</div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Admissions Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setActiveDropdown('admissions')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button
              id="btn-nav-admissions"
              onClick={() => handleNavClick('admissions')}
              className={`px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                activeSection === 'admissions'
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span>Admissions</span>
              <ChevronDown size={13} className={`transition-transform duration-200 ${activeDropdown === 'admissions' ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {activeDropdown === 'admissions' && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 mt-1 w-64 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-xl z-50 space-y-0.5"
                >
                  {admissionsDropdown.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={item.action}
                      className="w-full p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors cursor-pointer block"
                    >
                      <div className="font-bold text-xs text-slate-800 dark:text-white">{item.label}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">{item.desc}</div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Resources Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setActiveDropdown('resources')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button
              id="btn-nav-resources"
              onClick={() => handleRouteClick('/resources')}
              className="px-3 py-2 rounded-xl transition-all cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1"
            >
              <span>Resources</span>
              <ChevronDown size={13} className={`transition-transform duration-200 ${activeDropdown === 'resources' ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {activeDropdown === 'resources' && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 mt-1 w-64 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-xl z-50 space-y-0.5"
                >
                  {resourcesDropdown.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={item.action}
                      className="w-full p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors cursor-pointer block"
                    >
                      <div className="font-bold text-xs text-slate-800 dark:text-white">{item.label}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">{item.desc}</div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sunshine Store Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setActiveDropdown('store')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button
              id="btn-nav-store"
              onClick={() => handleRouteClick('/books')}
              className="px-3 py-2 rounded-xl transition-all cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400"
            >
              <ShoppingBag size={14} className="text-amber-500" />
              <span>Sunshine Store</span>
              <ChevronDown size={13} className={`transition-transform duration-200 ${activeDropdown === 'store' ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {activeDropdown === 'store' && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 mt-1 w-64 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-xl z-50 space-y-0.5"
                >
                  {storeDropdown.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={item.action}
                      className="w-full p-2 rounded-xl hover:bg-amber-50 dark:hover:bg-slate-800 text-left transition-colors cursor-pointer block"
                    >
                      <div className="font-bold text-xs text-slate-800 dark:text-white">{item.label}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">{item.desc}</div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Results Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setActiveDropdown('results')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button
              id="btn-nav-results"
              onClick={() => handleNavClick('results')}
              className={`px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                activeSection === 'results'
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span>Results</span>
              <ChevronDown size={13} className={`transition-transform duration-200 ${activeDropdown === 'results' ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {activeDropdown === 'results' && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 mt-1 w-60 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-xl z-50 space-y-0.5"
                >
                  {resultsDropdown.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={item.action}
                      className="w-full p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors cursor-pointer block"
                    >
                      <div className="font-bold text-xs text-slate-800 dark:text-white">{item.label}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">{item.desc}</div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* About Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setActiveDropdown('about')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button
              id="btn-nav-about"
              onClick={() => handleNavClick('about')}
              className={`px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                activeSection === 'about'
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span>About</span>
              <ChevronDown size={13} className={`transition-transform duration-200 ${activeDropdown === 'about' ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {activeDropdown === 'about' && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 mt-1 w-64 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-xl z-50 space-y-0.5"
                >
                  {aboutDropdown.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={item.action}
                      className="w-full p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors cursor-pointer block"
                    >
                      <div className="font-bold text-xs text-slate-800 dark:text-white">{item.label}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">{item.desc}</div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Contact */}
          <button
            id="btn-nav-contact"
            onClick={() => handleNavClick('contact')}
            className={`px-3 py-2 rounded-xl transition-all cursor-pointer ${
              activeSection === 'contact'
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            Contact
          </button>

        </nav>

        {/* Right Header Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Theme Switcher */}
          <button
            id="btn-nav-theme-toggle"
            onClick={onToggleTheme}
            className="p-2 sm:p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme mode"
          >
            {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-slate-700" />}
          </button>

          {/* Login Dropdown (Replaces ERP technical label) */}
          <div 
            className="relative hidden sm:block"
            onMouseEnter={() => setActiveDropdown('login')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button
              id="btn-nav-login"
              onClick={() => handleRouteClick('/login')}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-extrabold text-xs transition-all cursor-pointer min-h-[44px]"
            >
              <LogIn size={15} className="text-blue-600 dark:text-blue-400" />
              <span>Login</span>
              <ChevronDown size={12} className={`transition-transform duration-200 ${activeDropdown === 'login' ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {activeDropdown === 'login' && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full right-0 mt-1 w-56 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-xl z-50 space-y-1"
                >
                  {loginDropdown.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={item.action}
                      className="w-full p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors cursor-pointer flex items-start gap-2.5"
                    >
                      <div className="mt-0.5">{item.icon}</div>
                      <div>
                        <div className="font-bold text-xs text-slate-800 dark:text-white">{item.label}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">{item.desc}</div>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sole Highlighted Primary Action CTA: Enroll Now */}
          <button
            id="btn-nav-enroll-now"
            onClick={() => handleNavClick('admissions')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-md transition-all cursor-pointer shrink-0 min-h-[44px]"
          >
            <GraduationCap size={16} />
            <span>Enroll Now</span>
          </button>

          {/* Mobile Drawer Toggle Toggle */}
          <button
            id="btn-nav-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Toggle mobile navigation menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="xl:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg overflow-hidden shadow-2xl"
          >
            <div className="px-4 py-5 space-y-3 max-h-[80vh] overflow-y-auto">
              
              {/* Home Link */}
              <button
                id="mobile-nav-home"
                onClick={() => handleNavClick('home')}
                className="w-full text-left py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center justify-between"
              >
                <span>🏠 Home</span>
              </button>

              {/* Courses Accordion */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <button
                  onClick={() => setExpandedMobileCategory(expandedMobileCategory === 'courses' ? null : 'courses')}
                  className="w-full text-left py-2.5 px-3 bg-slate-50 dark:bg-slate-800/60 font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center justify-between"
                >
                  <span>🎓 Courses</span>
                  <ChevronDown size={14} className={`transition-transform duration-200 ${expandedMobileCategory === 'courses' ? 'rotate-180' : ''}`} />
                </button>
                {expandedMobileCategory === 'courses' && (
                  <div className="p-2 bg-white dark:bg-slate-900 space-y-1 border-t border-slate-100 dark:border-slate-800">
                    {coursesDropdown.map((c, idx) => (
                      <button
                        key={idx}
                        onClick={c.action}
                        className="w-full text-left p-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 block"
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Admissions Accordion */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <button
                  onClick={() => setExpandedMobileCategory(expandedMobileCategory === 'admissions' ? null : 'admissions')}
                  className="w-full text-left py-2.5 px-3 bg-slate-50 dark:bg-slate-800/60 font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center justify-between"
                >
                  <span>📋 Admissions</span>
                  <ChevronDown size={14} className={`transition-transform duration-200 ${expandedMobileCategory === 'admissions' ? 'rotate-180' : ''}`} />
                </button>
                {expandedMobileCategory === 'admissions' && (
                  <div className="p-2 bg-white dark:bg-slate-900 space-y-1 border-t border-slate-100 dark:border-slate-800">
                    {admissionsDropdown.map((a, idx) => (
                      <button
                        key={idx}
                        onClick={a.action}
                        className="w-full text-left p-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 block"
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Resources Accordion */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <button
                  onClick={() => setExpandedMobileCategory(expandedMobileCategory === 'resources' ? null : 'resources')}
                  className="w-full text-left py-2.5 px-3 bg-slate-50 dark:bg-slate-800/60 font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center justify-between"
                >
                  <span>📚 Study Resources</span>
                  <ChevronDown size={14} className={`transition-transform duration-200 ${expandedMobileCategory === 'resources' ? 'rotate-180' : ''}`} />
                </button>
                {expandedMobileCategory === 'resources' && (
                  <div className="p-2 bg-white dark:bg-slate-900 space-y-1 border-t border-slate-100 dark:border-slate-800">
                    {resourcesDropdown.map((r, idx) => (
                      <button
                        key={idx}
                        onClick={r.action}
                        className="w-full text-left p-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 block"
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Sunshine Store Accordion */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <button
                  onClick={() => setExpandedMobileCategory(expandedMobileCategory === 'store' ? null : 'store')}
                  className="w-full text-left py-2.5 px-3 bg-amber-500/10 dark:bg-amber-500/20 font-bold text-xs text-amber-700 dark:text-amber-400 flex items-center justify-between"
                >
                  <span className="flex items-center gap-1.5">
                    <ShoppingBag size={14} />
                    <span>Sunshine Store</span>
                  </span>
                  <ChevronDown size={14} className={`transition-transform duration-200 ${expandedMobileCategory === 'store' ? 'rotate-180' : ''}`} />
                </button>
                {expandedMobileCategory === 'store' && (
                  <div className="p-2 bg-white dark:bg-slate-900 space-y-1 border-t border-slate-100 dark:border-slate-800">
                    {storeDropdown.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={s.action}
                        className="w-full text-left p-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 block"
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Results Accordion */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <button
                  onClick={() => setExpandedMobileCategory(expandedMobileCategory === 'results' ? null : 'results')}
                  className="w-full text-left py-2.5 px-3 bg-slate-50 dark:bg-slate-800/60 font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center justify-between"
                >
                  <span>🏆 Results</span>
                  <ChevronDown size={14} className={`transition-transform duration-200 ${expandedMobileCategory === 'results' ? 'rotate-180' : ''}`} />
                </button>
                {expandedMobileCategory === 'results' && (
                  <div className="p-2 bg-white dark:bg-slate-900 space-y-1 border-t border-slate-100 dark:border-slate-800">
                    {resultsDropdown.map((res, idx) => (
                      <button
                        key={idx}
                        onClick={res.action}
                        className="w-full text-left p-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 block"
                      >
                        {res.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* About Link */}
              <button
                id="mobile-nav-about"
                onClick={() => handleNavClick('about')}
                className="w-full text-left py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center justify-between"
              >
                <span>🏫 About Sunshine Classes</span>
              </button>

              {/* Contact Link */}
              <button
                id="mobile-nav-contact"
                onClick={() => handleNavClick('contact')}
                className="w-full text-left py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center justify-between"
              >
                <span>📞 Contact Us</span>
              </button>

              {/* Bottom Drawer Actions */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <button
                  id="mobile-btn-enroll-now"
                  onClick={() => handleNavClick('admissions')}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500 text-white font-black text-xs shadow-md min-h-[44px]"
                >
                  <GraduationCap size={16} />
                  <span>Enroll Now (Online Admission)</span>
                </button>

                <button
                  id="mobile-btn-login"
                  onClick={() => handleRouteClick('/login')}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-800 dark:bg-slate-700 text-white font-bold text-xs shadow-md min-h-[44px]"
                >
                  <LogIn size={16} />
                  <span>Student & Teacher Login</span>
                </button>

                {onOpenSupportForm && (
                  <button
                    id="mobile-btn-support"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenSupportForm();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-purple-200 dark:border-purple-800/60 text-purple-700 dark:text-purple-300 bg-purple-50/50 dark:bg-purple-950/30 text-xs font-bold min-h-[44px]"
                  >
                    <HelpCircle size={15} />
                    <span>Report Admission Failure</span>
                  </button>
                )}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
