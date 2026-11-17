import React from 'react';
import {
  Atom,
  Book,
  BookMarked,
  BookOpen,
  Briefcase,
  Calculator,
  ClipboardCheck,
  ClipboardList,
  Cpu,
  Dna,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  FlaskConical,
  FolderOpen,
  Globe,
  Languages,
  Microscope,
  ScrollText,
  Sigma
} from 'lucide-react';
import { StudyMaterial } from '../../types';
import { isNcertTextbookChapter } from '../../services/studyMaterialService';

export type LibraryCategoryId =
  | 'NOTES'
  | 'PDF'
  | 'QUESTION_BANK'
  | 'SAMPLE_PAPER'
  | 'PYQ'
  | 'FORMULA_SHEET'
  | 'ASSIGNMENT'
  | 'WORKSHEET'
  | 'SYLLABUS'
  | 'LAB_MANUAL'
  | 'OTHER';

export type StudyResourceSortMode = 'chapter' | 'newest' | 'alphabetical';

export interface LibraryCategoryMeta {
  id: LibraryCategoryId;
  label: string;
  shortLabel: string;
  description: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  iconClass: string;
  accentBg: string;
}

export const LIBRARY_CATEGORIES: LibraryCategoryMeta[] = [
  {
    id: 'NOTES',
    label: 'Chapter Notes',
    shortLabel: 'Notes',
    description: 'Concise revision summaries, diagrams & key concepts',
    Icon: FileText,
    iconClass: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200/80 dark:border-amber-900/60',
    accentBg: 'hover:border-amber-400 dark:hover:border-amber-500'
  },
  {
    id: 'PDF',
    label: 'NCERT Books & PDFs',
    shortLabel: 'Books PDF',
    description: 'Official NCERT textbook chapters & reference book PDFs',
    Icon: Book,
    iconClass: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border-rose-200/80 dark:border-rose-900/60',
    accentBg: 'hover:border-rose-400 dark:hover:border-rose-500'
  },
  {
    id: 'QUESTION_BANK',
    label: 'Question Banks',
    shortLabel: 'Q-Banks',
    description: 'Chapter-wise MCQs, assertion-reason & case studies',
    Icon: ClipboardCheck,
    iconClass: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 border-indigo-200/80 dark:border-indigo-900/60',
    accentBg: 'hover:border-indigo-400 dark:hover:border-indigo-500'
  },
  {
    id: 'SAMPLE_PAPER',
    label: 'Sample Papers',
    shortLabel: 'Sample Papers',
    description: 'Official model question papers & marking schemes',
    Icon: FileCheck2,
    iconClass: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-900/60',
    accentBg: 'hover:border-emerald-400 dark:hover:border-emerald-500'
  },
  {
    id: 'PYQ',
    label: 'Previous Year Papers',
    shortLabel: 'PYQs',
    description: 'Past board exam papers with step-by-step solutions',
    Icon: ScrollText,
    iconClass: 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border-blue-200/80 dark:border-blue-900/60',
    accentBg: 'hover:border-blue-400 dark:hover:border-blue-500'
  },
  {
    id: 'FORMULA_SHEET',
    label: 'Formula Sheets',
    shortLabel: 'Formulas',
    description: 'Printable equations, theorems, laws & reaction charts',
    Icon: Calculator,
    iconClass: 'bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400 border-orange-200/80 dark:border-orange-900/60',
    accentBg: 'hover:border-orange-400 dark:hover:border-orange-500'
  },
  {
    id: 'ASSIGNMENT',
    label: 'Assignments',
    shortLabel: 'Assignments',
    description: 'Take-home homework tasks & graded problem sets',
    Icon: FileSpreadsheet,
    iconClass: 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-400 border-sky-200/80 dark:border-sky-900/60',
    accentBg: 'hover:border-sky-400 dark:hover:border-sky-500'
  },
  {
    id: 'WORKSHEET',
    label: 'Worksheets',
    shortLabel: 'Worksheets',
    description: 'Topic-wise daily practice drills & numerical sheets',
    Icon: ClipboardList,
    iconClass: 'bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-400 border-teal-200/80 dark:border-teal-900/60',
    accentBg: 'hover:border-teal-400 dark:hover:border-teal-500'
  },
  {
    id: 'SYLLABUS',
    label: 'Syllabus',
    shortLabel: 'Syllabus',
    description: 'Official curriculum, unit weightage & exam blueprints',
    Icon: BookMarked,
    iconClass: 'bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-400 border-violet-200/80 dark:border-violet-900/60',
    accentBg: 'hover:border-violet-400 dark:hover:border-violet-500'
  },
  {
    id: 'LAB_MANUAL',
    label: 'Practical & Lab Manuals',
    shortLabel: 'Lab Manuals',
    description: 'Science experiments, viva questions & practical guides',
    Icon: Microscope,
    iconClass: 'bg-lime-50 dark:bg-lime-950/50 text-lime-700 dark:text-lime-400 border-lime-200/80 dark:border-lime-900/60',
    accentBg: 'hover:border-lime-400 dark:hover:border-lime-500'
  },
  {
    id: 'OTHER',
    label: 'Other Resources',
    shortLabel: 'Other',
    description: 'NCERT solutions, study articles & reference links',
    Icon: FolderOpen,
    iconClass: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    accentBg: 'hover:border-slate-400 dark:hover:border-slate-500'
  }
];

export const SUBJECT_PRIORITY = [
  'Mathematics',
  'Science',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'Social Studies',
  'Hindi',
  'Computer Science',
  'Economics',
  'Accountancy',
  'Business Studies'
];

export const CLASS_PRIORITY = [
  'Class 10',
  'Class 12',
  'Class 9',
  'Class 8',
  'Class 7',
  'Class 6',
  'Class 5',
  'Board Specials'
];

export const sanitizeElementId = (value: string): string =>
  value.toLowerCase().replace(/[^a-z0-9_-]/g, '-');

export const getCategoryMeta = (categoryId: string): LibraryCategoryMeta | undefined => {
  const norm = categoryId.toUpperCase();
  if (norm === 'NCERT_SOLUTION' || norm === 'VIDEO_LINK' || norm === 'EXTERNAL_LINK' || norm === 'BLOG') {
    return LIBRARY_CATEGORIES.find((c) => c.id === 'OTHER');
  }
  return LIBRARY_CATEGORIES.find((c) => c.id === norm);
};

export const getResourceCategoryId = (item: StudyMaterial): LibraryCategoryId => {
  if (isNcertTextbookChapter(item)) return 'PDF';
  const t = (item.materialType || '').toUpperCase();
  const c = (item.category || '').toUpperCase();
  if (t === 'NOTES') return 'NOTES';
  if (t === 'PDF' || c === 'BOOK' || c === 'TEXTBOOK') return 'PDF';
  if (t === 'QUESTION_BANK') return 'QUESTION_BANK';
  if (t === 'SAMPLE_PAPER') return 'SAMPLE_PAPER';
  if (t === 'PYQ') return 'PYQ';
  if (t === 'FORMULA_SHEET') return 'FORMULA_SHEET';
  if (t === 'ASSIGNMENT') return 'ASSIGNMENT';
  if (t === 'WORKSHEET') return 'WORKSHEET';
  if (t === 'SYLLABUS') return 'SYLLABUS';
  if (t === 'LAB_MANUAL') return 'LAB_MANUAL';
  if (t === 'NCERT_SOLUTION' || t === 'VIDEO_LINK' || t === 'EXTERNAL_LINK' || t === 'BLOG' || t === 'OTHER') {
    return 'OTHER';
  }
  if (c === 'NOTES') return 'NOTES';
  return 'OTHER';
};

export const matchesLibraryCategory = (item: StudyMaterial, categoryId: string): boolean => {
  if (!categoryId || categoryId === 'ALL') return true;
  const target = categoryId.toUpperCase();
  const resolved = getResourceCategoryId(item);
  if (resolved === target) return true;
  if (target === 'NCERT_SOLUTION') {
    return (item.materialType || '').toUpperCase() === 'NCERT_SOLUTION';
  }
  return (item.tags || []).some((t) => t.toUpperCase().replace(/\s+/g, '_') === target);
};

export const getResourceTypeLabel = (item: StudyMaterial): string => {
  if (isNcertTextbookChapter(item)) return 'NCERT Book PDF';
  const t = (item.materialType || '').toUpperCase();
  if (t === 'NCERT_SOLUTION') return 'NCERT Solutions';
  if (t === 'VIDEO_LINK') return 'Video Lecture';
  if (t === 'EXTERNAL_LINK') return 'External Link';
  if (t === 'BLOG') return 'Study Guide';
  const catMeta = getCategoryMeta(getResourceCategoryId(item));
  return catMeta?.label || 'Study Resource';
};

export const getFileFormatLabel = (item: StudyMaterial): string => {
  if (item.fileFormat) return item.fileFormat.toUpperCase();
  const ref = (item.file || item.fileUrl || '').toLowerCase();
  if (ref.endsWith('.pdf') || item.fileData?.startsWith('data:application/pdf')) return 'PDF';
  if (item.materialType === 'FORMULA_SHEET') return 'Interactive / PDF';
  if (item.materialType === 'VIDEO_LINK' || item.youtubeUrl) return 'Video';
  if (item.materialType === 'EXTERNAL_LINK' || item.externalUrl) return 'Web Link';
  if (ref.endsWith('.doc') || ref.endsWith('.docx')) return 'DOCX';
  if (ref.endsWith('.ppt') || ref.endsWith('.pptx')) return 'PPT';
  return 'PDF';
};

export const extractChapterInfo = (item: StudyMaterial): string => {
  if (item.chapter && item.chapter.trim()) return item.chapter.trim();
  const match = (item.title || '').match(/Chapter\s*\d+(?:\s*[:\-–]\s*[^|]+)?/i);
  return match ? match[0].trim() : '';
};

export const extractChapterOrderNumber = (item: StudyMaterial): number => {
  const chSource = item.chapter || item.title || '';
  const chMatch = chSource.match(/(?:Chapter|Unit|Ch\.?)\s*(\d+)/i);
  if (chMatch) return parseInt(chMatch[1], 10);
  const digitOnly = (item.chapter || '').replace(/\D/g, '');
  if (digitOnly) {
    const parsed = parseInt(digitOnly, 10);
    if (!isNaN(parsed)) return parsed;
  }
  return 999;
};

export const formatResourceDate = (dateStr?: string): string | null => {
  if (!dateStr) return null;
  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

export const matchesClassFilter = (itemClass: string | undefined, selectedClass: string): boolean => {
  if (!selectedClass || selectedClass === 'ALL') return true;
  const normalizedItem = (itemClass || '').toLowerCase().trim();
  const normalizedTarget = selectedClass.toLowerCase().trim();
  return (
    normalizedItem === normalizedTarget ||
    normalizedItem === 'all' ||
    normalizedItem === 'board specials'
  );
};

export const matchesSearchQuery = (item: StudyMaterial, query: string): boolean => {
  const q = query.toLowerCase().trim();
  if (!q) return true;
  const haystack = [
    item.title,
    item.subject,
    item.chapter,
    item.class,
    item.description,
    item.desc,
    getResourceTypeLabel(item),
    item.createdBy,
    ...(item.tags || []),
    ...(item.keywords || [])
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(q);
};

export const getSubjectVisualMeta = (subject: string) => {
  const s = subject.toLowerCase();
  if (s.includes('math')) {
    return {
      Icon: Sigma,
      badgeClass: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200/70 dark:border-amber-900/60'
    };
  }
  if (s.includes('physics')) {
    return {
      Icon: Atom,
      badgeClass: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 border-indigo-200/70 dark:border-indigo-900/60'
    };
  }
  if (s.includes('chem')) {
    return {
      Icon: FlaskConical,
      badgeClass: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200/70 dark:border-emerald-900/60'
    };
  }
  if (s.includes('bio') || s.includes('science')) {
    return {
      Icon: Dna,
      badgeClass: 'bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-400 border-teal-200/70 dark:border-teal-900/60'
    };
  }
  if (s.includes('social') || s.includes('history') || s.includes('geo')) {
    return {
      Icon: Globe,
      badgeClass: 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-400 border-sky-200/70 dark:border-sky-900/60'
    };
  }
  if (s.includes('hindi') || s.includes('english') || s.includes('lang')) {
    return {
      Icon: Languages,
      badgeClass: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border-rose-200/70 dark:border-rose-900/60'
    };
  }
  if (s.includes('computer')) {
    return {
      Icon: Cpu,
      badgeClass: 'bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-400 border-violet-200/70 dark:border-violet-900/60'
    };
  }
  if (s.includes('econ') || s.includes('account') || s.includes('business')) {
    return {
      Icon: Briefcase,
      badgeClass: 'bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400 border-orange-200/70 dark:border-orange-900/60'
    };
  }
  return {
    Icon: BookOpen,
    badgeClass: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
  };
};

export const orderSubjectsByPriority = (subjects: string[]): string[] => {
  const unique = new Set(subjects.filter(Boolean));
  const ordered: string[] = [];
  SUBJECT_PRIORITY.forEach((s) => {
    if (unique.has(s)) {
      ordered.push(s);
      unique.delete(s);
    }
  });
  Array.from(unique)
    .sort((a, b) => a.localeCompare(b))
    .forEach((s) => ordered.push(s));
  return ordered;
};

export const extractSearchSuggestions = (materials: StudyMaterial[], limit = 6): string[] => {
  const counts = new Map<string, number>();
  materials.forEach((item) => {
    if (item.subject) {
      counts.set(item.subject, (counts.get(item.subject) || 0) + 3);
    }
    (item.keywords || item.tags || []).forEach((kw) => {
      const clean = kw.trim();
      if (clean.length >= 3 && clean.length <= 24 && !/^class\s*\d+$/i.test(clean)) {
        counts.set(clean, (counts.get(clean) || 0) + 1);
      }
    });
  });

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([term]) => term);
};
