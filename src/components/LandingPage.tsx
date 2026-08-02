/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Phone,
  MessageSquare,
  Award,
  BookOpen,
  Calendar,
  ChevronRight,
  MapPin,
  Clock,
  Star,
  Users,
  CheckCircle,
  FileText,
  Mail,
  Camera,
  Layers,
  ArrowUp,
  X,
  Plus,
  Search,
  Lock,
  AlertCircle,
  Sun,
  Moon,
  Facebook,
  Instagram,
  ExternalLink,
  ShieldCheck,
  GraduationCap,
  Upload,
  Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Course, BlogPost, Testimonial, Topper, StudyMaterial, GalleryItem, Admission, Student, FounderMember, InstituteStrength, SubscriptionConfig } from '../types';
import { LeadershipSection } from './landing/LeadershipSection';
import SunshineLogo from './SunshineLogo';
import { CloudinaryUpload } from './CloudinaryUpload';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { trackCTAClick, trackContactClick } from './SEOHead';

// Modular Landing Page Components
import { Navbar } from './landing/Navbar';
import { HeroSection } from './landing/HeroSection';
import { QuickAccessHub } from './landing/QuickAccessHub';
import { EcosystemFeatures } from './landing/EcosystemFeatures';
import { CoursesSection } from './landing/CoursesSection';
import { StudyMaterialShowcase } from './landing/StudyMaterialShowcase';
import { SunshineStoreShowcase } from './landing/SunshineStoreShowcase';
import { ToppersSection } from './landing/ToppersSection';
import { TopperCard } from './merit/TopperCard';
import { ResultsPage } from './landing/ResultsPage';
import { FacultySection } from './landing/FacultySection';
import { WhyChooseUsSection } from './landing/WhyChooseUsSection';
import { FacultyPage } from './landing/FacultyPage';
import { TestimonialsSection } from './landing/TestimonialsSection';
import { FAQSection } from './landing/FAQSection';
import { ContactSection } from './landing/ContactSection';
import { Footer } from './landing/Footer';
import { MobileBottomNav } from './landing/MobileBottomNav';
import { PublicStudyMaterialPage } from '../pages/PublicStudyMaterialPage';
import { UNIVERSAL_COURSES, getCourseBySlug } from '../data/coursesData';
import { CourseDirectoryPage } from './courses/CourseDirectoryPage';
import { CourseDetailPage } from './courses/CourseDetailPage';
import { AdmissionsPage } from './admissions/AdmissionsPage';

const WhatsAppIcon = ({ className = "w-5 h-5", size = 20 }: { className?: string; size?: number }) => (
  <svg 
    viewBox="0 0 24 24" 
    width={size} 
    height={size} 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.705 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

function maskName(name: string): string {
  if (!name) return '';
  return name.split(' ').map(word => {
    if (word.length <= 2) return word.charAt(0) + '*'.repeat(word.length - 1);
    return word.slice(0, 2) + '*'.repeat(word.length - 2);
  }).join(' ');
}

function maskMobile(mobile: string): string {
  if (!mobile) return '';
  const digits = mobile.replace(/\D/g, '');
  if (digits.length <= 4) return '*'.repeat(digits.length);
  return '*'.repeat(digits.length - 4) + digits.slice(-4);
}

interface LandingPageProps {
  courses: Course[];
  blogs: BlogPost[];
  testimonials: Testimonial[];
  toppers: Topper[];
  onAddReview: (review: Omit<Testimonial, 'id'>) => void;
  studyMaterials: StudyMaterial[];
  gallery: GalleryItem[];
  onNavigateToERP: () => void;
  onAddAdmission: (adm: Omit<Admission, 'id' | 'status' | 'date'>) => Promise<string> | string;
  admissions?: Admission[];
  students?: Student[];
  founders?: FounderMember[];
  strengths?: InstituteStrength[];
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  subConfig: SubscriptionConfig;
  onAddStudyMaterial?: (material: Omit<StudyMaterial, 'id'>) => void;
}

export default function LandingPage({
  courses,
  blogs,
  testimonials,
  toppers,
  onAddReview,
  studyMaterials,
  gallery,
  onNavigateToERP,
  onAddAdmission,
  admissions = [],
  students = [],
  founders = [],
  strengths = [],
  theme,
  onToggleTheme,
  subConfig,
  onAddStudyMaterial
}: LandingPageProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const getSectionFromPath = (pathname: string) => {
    const p = pathname.toLowerCase();
    if (p === '/about' || p.startsWith('/about/')) return 'about';
    if (p === '/faculty') return 'faculty';
    if (p === '/courses' || p.startsWith('/courses/')) return 'courses';
    if (p === '/enroll' || p === '/admissions' || p.startsWith('/admissions/')) return 'admissions';
    if (p === '/results' || p.startsWith('/results/')) return 'results';
    if (p === '/resources' || p.startsWith('/resources/')) return 'resources';
    if (p === '/gallery') return 'gallery';
    if (p === '/contact') return 'contact';
    return 'home';
  };

  const activeSection = getSectionFromPath(location.pathname);
  const [isCourseNavLoading, setIsCourseNavLoading] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (location.pathname.startsWith('/courses')) {
      setIsCourseNavLoading(true);
      const timer = setTimeout(() => setIsCourseNavLoading(false), 180);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  const setActiveSection = (section: 'home' | 'about' | 'faculty' | 'courses' | 'admissions' | 'results' | 'resources' | 'gallery' | 'contact') => {
    if (section === 'home') navigate('/');
    else if (section === 'admissions') navigate('/enroll');
    else navigate(`/${section}`);
  };

  const handleERPClick = () => {
    if (currentUser) {
      if (currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN') {
        navigate('/admin/dashboard');
      } else if (currentUser.role === 'STUDENT') {
        navigate('/student/dashboard');
      } else if (currentUser.role === 'TEACHER') {
        navigate('/teacher/dashboard');
      } else if (currentUser.role === 'RECEPTIONIST') {
        navigate('/receptionist/dashboard');
      } else {
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [galleryFilter, setGalleryFilter] = useState<string>('ALL');

  // Resource/Study Notes Hub Filter States
  const [resourcesSearch, setResourcesSearch] = useState('');
  const [resourcesSubject, setResourcesSubject] = useState('ALL');
  const [resourcesClass, setResourcesClass] = useState('ALL');
  const [resourcesCategory, setResourcesCategory] = useState('ALL');

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newLandingMaterial, setNewLandingMaterial] = useState<{
    title: string;
    subject: string;
    class: string;
    category: 'NOTES' | 'QUESTION_PAPER';
    desc: string;
    file: string;
    fileData: string;
  }>({
    title: '',
    subject: 'Science',
    class: 'Class 10',
    category: 'NOTES',
    desc: '',
    file: '',
    fileData: ''
  });

  const filteredResources = (studyMaterials || []).filter((item) => {
    const matchSearch = resourcesSearch.trim() === '' || 
      item.title.toLowerCase().includes(resourcesSearch.toLowerCase()) || 
      item.desc.toLowerCase().includes(resourcesSearch.toLowerCase()) || 
      item.subject.toLowerCase().includes(resourcesSearch.toLowerCase());
    
    const matchSubject = resourcesSubject === 'ALL' || item.subject === resourcesSubject;
    const matchClass = resourcesClass === 'ALL' || item.class === resourcesClass;
    const matchCategory = resourcesCategory === 'ALL' || item.category === resourcesCategory;

    return matchSearch && matchSubject && matchClass && matchCategory;
  });

  // Contact/Inquiry states
  const [contactName, setContactName] = useState('');
  const [contactMobile, setContactMobile] = useState('');
  const [contactClass, setContactClass] = useState('Class 10');
  const [contactNotes, setContactNotes] = useState('');
  const [isContactSubmitted, setIsContactSubmitted] = useState(false);

  // Admission Form States
  const [admName, setAdmName] = useState('');
  const [admFather, setAdmFather] = useState('');
  const [admMother, setAdmMother] = useState('');
  const [admDob, setAdmDob] = useState('2011-05-15');
  const [admGender, setAdmGender] = useState('Male');
  const [admClass, setAdmClass] = useState('Class 10');
  const [admPrevSchool, setAdmPrevSchool] = useState('');
  const [admMobile, setAdmMobile] = useState('');
  const [admWhatsapp, setAdmWhatsapp] = useState('');
  const [admParentMobile, setAdmParentMobile] = useState('');
  const [admEmail, setAdmEmail] = useState('');
  const [admAddress, setAdmAddress] = useState('');
  const [admAadhar, setAdmAadhar] = useState('');
  const [admBatch, setAdmBatch] = useState('Class 10 - Evening Stars');
  const [admTiming, setAdmTiming] = useState('04:00 PM - 06:30 PM');
  const [admPhotoUrl, setAdmPhotoUrl] = useState('');
  
  // Admission confirmation state
  const [generatedAdmId, setGeneratedAdmId] = useState<string | null>(null);
  const [isAdmLoading, setIsAdmLoading] = useState(false);
  const [admError, setAdmError] = useState<string | null>(null);

  // Google Form style troubleshooting state
  const [showSupportForm, setShowSupportForm] = useState(false);
  const [supportName, setSupportName] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [supportMobile, setSupportMobile] = useState('');
  const [supportClass, setSupportClass] = useState('Class 10');
  const [supportErrorMsg, setSupportErrorMsg] = useState('');
  const [supportNotes, setSupportNotes] = useState('');
  const [isSupportSubmitting, setIsSupportSubmitting] = useState(false);
  const [supportSuccess, setSupportSuccess] = useState(false);

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportName.trim() || !supportMobile.trim()) {
      alert("Please fill in the required fields (Student Name and Mobile Number).");
      return;
    }

    setIsSupportSubmitting(true);
    try {
      const response = await fetch("/api/support-tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: supportName,
          email: supportEmail,
          mobile: supportMobile,
          className: supportClass,
          errorMessage: supportErrorMsg || "Manual user failure report",
          notes: supportNotes
        })
      });
      const res = await response.json();
      if (res.status === "success") {
        setSupportSuccess(true);
      } else {
        alert(res.message || "Failed to submit report. Please try again.");
      }
    } catch (err: any) {
      console.error("Support form submit error:", err);
      alert("Error submitting support form. Please check your network and try again.");
    } finally {
      setIsSupportSubmitting(false);
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsContactSubmitted(true);
    setTimeout(() => {
      setIsContactSubmitted(false);
      setContactName('');
      setContactMobile('');
      setContactNotes('');
    }, 4000);
  };

  const handleAdmissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdmLoading(true);
    setAdmError(null);

    const sName = admName.trim();
    const sFather = admFather.trim();
    const sMother = admMother.trim();
    const sMobile = admMobile.trim();
    const sWhatsapp = admWhatsapp.trim();
    const sParentMobile = admParentMobile.trim();
    const sEmail = admEmail.trim();
    const sAddress = admAddress.trim();
    const sAadhar = admAadhar.trim();

    // 1. Data Length Validations
    if (sName.length < 3) {
      setAdmError("Student Name must be at least 3 characters long.");
      setIsAdmLoading(false);
      return;
    }
    if (sFather.length < 3) {
      setAdmError("Father's Name must be at least 3 characters long.");
      setIsAdmLoading(false);
      return;
    }
    if (sMother.length < 3) {
      setAdmError("Mother's Name must be at least 3 characters long.");
      setIsAdmLoading(false);
      return;
    }
    if (sAddress.length < 8) {
      setAdmError("Please provide a more complete correspondence address (minimum 8 characters).");
      setIsAdmLoading(false);
      return;
    }

    // 2. 10-Digit Mobile Phone Validations
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(sMobile)) {
      setAdmError("Mobile calling number must be a valid 10-digit number.");
      setIsAdmLoading(false);
      return;
    }
    if (!phoneRegex.test(sWhatsapp)) {
      setAdmError("Student WhatsApp number must be a valid 10-digit number.");
      setIsAdmLoading(false);
      return;
    }
    if (!phoneRegex.test(sParentMobile)) {
      setAdmError("Parent's WhatsApp number must be a valid 10-digit number.");
      setIsAdmLoading(false);
      return;
    }

    // 3. Email Format Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (sEmail && !emailRegex.test(sEmail)) {
      setAdmError("Please enter a valid student email address.");
      setIsAdmLoading(false);
      return;
    }

    // 4. Aadhar Card Number Format Validation
    if (sAadhar && sAadhar.length !== 12) {
      setAdmError("Aadhar Card Number must be exactly 12 digits long.");
      setIsAdmLoading(false);
      return;
    }

    try {
      const admId = await onAddAdmission({
        studentName: sName,
        fatherName: sFather,
        motherName: sMother,
        dob: admDob,
        gender: admGender,
        className: admClass,
        previousSchool: admPrevSchool || undefined,
        mobile: sMobile,
        whatsapp: sWhatsapp,
        parentMobile: sParentMobile,
        email: sEmail || undefined,
        address: sAddress,
        aadhar: sAadhar || undefined,
        preferredBatch: admBatch,
        preferredTiming: admTiming,
        photoUrl: admPhotoUrl || undefined
      });

      setGeneratedAdmId(admId);
      // Clear fields
      setAdmName('');
      setAdmFather('');
      setAdmMother('');
      setAdmPrevSchool('');
      setAdmMobile('');
      setAdmWhatsapp('');
      setAdmParentMobile('');
      setAdmEmail('');
      setAdmAddress('');
      setAdmAadhar('');
      setAdmPhotoUrl('');
    } catch (err: any) {
      console.error("[LandingPage] Admission Form Submission Failed:", err);
      setAdmError(err.message || "An error occurred while submitting the admission. Please try again.");
    } finally {
      setIsAdmLoading(false);
    }
  };

  // Static Facilities List
  const facilities = [
    { title: 'Interactive Smart Classrooms', desc: 'Syllabus topics explained using premium modern audio-visual visualization tools.', icon: Layers },
    { title: 'Small Batch Sizes (Max 25)', desc: 'Guarantees that each board aspirant gets personal, direct concept guidance.', icon: Users },
    { title: 'Doubt Clinics Rooms', desc: 'Daily post-class sessions with Priyanshu Sir to master difficult NCERT numerical tasks.', icon: BookOpen },
    { title: 'Bi-Weekly Assessment Logs', desc: 'Highly structure mock exam series mirroring authentic UP/CBSE board templates.', icon: FileText }
  ];

  return (
    <div id="landing-container" className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors">
      {/* Modern Grouped Navigation Bar */}
      <Navbar
        activeSection={activeSection}
        setActiveSection={(sec) => {
          setActiveSection(sec as any);
          setGeneratedAdmId(null);
        }}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onOpenSupportForm={() => setActiveSection('contact')}
      />

      {/* Main Dynamic View Switching Block */}
      <main className="flex-1">
        {/* VIEW 1: HOME (Redesigned Mobile-First Ecosystem) */}
        {activeSection === 'home' && (
          <div className="w-full max-w-full overflow-x-hidden space-y-0">
            <HeroSection
              onNavigateSection={(sec) => setActiveSection(sec)}
            />

            <QuickAccessHub
              onNavigateSection={(sec) => setActiveSection(sec)}
            />

            <EcosystemFeatures />

            <CoursesSection
              onSelectClassForAdmission={(cls) => {
                setAdmClass(cls);
                navigate('/enroll');
              }}
              onNavigateSection={(sec) => {
                if (sec.startsWith('courses/')) {
                  navigate(`/${sec}`);
                } else {
                  setActiveSection(sec as any);
                }
              }}
              onExploreCourse={(slug) => navigate(`/courses/${slug}`)}
            />

            <StudyMaterialShowcase
              studyMaterials={studyMaterials}
              onNavigateResources={() => navigate('/resources')}
            />

            <SunshineStoreShowcase
              onNavigateStore={() => setActiveSection('store' as any)}
            />

            <ToppersSection 
              toppers={toppers} 
              onNavigateResults={() => setActiveSection('results' as any)}
            />

            <WhyChooseUsSection strengths={strengths} />

            <TestimonialsSection
              testimonials={testimonials}
              onSubmitReview={onAddReview}
            />

            <FAQSection />

            <ContactSection 
              onNavigateSection={(sec) => setActiveSection(sec as any)}
            />
          </div>
        )}

        {/* DEDICATED FACULTY & MENTORS PAGE */}
        {activeSection === 'faculty' && (
          <FacultyPage
            founders={founders}
            onNavigateSection={(sec) => setActiveSection(sec as any)}
            onSelectClassForAdmission={(cls) => {
              setAdmClass(cls);
              navigate('/enroll');
            }}
          />
        )}

        {/* VIEW 2: ABOUT US */}
        {activeSection === 'about' && (
          <div className="mx-auto max-w-7xl px-4 py-12 space-y-16 animate-fade-in">
            {/* Mission Vision */}
            <div className="grid gap-8 lg:grid-cols-12 items-center">
              <div className="lg:col-span-6 space-y-6">
                <span className="text-xs font-black uppercase text-brand-orange tracking-widest block mb-1">Our Foundation</span>
                <h3 className="font-display text-3xl font-black text-slate-800 dark:text-white">Nurturing Toppers in Pihani</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Sunshine Classes was established with a singular focus: to strip away the phobia of complex calculations and equations and make quality, concept-driven science and mathematics education accessible to every student in Pihani, Hardoi. We combine structured academic discipline with empathetic personal mentorship.
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-blue-50/50 dark:bg-slate-900/40 p-4 border border-blue-100/50 dark:border-blue-950/50">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase mb-1 flex items-center gap-1.5">
                      <GraduationCap className="text-brand-blue w-4 h-4" /> Our Mission
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">To build outstanding conceptual foundations in Math and Science, enabling students to conquer board exams effortlessly.</p>
                  </div>
                  <div className="rounded-xl bg-amber-50/50 dark:bg-slate-900/40 p-4 border border-amber-100/50 dark:border-amber-950/50">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase mb-1 flex items-center gap-1.5">
                      <Award className="text-brand-orange w-4 h-4" /> Our Vision
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">To remain the gold-standard coaching brand in Hardoi district, celebrating academic merit year after year.</p>
                  </div>
                </div>
              </div>

              {/* Dynamic Quick Stat Box */}
              <div className="lg:col-span-6 rounded-3xl bg-slate-900 text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 h-24 w-24 bg-brand-orange/10 rounded-full blur-2xl"></div>
                <h4 className="font-display font-bold text-sm uppercase text-amber-300 tracking-wider mb-4">Our Direct Impact Parameters</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <span className="block text-xl font-extrabold text-amber-300">10+ Years</span>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Academic Heritage</span>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <span className="block text-xl font-extrabold text-amber-300">98% Passed</span>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">First Division Boards</span>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <span className="block text-xl font-extrabold text-amber-300">25:1 Max</span>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Student-Teacher Ratio</span>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <span className="block text-xl font-extrabold text-amber-300">100% NCERT</span>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Pedagogic Fidelity</span>
                  </div>
                </div>
              </div>
            </div>

            {/* LEADERSHIP TEAM SECTION */}
            <LeadershipSection
              founders={founders}
              showExploreButton={true}
              onExploreFaculty={() => setActiveSection('faculty')}
            />
          </div>
        )}

        {/* VIEW 3: COURSES DIRECTORY & DEDICATED CLASS PAGES */}
        {activeSection === 'courses' && (() => {
          const isCourseClassPage = location.pathname.startsWith('/courses/class-');
          const currentClassSlug = isCourseClassPage ? location.pathname.replace('/courses/', '').trim().toLowerCase() : null;
          const currentCourse = currentClassSlug ? getCourseBySlug(currentClassSlug) : undefined;

          if (currentCourse) {
            return (
              <CourseDetailPage
                isLoading={isCourseNavLoading}
                course={currentCourse}
                onNavigateSection={(sec) => {
                  if (sec.startsWith('courses/')) {
                    navigate(`/${sec}`);
                  } else {
                    setActiveSection(sec as any);
                  }
                }}
                onSelectClassForAdmission={(className) => {
                  setAdmClass(className);
                  navigate('/enroll');
                }}
                onExploreCourse={(slug) => navigate(`/courses/${slug}`)}
              />
            );
          }

          return (
            <CourseDirectoryPage
              isLoading={isCourseNavLoading}
              onExploreCourse={(slug) => navigate(`/courses/${slug}`)}
              onSelectClassForAdmission={(className) => {
                setAdmClass(className);
                navigate('/enroll');
              }}
              onNavigateSection={(sec) => {
                if (sec.startsWith('courses/')) {
                  navigate(`/${sec}`);
                } else {
                  setActiveSection(sec as any);
                }
              }}
            />
          );
        })()}

        {/* VIEW 4: ONLINE ADMISSIONS FORM */}
        {activeSection === 'admissions' && (
          <AdmissionsPage
            admName={admName}
            setAdmName={setAdmName}
            admDob={admDob}
            setAdmDob={setAdmDob}
            admGender={admGender}
            setAdmGender={setAdmGender}
            admClass={admClass}
            setAdmClass={setAdmClass}
            admPrevSchool={admPrevSchool}
            setAdmPrevSchool={setAdmPrevSchool}
            admAadhar={admAadhar}
            setAdmAadhar={setAdmAadhar}
            admFather={admFather}
            setAdmFather={setAdmFather}
            admMother={admMother}
            setAdmMother={setAdmMother}
            admPhone={admMobile}
            setAdmPhone={setAdmMobile}
            admWhatsapp={admWhatsapp}
            setAdmWhatsapp={setAdmWhatsapp}
            admAddress={admAddress}
            setAdmAddress={setAdmAddress}
            admBatch={admBatch}
            setAdmBatch={setAdmBatch}
            admTiming={admTiming}
            setAdmTiming={setAdmTiming}
            admPhotoUrl={admPhotoUrl}
            setAdmPhotoUrl={setAdmPhotoUrl}
            generatedAdmId={generatedAdmId}
            handleAdmissionSubmit={handleAdmissionSubmit}
            subConfig={subConfig}
            onNavigateSection={(sec) => {
              if (sec.startsWith('courses/')) {
                navigate(`/${sec}`);
              } else {
                setActiveSection(sec as any);
              }
            }}
            resetForm={() => setGeneratedAdmId(null)}
          />
        )}

        {/* VIEW 5: UNIFIED RESULTS & ACADEMIC HONOR ROLL PAGE */}
        {activeSection === 'results' && (
          <ResultsPage
            toppers={toppers}
            testimonials={testimonials}
            onEnrollClick={(cls) => {
              if (cls) setAdmClass(cls);
              navigate('/enroll');
            }}
            onSubmitReview={onAddReview}
          />
        )}

        {/* VIEW: STUDY NOTES & RESOURCES HUB (Sprint 3 Study Material Portal) */}
        {activeSection === 'resources' && (
          <div className="animate-fade-in -mx-4 -my-12">
            <PublicStudyMaterialPage
              currentUser={currentUser}
              onNavigateSection={(sec) => setActiveSection(sec as any)}
              cmsMaterials={studyMaterials}
            />
          </div>
        )}


        {/* VIEW 6: CAMPUS GALLERY */}
        {activeSection === 'gallery' && (
          <div className="mx-auto max-w-7xl px-4 py-12 space-y-12">
            <div className="text-center max-w-xl mx-auto">
              <span className="text-xs font-black uppercase text-brand-orange tracking-widest block mb-1">Campus Life</span>
              <h3 className="font-display text-3xl font-black text-slate-800">Our Interactive Infrastructure</h3>
              <p className="text-xs text-slate-500 mt-1">Explore classroom environments, annual celebration events, and mock examinations halls.</p>
            </div>

            {/* Gallery Category Filter buttons */}
            <div className="flex flex-wrap gap-2 justify-center">
              {['ALL', 'CLASSROOM', 'EVENTS', 'RESULTS', 'ACTIVITIES'].map((cat) => (
                <button
                  key={cat}
                  id={`btn-gallery-filter-${cat.toLowerCase()}`}
                  onClick={() => setGalleryFilter(cat)}
                  className={`rounded-xl px-4 py-1.5 text-xs font-bold transition-all ${
                    galleryFilter === cat ? 'bg-brand-blue text-white shadow' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Masonry image grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {gallery
                .filter((g) => galleryFilter === 'ALL' || g.category === galleryFilter)
                .map((g) => (
                  <div key={g.id} className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-all group">
                    <div className="h-48 overflow-hidden bg-slate-100 relative">
                      <img src={g.imageUrl} alt={g.title} width={400} height={300} loading="lazy" decoding="async" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <span className="absolute bottom-3 left-3 rounded bg-brand-blue/90 text-white text-[8px] font-black uppercase px-2 py-0.5 backdrop-blur-sm">
                        {g.category}
                      </span>
                    </div>
                    <div className="p-4">
                      <h4 className="text-xs font-bold text-slate-800 leading-snug">{g.title}</h4>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* VIEW 8: CONTACT US & INQUIRY */}
        {activeSection === 'contact' && (
          <div className="mx-auto max-w-7xl px-4 py-12 grid gap-12 md:grid-cols-12">
            <div className="md:col-span-5 space-y-6">
              <span className="text-xs font-black uppercase text-brand-orange tracking-widest block mb-1">Visit Campus</span>
              <h3 className="font-display text-3xl font-black text-slate-800">Our Office & Help Desk</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                We welcome parent inquiry visits and walk-ins between our office operating cycles. Feel free to contact us over calling dial or schedule a campus walkthrough.
              </p>

              <div className="space-y-4 text-xs text-slate-600">
                <div className="flex items-start gap-2.5">
                  <MapPin className="text-brand-orange flex-shrink-0" size={16} />
                  <div>
                    <strong>Campus Address:</strong>
                    <p className="text-slate-500 mt-0.5">Mohalla Mishrana, Opposite Subhash Park, Pihani, Hardoi, Uttar Pradesh (Pin: 241406)</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Clock className="text-brand-orange flex-shrink-0" size={16} />
                  <div>
                    <strong>Office Operating Cycles:</strong>
                    <p className="text-slate-500 mt-0.5">10:00 AM to 07:00 PM (Monday to Sunday)</p>
                  </div>
                </div>
              </div>

              {/* Real social and call integration buttons */}
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Quick Connect Channels</span>
                <div className="grid grid-cols-2 gap-2.5">
                  <a
                    href="tel:+918707738284"
                    className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-blue-50/20 hover:border-blue-200 p-3 transition-all group cursor-pointer"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 group-hover:scale-105 transition-all">
                      <Phone size={15} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Voice Call</span>
                      <span className="text-[11px] font-extrabold text-slate-700">8707738284</span>
                    </div>
                  </a>

                  <a
                    href="https://wa.me/919161586254?text=Hello!%20I%20want%20to%20inquire%20about%20Sunshine%20Classes%20tuitions."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50/15 hover:bg-emerald-50/40 hover:border-emerald-300 p-3 transition-all group cursor-pointer"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 group-hover:scale-105 transition-all">
                      <WhatsAppIcon size={15} className="text-emerald-600" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-emerald-600 block uppercase tracking-wider">WhatsApp</span>
                      <span className="text-[11px] font-extrabold text-slate-700">9161586254</span>
                    </div>
                  </a>

                  <a
                    href="https://facebook.com/sunshineclassespihani"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-blue-50/15 hover:border-blue-300 p-3 transition-all group cursor-pointer"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-blue-700 group-hover:scale-105 transition-all">
                      <Facebook size={15} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Facebook</span>
                      <span className="text-[11px] font-extrabold text-slate-700">@sunshine...</span>
                    </div>
                  </a>

                  <a
                    href="https://instagram.com/sunshineclassespihani"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-pink-50/15 hover:border-pink-300 p-3 transition-all group cursor-pointer"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-pink-600 group-hover:scale-105 transition-all">
                      <Instagram size={15} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Instagram</span>
                      <span className="text-[11px] font-extrabold text-slate-700">@sunshine...</span>
                    </div>
                  </a>
                </div>
              </div>

              {/* Real Google Maps interactive iframe */}
              <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm h-64 bg-slate-100 relative group">
                <iframe
                  title="Sunshine Classes Pihani Location Map"
                  src="https://maps.google.com/maps?q=Sunshine%20Classes,%20Pihani,%20Hardoi,%20Uttar%20Pradesh%20241406&t=&z=16&ie=UTF8&iwloc=&output=embed"
                  className="w-full h-full border-0"
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
                <div className="absolute bottom-3 left-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur px-2.5 py-1.5 rounded-lg shadow-md border border-slate-200/60 dark:border-slate-800/60 flex items-center gap-1.5 text-[10px] font-bold text-slate-700 dark:text-slate-200">
                  <MapPin size={12} className="text-brand-orange animate-pulse" />
                  <span>Sunshine Classes, Pihani</span>
                </div>
                <a
                  href="https://maps.app.goo.gl/Z7BuSwoBFkvghk5e8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-3 right-3 bg-brand-orange hover:bg-indigo-700 text-white px-2.5 py-1.5 rounded-lg shadow-md flex items-center gap-1.5 text-[9px] font-black tracking-wider uppercase cursor-pointer transition-all duration-300 transform hover:scale-105"
                >
                  <MapPin size={11} />
                  <span>Open Maps</span>
                  <ExternalLink size={10} />
                </a>
              </div>
            </div>

            {/* Offline inquiry desk form */}
            <div className="md:col-span-7 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              <h3 className="font-display font-bold text-base text-slate-800 mb-2">Send Inquiry Dispatch</h3>
              <p className="text-xs text-slate-500 mb-6 font-medium">Have a doubt? Enter parameters. Desk receptionist will follow up on WhatsApp within 12 hours.</p>

              {!isContactSubmitted ? (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-700">Your Full Name</label>
                      <input
                        id="contact-input-name"
                        type="text"
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="e.g. Sanjay Singh"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-brand-blue focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-700">Calling Mobile</label>
                      <input
                        id="contact-input-mobile"
                        type="tel"
                        required
                        value={contactMobile}
                        onChange={(e) => setContactMobile(e.target.value)}
                        placeholder="e.g. 9161586254"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-brand-blue focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">What is your query details?</label>
                    <textarea
                      id="contact-ta-notes"
                      required
                      rows={4}
                      value={contactNotes}
                      onChange={(e) => setContactNotes(e.target.value)}
                      placeholder="Ask about pre-board mock schedules, tuition slot availability, or discount parameters..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-brand-blue focus:bg-white"
                    ></textarea>
                  </div>

                  <div className="flex justify-end">
                    <button
                      id="btn-contact-submit"
                      type="submit"
                      className="rounded-xl bg-brand-blue hover:bg-brand-blue-hover text-white px-5 py-2.5 text-xs font-bold shadow-md transition-all"
                    >
                      Disptach Enquiry
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-12 space-y-3">
                  <CheckCircle size={32} className="text-green-500 mx-auto" />
                  <h4 className="text-xs font-bold text-slate-800">Inquiry Dispatch Logged!</h4>
                  <p className="text-xs text-slate-500">Neha Sharma (Desk Registrar) will contact you over dial shortly.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Floating Action Bars */}
      <div className="fixed bottom-16 xl:bottom-6 left-4 sm:left-6 z-40 flex items-center gap-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-1.5 rounded-full shadow-xl border border-slate-200/60 dark:border-slate-800/60">
        <a
          id="btn-sticky-call"
          href="tel:8707738284"
          className="flex h-9 items-center gap-1.5 rounded-full bg-amber-500 text-white px-3.5 hover:bg-amber-600 text-xs font-bold transition-all shadow-sm cursor-pointer"
          title="Call Admission Desk"
        >
          <Phone size={12} /> <span className="hidden sm:inline">Call Office</span>
        </a>
        
        <a
          id="btn-sticky-whatsapp"
          href="https://wa.me/919161586254?text=Hello!%20I%20am%20interested%20in%20Sunshine%20Classes."
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 hover:bg-emerald-600 text-white transition-all shadow-sm cursor-pointer"
          title="Chat on WhatsApp"
        >
          <WhatsAppIcon size={14} />
        </a>

        <a
          id="btn-sticky-facebook"
          href="https://facebook.com/sunshineclassespihani"
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm cursor-pointer"
          title="Visit Facebook Page"
        >
          <Facebook size={14} />
        </a>

        <a
          id="btn-sticky-instagram"
          href="https://instagram.com/sunshineclassespihani"
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 hover:opacity-90 text-white transition-all shadow-sm cursor-pointer"
          title="Follow on Instagram"
        >
          <Instagram size={14} />
        </a>
      </div>

      {/* Modular Redesigned Footer */}
      <Footer setActiveSection={setActiveSection} />

      {/* Sticky Mobile Bottom Navigation Bar */}
      <MobileBottomNav activeSection={activeSection} setActiveSection={setActiveSection} />

      {/* GOOGLE FORM-STYLE ENROLLMENT FAILURE REPORTING MODAL */}
      {showSupportForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4" id="google-form-support-overlay">
          <div className="relative w-full max-w-2xl bg-[#f0ebf8] dark:bg-slate-950 rounded-2xl shadow-2xl border border-[#d1c4e9] overflow-hidden my-8 animate-in fade-in zoom-in duration-200 text-left">
            {/* Google Forms Top Purple Bar */}
            <div className="h-2.5 bg-[#673ab7]" id="gform-top-accent"></div>
            
            {/* Main Form Scroller */}
            <div className="p-4 sm:p-6 space-y-4 max-h-[85vh] overflow-y-auto">
              
              {/* Header card */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-3 relative">
                {/* Form header */}
                <h3 className="font-sans text-2xl font-normal text-slate-900 dark:text-white" id="gform-title">
                  Sunshine Classes - Enrollment Support Form
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                  Did you encounter an error or failure while trying to submit your online enrollment? 
                  Please fill out this quick reporting form. Our administration team will review your details and manually initiate or repair your student record.
                </p>
                <div className="text-[10px] text-red-600 font-semibold border-t border-slate-100 dark:border-slate-800 pt-2.5 flex items-center gap-1">
                  <span>*</span> Indicates required question
                </div>
                
                <button
                  id="btn-close-support-form-top"
                  type="button"
                  onClick={() => setShowSupportForm(false)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer text-sm font-bold p-1"
                >
                  ✕
                </button>
              </div>

              {supportSuccess ? (
                /* SUCCESS RESPONSE CARD */
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm text-left space-y-5">
                  <h4 className="font-sans text-xl font-normal text-slate-900 dark:text-white">
                    Enrollment Support Form
                  </h4>
                  <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1 font-sans">
                    <p className="font-semibold text-emerald-600 dark:text-emerald-400">✓ Your response has been recorded.</p>
                    <p className="text-slate-500 mt-2 leading-relaxed">
                      Thank you for reporting this issue. Our administrative staff will review your case immediately and contact you at the mobile number provided.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                    <button
                      id="btn-support-form-submit-another"
                      type="button"
                      onClick={() => setSupportSuccess(false)}
                      className="text-xs text-[#673ab7] hover:underline font-bold cursor-pointer bg-transparent border-0 p-0"
                    >
                      Submit another response
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      id="btn-support-form-close-success"
                      type="button"
                      onClick={() => setShowSupportForm(false)}
                      className="text-xs text-slate-500 hover:underline font-bold cursor-pointer bg-transparent border-0 p-0"
                    >
                      Close Window
                    </button>
                  </div>
                </div>
              ) : (
                /* INPUT CARDS FORM */
                <form onSubmit={handleSupportSubmit} className="space-y-4">
                  
                  {/* Candidate Name Card */}
                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-2 text-left">
                    <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 font-sans">
                      Candidate's Full Name <span className="text-red-500">*</span>
                    </label>
                    <p className="text-[10px] text-slate-400">Please write the student's legal name used in the enrollment attempt.</p>
                    <input
                      type="text"
                      required
                      id="gform-input-name"
                      value={supportName}
                      onChange={(e) => setSupportName(e.target.value)}
                      placeholder="Your answer"
                      className="w-full max-w-md border-b-2 border-slate-200 dark:border-slate-700 bg-transparent py-2 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-[#673ab7] transition-all font-sans"
                    />
                  </div>

                  {/* Contact Number Card */}
                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-2 text-left">
                    <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 font-sans">
                      Contact Phone / WhatsApp Number <span className="text-red-500">*</span>
                    </label>
                    <p className="text-[10px] text-slate-400">Where can our support panel contact you to coordinate?</p>
                    <input
                      type="tel"
                      required
                      id="gform-input-phone"
                      value={supportMobile}
                      onChange={(e) => setSupportMobile(e.target.value)}
                      placeholder="Your answer"
                      className="w-full max-w-md border-b-2 border-slate-200 dark:border-slate-700 bg-transparent py-2 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-[#673ab7] transition-all font-sans"
                    />
                  </div>

                  {/* Email Address Card */}
                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-2 text-left">
                    <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 font-sans">
                      Correspondence Email Address
                    </label>
                    <p className="text-[10px] text-slate-400">Optional. Enter if you wish to receive credentials copy via email.</p>
                    <input
                      type="email"
                      id="gform-input-email"
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      placeholder="Your answer"
                      className="w-full max-w-md border-b-2 border-slate-200 dark:border-slate-700 bg-transparent py-2 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-[#673ab7] transition-all font-sans"
                    />
                  </div>

                  {/* Class Applying Card */}
                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-2 text-left">
                    <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 font-sans">
                      Academic Class Group <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="gform-select-class"
                      value={supportClass}
                      onChange={(e) => setSupportClass(e.target.value)}
                      className="w-full max-w-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-[#673ab7]"
                    >
                      <option value="Class 10">Class 10</option>
                      <option value="Class 9">Class 9</option>
                      <option value="Classes 5 to 8">Classes 5 to 8</option>
                      <option value="Classes 1 to 4">Classes 1 to 4</option>
                    </select>
                  </div>

                  {/* Error Message Card */}
                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-2 text-left">
                    <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 font-sans">
                      Error Message / Failure Reason
                    </label>
                    <p className="text-[10px] text-slate-400">Optional. Describe the specific error or paste any warning text displayed.</p>
                    <textarea
                      id="gform-input-error"
                      rows={2}
                      value={supportErrorMsg}
                      onChange={(e) => setSupportErrorMsg(e.target.value)}
                      placeholder="Your answer"
                      className="w-full border-b-2 border-slate-200 dark:border-slate-700 bg-transparent py-2 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-[#673ab7] transition-all font-sans resize-none"
                    />
                  </div>

                  {/* Additional Remarks Card */}
                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-2 text-left">
                    <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 font-sans">
                      Additional Remarks / Help Notes
                    </label>
                    <p className="text-[10px] text-slate-400">Any other details you would like to submit to our administrative team.</p>
                    <textarea
                      id="gform-input-notes"
                      rows={2}
                      value={supportNotes}
                      onChange={(e) => setSupportNotes(e.target.value)}
                      placeholder="Your answer"
                      className="w-full border-b-2 border-slate-200 dark:border-slate-700 bg-transparent py-2 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-[#673ab7] transition-all font-sans resize-none"
                    />
                  </div>

                  {/* Actions footer */}
                  <div className="flex justify-between items-center pt-2">
                    <button
                      id="btn-gform-clear"
                      type="button"
                      onClick={() => {
                        setSupportName('');
                        setSupportEmail('');
                        setSupportMobile('');
                        setSupportErrorMsg('');
                        setSupportNotes('');
                      }}
                      className="text-xs text-[#673ab7] hover:bg-[#673ab7]/5 px-4 py-2 rounded-lg font-bold transition-all cursor-pointer bg-transparent border-0"
                    >
                      Clear form
                    </button>
                    
                    <div className="flex items-center gap-3">
                      <button
                        id="btn-gform-cancel"
                        type="button"
                        onClick={() => setShowSupportForm(false)}
                        className="rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 px-4 py-2 text-xs font-bold transition-all cursor-pointer bg-transparent border-0"
                      >
                        Cancel
                      </button>
                      <button
                        id="btn-gform-submit"
                        type="submit"
                        disabled={isSupportSubmitting}
                        className="rounded-lg bg-[#673ab7] hover:bg-[#5e35b1] text-white px-5 py-2 text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {isSupportSubmitting ? (
                          <>
                            <span className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            Submitting...
                          </>
                        ) : (
                          "Submit"
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
            <div className="bg-[#f0ebf8] dark:bg-slate-900 py-3.5 px-6 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 flex justify-between items-center">
              <span>This form was created inside Sunshine Classes Support Desk.</span>
              <span className="font-bold font-sans">Google Forms Style</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function ReviewForm({ onSubmitReview }: { onSubmitReview: (review: Omit<Testimonial, 'id'>) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState<'PARENT' | 'STUDENT'>('STUDENT');
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [customPhoto, setCustomPhoto] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) {
      alert('Please fill in your name and review message.');
      return;
    }
    onSubmitReview({
      name: name.trim(),
      role,
      rating,
      content: content.trim(),
      avatarUrl: customPhoto || (role === 'STUDENT' 
        ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60' 
        : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=60')
    });
    setSubmitted(true);
    setName('');
    setContent('');
    setCustomPhoto('');
    setTimeout(() => {
      setSubmitted(false);
      setIsOpen(false);
    }, 2500);
  };

  if (!isOpen) {
    return (
      <button
        id="btn-open-review-form"
        onClick={() => setIsOpen(true)}
        className="rounded-xl bg-brand-orange hover:bg-brand-orange/90 text-white text-xs font-bold px-5 py-2.5 shadow-sm transition-all cursor-pointer"
      >
        Write a Review
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="text-left space-y-4 mt-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
      {submitted ? (
        <div className="text-center py-6 space-y-2">
          <span className="text-2xl">🎉</span>
          <h5 className="font-bold text-xs text-green-600">Review Submitted Successfully!</h5>
          <p className="text-[10px] text-slate-500">Thank you for your feedback. Your review has been added to our public page!</p>
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Your Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g., Ramesh Kumar"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-1.5 text-xs focus:ring-1 focus:ring-brand-blue outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Your Role</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as any)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-1.5 text-xs focus:ring-1 focus:ring-brand-blue outline-none"
              >
                <option value="STUDENT">Student</option>
                <option value="PARENT">Parent</option>
              </select>
            </div>
          </div>

          <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-lg p-3 bg-slate-50/50 dark:bg-slate-900/50">
            <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1.5">Your Photo (Optional)</label>
            <div className="flex gap-3 items-center">
              {customPhoto && (
                <img src={customPhoto} alt="Reviewer preview" width={36} height={36} loading="lazy" decoding="async" className="h-9 w-9 rounded-full object-cover border border-slate-200" />
              )}
              <div className="relative border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-center flex-1 flex items-center justify-center cursor-pointer">
                <input
                  type="file"
                  id="landing-review-photo-picker"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const f = e.target.files[0];
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setCustomPhoto(reader.result as string);
                      };
                      reader.readAsDataURL(f);
                    }
                  }}
                />
                <label htmlFor="landing-review-photo-picker" className="cursor-pointer flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <Upload size={13} className="text-slate-400" />
                  <span className="font-bold text-brand-blue hover:underline">Choose Photo</span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Rating</label>
            <div className="flex gap-1.5 items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="text-amber-400 hover:scale-115 transition-transform cursor-pointer"
                >
                  <Star size={18} fill={star <= rating ? "currentColor" : "none"} />
                </button>
              ))}
              <span className="text-[10px] font-bold text-slate-500 ml-2">({rating} Stars)</span>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Your Review / Message</label>
            <textarea
              required
              rows={3}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Tell other parents and students about your experience at Sunshine Classes..."
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-1.5 text-xs focus:ring-1 focus:ring-brand-blue outline-none resize-none"
            />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-brand-blue text-white px-4 py-1.5 text-xs font-bold hover:bg-brand-blue-hover cursor-pointer shadow-sm"
            >
              Submit Review
            </button>
          </div>
        </>
      )}
    </form>
  );
}

