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
import { StudyMaterial, StudyMaterialType } from '../../types';
import {
  isExternalQuestionBankResource,
  isNcertTextbookChapter
} from '../../services/studyMaterialService';

export type LibraryCategoryId =
  | 'QUESTION_BANK'
  | 'SAMPLE_PAPER'
  | 'PYQ'
  | 'FORMULA_SHEET'
  | 'WORKSHEET'
  | 'ASSIGNMENT'
  | 'SYLLABUS'
  | 'LAB_MANUAL'
  | 'OTHER'
  | 'NOTES'
  | 'PDF';

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
    id: 'QUESTION_BANK',
    label: 'Important Questions',
    shortLabel: 'Imp. Questions',
    description: 'Curated board-exam important questions, chapter-wise solved Q&A & most repeated sets',
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
    id: 'WORKSHEET',
    label: 'Worksheets',
    shortLabel: 'Worksheets',
    description: 'Topic-wise daily practice drills & numerical sheets',
    Icon: ClipboardList,
    iconClass: 'bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-400 border-teal-200/80 dark:border-teal-900/60',
    accentBg: 'hover:border-teal-400 dark:hover:border-teal-500'
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
    description: 'Official CBSE question banks, NCERT solutions, study guides & reference links',
    Icon: FolderOpen,
    iconClass: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    accentBg: 'hover:border-slate-400 dark:hover:border-slate-500'
  },
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
  }
];

export const SUBJECT_PRIORITY = [
  'Mathematics',
  'Science',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'Social Science',
  'Hindi',
  'Computer Science',
  'Economics',
  'Accountancy',
  'Business Studies'
];

export const CLASS_PRIORITY = [
  'Class 12',
  'Class 11',
  'Class 10',
  'Class 9',
  'Class 8',
  'Class 7',
  'Class 6',
  'Class 5',
  'Board Specials'
];

export const UPLOAD_CLASSES_LIST = [
  'Class 12',
  'Class 11',
  'Class 10',
  'Class 9',
  'Class 8',
  'Class 7',
  'Class 6',
  'Class 5',
  'Class 4',
  'Class 3',
  'Class 2',
  'Class 1',
  'Board Specials'
];

export const UPLOAD_SUBJECTS_LIST = [
  'Mathematics',
  'Science',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'Social Science',
  'Hindi',
  'Computer Science',
  'Economics',
  'Accountancy',
  'Business Studies',
  'General Knowledge'
];

export const mapCategoryIdToMaterialType = (categoryId?: string): StudyMaterial['materialType'] => {
  const norm = (categoryId || '').toUpperCase();
  if (norm === 'QUESTION_BANK') return 'QUESTION_BANK';
  if (norm === 'SAMPLE_PAPER') return 'SAMPLE_PAPER';
  if (norm === 'PYQ') return 'PYQ';
  if (norm === 'FORMULA_SHEET') return 'FORMULA_SHEET';
  if (norm === 'WORKSHEET') return 'WORKSHEET';
  if (norm === 'ASSIGNMENT') return 'ASSIGNMENT';
  if (norm === 'SYLLABUS') return 'SYLLABUS';
  if (norm === 'LAB_MANUAL') return 'LAB_MANUAL';
  if (norm === 'NOTES') return 'NOTES';
  if (norm === 'PDF') return 'PDF';
  if (norm === 'OTHER') return 'OTHER';
  return 'QUESTION_BANK';
};

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
  const url = (item.fileUrl || '').toLowerCase();
  if (t === 'QUESTION_BANK' && url.includes('ncert.nic.in/textbook/pdf/')) return 'PDF';
  if (t === 'QUESTION_BANK' && isExternalQuestionBankResource(item)) return 'OTHER';
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

export const getCategoryPriorityIndex = (item: StudyMaterial): number => {
  const catId = getResourceCategoryId(item);
  const idx = LIBRARY_CATEGORIES.findIndex((c) => c.id === catId);
  return idx === -1 ? LIBRARY_CATEGORIES.length : idx;
};

export const matchesLibraryCategory = (item: StudyMaterial, categoryId: string): boolean => {
  if (!categoryId || categoryId === 'ALL') return true;
  const target = categoryId.toUpperCase();
  const resolved = getResourceCategoryId(item);
  if (resolved === target) return true;
  if (target === 'QUESTION_BANK') {
    return false;
  }
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

export const IMPORTANT_QUESTIONS_SUBJECT_FILTERS = [
  'Mathematics',
  'Science',
  'Social Science',
  'History',
  'English',
  'Hindi'
] as const;

export const matchesImportantQuestionsSubject = (
  item: StudyMaterial,
  subjectFilter: string
): boolean => {
  if (!subjectFilter || subjectFilter === 'ALL') return true;
  const target = subjectFilter.trim().toLowerCase();
  const itemSubject = (item.subject || '').trim().toLowerCase();

  if (itemSubject === target) return true;

  if (target === 'social science' || target === 'social studies') {
    return (
      itemSubject === 'social science' ||
      itemSubject === 'social studies' ||
      itemSubject === 'sst'
    );
  }

  if (target === 'history') {
    const haystack = [
      item.subject,
      item.title,
      item.chapter,
      ...(item.tags || [])
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return /\bhistory\b/i.test(haystack);
  }

  return false;
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

export interface ParsedFilenameMetadata {
  title: string;
  detectedClass?: string;
  detectedSubject?: string;
  detectedMaterialType?: StudyMaterialType;
  detectedChapter?: string;
  tags: string[];
}

const PRESERVED_UPPERCASE_TOKENS = new Set([
  'CBSE',
  'NCERT',
  'PYQ',
  'PYQS',
  'SQP',
  'MCQ',
  'MCQS',
  'PDF',
  'VVI',
  'DPP',
  'SST',
  'HOTS',
  'ICSE',
  'BSEB',
  'UP',
  'SQL',
  'AI',
  'II',
  'III',
  'IV',
  'VI',
  'VII',
  'VIII',
  'IX',
  'XI',
  'XII'
]);

const FILENAME_STOP_WORDS = new Set([
  'the',
  'and',
  'for',
  'with',
  'from',
  'into',
  'that',
  'this',
  'pdf',
  'doc',
  'docx',
  'ppt',
  'pptx',
  'zip',
  'png',
  'jpg',
  'jpeg',
  'webp',
  'class',
  'cls',
  'std',
  'grade',
  'chapter',
  'chap',
  'unit',
  'file',
  'document',
  'study',
  'material',
  'materials',
  'resource',
  'resources',
  'sunshine',
  'classes',
  'final',
  'new',
  'latest',
  'updated',
  'copy',
  'part',
  'set',
  'math',
  'maths',
  'mathematics',
  'science',
  'physics',
  'chemistry',
  'biology',
  'english',
  'hindi',
  'social',
  'computer',
  'economics',
  'accountancy',
  'business',
  'studies',
  'sample',
  'paper',
  'papers',
  'question',
  'questions',
  'important',
  'bank',
  'formula',
  'formulas',
  'sheet',
  'sheets',
  'notes',
  'worksheet',
  'worksheets',
  'assignment',
  'assignments',
  'syllabus',
  'manual',
  'practical',
  'ncert',
  'cbse',
  'icse',
  'book',
  'books',
  'solution',
  'solutions',
  'solved',
  'previous',
  'year'
]);

const ROMAN_CLASS_MAP: Record<string, string> = {
  xii: 'Class 12',
  xi: 'Class 11',
  x: 'Class 10',
  ix: 'Class 9',
  viii: 'Class 8',
  vii: 'Class 7',
  vi: 'Class 6',
  v: 'Class 5',
  iv: 'Class 4',
  iii: 'Class 3',
  ii: 'Class 2',
  i: 'Class 1'
};

const formatWordCase = (word: string): string => {
  const upper = word.toUpperCase();
  if (PRESERVED_UPPERCASE_TOKENS.has(upper)) {
    if (upper === 'PYQS') return 'PYQs';
    if (upper === 'MCQS') return 'MCQs';
    return upper;
  }
  if (/^\d+(?:st|nd|rd|th)?$/i.test(word)) return word.toLowerCase();
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
};

export const parseStudyMaterialFilename = (
  fileName: string,
  defaults?: {
    defaultClass?: string;
    defaultSubject?: string;
    defaultMaterialType?: StudyMaterialType;
  }
): ParsedFilenameMetadata => {
  const withoutExt = fileName.replace(/\.[^/.]+$/, '');
  const spacedRaw = withoutExt
    .replace(/[_+]+/g, ' ')
    .replace(/[-–—]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([a-zA-Z])(\d)/g, '$1 $2')
    .replace(/(\d)(?!(?:st|nd|rd|th)\b)([a-zA-Z])/gi, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();

  const lower = spacedRaw.toLowerCase();
  const cleanTitle = spacedRaw
    .split(' ')
    .filter(Boolean)
    .map(formatWordCase)
    .join(' ') || withoutExt;

  let detectedClass: string | undefined;
  const numericClassMatch =
    lower.match(/\b(?:class|cls|std|grade)\s*(1[0-2]|[1-9])\b/i) ||
    lower.match(/\b(1[0-2]|[1-9])\s*(?:th|st|nd|rd)\b/i);
  if (numericClassMatch) {
    const classNum = parseInt(numericClassMatch[1], 10);
    if (classNum >= 1 && classNum <= 12) {
      detectedClass = `Class ${classNum}`;
    }
  } else {
    const romanClassMatch = lower.match(/\b(?:class|cls|std)\s*(xii|xi|x|ix|viii|vii|vi|v|iv|iii|ii|i)\b/i);
    if (romanClassMatch) {
      detectedClass = ROMAN_CLASS_MAP[romanClassMatch[1].toLowerCase()];
    } else if (/\bboard\s*specials?\b/i.test(lower)) {
      detectedClass = 'Board Specials';
    }
  }

  let detectedSubject: string | undefined;
  if (/\b(?:computer\s*science|comp\s*sci|informatics|python|sql)\b/i.test(lower)) {
    detectedSubject = 'Computer Science';
  } else if (/\b(?:social\s*science|social\s*studies|sst|history|geography|civics|political\s*science)\b/i.test(lower)) {
    detectedSubject = 'Social Science';
  } else if (/\b(?:business\s*studies|bst)\b/i.test(lower)) {
    detectedSubject = 'Business Studies';
  } else if (/\b(?:general\s*knowledge|gk)\b/i.test(lower)) {
    detectedSubject = 'General Knowledge';
  } else if (/\b(?:mathematics|maths|math|algebra|geometry|trigonometry|calculus|mensuration)\b/i.test(lower)) {
    detectedSubject = 'Mathematics';
  } else if (/\b(?:physics|phy|optics|mechanics|electromagnetism)\b/i.test(lower)) {
    detectedSubject = 'Physics';
  } else if (/\b(?:chemistry|chem|organic|inorganic)\b/i.test(lower)) {
    detectedSubject = 'Chemistry';
  } else if (/\b(?:biology|bio|botany|zoology|genetics)\b/i.test(lower)) {
    detectedSubject = 'Biology';
  } else if (/\b(?:science|sci)\b/i.test(lower)) {
    detectedSubject = 'Science';
  } else if (/\b(?:english|eng|grammar|literature)\b/i.test(lower)) {
    detectedSubject = 'English';
  } else if (/\b(?:hindi|vyakaran)\b/i.test(lower)) {
    detectedSubject = 'Hindi';
  } else if (/\b(?:economics|econ|macroeconomics|microeconomics)\b/i.test(lower)) {
    detectedSubject = 'Economics';
  } else if (/\b(?:accountancy|accounts|accounting)\b/i.test(lower)) {
    detectedSubject = 'Accountancy';
  }

  let detectedMaterialType: StudyMaterialType | undefined;
  let detectedTypeTag: string | undefined;
  if (/\b(?:pyq|pyqs|previous\s*years?|past\s*years?|last\s*\d+\s*years?|board\s*papers?)\b/i.test(lower)) {
    detectedMaterialType = 'PYQ';
    detectedTypeTag = 'PYQ';
  } else if (/\b(?:sample\s*papers?|sqp|model\s*papers?|mock\s*papers?|mock\s*tests?|pre\s*board)\b/i.test(lower)) {
    detectedMaterialType = 'SAMPLE_PAPER';
    detectedTypeTag = 'Sample Paper';
  } else if (/\b(?:question\s*banks?|q\s*banks?|qbank)\b/i.test(lower)) {
    detectedMaterialType = 'OTHER';
    detectedTypeTag = 'Question Bank';
  } else if (/\b(?:important\s*questions?|imp\s*questions?|imp\s*ques|most\s*expected|vvi|mcq|mcqs|case\s*stud(?:y|ies)|assertion|hots)\b/i.test(lower)) {
    detectedMaterialType = 'QUESTION_BANK';
    detectedTypeTag = 'Important Questions';
  } else if (/\b(?:formulas?|cheat\s*sheets?|theorems?|equations?|mind\s*maps?|mindmap)\b/i.test(lower)) {
    detectedMaterialType = 'FORMULA_SHEET';
    detectedTypeTag = 'Formula Sheet';
  } else if (/\b(?:worksheets?|dpp|daily\s*practice|practice\s*sheets?)\b/i.test(lower)) {
    detectedMaterialType = 'WORKSHEET';
    detectedTypeTag = 'Worksheet';
  } else if (/\b(?:assignments?|homework)\b/i.test(lower)) {
    detectedMaterialType = 'ASSIGNMENT';
    detectedTypeTag = 'Assignment';
  } else if (/\b(?:syllabus|blueprint|curriculum|marking\s*scheme)\b/i.test(lower)) {
    detectedMaterialType = 'SYLLABUS';
    detectedTypeTag = 'Syllabus';
  } else if (/\b(?:lab\s*manuals?|practicals?|experiments?|viva)\b/i.test(lower)) {
    detectedMaterialType = 'LAB_MANUAL';
    detectedTypeTag = 'Lab Manual';
  } else if (/\b(?:ncert\s*solutions?|solutions?|answer\s*keys?|solved)\b/i.test(lower)) {
    detectedMaterialType = 'NCERT_SOLUTION';
    detectedTypeTag = 'NCERT Solutions';
  } else if (/\b(?:notes|summary|revision|key\s*points|one\s*shot|oneshot|handwritten)\b/i.test(lower)) {
    detectedMaterialType = 'NOTES';
    detectedTypeTag = 'Chapter Notes';
  } else if (/\b(?:ncert\s*books?|textbooks?|books?)\b/i.test(lower)) {
    detectedMaterialType = 'PDF';
    detectedTypeTag = 'NCERT Book';
  }

  let detectedChapter: string | undefined;
  const chapterMatch = lower.match(/\b(?:chapter|chap|ch|unit)\s*(\d{1,2})\b/i);
  if (chapterMatch) {
    detectedChapter = `Chapter ${parseInt(chapterMatch[1], 10)}`;
  }

  const tags: string[] = [];
  const seenLower = new Set<string>();
  const pushTag = (raw: string | undefined) => {
    if (!raw) return;
    const clean = raw.trim();
    if (!clean) return;
    const key = clean.toLowerCase();
    if (!seenLower.has(key)) {
      seenLower.add(key);
      tags.push(clean);
    }
  };

  pushTag(detectedClass || (defaults?.defaultClass && defaults.defaultClass !== 'ALL' ? defaults.defaultClass : undefined));
  pushTag(detectedSubject || (defaults?.defaultSubject && defaults.defaultSubject !== 'ALL' ? defaults.defaultSubject : undefined));
  pushTag(detectedTypeTag);
  pushTag(detectedChapter);

  if (/\bcbse\b/i.test(lower)) pushTag('CBSE');
  if (/\bicse\b/i.test(lower)) pushTag('ICSE');
  if (/\bup\s*board\b/i.test(lower)) pushTag('UP Board');
  if (/\bbseb\b/i.test(lower)) pushTag('BSEB');
  if (/\bncert\b/i.test(lower)) pushTag('NCERT');
  if (/\bboard\s*exam\b/i.test(lower)) pushTag('Board Exam');
  if (/\bmcq|mcqs\b/i.test(lower)) pushTag('MCQ');
  if (/\bcase\s*study\b/i.test(lower)) pushTag('Case Study');
  if (/\bassertion\b/i.test(lower)) pushTag('Assertion-Reason');
  if (/\bsolved|solution|solutions|answer\s*key\b/i.test(lower)) pushTag('Solved');
  if (/\brevision|one\s*shot|oneshot\b/i.test(lower)) pushTag('Revision');
  if (/\bpre\s*board\b/i.test(lower)) pushTag('Pre-Board');
  if (/\bhalf\s*yearly\b/i.test(lower)) pushTag('Half Yearly');
  if (/\bterm\s*[12]\b/i.test(lower)) {
    const m = lower.match(/\bterm\s*([12])\b/i);
    if (m) pushTag(`Term ${m[1]}`);
  }

  const yearRangeMatch = spacedRaw.match(/\b(20\d{2})\s+(20\d{2}|\d{2})\b/);
  if (yearRangeMatch) {
    pushTag(`${yearRangeMatch[1]}-${yearRangeMatch[2]}`);
  } else {
    const yearMatches = spacedRaw.match(/\b(202[0-9]|2030)\b/g);
    if (yearMatches) {
      yearMatches.forEach((yr) => pushTag(yr));
    }
  }

  const setMatch = lower.match(/\bset\s*([a-z0-9]{1,2})\b/i);
  if (setMatch) {
    pushTag(`Set ${setMatch[1].toUpperCase()}`);
  }

  // Extract up to 3 topic keywords from remaining descriptive filename tokens
  const topicWords = spacedRaw
    .split(' ')
    .filter((word) => {
      const wLower = word.toLowerCase();
      if (wLower.length < 4) return false;
      if (/^\d+(?:st|nd|rd|th)?$/.test(wLower)) return false;
      if (FILENAME_STOP_WORDS.has(wLower)) return false;
      if (seenLower.has(wLower)) return false;
      return true;
    })
    .slice(0, 3);

  topicWords.forEach((word) => pushTag(formatWordCase(word)));

  return {
    title: cleanTitle,
    detectedClass,
    detectedSubject,
    detectedMaterialType: detectedMaterialType || defaults?.defaultMaterialType,
    detectedChapter,
    tags: tags.slice(0, 8)
  };
};

