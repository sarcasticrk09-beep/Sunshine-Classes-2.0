import React, { useState, useEffect, useMemo, useRef } from 'react';
import { StudyMaterial, StudyMaterialType, User } from '../types';
import { 
  getPublicStudyMaterials, 
  getStudyMaterials, 
  incrementDownloadCount, 
  incrementViewCount 
} from '../services/studyMaterialService';
import { SEED_STUDY_MATERIALS } from '../data';
import { SyncService } from '../services/SyncService';
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
import { useNavigate, useLocation } from 'react-router-dom';
import { SEOHead } from '../components/SEOHead';

const getRouteMeta = (pathname: string) => {
  const p = pathname.toLowerCase();
  if (p.includes('/chapter-notes') || p.includes('/notes')) {
    return {
      title: 'NCERT Chapter Notes & Summaries',
      subtitle: 'In-depth, chapter-by-chapter revision guides and key concept breakdowns for Math, Science & Grammar.',
      breadcrumbLabel: 'Chapter Notes',
      categoryPreset: 'NOTES',
      seoTitle: 'NCERT Chapter Notes & Summaries | Sunshine Classes Pihani',
      seoDesc: 'Download NCERT chapter notes and concise revision summaries prepared by expert faculty at Sunshine Classes.'
    };
  }
  if (p.includes('/pyqs') || p.includes('/board-papers') || p.includes('/previous-year')) {
    return {
      title: 'Previous Year Papers (PYQs) & Board Archives',
      subtitle: '10-year solved CBSE & UP Board question papers with marking schemes and step-by-step solutions.',
      breadcrumbLabel: 'PYQs & Board Papers',
      categoryPreset: 'PYQ',
      seoTitle: 'Board Exam PYQs & Solved Question Papers | Sunshine Classes Pihani',
      seoDesc: '10-year solved CBSE & UP Board examination papers for Class 9 and 10 students.'
    };
  }
  if (p.includes('/formula-sheets') || p.includes('/formula')) {
    return {
      title: 'Formula Cheat-Sheets & Math Quick Tricks',
      subtitle: 'Instant revision formula sheets for Mathematics, Physics equations, Chemistry reactions, and shortcuts.',
      breadcrumbLabel: 'Formula Sheets',
      categoryPreset: 'FORMULA_SHEET',
      seoTitle: 'Math & Physics Formula Sheets | Sunshine Classes Pihani',
      seoDesc: 'Download printable Math and Physics formula cheat sheets for Class 9 and 10 revision.'
    };
  }
  if (p.includes('/worksheets') || p.includes('/homework')) {
    return {
      title: 'Practice Worksheets & Problem Sets',
      subtitle: 'Topic-wise practice problem sets and classroom worksheets mapped to NCERT exercises.',
      breadcrumbLabel: 'Worksheets',
      categoryPreset: 'WORKSHEET',
      seoTitle: 'Classroom & Homework Practice Worksheets | Sunshine Classes Pihani',
      seoDesc: 'Structured Math and Science practice worksheets and problem sets for Class 6 to 10.'
    };
  }
  if (p.includes('/practice-papers') || p.includes('/sample-papers') || p.includes('/mock-tests')) {
    return {
      title: 'Mock Practice Papers & Model Exam Kits',
      subtitle: 'Full-length model question papers and sample test packages formatted as per the latest exam pattern.',
      breadcrumbLabel: 'Practice Papers',
      categoryPreset: 'SAMPLE_PAPER',
      seoTitle: 'Board Mock Practice Papers & Sample Exams | Sunshine Classes Pihani',
      seoDesc: 'Practice full-length mock exams and sample question papers for Class 10 board preparation.'
    };
  }
  if (p.includes('/study-material')) {
    return {
      title: 'Comprehensive Study Material Library',
      subtitle: 'Printed notes, complete course kits, and downloadable PDF modules across all tuition subjects.',
      breadcrumbLabel: 'Study Material',
      categoryPreset: 'ALL',
      seoTitle: 'Comprehensive Study Material Library | Sunshine Classes Pihani',
      seoDesc: 'Access complete PDF study materials and course packages for Sunshine Classes students.'
    };
  }
  if (p.includes('/syllabus') || p.includes('/blueprint')) {
    return {
      title: 'Board Exam Syllabus & Official Blueprints',
      subtitle: 'Complete syllabus breakdown, chapter weightage, and marking patterns for Classes 6 to 10.',
      breadcrumbLabel: 'Syllabus & Blueprint',
      categoryPreset: 'SYLLABUS',
      seoTitle: 'Board Exam Syllabus & Marking Scheme Blueprints | Sunshine Classes Pihani',
      seoDesc: 'Download syllabus, chapter weightage, and exam blueprints for Sunshine Classes students.'
    };
  }
  if (p.includes('/question-bank') || p.includes('/question-papers')) {
    return {
      title: 'Chapter-Wise Question Banks & Practice Sets',
      subtitle: 'Comprehensive question banks, 1-mark MCQs, case study questions, and long answer sets.',
      breadcrumbLabel: 'Question Banks',
      categoryPreset: 'QUESTION_BANK',
      seoTitle: 'Class 9 & 10 Question Banks | Sunshine Classes Pihani',
      seoDesc: 'Chapter-wise question banks with solved problems for Class 9 and 10 board prep.'
    };
  }
  return {
    title: 'Study Material & Learning Resource Portal',
    subtitle: 'Discover, preview, and download chapter revision notes, formula cheat-sheets, worksheets, NCERT solutions, and 10-year board paper archives.',
    breadcrumbLabel: 'All Resources',
    categoryPreset: 'ALL',
    seoTitle: 'Study Resources & Download Center | Sunshine Classes Pihani',
    seoDesc: 'Download NCERT study notes, PYQs, formula sheets, and worksheets from Sunshine Classes.'
  };
};

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
  { id: 'QUESTION_BANK', label: 'Question Bank', icon: '🗂️' },
  { id: 'SYLLABUS', label: 'Syllabus & Blueprint', icon: '📑' },
  { id: 'PDF', label: 'PDF Documents', icon: '📄' },
  { id: 'NOTES', label: 'Revision Notes', icon: '📘' },
  { id: 'FORMULA_SHEET', label: 'Formula Sheets', icon: '🧮' },
  { id: 'PYQ', label: 'Previous Year Papers (PYQs)', icon: '📜' },
  { id: 'WORKSHEET', label: 'Worksheets & Practice', icon: '📋' },
  { id: 'SAMPLE_PAPER', label: 'Sample Papers', icon: '🎯' },
  { id: 'NCERT_SOLUTION', label: 'NCERT Solutions', icon: '📖' },
  { id: 'VIDEO_LINK', label: 'Video Lectures', icon: '🎥' }
];

export const getCategoryBadgeInfo = (type?: string) => {
  switch ((type || '').toUpperCase()) {
    case 'QUESTION_BANK':
      return { label: 'Question Bank', color: 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200/60 dark:border-purple-800/60' };
    case 'SYLLABUS':
      return { label: 'Syllabus', color: 'bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border-violet-200/60 dark:border-violet-800/60' };
    case 'PDF':
      return { label: 'PDF Document', color: 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/60' };
    case 'NOTES':
      return { label: 'Revision Notes', color: 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200/60 dark:border-blue-800/60' };
    case 'FORMULA_SHEET':
      return { label: 'Formula Sheet', color: 'bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200/60 dark:border-teal-800/60' };
    case 'PYQ':
      return { label: 'PYQ Paper', color: 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-800/60' };
    case 'SAMPLE_PAPER':
      return { label: 'Sample Paper', color: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/60' };
    case 'WORKSHEET':
      return { label: 'Worksheet', color: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/60' };
    case 'NCERT_SOLUTION':
      return { label: 'NCERT Solution', color: 'bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border-orange-200/60 dark:border-orange-800/60' };
    case 'VIDEO_LINK':
      return { label: 'Video Lecture', color: 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200/60 dark:border-red-800/60' };
    default:
      return { label: 'Study Resource', color: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700' };
  }
};

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
  const location = useLocation();
  const catalogRef = useRef<HTMLDivElement>(null);

  const routeMeta = useMemo(() => getRouteMeta(location.pathname), [location.pathname]);

  const [materials, setMaterials] = useState<StudyMaterial[]>(cmsMaterials || []);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState(routeMeta.categoryPreset);
  const [selectedAccess, setSelectedAccess] = useState('ALL');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'POPULAR' | 'TITLE'>('NEWEST');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Sync category when path changes
  useEffect(() => {
    setSelectedCategory(routeMeta.categoryPreset);
  }, [routeMeta.categoryPreset]);

  // Modal States
  const [selectedMaterial, setSelectedMaterial] = useState<StudyMaterial | null>(null);
  const [restrictedModalMaterial, setRestrictedModalMaterial] = useState<StudyMaterial | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load study materials on mount or update when cmsMaterials changes
  useEffect(() => {
    if (cmsMaterials && Array.isArray(cmsMaterials)) {
      setMaterials(cmsMaterials);
      setLoading(false);
    } else {
      loadMaterials();
    }

    const unsubscribe = SyncService.subscribe('study_materials', () => {
      loadMaterials();
    });

    return () => {
      unsubscribe();
    };
  }, [cmsMaterials, currentUser]);

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
      
      const hasDummy = Array.isArray(data) && data.some(m => m.fileUrl?.includes('dummy.pdf'));
      const activeData = (Array.isArray(data) && data.length > 0 && !hasDummy) ? data : SEED_STUDY_MATERIALS;
      setMaterials(activeData.filter(m => m.status === 'PUBLISHED' || !m.status));
    } catch (err) {
      console.warn('Study materials fetch notice:', err);
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

  // Featured Resources (Curated top study materials)
  const popularDownloads = useMemo(() => {
    return [...materials]
      .sort((a, b) => new Date(b.createdAt || b.date || 0).getTime() - new Date(a.createdAt || a.date || 0).getTime())
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
        const itemType = (item.materialType || '').toUpperCase();
        const legacyCat = (item.category || '').toUpperCase();
        if (selectedCategory === 'PDF') {
          const isPdf = itemType === 'PDF' || (item.file || item.fileUrl || '').toLowerCase().endsWith('.pdf');
          if (!isPdf) return false;
        } else if (itemType !== selectedCategory && legacyCat !== selectedCategory) {
          const matchesTag = (item.tags || []).some(t => t.toUpperCase().replace(/\s+/g, '_') === selectedCategory);
          if (!matchesTag) return false;
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

Official Website: https://sunshineclasses.net
Contact: +91 8707738284 | Pihani, Hardoi (U.P.)`;

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
      <SEOHead title={routeMeta.seoTitle} description={routeMeta.seoDesc} />
      
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

      {/* TOP CONTROL HEADER & INSTANT SEARCH */}
      <header className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white py-6 px-4 border-b border-amber-500/20">
        <div className="max-w-5xl mx-auto space-y-4">
          
          {/* Navigation Bar */}
          <div className="flex items-center justify-between gap-3 text-xs">
            <button
              id="btn-back-home"
              onClick={() => {
                if (onNavigateSection) onNavigateSection('home');
                else navigate('/');
              }}
              className="hover:text-amber-400 flex items-center gap-1 text-slate-300 font-medium transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} /> Home
            </button>
            <div className="flex items-center gap-2">
              {currentUser ? (
                <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                  <Unlock size={12} /> Student Logged In
                </span>
              ) : (
                <button
                  id="btn-public-student-login"
                  onClick={() => {
                    if (onOpenLoginModal) onOpenLoginModal();
                    else navigate('/student/login');
                  }}
                  className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                >
                  <LogIn size={12} /> Student Login
                </button>
              )}
            </div>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Study Notes & Learning Resources
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Direct, 1-click access to downloadable NCERT chapter guides, formula sheets, PYQs, and worksheets.
            </p>
          </div>

          {/* Search Field & Filter Controls */}
          <div className="space-y-3 pt-1">
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="input-public-resource-search"
                type="text"
                placeholder="Filter by filename, subject, or chapter keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-400 text-xs font-medium focus:outline-none focus:border-amber-400 transition-all"
              />
              {searchQuery && (
                <button
                  id="btn-clear-public-search"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Class & Subject Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 shrink-0">Class:</span>
              {CLASSES_LIST.map(cls => (
                <button
                  key={cls}
                  id={`btn-filter-class-${cls.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setSelectedClass(cls)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedClass === cls
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {cls === 'ALL' ? 'All Classes' : cls}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 shrink-0">Subject:</span>
              {SUBJECTS_LIST.map(s => (
                <button
                  key={s}
                  id={`btn-filter-subject-${s.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setSelectedSubject(s)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedSubject === s
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {s === 'ALL' ? 'All Subjects' : s}
                </button>
              ))}
            </div>

            {/* Category Filter Pills (Question Bank, Syllabus, PDF Document, etc.) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 shrink-0">Category:</span>
              {CATEGORIES_LIST.map(cat => (
                <button
                  key={cat.id}
                  id={`btn-filter-category-${cat.id.toLowerCase().replace(/_/g, '-')}`}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                    selectedCategory === cat.id
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </header>

      {/* MAIN HIGH-DENSITY RESOURCE LIST */}
      <div className="max-w-5xl mx-auto px-4 mt-6">
        {loading ? (
          <div className="text-center py-16 space-y-2">
            <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-500">Loading resources...</p>
          </div>
        ) : filteredMaterials.length === 0 ? (
          <div className="p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <BookOpen className="mx-auto text-slate-400" size={32} />
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
              No study materials matching your filter
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try searching with another keyword or resetting class, subject, and category filters.
            </p>
            <button
              id="btn-reset-public-filters"
              onClick={() => {
                setSearchQuery('');
                setSelectedClass('ALL');
                setSelectedSubject('ALL');
                setSelectedCategory('ALL');
                setSelectedAccess('ALL');
              }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
            {filteredMaterials.map((item, idx) => {
              const catBadge = getCategoryBadgeInfo(item.materialType || item.category);
              return (
                <div
                  key={item.id || idx}
                  className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                >
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <div className="pt-0.5 shrink-0">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60">
                        {item.subject}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                          {item.title}
                        </h3>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${catBadge.color}`}>
                          {catBadge.label}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {item.class}
                        </span>
                        {item.isPublic === false ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 flex items-center gap-0.5 shrink-0">
                            <Lock size={9} /> Student Exclusive
                          </span>
                        ) : null}
                      </div>
                    {(item.description || item.desc) && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 leading-normal">
                        {item.description || item.desc}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                  <button
                    id={`btn-details-catalog-${item.id || idx}`}
                    onClick={(e) => handleViewDetails(item, e)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all cursor-pointer"
                  >
                    Details
                  </button>
                  <button
                    id={`btn-dl-catalog-${item.id || idx}`}
                    onClick={(e) => handleDownload(item, e)}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download size={13} />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        )}
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
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block font-semibold uppercase">Faculty / Author</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{selectedMaterial.createdBy || 'Priyanshu Sir'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block font-semibold uppercase">File Format</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{selectedMaterial.materialType || 'PDF Document'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block font-semibold uppercase">File Size</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{selectedMaterial.size || '1.2 MB'}</span>
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
