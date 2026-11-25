import { StudyMaterial, StudyMaterialStatus, StudyMaterialType } from '../types';
import { SEED_STUDY_MATERIALS } from '../data';
import { SyncService } from './SyncService';

const COLLECTION_NAME = 'study_materials';

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Identify official NCERT textbook chapter PDFs that were previously misclassified as NOTES
 */
export function isNcertTextbookChapter(item: Partial<StudyMaterial>): boolean {
  const title = (item.title || '').trim();
  const desc = (item.description || item.desc || '').toLowerCase();
  const url = (item.fileUrl || '').toLowerCase();
  const tags = (item.tags || []).map((t) => t.toLowerCase());
  const isNcertChapterTitle = /^ncert\s+class\s+\d+/i.test(title);
  const isTextbookMeta =
    desc.includes('official ncert textbook chapter') ||
    tags.includes('textbook') ||
    url.includes('ncert.nic.in/textbook/pdf/');
  return isNcertChapterTitle && isTextbookMeta;
}

/**
 * Identify official CBSE Question Bank PDFs (or items titled "Question Bank")
 * that should be separated from the dedicated Important Questions section.
 */
export function isExternalQuestionBankResource(item: Partial<StudyMaterial>): boolean {
  const title = (item.title || '').trim();
  const url = (item.fileUrl || '').toLowerCase();
  return (
    url.includes('/web_material/questionbank/') ||
    /\bquestion\s*banks?\b/i.test(title)
  );
}

const DELETED_MATERIAL_IDS_KEY = 'sunshine_deleted_study_material_ids';

function getDeletedMaterialIdSet(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(DELETED_MATERIAL_IDS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed.map(String) : []);
  } catch {
    return new Set();
  }
}

function recordDeletedMaterialIds(ids: string[]): void {
  if (typeof window === 'undefined' || ids.length === 0) return;
  try {
    const existing = getDeletedMaterialIdSet();
    ids.forEach((id) => existing.add(String(id)));
    localStorage.setItem(DELETED_MATERIAL_IDS_KEY, JSON.stringify(Array.from(existing)));
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Unify equivalent Social Studies / SST subject names to canonical "Social Science"
 * so duplicate subject folders or filter options never appear.
 */
export function normalizeStudyMaterialSubject(subject?: string): string {
  const trimmed = (subject || '').trim();
  if (!trimmed) return '';
  const lower = trimmed.toLowerCase();
  if (
    lower === 'social studies' ||
    lower === 'sst' ||
    lower === 'social science' ||
    lower === 'history' ||
    lower === 'geography' ||
    lower === 'civics' ||
    lower === 'political science'
  ) {
    return 'Social Science';
  }
  return trimmed;
}

export type SocialScienceSubcategory = 'History' | 'Geography' | 'Civics' | 'Economics';

export interface SocialScienceChapterMeta {
  subcategory: SocialScienceSubcategory;
  chapterNumber: number;
  canonicalChapter: string;
  boardNote?: string;
  pattern: RegExp;
  requiresSstContext?: boolean;
}

export const CLASS_10_SOCIAL_SCIENCE_CHAPTERS: readonly SocialScienceChapterMeta[] = [
  // History (Chapters 1-5)
  {
    subcategory: 'History',
    chapterNumber: 1,
    canonicalChapter: 'History · Chapter 1: The Rise of Nationalism in Europe',
    pattern: /\b(?:the\s*)?rise\s*of\s*nationalism\s*in\s*europe\b/i
  },
  {
    subcategory: 'History',
    chapterNumber: 2,
    canonicalChapter: 'History · Chapter 2: Nationalism in India',
    pattern: /\bnationalism\s*in\s*india\b/i
  },
  {
    subcategory: 'History',
    chapterNumber: 3,
    canonicalChapter: 'History · Chapter 3: The Making of a Global World',
    pattern: /\b(?:the\s*)?making\s*of\s*a?\s*global\s*world\b/i
  },
  {
    subcategory: 'History',
    chapterNumber: 4,
    canonicalChapter: 'History · Chapter 4: The Age of Industrialization',
    boardNote: 'Not in 2026–27 Board Exam',
    pattern: /\b(?:the\s*)?age\s*of\s*industriali[sz]ation\b|\bindustriali[sz]ation\b/i
  },
  {
    subcategory: 'History',
    chapterNumber: 5,
    canonicalChapter: 'History · Chapter 5: Print Culture and the Modern World',
    pattern: /\bprint\s*culture(?:\s*(?:&|and)\s*(?:the\s*)?modern\s*world)?\b/i
  },
  // Geography (Chapters 1-7) — evaluated before Economics to prevent "Resources and Development" colliding with "Development"
  {
    subcategory: 'Geography',
    chapterNumber: 1,
    canonicalChapter: 'Geography · Chapter 1: Resources and Development',
    pattern: /\bresources?\s*(?:&|and)\s*development\b/i
  },
  {
    subcategory: 'Geography',
    chapterNumber: 2,
    canonicalChapter: 'Geography · Chapter 2: Forest and Wildlife Resources',
    pattern: /\bforests?\s*(?:&|and)\s*wildlife(?:\s*resources?)?\b/i
  },
  {
    subcategory: 'Geography',
    chapterNumber: 3,
    canonicalChapter: 'Geography · Chapter 3: Water Resources',
    pattern: /\bwater\s*resources?\b/i,
    requiresSstContext: true
  },
  {
    subcategory: 'Geography',
    chapterNumber: 4,
    canonicalChapter: 'Geography · Chapter 4: Agriculture',
    pattern: /\bagriculture\b/i,
    requiresSstContext: true
  },
  {
    subcategory: 'Geography',
    chapterNumber: 5,
    canonicalChapter: 'Geography · Chapter 5: Minerals and Energy Resources',
    pattern: /\bminerals?\s*(?:&|and)\s*energy(?:\s*resources?)?\b/i
  },
  {
    subcategory: 'Geography',
    chapterNumber: 6,
    canonicalChapter: 'Geography · Chapter 6: Manufacturing Industries',
    pattern: /\bmanufacturing\s*industr(?:y|ies)\b/i
  },
  {
    subcategory: 'Geography',
    chapterNumber: 7,
    canonicalChapter: 'Geography · Chapter 7: Lifelines of National Economy',
    boardNote: 'Map Work Only · 2026–27 Board',
    pattern: /\blifelines?\s*of\s*(?:the\s*)?national\s*economy\b/i
  },
  // Civics (Chapters 1-5)
  {
    subcategory: 'Civics',
    chapterNumber: 1,
    canonicalChapter: 'Civics · Chapter 1: Power-Sharing',
    pattern: /\bpower[\s-]*sharing\b/i
  },
  {
    subcategory: 'Civics',
    chapterNumber: 2,
    canonicalChapter: 'Civics · Chapter 2: Federalism',
    pattern: /\bfederalism\b/i
  },
  {
    subcategory: 'Civics',
    chapterNumber: 3,
    canonicalChapter: 'Civics · Chapter 3: Gender, Religion, and Caste',
    pattern: /\bgender[\s,&]+(?:religion[\s,&]+)?(?:and\s+)?caste\b|\bgender[\s,&]+religion\b/i
  },
  {
    subcategory: 'Civics',
    chapterNumber: 4,
    canonicalChapter: 'Civics · Chapter 4: Political Parties',
    pattern: /\bpolitical\s*parties\b/i
  },
  {
    subcategory: 'Civics',
    chapterNumber: 5,
    canonicalChapter: 'Civics · Chapter 5: Outcomes of Democracy',
    pattern: /\boutcomes?\s*of\s*democracy\b/i
  },
  // Economics (Chapters 1-4)
  {
    subcategory: 'Economics',
    chapterNumber: 2,
    canonicalChapter: 'Economics · Chapter 2: Sectors of the Indian Economy',
    pattern: /\bsectors?\s*of\s*(?:the\s*)?(?:indian\s*)?economy\b/i
  },
  {
    subcategory: 'Economics',
    chapterNumber: 3,
    canonicalChapter: 'Economics · Chapter 3: Money and Credit',
    pattern: /\bmoney\s*(?:&|and)\s*credit\b/i
  },
  {
    subcategory: 'Economics',
    chapterNumber: 4,
    canonicalChapter: 'Economics · Chapter 4: Globalization and the Indian Economy',
    pattern: /\bglobali[sz]ation(?:\s*(?:&|and)\s*(?:the\s*)?indian\s*economy)?\b/i
  },
  {
    subcategory: 'Economics',
    chapterNumber: 1,
    canonicalChapter: 'Economics · Chapter 1: Development',
    pattern: /\bdevelopment\b/i,
    requiresSstContext: true
  }
];

const NON_SST_SUBJECTS = new Set([
  'mathematics',
  'science',
  'physics',
  'chemistry',
  'biology',
  'english',
  'english language',
  'english literature',
  'hindi',
  'hindi language',
  'hindi literature',
  'computer science',
  'accountancy',
  'business studies'
]);

const SST_CONTEXT_SUBJECTS = new Set([
  'social science',
  'social studies',
  'sst',
  'history',
  'geography',
  'civics',
  'political science',
  'economics'
]);

export function detectSocialScienceChapterMeta(
  item: Partial<StudyMaterial>
): SocialScienceChapterMeta | null {
  const subjectLower = (item.subject || '').trim().toLowerCase();
  const isSstContext = !subjectLower || SST_CONTEXT_SUBJECTS.has(subjectLower);
  const isExplicitNonSst = NON_SST_SUBJECTS.has(subjectLower);

  const primaryText = [item.title, item.chapter, item.file, item.slug]
    .filter(Boolean)
    .join(' ');

  if (!primaryText.trim()) return null;

  // Skip full-syllabus combined SST papers/notes from single-chapter classification
  if (/\bfull\s*(?:sst\s*)?syllabus\b|\ball\s*chapters\b/i.test(primaryText)) {
    return null;
  }

  for (const meta of CLASS_10_SOCIAL_SCIENCE_CHAPTERS) {
    if (meta.requiresSstContext && (!isSstContext || isExplicitNonSst)) {
      continue;
    }
    if (meta.pattern.test(primaryText)) {
      return meta;
    }
  }
  return null;
}

export function classifySocialScienceSubcategory(
  item: Partial<StudyMaterial>
): SocialScienceSubcategory | null {
  const chapterMeta = detectSocialScienceChapterMeta(item);
  if (chapterMeta) return chapterMeta.subcategory;

  const primaryText = [
    item.title,
    item.chapter,
    ...(item.tags || []),
    ...(item.keywords || [])
  ]
    .filter(Boolean)
    .join(' ');

  if (!primaryText.trim()) return null;

  // Evaluate unambiguous discipline keywords in priority order
  if (
    /\b(?:geography|climate|drainage|physical\s*features|natural\s*vegetation|map\s*work|map\s*pointing)\b/i.test(
      primaryText
    )
  ) {
    return 'Geography';
  }
  if (
    /\b(?:history|french\s*revolution|nazism|russian\s*revolution|pastoralists|forest\s*society|colonialism)\b/i.test(
      primaryText
    )
  ) {
    return 'History';
  }
  if (
    /\b(?:civics|political\s*science|democratic\s*politics|constitutional\s*design|electoral\s*politics|working\s*of\s*institutions|democratic\s*rights)\b/i.test(
      primaryText
    )
  ) {
    return 'Civics';
  }
  if (
    /\b(?:economics?|consumer\s*rights|palampur|people\s*as\s*resource|poverty|food\s*security)\b/i.test(
      primaryText
    )
  ) {
    return 'Economics';
  }

  return null;
}

export type ScienceSubcategory = 'Physics' | 'Biology' | 'Chemistry';

export interface ScienceChapterMeta {
  subcategory: ScienceSubcategory;
  className: 'Class 10' | 'Class 9';
  chapterNumber: number;
  canonicalChapter: string;
  boardNote?: string;
  pattern: RegExp;
  requiresScienceContext?: boolean;
}

export const CBSE_SCIENCE_CHAPTERS: readonly ScienceChapterMeta[] = [
  // Class 10 Chemistry (Chapters 1-4 + rationalized legacy)
  {
    subcategory: 'Chemistry',
    className: 'Class 10',
    chapterNumber: 1,
    canonicalChapter: 'Chemistry · Chapter 1: Chemical Reactions and Equations',
    pattern: /\bchemical\s*reactions?(?:\s*(?:&|and)\s*equations?)?\b/i
  },
  {
    subcategory: 'Chemistry',
    className: 'Class 10',
    chapterNumber: 2,
    canonicalChapter: 'Chemistry · Chapter 2: Acids, Bases and Salts',
    pattern: /\bacids?[\s,&]+bases?(?:[\s,&]+(?:and\s+)?salts?)?\b/i
  },
  {
    subcategory: 'Chemistry',
    className: 'Class 10',
    chapterNumber: 3,
    canonicalChapter: 'Chemistry · Chapter 3: Metals and Non-metals',
    pattern: /\bmetals?\s*(?:&|and)\s*non[\s-]*metals?\b/i
  },
  {
    subcategory: 'Chemistry',
    className: 'Class 10',
    chapterNumber: 4,
    canonicalChapter: 'Chemistry · Chapter 4: Carbon and its Compounds',
    pattern: /\bcarbon\s*(?:&|and)\s*(?:its\s*)?compounds?\b/i
  },
  {
    subcategory: 'Chemistry',
    className: 'Class 10',
    chapterNumber: 5,
    canonicalChapter: 'Chemistry · Periodic Classification of Elements',
    boardNote: 'Not in 2026–27 Board Exam',
    pattern: /\bperiodic\s*classification(?:\s*of\s*elements?)?\b/i
  },
  // Class 10 Biology (Chapters 5-8, 13 + rationalized legacy)
  {
    subcategory: 'Biology',
    className: 'Class 10',
    chapterNumber: 5,
    canonicalChapter: 'Biology · Chapter 5: Life Processes',
    pattern: /\blife\s*process(?:es)?\b/i
  },
  {
    subcategory: 'Biology',
    className: 'Class 10',
    chapterNumber: 6,
    canonicalChapter: 'Biology · Chapter 6: Control and Coordination',
    pattern: /\bcontrol\s*(?:&|and)\s*co[\s-]*ordination\b/i
  },
  {
    subcategory: 'Biology',
    className: 'Class 10',
    chapterNumber: 7,
    canonicalChapter: 'Biology · Chapter 7: How do Organisms Reproduce?',
    pattern: /\b(?:how\s*do\s*)?organisms?\s*reproduce\b/i
  },
  {
    subcategory: 'Biology',
    className: 'Class 10',
    chapterNumber: 8,
    canonicalChapter: 'Biology · Chapter 8: Heredity',
    pattern: /\bheredity(?:\s*(?:&|and)\s*evolution)?\b/i
  },
  {
    subcategory: 'Biology',
    className: 'Class 10',
    chapterNumber: 13,
    canonicalChapter: 'Biology · Chapter 13: Our Environment',
    pattern: /\bour\s*environment\b/i
  },
  {
    subcategory: 'Biology',
    className: 'Class 10',
    chapterNumber: 14,
    canonicalChapter: 'Biology · Sustainable Management of Natural Resources',
    boardNote: 'Internal Assessment Only · 2026–27',
    pattern: /\b(?:sustainable\s*)?management\s*of\s*natural\s*resources?\b/i
  },
  // Class 10 Physics (Chapters 9-12 + rationalized legacy; Ch 12 evaluated before Ch 11)
  {
    subcategory: 'Physics',
    className: 'Class 10',
    chapterNumber: 12,
    canonicalChapter: 'Physics · Chapter 12: Magnetic Effects of Electric Current',
    pattern: /\bmagnetic\s*effects?\s*of\s*(?:an\s*)?electric\s*current\b/i
  },
  {
    subcategory: 'Physics',
    className: 'Class 10',
    chapterNumber: 10,
    canonicalChapter: 'Physics · Chapter 10: The Human Eye and the Colourful World',
    pattern: /\b(?:the\s*)?human\s*eye(?:\s*(?:&|and)\s*(?:the\s*)?colou?rful\s*world)?\b/i
  },
  {
    subcategory: 'Physics',
    className: 'Class 10',
    chapterNumber: 9,
    canonicalChapter: 'Physics · Chapter 9: Light – Reflection and Refraction',
    pattern:
      /\blight[\s\-–:,]+reflection(?:\s*(?:&|and)\s*refraction)?\b|\breflection\s*(?:&|and)\s*refraction\b/i
  },
  {
    subcategory: 'Physics',
    className: 'Class 10',
    chapterNumber: 11,
    canonicalChapter: 'Physics · Chapter 11: Electricity',
    pattern: /\belectricity\b/i
  },
  {
    subcategory: 'Physics',
    className: 'Class 10',
    chapterNumber: 14,
    canonicalChapter: 'Physics · Sources of Energy',
    boardNote: 'Not in 2026–27 Board Exam',
    pattern: /\bsources?\s*of\s*energy\b/i
  },
  {
    subcategory: 'Physics',
    className: 'Class 10',
    chapterNumber: 9,
    canonicalChapter: 'Physics · Chapter 9: Light – Reflection and Refraction',
    pattern: /\blight\b/i,
    requiresScienceContext: true
  },
  // Class 9 Chemistry (Chapters 1-4)
  {
    subcategory: 'Chemistry',
    className: 'Class 9',
    chapterNumber: 1,
    canonicalChapter: 'Chemistry · Chapter 1: Matter in Our Surroundings',
    pattern: /\bmatter\s*in\s*our\s*surroundings?\b/i
  },
  {
    subcategory: 'Chemistry',
    className: 'Class 9',
    chapterNumber: 2,
    canonicalChapter: 'Chemistry · Chapter 2: Is Matter Around Us Pure?',
    pattern: /\b(?:is\s*)?matter\s*around\s*us\s*pure\b/i
  },
  {
    subcategory: 'Chemistry',
    className: 'Class 9',
    chapterNumber: 3,
    canonicalChapter: 'Chemistry · Chapter 3: Atoms and Molecules',
    pattern: /\batoms?\s*(?:&|and)\s*molecules?\b/i
  },
  {
    subcategory: 'Chemistry',
    className: 'Class 9',
    chapterNumber: 4,
    canonicalChapter: 'Chemistry · Chapter 4: Structure of the Atom',
    pattern: /\bstructure\s*of\s*(?:the\s*)?atoms?\b/i
  },
  // Class 9 Biology (Chapters 5, 6, 12 + rationalized legacy)
  {
    subcategory: 'Biology',
    className: 'Class 9',
    chapterNumber: 5,
    canonicalChapter: 'Biology · Chapter 5: The Fundamental Unit of Life',
    pattern: /\b(?:the\s*)?fundamental\s*unit\s*of\s*life\b/i
  },
  {
    subcategory: 'Biology',
    className: 'Class 9',
    chapterNumber: 12,
    canonicalChapter: 'Biology · Chapter 12: Improvement in Food Resources',
    pattern: /\bimprovement\s*in\s*food\s*resources?\b/i
  },
  {
    subcategory: 'Biology',
    className: 'Class 9',
    chapterNumber: 7,
    canonicalChapter: 'Biology · Diversity in Living Organisms',
    boardNote: 'Not in 2026–27 Board Exam',
    pattern: /\bdiversity\s*in\s*living\s*organisms?\b/i
  },
  {
    subcategory: 'Biology',
    className: 'Class 9',
    chapterNumber: 13,
    canonicalChapter: 'Biology · Why Do We Fall Ill?',
    boardNote: 'Not in 2026–27 Board Exam',
    pattern: /\bwhy\s*do\s*we\s*fall\s*ill\b/i
  },
  {
    subcategory: 'Biology',
    className: 'Class 9',
    chapterNumber: 6,
    canonicalChapter: 'Biology · Chapter 6: Tissues',
    pattern: /\btissues?\b/i,
    requiresScienceContext: true
  },
  // Class 9 Physics (Chapters 7-11; Ch 8 Force and Laws of Motion evaluated before Ch 7 Motion)
  {
    subcategory: 'Physics',
    className: 'Class 9',
    chapterNumber: 8,
    canonicalChapter: 'Physics · Chapter 8: Force and Laws of Motion',
    pattern: /\bforce\s*(?:&|and)\s*laws?\s*of\s*motion\b|\blaws?\s*of\s*motion\b/i
  },
  {
    subcategory: 'Physics',
    className: 'Class 9',
    chapterNumber: 9,
    canonicalChapter: 'Physics · Chapter 9: Gravitation',
    pattern: /\bgravitation\b/i
  },
  {
    subcategory: 'Physics',
    className: 'Class 9',
    chapterNumber: 10,
    canonicalChapter: 'Physics · Chapter 10: Work and Energy',
    pattern: /\bwork\s*(?:&|and)\s*energy\b/i
  },
  {
    subcategory: 'Physics',
    className: 'Class 9',
    chapterNumber: 7,
    canonicalChapter: 'Physics · Chapter 7: Motion',
    pattern: /\bmotion\b/i,
    requiresScienceContext: true
  },
  {
    subcategory: 'Physics',
    className: 'Class 9',
    chapterNumber: 11,
    canonicalChapter: 'Physics · Chapter 11: Sound',
    pattern: /\bsound\b/i,
    requiresScienceContext: true
  }
];

const NON_SCIENCE_SUBJECTS = new Set([
  'mathematics',
  'social science',
  'social studies',
  'sst',
  'history',
  'geography',
  'civics',
  'political science',
  'economics',
  'english',
  'english language',
  'english literature',
  'hindi',
  'hindi language',
  'hindi literature',
  'computer science',
  'accountancy',
  'business studies'
]);

const LANGUAGE_SUBCATEGORY_PARENT_MAP: Record<string, { parent: 'English' | 'Hindi'; label: string }> = {
  'english language': { parent: 'English', label: 'English Language' },
  'english literature': { parent: 'English', label: 'English Literature' },
  'hindi language': { parent: 'Hindi', label: 'Hindi Language' },
  'hindi literature': { parent: 'Hindi', label: 'Hindi Literature' }
};

const SCIENCE_CONTEXT_SUBJECTS = new Set(['science', 'physics', 'chemistry', 'biology']);

const SCIENCE_BRANCH_NAME_MAP: Record<string, ScienceSubcategory> = {
  physics: 'Physics',
  chemistry: 'Chemistry',
  biology: 'Biology'
};

export function detectScienceChapterMeta(
  item: Partial<StudyMaterial>
): ScienceChapterMeta | null {
  const classTrimmed = (item.class || '').trim();
  // Preserve Class 11 & Class 12 standalone Physics, Chemistry, and Biology subjects
  if (/^class\s*1[12]\b/i.test(classTrimmed)) {
    return null;
  }

  const subjectLower = (item.subject || '').trim().toLowerCase();
  if (NON_SCIENCE_SUBJECTS.has(subjectLower)) {
    return null;
  }

  const chapterTrimmed = (item.chapter || '').trim();
  // Skip multi-chapter ranges or pre-labelled multi-topic formula sheets (e.g. "Chemistry: Chapters 1-4", "Physics: Light & Electricity")
  if (
    /\bchapters?\s*\d+\s*(?:&|and|-|–|to)\s*\d+\b/i.test(chapterTrimmed) ||
    (/^(?:physics|chemistry|biology)\s*[:·\-–]/i.test(chapterTrimmed) &&
      !/\bchapter\s*\d+\b/i.test(chapterTrimmed))
  ) {
    return null;
  }

  const primaryText = [item.title, item.chapter, item.file, item.slug]
    .filter(Boolean)
    .join(' ');

  if (!primaryText.trim()) return null;

  // Skip full-syllabus combined Science papers/notes from single-chapter classification
  if (/\bfull\s*(?:science\s*)?syllabus\b|\ball\s*chapters\b/i.test(primaryText)) {
    return null;
  }

  const isSpecificClass = /^class\s*\d+\b/i.test(classTrimmed);
  const classLower = classTrimmed.toLowerCase();
  const isScienceContext =
    SCIENCE_CONTEXT_SUBJECTS.has(subjectLower) ||
    /\b(?:science|sci|physics|phy|chemistry|chem|biology|bio)\b/i.test(primaryText);

  for (const meta of CBSE_SCIENCE_CHAPTERS) {
    if (isSpecificClass && meta.className.toLowerCase() !== classLower) {
      continue;
    }
    if (meta.requiresScienceContext && !isScienceContext) {
      continue;
    }
    if (meta.pattern.test(primaryText)) {
      return meta;
    }
  }
  return null;
}

export function classifyScienceSubcategory(
  item: Partial<StudyMaterial>
): ScienceSubcategory | null {
  const subjectLower = (item.subject || '').trim().toLowerCase();
  if (NON_SCIENCE_SUBJECTS.has(subjectLower)) {
    return null;
  }

  const chapterMeta = detectScienceChapterMeta(item);
  if (chapterMeta) return chapterMeta.subcategory;

  if (SCIENCE_BRANCH_NAME_MAP[subjectLower]) {
    return SCIENCE_BRANCH_NAME_MAP[subjectLower];
  }

  const titleAndChapter = [item.title, item.chapter].filter(Boolean).join(' ');
  const primaryText = [
    item.title,
    item.chapter,
    ...(item.tags || []),
    ...(item.keywords || [])
  ]
    .filter(Boolean)
    .join(' ');

  if (!primaryText.trim()) return null;

  // Detect explicit branch labels; combined multi-branch full-syllabus items stay under "All"
  const matchedBranches: ScienceSubcategory[] = [];
  if (/\bphysics\b/i.test(primaryText)) matchedBranches.push('Physics');
  if (/\bbiology\b/i.test(primaryText)) matchedBranches.push('Biology');
  if (/\bchemistry\b/i.test(primaryText)) matchedBranches.push('Chemistry');

  if (matchedBranches.length > 1) {
    return null;
  }
  if (matchedBranches.length === 1) {
    return matchedBranches[0];
  }

  // Skip full-syllabus / combined Science packs with no branch specifier
  if (
    /\bfull\s*(?:science\s*)?syllabus\b|\ball\s*chapters\b|\bmost\s*repeated\s*board\s*questions\b|\bassertion[\s-]*reason(?:ing)?\b/i.test(
      titleAndChapter
    )
  ) {
    return null;
  }

  // Evaluate unambiguous discipline keywords (covers Class 6-8 NCERT Science chapters & custom notes)
  if (
    /\b(?:chemical\s*reactions?|acids?[\s,&]+bases?|metals?\s*(?:&|and)\s*non[\s-]*metals?|carbon\s*(?:&|and)\s*(?:its\s*)?compounds?|periodic\s*classification|matter\s*in\s*our\s*surroundings?|matter\s*around\s*us\s*pure|atoms?\s*(?:&|and)\s*molecules?|structure\s*of\s*(?:the\s*)?atoms?|physical\s*(?:&|and)\s*chemical\s*changes?|synthetic\s*fibres?|coal\s*(?:&|and)\s*petroleum|combustion\s*(?:&|and)\s*flame|valency|mole\s*concept|redox|reactivity\s*series)\b/i.test(
      primaryText
    )
  ) {
    return 'Chemistry';
  }
  if (
    /\b(?:life\s*process(?:es)?|control\s*(?:&|and)\s*co[\s-]*ordination|reproduc(?:e|tion)|heredity|evolution|our\s*environment|fundamental\s*unit\s*of\s*life|cell\s*organelles?|tissues?|diversity\s*in\s*living|why\s*do\s*we\s*fall\s*ill|improvement\s*in\s*food|crop\s*production|microorganisms?|conservation\s*of\s*plants|adolescence|nutrition\s*in\s*(?:plants|animals)|respiration\s*in\s*organisms|transportation\s*in\s*animals|human\s*heart|nephron|photosynthesis|organisms?)\b/i.test(
      primaryText
    )
  ) {
    return 'Biology';
  }
  if (
    /\b(?:light|reflection|refraction|human\s*eye|electricity|electric\s*current|magnetic\s*effects?|sources?\s*of\s*energy|motion|force\s*(?:&|and)\s*(?:pressure|laws)|gravitation|work\s*(?:&|and)\s*energy|sound|friction|heat|optics|ray\s*diagrams?|numericals?|derivations?|some\s*natural\s*phenomena)\b/i.test(
      primaryText
    )
  ) {
    return 'Physics';
  }

  return null;
}

/**
 * Normalize legacy misclassified study materials:
 * - Unify "Social Studies" / "SST" / SST branch subjects -> "Social Science"
 * - Auto-categorize CBSE Class 10 Social Science chapters into History / Geography / Civics / Economics
 * - Auto-categorize CBSE Class 9 & Class 10 Science chapters into Physics / Biology / Chemistry
 * - NCERT textbook chapter PDFs from NOTES/QUESTION_BANK -> PDF / BOOK
 * - Official CBSE Question Bank PDFs from QUESTION_BANK (Important Questions) -> OTHER
 */
const SST_BRANCH_NAME_MAP: Record<string, SocialScienceSubcategory> = {
  history: 'History',
  geography: 'Geography',
  civics: 'Civics',
  'political science': 'Civics'
};

export function normalizeStudyMaterial(item: StudyMaterial): StudyMaterial {
  let baseItem: StudyMaterial = item;

  const rawSubjectLower = (baseItem.subject || '').trim().toLowerCase();
  const explicitSstBranch = SST_BRANCH_NAME_MAP[rawSubjectLower];
  if (explicitSstBranch) {
    const existingTags = Array.isArray(baseItem.tags) ? baseItem.tags : [];
    const hasBranchTag = existingTags.some(
      (t) => t.trim().toLowerCase() === explicitSstBranch.toLowerCase()
    );
    baseItem = {
      ...baseItem,
      subject: 'Social Science',
      tags: hasBranchTag ? existingTags : [...existingTags, explicitSstBranch]
    };
  }

  const normalizedSubject = normalizeStudyMaterialSubject(baseItem.subject);
  if (normalizedSubject && normalizedSubject !== baseItem.subject) {
    baseItem = { ...baseItem, subject: normalizedSubject };
  }

  const sstChapterMeta = detectSocialScienceChapterMeta(baseItem);
  if (sstChapterMeta) {
    const existingTags = Array.isArray(baseItem.tags) ? baseItem.tags : [];
    const hasSubcatTag = existingTags.some(
      (t) => t.trim().toLowerCase() === sstChapterMeta.subcategory.toLowerCase()
    );
    const nextTags = hasSubcatTag
      ? existingTags
      : [...existingTags, sstChapterMeta.subcategory];

    let nextChapter = (baseItem.chapter || '').trim();
    const hasDisciplinePrefix = /^(?:history|geography|civics|economics)\s*[·:\-–]/i.test(
      nextChapter
    );
    if (!nextChapter || !hasDisciplinePrefix) {
      nextChapter = sstChapterMeta.boardNote
        ? `${sstChapterMeta.canonicalChapter} (${sstChapterMeta.boardNote})`
        : sstChapterMeta.canonicalChapter;
    } else if (
      sstChapterMeta.boardNote &&
      !/2026|not\s*(?:coming|in)|map\s*work/i.test(nextChapter)
    ) {
      nextChapter = `${nextChapter} (${sstChapterMeta.boardNote})`;
    }

    const nextSubject =
      !baseItem.subject ||
      SST_CONTEXT_SUBJECTS.has(baseItem.subject.trim().toLowerCase()) ||
      !NON_SST_SUBJECTS.has(baseItem.subject.trim().toLowerCase())
        ? 'Social Science'
        : baseItem.subject;

    baseItem = {
      ...baseItem,
      subject: nextSubject,
      chapter: nextChapter,
      tags: nextTags
    };
  } else if (
    (baseItem.subject || '').trim().toLowerCase() === 'economics' &&
    /^class\s*(?:9|10)\b/i.test(baseItem.class || '')
  ) {
    const existingTags = Array.isArray(baseItem.tags) ? baseItem.tags : [];
    const hasEconTag = existingTags.some((t) => t.trim().toLowerCase() === 'economics');
    baseItem = {
      ...baseItem,
      subject: 'Social Science',
      tags: hasEconTag ? existingTags : [...existingTags, 'Economics']
    };
  }

  const scienceChapterMeta = detectScienceChapterMeta(baseItem);
  if (scienceChapterMeta) {
    const existingTags = Array.isArray(baseItem.tags) ? baseItem.tags : [];
    const hasSubcatTag = existingTags.some(
      (t) => t.trim().toLowerCase() === scienceChapterMeta.subcategory.toLowerCase()
    );
    const nextTags = hasSubcatTag
      ? existingTags
      : [...existingTags, scienceChapterMeta.subcategory];

    let nextChapter = (baseItem.chapter || '').trim();
    const hasDisciplinePrefix = /^(?:physics|biology|chemistry)\s*[·:\-–]/i.test(
      nextChapter
    );
    if (!nextChapter || !hasDisciplinePrefix) {
      nextChapter = scienceChapterMeta.boardNote
        ? `${scienceChapterMeta.canonicalChapter} (${scienceChapterMeta.boardNote})`
        : scienceChapterMeta.canonicalChapter;
    } else if (
      scienceChapterMeta.boardNote &&
      !/2026|not\s*(?:coming|in)|internal\s*assessment/i.test(nextChapter)
    ) {
      nextChapter = `${nextChapter} (${scienceChapterMeta.boardNote})`;
    }

    baseItem = {
      ...baseItem,
      subject: 'Science',
      chapter: nextChapter,
      tags: nextTags
    };
  } else {
    const lowerSub = (baseItem.subject || '').trim().toLowerCase();
    const branchLabel = SCIENCE_BRANCH_NAME_MAP[lowerSub];
    if (branchLabel && /^class\s*(?:[1-9]|10)\b/i.test(baseItem.class || '')) {
      const existingTags = Array.isArray(baseItem.tags) ? baseItem.tags : [];
      const hasBranchTag = existingTags.some(
        (t) => t.trim().toLowerCase() === branchLabel.toLowerCase()
      );
      baseItem = {
        ...baseItem,
        subject: 'Science',
        tags: hasBranchTag ? existingTags : [...existingTags, branchLabel]
      };
    }
  }

  const languageSubcatMeta = LANGUAGE_SUBCATEGORY_PARENT_MAP[(baseItem.subject || '').trim().toLowerCase()];
  if (languageSubcatMeta) {
    const existingTags = Array.isArray(baseItem.tags) ? baseItem.tags : [];
    const seen = new Set(existingTags.map((t) => t.trim().toLowerCase()));
    const nextTags = [...existingTags];
    if (!seen.has(languageSubcatMeta.parent.toLowerCase())) {
      nextTags.push(languageSubcatMeta.parent);
      seen.add(languageSubcatMeta.parent.toLowerCase());
    }
    if (!seen.has(languageSubcatMeta.label.toLowerCase())) {
      nextTags.push(languageSubcatMeta.label);
    }
    if (nextTags.length !== existingTags.length || baseItem.subject !== languageSubcatMeta.label) {
      baseItem = {
        ...baseItem,
        subject: languageSubcatMeta.label,
        tags: nextTags
      };
    }
  }

  const url = (baseItem.fileUrl || '').toLowerCase();
  if (
    (isNcertTextbookChapter(baseItem) && baseItem.materialType === 'NOTES') ||
    (baseItem.materialType === 'QUESTION_BANK' && url.includes('ncert.nic.in/textbook/pdf/'))
  ) {
    return {
      ...baseItem,
      materialType: 'PDF',
      category:
        baseItem.category === 'NOTES' || baseItem.category === 'QUESTION_PAPER' || !baseItem.category
          ? 'BOOK'
          : baseItem.category
    };
  }
  if (baseItem.materialType === 'QUESTION_BANK' && isExternalQuestionBankResource(baseItem)) {
    return {
      ...baseItem,
      materialType: 'OTHER'
    };
  }
  return baseItem;
}

/**
 * Ensure newly added featured or bundled local seed materials (e.g., official Board 2027
 * and chapter-wise Important Questions PDFs) are automatically merged into existing
 * local/cloud libraries unless explicitly deleted by staff.
 */
export function mergeFeaturedSeedStudyMaterials(list: StudyMaterial[]): StudyMaterial[] {
  const normalizedList = (list || []).map(normalizeStudyMaterial);
  const deletedIds = getDeletedMaterialIdSet();
  const seedCurated = SEED_STUDY_MATERIALS.filter(
    (s) => s.isFeatured || Boolean(s.fileUrl && s.fileUrl.startsWith('/assets/aistudio/'))
  ).map(normalizeStudyMaterial);
  const seedCuratedById = new Map<string, StudyMaterial>();
  seedCurated.forEach((item) => {
    seedCuratedById.set(item.id, item);
    if (item.materialId) seedCuratedById.set(item.materialId, item);
  });

  const existingIds = new Set<string>();
  const hydrated = normalizedList.map((item) => {
    if (item.id) existingIds.add(item.id);
    if (item.materialId) existingIds.add(item.materialId);
    const matchingSeed =
      seedCuratedById.get(item.id) ||
      (item.materialId ? seedCuratedById.get(item.materialId) : undefined);
    if (matchingSeed) {
      return {
        ...item,
        isFeatured: item.isFeatured !== undefined ? item.isFeatured : matchingSeed.isFeatured,
        highlightBadge: item.highlightBadge || matchingSeed.highlightBadge,
        pageCount: item.pageCount || matchingSeed.pageCount,
        fileFormat: item.fileFormat || matchingSeed.fileFormat
      };
    }
    return item;
  });

  const missingCurated = seedCurated.filter(
    (item) =>
      !existingIds.has(item.id) &&
      (!item.materialId || !existingIds.has(item.materialId)) &&
      !deletedIds.has(item.id) &&
      (!item.materialId || !deletedIds.has(item.materialId))
  );

  return missingCurated.length > 0 ? [...missingCurated, ...hydrated] : hydrated;
}

/**
 * Fetch all study materials
 */
export async function getStudyMaterials(): Promise<StudyMaterial[]> {
  try {
    const list = await SyncService.list<StudyMaterial>(COLLECTION_NAME);
    if (Array.isArray(list) && list.length > 0) {
      const cleanedList = list.filter((m) => !m.fileUrl?.includes('dummy.pdf'));
      const sourceList = cleanedList.length > 0 ? cleanedList : SEED_STUDY_MATERIALS;
      const mapped = sourceList.map((data) => normalizeStudyMaterial({
        ...data,
        id: data.id,
        materialId: data.materialId || data.id,
        desc: data.description || data.desc || '',
        file: data.file || data.fileUrl || '',
        category: data.category || (data.materialType === 'NOTES' ? 'NOTES' : data.materialType === 'PDF' ? 'BOOK' : 'QUESTION_PAPER')
      }));
      return mergeFeaturedSeedStudyMaterials(mapped);
    }
  } catch (err) {
    console.warn('Study materials fetch error:', err);
  }
  
  return SEED_STUDY_MATERIALS.map(normalizeStudyMaterial);
}

/**
 * Fetch public published study materials for website visitors
 */
export async function getPublicStudyMaterials(): Promise<StudyMaterial[]> {
  try {
    const list = await SyncService.list<StudyMaterial>(COLLECTION_NAME);
    if (Array.isArray(list) && list.length > 0) {
      const cleanedList = list.filter((m) => !m.fileUrl?.includes('dummy.pdf'));
      const sourceList = cleanedList.length > 0 ? cleanedList : SEED_STUDY_MATERIALS;
      return mergeFeaturedSeedStudyMaterials(sourceList)
        .filter((m) => (m.isPublic === undefined || m.isPublic) && (m.status === undefined || m.status === 'PUBLISHED'));
    }
  } catch (err) {
    console.warn('Error fetching public study materials:', err);
  }
  return SEED_STUDY_MATERIALS.map(normalizeStudyMaterial).filter((m) => m.isPublic && m.status === 'PUBLISHED');
}

export function inferCategoryFromType(materialType?: StudyMaterialType): StudyMaterial['category'] {
  if (materialType === 'NOTES') return 'NOTES';
  if (materialType === 'PDF') return 'BOOK';
  return 'QUESTION_PAPER';
}

/**
 * Create or save a new study material
 */
export async function createStudyMaterial(
  materialData: Omit<StudyMaterial, 'id' | 'createdAt' | 'updatedAt' | 'downloadCount' | 'viewCount'> & {
    id?: string;
  }
): Promise<StudyMaterial> {
  const newId = materialData.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `mat-${Date.now()}`);
  const now = new Date().toISOString();
  const slug = materialData.slug || generateSlug(materialData.title);
  const materialType = materialData.materialType || 'NOTES';

  const fullMaterial: StudyMaterial = normalizeStudyMaterial({
    id: newId,
    materialId: newId,
    title: materialData.title,
    slug,
    description: materialData.description || materialData.desc || '',
    desc: materialData.description || materialData.desc || '',
    class: materialData.class,
    subject: materialData.subject,
    chapter: materialData.chapter || '',
    materialType,
    category: materialData.category || inferCategoryFromType(materialType),
    file: materialData.file || '',
    size: materialData.size || '1.0 MB',
    fileFormat: materialData.fileFormat,
    pageCount: materialData.pageCount,
    fileUrl: materialData.fileUrl || '',
    thumbnailUrl: materialData.thumbnailUrl || '',
    youtubeUrl: materialData.youtubeUrl || '',
    externalUrl: materialData.externalUrl || '',
    fileData: materialData.fileData || '',
    isPublic: materialData.isPublic !== undefined ? materialData.isPublic : true,
    isFeatured: materialData.isFeatured,
    highlightBadge: materialData.highlightBadge,
    status: materialData.status || 'PUBLISHED',
    downloadCount: 0,
    viewCount: 0,
    tags: materialData.tags || [],
    seoTitle: materialData.seoTitle || `${materialData.title} PDF - Sunshine Classes`,
    metaDescription: materialData.metaDescription || materialData.description || materialData.title,
    keywords: materialData.keywords || materialData.tags || [],
    createdBy: materialData.createdBy || 'Admin',
    uploadedBy: materialData.uploadedBy || materialData.createdBy || 'Admin',
    createdAt: now,
    updatedAt: now,
    date: materialData.date || now.split('T')[0]
  });

  try {
    await SyncService.set(COLLECTION_NAME, newId, fullMaterial);
    await SyncService.processTransactionLog().catch(() => {});
  } catch (err) {
    console.error('Error saving study material:', err);
  }

  return fullMaterial;
}

/**
 * Update an existing study material
 */
export async function updateStudyMaterial(
  id: string,
  updates: Partial<StudyMaterial>
): Promise<void> {
  const now = new Date().toISOString();
  const payload: Partial<StudyMaterial> = {
    ...updates,
    updatedAt: now
  };

  if (updates.title && !updates.slug) {
    payload.slug = generateSlug(updates.title);
  }
  if (updates.materialType && !updates.category) {
    payload.category = inferCategoryFromType(updates.materialType);
  }

  try {
    await SyncService.update(COLLECTION_NAME, id, payload);
    await SyncService.processTransactionLog().catch(() => {});
  } catch (err) {
    console.error(`Error updating study material ${id}:`, err);
  }
}

/**
 * Delete a study material by ID
 */
export async function deleteStudyMaterial(id: string): Promise<void> {
  recordDeletedMaterialIds([id]);
  try {
    await SyncService.delete(COLLECTION_NAME, id);
  } catch (err) {
    console.error(`Error deleting study material ${id}:`, err);
  }
}

/**
 * Bulk delete study materials
 */
export async function bulkDeleteStudyMaterials(ids: string[]): Promise<void> {
  recordDeletedMaterialIds(ids);
  for (const id of ids) {
    await SyncService.delete(COLLECTION_NAME, id);
  }
}

/**
 * Bulk update status (Publish / Unpublish / Archive)
 */
export async function bulkUpdateStatus(
  ids: string[],
  status: StudyMaterialStatus,
  isPublic?: boolean
): Promise<void> {
  const now = new Date().toISOString();
  for (const id of ids) {
    const updateData: any = { status, updatedAt: now };
    if (isPublic !== undefined) {
      updateData.isPublic = isPublic;
    }
    await SyncService.update(COLLECTION_NAME, id, updateData);
  }
}

/**
 * Increment view count
 */
export async function incrementViewCount(id: string): Promise<void> {
  try {
    const item = await SyncService.get<StudyMaterial>(COLLECTION_NAME, id);
    if (item) {
      await SyncService.update(COLLECTION_NAME, id, {
        viewCount: (item.viewCount || 0) + 1
      });
    }
  } catch (err) {
    console.warn(`Could not increment view count for ${id}:`, err);
  }
}

/**
 * Increment download count and set lastDownloaded
 */
export async function incrementDownloadCount(id: string): Promise<void> {
  const now = new Date().toISOString();
  try {
    const item = await SyncService.get<StudyMaterial>(COLLECTION_NAME, id);
    if (item) {
      await SyncService.update(COLLECTION_NAME, id, {
        downloadCount: (item.downloadCount || 0) + 1,
        lastDownloaded: now
      });
    }
  } catch (err) {
    console.warn(`Could not increment download count for ${id}:`, err);
  }
}
