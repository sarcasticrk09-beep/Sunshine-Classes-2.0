import React, { useState, useEffect, useMemo, useRef } from 'react';
import { StudyMaterial, StudyMaterialType, User } from '../types';
import { 
  getPublicStudyMaterials, 
  getStudyMaterials, 
  incrementDownloadCount, 
  incrementViewCount 
} from '../services/studyMaterialService';
import { SEED_STUDY_MATERIALS } from '../data';
import { 
  BookOpen, 
  Search, 
  Download, 
  Eye, 
  FileText, 
  Sparkles, 
  ChevronRight, 
  Filter, 
  GraduationCap, 
  Share2, 
  ExternalLink, 
  Youtube, 
  CheckCircle2, 
  ArrowLeft,
  X,
  Tag,
  Clock,
  Layers,
  FileCheck,
  Lock,
  Unlock,
  TrendingUp,
  Flame,
  ArrowUpRight,
  Video,
  FileSpreadsheet,
  FolderArchive,
  Image as ImageIcon,
  RotateCcw,
  LogIn,
  ShieldAlert,
  ArrowRight,
  SlidersHorizontal,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

interface PublicStudyMaterialPageProps {
  currentUser?: User | null;
  onNavigateSection?: (section: string) => void;
  cmsMaterials?: StudyMaterial[];
  onOpenLoginModal?: () => void;
}

const CLASSES_LIST = [
  'ALL',
  'Class 10',
  'Class 9',
  'Class 8',
  'Class 7',
  'Class 6',
  'Class 5',
  'Board Specials'
];

const SUBJECTS_LIST = [
  'ALL',
  'Mathematics',
  'Science',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'Social Studies',
  'Hindi'
];

const CATEGORIES_LIST = [
  { id: 'ALL', label: 'All Categories', icon: '✨' },
  { id: 'NOTES', label: 'Notes & Chapter Guides', icon: '📘' },
  { id: 'FORMULA_SHEET', label: 'Formula & Trick Sheets', icon: '🧮' },
  { id: 'PYQ', label: 'Previous Year Papers (PYQs)', icon: '📜' },
  { id: 'WORKSHEET', label: 'Worksheets & Homework', icon: '📋' },
  { id: 'SAMPLE_PAPER', label: 'Sample Papers & Mocks', icon: '🎯' },
  { id: 'NCERT_SOLUTION', label: 'NCERT Step Solutions', icon: '📖' },
  { id: 'QUESTION_BANK', label: 'Question Banks', icon: '🗂️' },
  { id: 'VIDEO_LINK', label: 'Video Lectures', icon: '🎥' }
];

const ACCESS_LEVELS = [
  { id: 'ALL', label: 'All Content' },
  { id: 'PUBLIC', label: 'Free Public 🌐' },
  { id: 'RESTRICTED', label: 'Enrolled Student Only 🔒' }
];

export const PublicStudyMaterialPage: React.FC<PublicStudyMaterialPageProps> = ({
  currentUser,
  onNavigateSection,
  cmsMaterials,
  onOpenLoginModal
}) => {
  const navigate = useNavigate();
  const catalogRef = useRef<HTMLDivElement>(null);

  const [materials, setMaterials] = useState<StudyMaterial[]>(cmsMaterials || []);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedAccess, setSelectedAccess] = useState('ALL');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'POPULAR' | 'TITLE'>('NEWEST');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Modal States
  const [selectedMaterial, setSelectedMaterial] = useState<StudyMaterial | null>(null);
  const [restrictedModalMaterial, setRestrictedModalMaterial] = useState<StudyMaterial | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load study materials on mount or update when cmsMaterials changes
  useEffect(() => {
    if (cmsMaterials && cmsMaterials.length > 0) {
      setMaterials(cmsMaterials);
      setLoading(false);
    } else {
      loadMaterials();
    }
  }, [cmsMaterials]);

  const loadMaterials = async () => {
    setLoading(true);
    try {
      // If user is authenticated as Student/Admin/Teacher, load all materials (including student-only)
      let data: StudyMaterial[] = [];
      if (currentUser) {
        data = await getStudyMaterials();
      } else {
        data = await getPublicStudyMaterials();
      }
      
      if (data && data.length > 0) {
        setMaterials(data.filter(m => m.status === 'PUBLISHED' || !m.status));
      } else {
        setMaterials(SEED_STUDY_MATERIALS.filter(m => m.status === 'PUBLISHED' || !m.status));
      }
    } catch (err) {
      console.warn('Using fallback seed study materials:', err);
      setMaterials(SEED_STUDY_MATERIALS.filter(m => m.status === 'PUBLISHED' || !m.status));
    } finally {
      setLoading(false);
    }
  };

  // Helper for Toast notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Latest Uploads (Top 6 newest)
  const latestUploads = useMemo(() => {
    return [...materials]
      .sort((a, b) => new Date(b.createdAt || b.date || 0).getTime() - new Date(a.createdAt || a.date || 0).getTime())
      .slice(0, 6);
  }, [materials]);

  // Popular Downloads (Top 6 most downloaded)
  const popularDownloads = useMemo(() => {
    return [...materials]
      .sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0))
      .slice(0, 6);
  }, [materials]);

  // Main Filtered Materials
  const filteredMaterials = useMemo(() => {
    return materials.filter(item => {
      // Class
      if (selectedClass !== 'ALL' && item.class !== selectedClass) return false;
      // Subject
      if (selectedSubject !== 'ALL' && item.subject !== selectedSubject) return false;
      // Category / Type
      if (selectedCategory !== 'ALL') {
        if (item.materialType !== selectedCategory && item.category !== selectedCategory) {
          return false;
        }
      }
      // Access Level
      if (selectedAccess === 'PUBLIC' && item.isPublic === false) return false;
      if (selectedAccess === 'RESTRICTED' && item.isPublic !== false) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = item.title.toLowerCase().includes(q);
        const subjectMatch = item.subject.toLowerCase().includes(q);
        const chapterMatch = (item.chapter || '').toLowerCase().includes(q);
        const descMatch = (item.description || item.desc || '').toLowerCase().includes(q);
        const tagsMatch = item.tags ? item.tags.some(t => t.toLowerCase().includes(q)) : false;
        const authorMatch = (item.createdBy || '').toLowerCase().includes(q);

        if (!titleMatch && !subjectMatch && !chapterMatch && !descMatch && !tagsMatch && !authorMatch) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'POPULAR') {
        return (b.downloadCount || 0) - (a.downloadCount || 0);
      }
      if (sortBy === 'TITLE') {
        return a.title.localeCompare(b.title);
      }
      // Default: NEWEST
      return new Date(b.createdAt || b.date || 0).getTime() - new Date(a.createdAt || a.date || 0).getTime();
    });
  }, [materials, selectedClass, selectedSubject, selectedCategory, selectedAccess, searchQuery, sortBy]);

  // Related Resources for Modal
  const relatedResources = useMemo(() => {
    if (!selectedMaterial) return [];
    return materials
      .filter(m => m.id !== selectedMaterial.id && (m.class === selectedMaterial.class || m.subject === selectedMaterial.subject || m.materialType === selectedMaterial.materialType))
      .slice(0, 4);
  }, [materials, selectedMaterial]);

  // Check access permission for restricted materials
  const hasAccessToMaterial = (material: StudyMaterial): boolean => {
    if (material.isPublic !== false) return true;
    if (currentUser) return true; // Enrolled student or admin/teacher
    return false;
  };

  // Handle Download Request
  const handleDownload = async (item: StudyMaterial, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    // Check Access Guard
    if (!hasAccessToMaterial(item)) {
      setRestrictedModalMaterial(item);
      return;
    }

    try {
      await incrementDownloadCount(item.id);
      setMaterials(prev => prev.map(m => m.id === item.id ? { ...m, downloadCount: (m.downloadCount || 0) + 1 } : m));
    } catch (err) {
      console.warn('Metrics recording failed:', err);
    }

    // Trigger File Download or View
    if (item.fileUrl && item.fileUrl.startsWith('http')) {
      window.open(item.fileUrl, '_blank', 'noopener,noreferrer');
      showToast(`Downloading "${item.title}" PDF...`);
    } else if (item.externalUrl && item.externalUrl.startsWith('http')) {
      window.open(item.externalUrl, '_blank', 'noopener,noreferrer');
    } else if (item.fileData) {
      if (item.fileData.startsWith('http://') || item.fileData.startsWith('https://')) {
        window.open(item.fileData, '_blank', 'noopener,noreferrer');
      } else {
        const link = document.createElement('a');
        link.href = item.fileData;
        link.download = item.file || `${item.slug || 'study_resource'}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast(`Downloading "${item.file}"...`);
      }
    } else {
      // Fallback Blob download for standard NCERT text reference
      const content = `Sunshine Classes Study Resource
Title: ${item.title}
Class: ${item.class} | Subject: ${item.subject} | Chapter: ${item.chapter || 'N/A'}
Faculty: ${item.createdBy || 'Priyanshu Gupta Sir'}

Description:
${item.description || item.desc}

Official Website: https://sunshineclasses.in
Contact: +91 9988776655 | Pihani, Hardoi (U.P.)`;

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${item.slug || 'sunshine_resource'}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      showToast(`Downloaded NCERT Reference Guide for "${item.title}"`);
    }
  };

  // Handle View Details
  const handleViewDetails = async (item: StudyMaterial, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    // Check Access Guard
    if (!hasAccessToMaterial(item)) {
      setRestrictedModalMaterial(item);
      return;
    }

    setSelectedMaterial(item);
    try {
      await incrementViewCount(item.id);
      setMaterials(prev => prev.map(m => m.id === item.id ? { ...m, viewCount: (m.viewCount || 0) + 1 } : m));
    } catch (err) {
      console.warn('Metrics recording failed:', err);
    }
  };

  // Scroll to Catalogue
  const scrollToCatalogue = () => {
    if (catalogRef.current) {
      catalogRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Helper function to render file icon based on materialType or file extension
  const renderFileTypeIcon = (type?: string, file?: string) => {
    const t = (type || '').toUpperCase();
    const f = (file || '').toLowerCase();

    if (t === 'VIDEO_LINK' || f.endsWith('.mp4') || f.includes('youtube')) {
      return <Video className="text-rose-500" size={18} />;
    }
    if (f.endsWith('.docx') || f.endsWith('.doc')) {
      return <FileText className="text-blue-500" size={18} />;
    }
    if (f.endsWith('.pptx') || f.endsWith('.ppt')) {
      return <FileSpreadsheet className="text-amber-500" size={18} />;
    }
    if (f.endsWith('.zip') || f.endsWith('.rar')) {
      return <FolderArchive className="text-purple-500" size={18} />;
    }
    if (f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg')) {
      return <ImageIcon className="text-emerald-500" size={18} />;
    }
    return <FileCheck className="text-amber-600" size={18} />;
  };

  return (
    <div id="study-material-portal-page" className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans pb-20">
      
      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold border border-slate-700 dark:border-amber-400"
          >
            <CheckCircle2 size={16} className="text-emerald-400 dark:text-slate-950" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. HERO SECTION */}
      <header className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white pt-10 pb-16 px-4 border-b border-amber-500/20 overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto space-y-6 relative z-10">
          
          {/* Top Bar Actions & Breadcrumbs */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <button
                onClick={() => {
                  if (onNavigateSection) onNavigateSection('home');
                  else navigate('/');
                }}
                className="hover:text-amber-400 flex items-center gap-1 transition-colors"
              >
                <ArrowLeft size={14} /> Back to Home
              </button>
              <ChevronRight size={12} className="text-slate-600" />
              <span className="text-amber-400 font-bold">Study Material Portal</span>
              {selectedClass !== 'ALL' && (
                <>
                  <ChevronRight size={12} className="text-slate-600" />
                  <span className="text-slate-300 font-semibold">{selectedClass}</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[11px] font-bold uppercase tracking-wider">
                <Sparkles size={12} /> ERP CMS Powered
              </span>
              {currentUser ? (
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  <Unlock size={14} /> Enrolled Student Pass Active
                </span>
              ) : (
                <button
                  onClick={() => {
                    if (onOpenLoginModal) onOpenLoginModal();
                    else navigate('/student/login');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <LogIn size={13} /> Student Login
                </button>
              )}
            </div>
          </div>

          {/* Hero Content */}
          <div className="grid lg:grid-cols-12 gap-8 items-center pt-2">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-amber-400">
                <BookOpen size={16} />
                <span>Learning Resource Hub</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Study Material <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">Portal</span>
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
                Discover, preview, and download chapter revision notes, formula cheat-sheets, worksheets, NCERT solutions, and 10-year board paper archives updated directly from Sunshine Classes ERP CMS.
              </p>

              {/* Stats Bar */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-amber-400 text-sm">500+</span>
                  <span className="text-slate-400">Chapter Notes</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-slate-700" />
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-amber-400 text-sm">10-Yr</span>
                  <span className="text-slate-400">Board PYQs</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-slate-700" />
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-amber-400 text-sm">100%</span>
                  <span className="text-slate-400">NCERT Mapped</span>
                </div>
              </div>
            </div>

            {/* Hero Instant Search Widget */}
            <div className="lg:col-span-5 bg-white/5 backdrop-blur-md p-5 rounded-3xl border border-white/10 space-y-3 shadow-2xl">
              <div className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center justify-between">
                <span>Instant Resource Finder</span>
                <SlidersHorizontal size={14} />
              </div>

              <div className="relative">
                <Search size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by topic, formula, or chapter..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') scrollToCatalogue();
                  }}
                  className="w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-400 text-xs font-medium focus:outline-none focus:border-amber-400 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-white"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white outline-none focus:border-amber-400"
                >
                  {CLASSES_LIST.map(cls => (
                    <option key={cls} value={cls}>
                      {cls === 'ALL' ? 'All Classes' : cls}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white outline-none focus:border-amber-400"
                >
                  {SUBJECTS_LIST.map(s => (
                    <option key={s} value={s}>
                      {s === 'ALL' ? 'All Subjects' : s}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={scrollToCatalogue}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Browse All Resources ({filteredMaterials.length})</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* 2. QUICK CATEGORY CARDS */}
      <section className="max-w-7xl mx-auto px-4 -mt-8 relative z-20">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { id: 'NOTES', title: 'Chapter Notes', count: '150+ PDFs', icon: '📘', color: 'hover:border-blue-400' },
            { id: 'FORMULA_SHEET', title: 'Formula Sheets', count: '45 Sheets', icon: '🧮', color: 'hover:border-amber-400' },
            { id: 'PYQ', title: '10-Yr PYQs', count: '80 Papers', icon: '📜', color: 'hover:border-purple-400' },
            { id: 'WORKSHEET', title: 'Worksheets', count: '120 Sheets', icon: '📋', color: 'hover:border-emerald-400' },
            { id: 'SAMPLE_PAPER', title: 'Sample Papers', count: '30 Mocks', icon: '🎯', color: 'hover:border-rose-400' },
            { id: 'NCERT_SOLUTION', title: 'NCERT Solutions', count: '200+ Guides', icon: '📖', color: 'hover:border-indigo-400' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                scrollToCatalogue();
              }}
              className={`p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all text-left group cursor-pointer ${
                selectedCategory === cat.id ? 'border-amber-500 ring-2 ring-amber-500/20' : cat.color
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-2xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                <ChevronRight size={14} className="text-slate-400 group-hover:text-amber-500 transition-colors" />
              </div>
              <h3 className="font-extrabold text-xs text-slate-800 dark:text-white line-clamp-1">
                {cat.title}
              </h3>
              <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                {cat.count}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* MAIN CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 mt-12 space-y-12">

        {/* 3. LATEST UPLOADS SECTION */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <Sparkles size={12} /> Fresh CMS Uploads
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Latest Learning Materials
              </h2>
            </div>
            <button
              onClick={scrollToCatalogue}
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              View All Catalogue <ArrowRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {latestUploads.map(item => (
              <div
                key={item.id}
                onClick={() => handleViewDetails(item)}
                className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-400 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                        {item.class}
                      </span>
                      <span className="px-2 py-0.5 rounded-md font-semibold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300">
                        {item.subject}
                      </span>
                    </div>
                    {item.isPublic === false ? (
                      <span className="px-2 py-0.5 rounded-md font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 flex items-center gap-1">
                        <Lock size={10} /> Enrolled Only
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                        <Unlock size={10} /> Free PDF
                      </span>
                    )}
                  </div>

                  <h3 className="font-extrabold text-xs text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2">
                    {item.title}
                  </h3>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {item.description || item.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                  <div className="flex items-center gap-1">
                    {renderFileTypeIcon(item.materialType, item.file)}
                    <span>{item.size || 'PDF Document'}</span>
                  </div>
                  <button
                    onClick={(e) => handleDownload(item, e)}
                    className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Download size={12} /> Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. POPULAR DOWNLOADS SECTION */}
        <section className="p-6 bg-gradient-to-br from-amber-500/10 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 rounded-3xl border border-amber-200/80 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <Flame size={12} className="text-amber-500" /> Student Favorites
              </span>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                Most Popular Downloads
              </h2>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Ranked by total student downloads
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularDownloads.map((item, index) => (
              <div
                key={item.id}
                onClick={() => handleViewDetails(item)}
                className="p-4 bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-400 shadow-2xs transition-all flex items-start gap-3 group cursor-pointer"
              >
                <div className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                  index === 0 ? 'bg-amber-500 text-white shadow-sm' : index === 1 ? 'bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-white' : 'bg-amber-100 dark:bg-slate-800 text-amber-800 dark:text-amber-400'
                }`}>
                  #{index + 1}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="font-bold text-amber-600 dark:text-amber-400">{item.class}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500">{item.subject}</span>
                  </div>
                  <h3 className="font-bold text-xs text-slate-900 dark:text-white truncate group-hover:text-amber-600 transition-colors">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                      <Download size={11} /> {item.downloadCount || 0} downloads
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. BROWSE ALL RESOURCES CATALOGUE */}
        <section ref={catalogRef} className="space-y-6 pt-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                Complete Resource Directory
              </span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Browse All Study Materials</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold">
                  {filteredMaterials.length} Items
                </span>
              </h2>
            </div>

            {/* Mobile Filter Toggle */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="md:hidden px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 shadow-xs"
              >
                <Filter size={14} />
                <span>Filters {showMobileFilters ? '(Close)' : ''}</span>
              </button>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2 text-xs font-semibold">
                <span className="text-slate-500 hidden sm:inline">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-amber-500 shadow-2xs"
                >
                  <option value="NEWEST">Newest First</option>
                  <option value="POPULAR">Most Downloaded</option>
                  <option value="TITLE">Alphabetical (A-Z)</option>
                </select>
              </div>
            </div>
          </div>

          {/* DESKTOP & MOBILE FILTER BARS */}
          <div className={`space-y-4 ${showMobileFilters ? 'block' : 'hidden md:block'}`}>
            {/* Category Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORIES_LIST.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                    selectedCategory === cat.id
                      ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-amber-400'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            {/* Class & Subject Filter Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">
                  Select Class
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:border-amber-500"
                >
                  {CLASSES_LIST.map(cls => (
                    <option key={cls} value={cls}>
                      {cls === 'ALL' ? 'All Classes' : cls}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">
                  Select Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:border-amber-500"
                >
                  {SUBJECTS_LIST.map(s => (
                    <option key={s} value={s}>
                      {s === 'ALL' ? 'All Subjects' : s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">
                  Access Level
                </label>
                <select
                  value={selectedAccess}
                  onChange={(e) => setSelectedAccess(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:border-amber-500"
                >
                  {ACCESS_LEVELS.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedClass('ALL');
                    setSelectedSubject('ALL');
                    setSelectedCategory('ALL');
                    setSelectedAccess('ALL');
                    setSortBy('NEWEST');
                  }}
                  className="w-full py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw size={13} /> Reset Filters
                </button>
              </div>
            </div>
          </div>

          {/* CATALOGUE GRID */}
          {loading ? (
            <div className="text-center py-20 space-y-3">
              <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-500">Loading learning library...</p>
            </div>
          ) : filteredMaterials.length === 0 ? (
            <div className="p-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-slate-800 text-amber-500 flex items-center justify-center text-3xl mx-auto">
                🔍
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-200">
                  No resources match your search criteria
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                  Try adjusting your search terms, changing the class/subject filter, or clearing selected filters.
                </p>
              </div>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedClass('ALL');
                  setSelectedSubject('ALL');
                  setSelectedCategory('ALL');
                  setSelectedAccess('ALL');
                }}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMaterials.map(item => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => handleViewDetails(item)}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-400 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group cursor-pointer"
                >
                  <div className="p-5 space-y-3">
                    {/* Top Badges */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                          {item.class}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300">
                          {item.subject}
                        </span>
                      </div>

                      {item.isPublic === false ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 flex items-center gap-1">
                          <Lock size={10} /> Student Only
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                          <Unlock size={10} /> Free
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
                      {item.title}
                    </h3>

                    {/* Chapter */}
                    {item.chapter && (
                      <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <Layers size={12} /> {item.chapter}
                      </div>
                    )}

                    {/* Description */}
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {item.description || item.desc}
                    </p>

                    {/* Tags */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {item.tags.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                      <span className="flex items-center gap-1" title="Views">
                        <Eye size={12} className="text-indigo-400" /> {item.viewCount || 0}
                      </span>
                      <span className="flex items-center gap-1" title="Downloads">
                        <Download size={12} className="text-emerald-400" /> {item.downloadCount || 0}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleViewDetails(item, e)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all cursor-pointer"
                      >
                        Details
                      </button>
                      <button
                        onClick={(e) => handleDownload(item, e)}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Download size={13} /> PDF
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

      </div>

      {/* 6. RESOURCE DETAILS MODAL */}
      <AnimatePresence>
        {selectedMaterial && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 text-white flex items-center justify-between shrink-0 border-b border-amber-500/20">
                <div className="flex items-center gap-2 min-w-0 pr-4">
                  <BookOpen size={20} className="text-amber-400 shrink-0" />
                  <h3 className="font-extrabold text-sm sm:text-base truncate">
                    {selectedMaterial.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedMaterial(null)}
                  className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-5">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="px-3 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-extrabold">
                    {selectedMaterial.class}
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 font-bold">
                    {selectedMaterial.subject}
                  </span>
                  {selectedMaterial.chapter && (
                    <span className="text-slate-500 font-semibold">| {selectedMaterial.chapter}</span>
                  )}
                  {selectedMaterial.isPublic === false ? (
                    <span className="ml-auto px-2.5 py-1 rounded-lg bg-rose-100 text-rose-700 font-extrabold text-[10px] flex items-center gap-1">
                      <Lock size={11} /> Enrolled Student Exclusive
                    </span>
                  ) : (
                    <span className="ml-auto px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-extrabold text-[10px] flex items-center gap-1">
                      <Unlock size={11} /> Free Public Download
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Description & Overview</span>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {selectedMaterial.description || selectedMaterial.desc}
                  </p>
                </div>

                {/* Video Lecture Embed/Link */}
                {selectedMaterial.youtubeUrl && (
                  <div className="p-4 bg-rose-50 dark:bg-rose-950/30 rounded-2xl border border-rose-200 dark:border-rose-800 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                        <Youtube size={18} /> Video Lecture Available
                      </span>
                      <p className="text-[11px] text-rose-600 dark:text-rose-400">Watch Priyanshu Sir's concept breakdown</p>
                    </div>
                    <a
                      href={selectedMaterial.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                    >
                      Watch Video
                    </a>
                  </div>
                )}

                {/* Metadata Card */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block font-semibold uppercase">Faculty / Author</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{selectedMaterial.createdBy || 'Priyanshu Sir'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block font-semibold uppercase">File Size</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{selectedMaterial.size || '1.2 MB'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block font-semibold uppercase">Downloads</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedMaterial.downloadCount || 0}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block font-semibold uppercase">Total Views</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{selectedMaterial.viewCount || 0}</span>
                  </div>
                </div>

                {/* Related Resources */}
                {relatedResources.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Related Resources in {selectedMaterial.class}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {relatedResources.map(rel => (
                        <div
                          key={rel.id}
                          onClick={() => handleViewDetails(rel)}
                          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-400 bg-white dark:bg-slate-900 transition-all cursor-pointer flex items-center justify-between"
                        >
                          <div className="min-w-0 pr-2">
                            <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">{rel.title}</h4>
                            <span className="text-[10px] text-slate-400">{rel.subject}</span>
                          </div>
                          <ChevronRight size={14} className="text-slate-400 shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer CTA */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
                <button
                  onClick={() => setSelectedMaterial(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                >
                  Close Preview
                </button>
                <button
                  onClick={(e) => handleDownload(selectedMaterial, e)}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Download size={15} /> Download Full PDF Document
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. RESTRICTED ACCESS MODAL */}
      <AnimatePresence>
        {restrictedModalMaterial && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 text-center relative overflow-hidden"
            >
              <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center text-2xl mx-auto shadow-inner">
                🔒
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400 block">
                  Enrolled Student Exclusive
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Restricted Access Resource
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  "<span className="font-semibold text-slate-800 dark:text-slate-200">{restrictedModalMaterial.title}</span>" is reserved for enrolled students of Sunshine Classes.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-left text-xs space-y-1">
                <div className="font-bold text-slate-700 dark:text-slate-300">How to access?</div>
                <p className="text-slate-500 text-[11px] leading-snug">
                  Sign in with your student roll number and password. If you are not enrolled yet, submit an admission request to get your credentials.
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <button
                  onClick={() => {
                    setRestrictedModalMaterial(null);
                    if (onOpenLoginModal) onOpenLoginModal();
                    else navigate('/student/login');
                  }}
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogIn size={15} /> Log In with Student Account
                </button>

                <button
                  onClick={() => setRestrictedModalMaterial(null)}
                  className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Back to Public Materials
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default PublicStudyMaterialPage;
