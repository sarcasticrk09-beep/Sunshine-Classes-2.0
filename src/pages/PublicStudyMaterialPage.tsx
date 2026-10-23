import React, { useState, useEffect, useMemo } from 'react';
import { StudyMaterial, User } from '../types';
import { 
  getPublicStudyMaterials, 
  getStudyMaterials, 
  incrementDownloadCount 
} from '../services/studyMaterialService';
import { SEED_STUDY_MATERIALS } from '../data';
import { SyncService } from '../services/SyncService';
import { 
  BookOpen, 
  Search, 
  Download, 
  FileText, 
  CheckCircle2, 
  ArrowLeft,
  X,
  Lock,
  Unlock,
  LogIn,
  ShieldAlert,
  Eye,
  ExternalLink
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
      categoryPreset: 'NOTES',
      seoTitle: 'NCERT Chapter Notes & Summaries | Sunshine Classes Pihani',
      seoDesc: 'Download NCERT chapter notes and concise revision summaries prepared by expert faculty at Sunshine Classes.'
    };
  }
  if (p.includes('/pyqs') || p.includes('/board-papers') || p.includes('/previous-year')) {
    return {
      title: 'Previous Year Papers (PYQs) & Board Archives',
      subtitle: '10-year solved CBSE & UP Board question papers with marking schemes and step-by-step solutions.',
      categoryPreset: 'PYQ',
      seoTitle: 'Board Exam PYQs & Solved Question Papers | Sunshine Classes Pihani',
      seoDesc: '10-year solved CBSE & UP Board examination papers for Class 9 and 10 students.'
    };
  }
  if (p.includes('/formula-sheets') || p.includes('/formula')) {
    return {
      title: 'Formula Cheat-Sheets & Math Quick Tricks',
      subtitle: 'Instant revision formula sheets for Mathematics, Physics equations, Chemistry reactions, and shortcuts.',
      categoryPreset: 'FORMULA_SHEET',
      seoTitle: 'Math & Physics Formula Sheets | Sunshine Classes Pihani',
      seoDesc: 'Download printable Math and Physics formula cheat sheets for Class 9 and 10 revision.'
    };
  }
  if (p.includes('/worksheets') || p.includes('/homework')) {
    return {
      title: 'Practice Worksheets & Problem Sets',
      subtitle: 'Topic-wise practice problem sets and classroom worksheets mapped to NCERT exercises.',
      categoryPreset: 'WORKSHEET',
      seoTitle: 'Classroom & Homework Practice Worksheets | Sunshine Classes Pihani',
      seoDesc: 'Structured Math and Science practice worksheets and problem sets for Class 6 to 10.'
    };
  }
  if (p.includes('/practice-papers') || p.includes('/sample-papers') || p.includes('/mock-tests')) {
    return {
      title: 'Mock Practice Papers & Model Exam Kits',
      subtitle: 'Full-length model question papers and sample test packages formatted as per the latest exam pattern.',
      categoryPreset: 'SAMPLE_PAPER',
      seoTitle: 'Board Mock Practice Papers & Sample Exams | Sunshine Classes Pihani',
      seoDesc: 'Practice full-length mock exams and sample question papers for Class 10 board preparation.'
    };
  }
  if (p.includes('/study-material')) {
    return {
      title: 'Comprehensive Study Material Library',
      subtitle: 'Printed notes, complete course kits, and downloadable PDF modules across all tuition subjects.',
      categoryPreset: 'ALL',
      seoTitle: 'Comprehensive Study Material Library | Sunshine Classes Pihani',
      seoDesc: 'Access complete PDF study materials and course packages for Sunshine Classes students.'
    };
  }
  if (p.includes('/syllabus') || p.includes('/blueprint')) {
    return {
      title: 'Board Exam Syllabus & Official Blueprints',
      subtitle: 'Complete syllabus breakdown, chapter weightage, and marking patterns for Classes 6 to 10.',
      categoryPreset: 'SYLLABUS',
      seoTitle: 'Board Exam Syllabus & Marking Scheme Blueprints | Sunshine Classes Pihani',
      seoDesc: 'Download syllabus, chapter weightage, and exam blueprints for Sunshine Classes students.'
    };
  }
  if (p.includes('/question-bank') || p.includes('/question-papers')) {
    return {
      title: 'Chapter-Wise Question Banks & Practice Sets',
      subtitle: 'Comprehensive question banks, 1-mark MCQs, case study questions, and long answer sets.',
      categoryPreset: 'QUESTION_BANK',
      seoTitle: 'Class 9 & 10 Question Banks | Sunshine Classes Pihani',
      seoDesc: 'Chapter-wise question banks with solved problems for Class 9 and 10 board prep.'
    };
  }
  return {
    title: 'Study Resources',
    subtitle: 'Find notes, chapter PDFs, worksheets and previous-year papers.',
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

const RESOURCE_TYPES = [
  { id: 'ALL', label: 'All Resources' },
  { id: 'QUESTION_BANK', label: 'Question Bank' },
  { id: 'SYLLABUS', label: 'Syllabus & Blueprint' },
  { id: 'PDF', label: 'PDF Documents' },
  { id: 'NOTES', label: 'Revision Notes' },
  { id: 'FORMULA_SHEET', label: 'Formula Sheets' },
  { id: 'PYQ', label: 'Previous Year Papers' },
  { id: 'WORKSHEET', label: 'Worksheets' },
  { id: 'SAMPLE_PAPER', label: 'Sample Papers' },
  { id: 'NCERT_SOLUTION', label: 'NCERT Solutions' }
];

const getResourceTypeLabel = (type?: string, category?: string) => {
  const t = (type || category || '').toUpperCase();
  switch (t) {
    case 'QUESTION_BANK':
      return 'Question Bank';
    case 'SYLLABUS':
      return 'Syllabus & Blueprint';
    case 'PDF':
      return 'PDF Document';
    case 'NOTES':
      return 'Revision Notes';
    case 'FORMULA_SHEET':
      return 'Formula Sheet';
    case 'PYQ':
      return 'Previous Year Paper';
    case 'WORKSHEET':
      return 'Worksheet';
    case 'SAMPLE_PAPER':
      return 'Sample Paper';
    case 'NCERT_SOLUTION':
      return 'NCERT Solution';
    case 'VIDEO_LINK':
      return 'Video Lecture';
    default:
      return 'Study Resource';
  }
};

const formatResourceDate = (dateStr?: string) => {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch {
    return null;
  }
};

export const PublicStudyMaterialPage: React.FC<PublicStudyMaterialPageProps> = ({
  currentUser,
  onNavigateSection,
  cmsMaterials,
  onOpenLoginModal
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const routeMeta = useMemo(() => getRouteMeta(location.pathname), [location.pathname]);

  const [materials, setMaterials] = useState<StudyMaterial[]>(cmsMaterials || []);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState(routeMeta.categoryPreset);

  // Sync category when path changes
  useEffect(() => {
    setSelectedCategory(routeMeta.categoryPreset);
  }, [routeMeta.categoryPreset]);

  // Modal States
  const [previewMaterial, setPreviewMaterial] = useState<StudyMaterial | null>(null);
  const [restrictedModalMaterial, setRestrictedModalMaterial] = useState<StudyMaterial | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Close modals on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (previewMaterial) setPreviewMaterial(null);
        if (restrictedModalMaterial) setRestrictedModalMaterial(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewMaterial, restrictedModalMaterial]);

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
    setHasError(false);
    try {
      let data: StudyMaterial[] = [];
      if (currentUser) {
        data = await getStudyMaterials();
      } else {
        data = await getPublicStudyMaterials();
      }
      
      const hasDummy = Array.isArray(data) && data.some(m => m.fileUrl?.includes('dummy.pdf'));
      const existingIds = new Set((data || []).map(m => m.id || m.materialId));
      const combined = hasDummy ? [...SEED_STUDY_MATERIALS] : [...(data || [])];
      if (!hasDummy) {
        SEED_STUDY_MATERIALS.forEach(seedItem => {
          if (!existingIds.has(seedItem.id) && !existingIds.has(seedItem.materialId)) {
            combined.push(seedItem);
          }
        });
      }
      const activeData = combined.length > 0 ? combined : SEED_STUDY_MATERIALS;
      setMaterials(activeData.filter(m => m.status === 'PUBLISHED' || !m.status));
    } catch (err) {
      console.warn('Study materials fetch notice:', err);
      if (!materials || materials.length === 0) {
        setHasError(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Dynamically derive available subjects from actual materials
  const availableSubjects = useMemo(() => {
    const subs = new Set<string>();
    materials.forEach(m => {
      if (m.subject) subs.add(m.subject);
    });
    const priority = ['Mathematics', 'Science', 'Physics', 'Chemistry', 'Biology', 'English', 'Social Studies', 'Hindi'];
    const ordered: string[] = [];
    priority.forEach(s => {
      if (subs.has(s)) {
        ordered.push(s);
        subs.delete(s);
      }
    });
    subs.forEach(s => ordered.push(s));
    return ordered;
  }, [materials]);

  // Dynamically derive available classes from actual materials
  const availableClasses = useMemo(() => {
    const classes = new Set<string>();
    materials.forEach(m => {
      if (m.class) classes.add(m.class);
    });
    const standard = ['Class 10', 'Class 9', 'Class 8', 'Class 7', 'Class 6', 'Class 5', 'Board Specials'];
    const ordered = ['ALL'];
    standard.forEach(c => {
      if (classes.has(c)) ordered.push(c);
    });
    classes.forEach(c => {
      if (!ordered.includes(c)) ordered.push(c);
    });
    return ordered;
  }, [materials]);

  // Compute resource count per subject for sidebar
  const subjectCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: materials.length };
    materials.forEach(m => {
      if (m.subject) {
        counts[m.subject] = (counts[m.subject] || 0) + 1;
      }
    });
    return counts;
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
      // Chapter numerical order if available, else date
      const getCh = (item: StudyMaterial): number => {
        if (item.chapter) {
          const p = parseInt(item.chapter.replace(/\D/g, ''), 10);
          if (!isNaN(p)) return p;
        }
        const m = (item.title || '').match(/Chapter\s*(\d+)/i);
        if (m) return parseInt(m[1], 10);
        return 999;
      };
      const chA = getCh(a);
      const chB = getCh(b);
      if (chA !== chB) return chA - chB;
      return new Date(b.createdAt || b.date || 0).getTime() - new Date(a.createdAt || a.date || 0).getTime();
    });
  }, [materials, selectedClass, selectedSubject, selectedCategory, searchQuery]);

  const hasActiveFilters = searchQuery.trim() !== '' || selectedClass !== 'ALL' || selectedSubject !== 'ALL' || selectedCategory !== 'ALL';

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedClass('ALL');
    setSelectedSubject('ALL');
    setSelectedCategory('ALL');
  };

  // Check access permission for restricted materials
  const hasAccessToMaterial = (material: StudyMaterial): boolean => {
    if (material.isPublic !== false) return true;
    if (currentUser) return true;
    return false;
  };

  // Extract browser-compatible preview URL
  const getPreviewUrl = (material?: StudyMaterial | null): string | null => {
    if (!material) return null;
    if (material.fileUrl && material.fileUrl.startsWith('http')) {
      return material.fileUrl;
    }
    if (material.externalUrl && material.externalUrl.startsWith('http')) {
      return material.externalUrl;
    }
    if (material.fileData && (material.fileData.startsWith('http') || material.fileData.startsWith('data:application/pdf'))) {
      return material.fileData;
    }
    return null;
  };

  // Handle Preview Request
  const handlePreview = (item: StudyMaterial, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    // Check Access Guard
    if (!hasAccessToMaterial(item)) {
      setRestrictedModalMaterial(item);
      return;
    }

    setPreviewMaterial(item);
  };

  // Handle Download Request
  const handleDownload = async (item: StudyMaterial, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    // Check Access Guard
    if (!hasAccessToMaterial(item)) {
      setRestrictedModalMaterial(item);
      return;
    }

    setDownloadingId(item.id);

    try {
      await incrementDownloadCount(item.id);
      setMaterials(prev => prev.map(m => m.id === item.id ? { ...m, downloadCount: (m.downloadCount || 0) + 1 } : m));
    } catch (err) {
      console.warn('Metrics recording notice:', err);
    }

    try {
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
        // Fallback Blob download for reference
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
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast(`Downloaded NCERT Reference Guide for "${item.title}"`);
      }
    } finally {
      setTimeout(() => setDownloadingId(null), 800);
    }
  };

  return (
    <div id="study-material-portal-page" className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans pb-24">
      <SEOHead title={routeMeta.seoTitle} description={routeMeta.seoDesc} />
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold border border-slate-700 dark:border-amber-400"
          >
            <CheckCircle2 size={16} className="text-emerald-400 dark:text-slate-950" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clean Educational Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
          {/* Top Bar Navigation */}
          <div className="flex items-center justify-between gap-4 text-xs">
            <button
              id="btn-back-home"
              onClick={() => {
                if (onNavigateSection) onNavigateSection('home');
                else navigate('/');
              }}
              className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 font-medium transition-colors cursor-pointer"
            >
              <ArrowLeft size={15} /> Home
            </button>
            <div>
              {currentUser ? (
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Unlock size={13} /> Student Logged In
                </span>
              ) : (
                <button
                  id="btn-public-student-login"
                  onClick={() => {
                    if (onOpenLoginModal) onOpenLoginModal();
                    else navigate('/student/login');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <LogIn size={13} /> Student Login
                </button>
              )}
            </div>
          </div>

          {/* Heading & Subtitle */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Study Resources
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              Find notes, chapter PDFs, worksheets and previous-year papers.
            </p>
          </div>

          {/* Prominent Search Bar */}
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="input-public-resource-search"
              type="text"
              placeholder="Search by subject, chapter, filename or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-xs font-medium focus:outline-none focus:border-amber-500 transition-colors"
            />
            {searchQuery && (
              <button
                id="btn-clear-public-search"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Three Compact Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {/* Class Filter */}
            <div>
              <label htmlFor="select-filter-class" className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                Class
              </label>
              <select
                id="select-filter-class"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full py-2 px-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
              >
                {availableClasses.map(cls => (
                  <option key={cls} value={cls}>
                    {cls === 'ALL' ? 'All Classes' : cls}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject Filter */}
            <div>
              <label htmlFor="select-filter-subject" className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                Subject
              </label>
              <select
                id="select-filter-subject"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full py-2 px-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
              >
                <option value="ALL">All Subjects</option>
                {availableSubjects.map(sub => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            {/* Resource Type Filter */}
            <div>
              <label htmlFor="select-filter-category" className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                Resource Type
              </label>
              <select
                id="select-filter-category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full py-2 px-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
              >
                {RESOURCE_TYPES.map(rt => (
                  <option key={rt.id} value={rt.id}>
                    {rt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filter Indicator & Clear Action */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between pt-2 text-xs border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 flex-wrap text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-slate-500 dark:text-slate-400">Active filters:</span>
                {selectedClass !== 'ALL' && (
                  <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-semibold border border-amber-200 dark:border-amber-900/40">
                    {selectedClass}
                  </span>
                )}
                {selectedSubject !== 'ALL' && (
                  <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-semibold border border-amber-200 dark:border-amber-900/40">
                    {selectedSubject}
                  </span>
                )}
                {selectedCategory !== 'ALL' && (
                  <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-semibold border border-amber-200 dark:border-amber-900/40">
                    {RESOURCE_TYPES.find(r => r.id === selectedCategory)?.label || selectedCategory}
                  </span>
                )}
                {searchQuery && (
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    "{searchQuery}"
                  </span>
                )}
              </div>
              <button
                id="btn-clear-all-filters"
                onClick={handleClearFilters}
                className="text-amber-600 dark:text-amber-400 hover:text-amber-700 font-semibold cursor-pointer shrink-0 ml-3"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Two-Column Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Sidebar — Browse Subjects (Desktop Only) */}
          <aside className="hidden lg:block lg:col-span-3 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sticky top-6">
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-3 mb-2">
                Browse Subjects
              </h2>
              <nav className="space-y-1">
                <button
                  id="btn-sidebar-subject-all"
                  onClick={() => setSelectedSubject('ALL')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    selectedSubject === 'ALL'
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold border-l-2 border-amber-500'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>All Subjects</span>
                  <span className="text-[11px] font-normal text-slate-400 dark:text-slate-500">
                    {subjectCounts.ALL || 0}
                  </span>
                </button>

                {availableSubjects.map((sub) => {
                  const count = subjectCounts[sub] || 0;
                  const isActive = selectedSubject === sub;
                  return (
                    <button
                      key={sub}
                      id={`btn-sidebar-subject-${sub.toLowerCase().replace(/\s+/g, '-')}`}
                      onClick={() => setSelectedSubject(sub)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold border-l-2 border-amber-500'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <span className="truncate">{sub}</span>
                      <span className="text-[11px] font-normal text-slate-400 dark:text-slate-500">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Right Panel — Resource List */}
          <main className="lg:col-span-9 space-y-4">
            {/* Panel Heading & Result Count */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {selectedSubject === 'ALL' ? 'All Resources' : `${selectedSubject} Resources`}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {filteredMaterials.length} {filteredMaterials.length === 1 ? 'resource' : 'resources'} available
                </p>
              </div>
            </div>

            {/* Content States */}
            {loading ? (
              /* Loading Skeletons */
              <div className="space-y-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg sm:rounded-xl p-3 sm:px-4 sm:py-3 animate-pulse flex items-center justify-between gap-4"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="w-20 h-2.5 bg-slate-200 dark:bg-slate-800 rounded" />
                      <div className="w-2/3 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
                      <div className="w-1/3 h-2.5 bg-slate-200 dark:bg-slate-800 rounded" />
                    </div>
                    <div className="hidden sm:flex items-center gap-2">
                      <div className="w-20 h-7 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                      <div className="w-28 h-7 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>
            ) : hasError ? (
              /* Error State */
              <div className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 rounded-xl p-10 text-center space-y-3">
                <ShieldAlert className="mx-auto text-rose-500" size={36} />
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  Unable to load resources
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Unable to load resources. Please try again.
                </p>
                <button
                  id="btn-retry-load-resources"
                  onClick={loadMaterials}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Retry
                </button>
              </div>
            ) : filteredMaterials.length === 0 ? (
              /* Empty State */
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-10 text-center space-y-3">
                <BookOpen className="mx-auto text-slate-400" size={36} />
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  No resources found
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  No resources found. Try changing your search or filters.
                </p>
                <button
                  id="btn-empty-reset-filters"
                  onClick={handleClearFilters}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              /* Clean Compact Resource Rows */
              <div className="space-y-2">
                {filteredMaterials.map((item, idx) => {
                  const chapterInfo = item.chapter || (item.title.match(/Chapter\s*\d+[^:—\-]*/i)?.[0]);
                  const titleHasChapter = chapterInfo && item.title.toLowerCase().includes(chapterInfo.toLowerCase());
                  const resourceTypeLabel = getResourceTypeLabel(item.materialType, item.category);
                  const formattedDate = formatResourceDate(item.createdAt || item.date);

                    return (
                    <article
                      key={item.id || idx}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg sm:rounded-xl p-3 sm:px-4 sm:py-3 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4"
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        {/* Compact file icon on tablet/desktop */}
                        <div className="hidden sm:flex mt-0.5 p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 shrink-0 border border-amber-200/50 dark:border-amber-900/40">
                          <FileText size={16} />
                        </div>

                        <div className="min-w-0 flex-1 space-y-1">
                          {/* Top row: Subject label & student badge */}
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                              {item.subject}
                            </span>
                            {item.isPublic === false && (
                              <span className="text-[9px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.2 rounded border border-rose-200/50 dark:border-rose-900/40 flex items-center gap-0.5">
                                <Lock size={9} /> Student Only
                              </span>
                            )}
                          </div>

                          {/* Title - concise, readable, semibold */}
                          <h3 className="text-[13px] sm:text-sm font-semibold text-slate-900 dark:text-white leading-snug line-clamp-2 sm:line-clamp-1">
                            {item.title}
                          </h3>

                          {/* Non-essential description: hidden on small mobile screens, visible on tablet/desktop */}
                          {(item.description || item.desc) && (
                            <p className="hidden sm:block text-xs text-slate-600 dark:text-slate-400 line-clamp-1 sm:line-clamp-2 leading-relaxed pt-0.5">
                              {item.description || item.desc}
                            </p>
                          )}

                          {/* Stacked metadata fields on mobile, inline on desktop */}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {item.class && <span className="font-semibold text-slate-700 dark:text-slate-300">{item.class}</span>}
                              {chapterInfo && !titleHasChapter && (
                                <>
                                  <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
                                  <span>{chapterInfo}</span>
                                </>
                              )}
                              <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
                              <span className="font-medium text-slate-600 dark:text-slate-300">{resourceTypeLabel}</span>
                            </div>
                            {(item.size || formattedDate) && (
                              <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500">
                                {item.size && (
                                  <>
                                    <span className="hidden sm:inline" aria-hidden="true">·</span>
                                    <span>{item.size}</span>
                                  </>
                                )}
                                {formattedDate && (
                                  <>
                                    <span aria-hidden="true">·</span>
                                    <span>Updated {formattedDate}</span>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons: span full card width on mobile, inline auto on desktop */}
                      <div className="shrink-0 sm:self-center flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-1.5 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/80">
                        <button
                          id={`btn-preview-resource-${String(item.id || idx).toLowerCase().replace(/[^a-z0-9_-]/g, '-')}`}
                          onClick={(e) => handlePreview(item, e)}
                          className="w-full sm:w-auto px-3 py-2 sm:py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Eye size={13} className="shrink-0" />
                          <span>Preview</span>
                        </button>

                        <button
                          id={`btn-download-resource-${String(item.id || idx).toLowerCase().replace(/[^a-z0-9_-]/g, '-')}`}
                          onClick={(e) => handleDownload(item, e)}
                          disabled={downloadingId === item.id}
                          className="w-full sm:w-auto px-3.5 py-2 sm:py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-70 shrink-0"
                        >
                          <Download size={13} className="shrink-0" />
                          <span>{downloadingId === item.id ? 'Downloading...' : 'Download PDF ↓'}</span>
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Browser-based PDF Preview Modal */}
      <AnimatePresence>
        {previewMaterial && (
          <div
            id="modal-pdf-preview"
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-slate-950/80 backdrop-blur-xs"
            onClick={() => setPreviewMaterial(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="bg-white dark:bg-slate-900 w-full max-w-5xl h-[92vh] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3 shrink-0">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold">
                    <span className="text-amber-600 dark:text-amber-400 uppercase tracking-wider text-[11px] font-bold">
                      {previewMaterial.subject}
                    </span>
                    {previewMaterial.class && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{previewMaterial.class}</span>
                      </>
                    )}
                    {previewMaterial.chapter && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{previewMaterial.chapter}</span>
                      </>
                    )}
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                    {previewMaterial.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {getPreviewUrl(previewMaterial) && (
                    <a
                      id="btn-preview-modal-open-tab"
                      href={getPreviewUrl(previewMaterial)!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <ExternalLink size={13} />
                      <span>Open in New Tab</span>
                    </a>
                  )}

                  <button
                    id="btn-preview-modal-download"
                    onClick={(e) => handleDownload(previewMaterial, e)}
                    disabled={downloadingId === previewMaterial.id}
                    className="px-3 sm:px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-70"
                  >
                    <Download size={13} />
                    <span className="hidden sm:inline">Download PDF</span>
                    <span className="sm:hidden">Download</span>
                  </button>

                  <button
                    id="btn-preview-modal-close"
                    onClick={() => setPreviewMaterial(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    aria-label="Close Preview"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Modal Viewer Body */}
              <div className="flex-1 w-full bg-slate-100 dark:bg-slate-950 overflow-hidden relative flex flex-col">
                {getPreviewUrl(previewMaterial) ? (
                  <iframe
                    src={getPreviewUrl(previewMaterial)!}
                    title={previewMaterial.title}
                    className="w-full h-full border-0"
                  />
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
                    <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/50">
                      <FileText size={40} />
                    </div>
                    <div className="max-w-md space-y-1">
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">
                        {previewMaterial.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {previewMaterial.description || previewMaterial.desc || 'Direct PDF viewer is available via download.'}
                      </p>
                    </div>
                    <button
                      id="btn-preview-modal-download-fallback"
                      onClick={(e) => handleDownload(previewMaterial, e)}
                      className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
                    >
                      <Download size={14} />
                      <span>Download Resource</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Restricted Access Modal for Unauthenticated Visitors */}
      <AnimatePresence>
        {restrictedModalMaterial && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 text-center relative overflow-hidden"
            >
              <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center text-xl mx-auto">
                <Lock size={22} />
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 block">
                  Enrolled Student Exclusive
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Restricted Access Resource
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  "<span className="font-semibold text-slate-800 dark:text-slate-200">{restrictedModalMaterial.title}</span>" is reserved for enrolled students of Sunshine Classes.
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  id="btn-login-modal-restricted"
                  onClick={() => {
                    setRestrictedModalMaterial(null);
                    if (onOpenLoginModal) onOpenLoginModal();
                    else navigate('/student/login');
                  }}
                  className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <LogIn size={14} /> Log In with Student Account
                </button>

                <button
                  id="btn-close-restricted-modal"
                  onClick={() => setRestrictedModalMaterial(null)}
                  className="w-full py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Back to Resources
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
