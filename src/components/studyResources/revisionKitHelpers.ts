import { StudyMaterial } from '../../types';
import {
  extractChapterOrderNumber,
  getCategoryPriorityIndex,
  getResourceCategoryId,
  LibraryCategoryId,
  matchesClassFilter
} from './resourceMeta';

export type RevisionKitPreset = 'exam-sprint' | 'papers-pyqs' | 'complete-pack' | 'custom';

export interface RevisionKitPresetMeta {
  id: Exclude<RevisionKitPreset, 'custom'>;
  label: string;
  description: string;
  maxItems: number;
  allowedCategories: LibraryCategoryId[];
}

export interface SavedRevisionKit {
  title: string;
  className: string;
  subjects: string[];
  preset: RevisionKitPreset;
  itemIds: string[];
  completedIds: string[];
  updatedAt: string;
}

export const REVISION_KIT_PRESETS: RevisionKitPresetMeta[] = [
  {
    id: 'exam-sprint',
    label: 'Board Exam Sprint',
    description: 'Important questions, sample papers, PYQs & formula sheets',
    maxItems: 12,
    allowedCategories: ['QUESTION_BANK', 'SAMPLE_PAPER', 'PYQ', 'FORMULA_SHEET', 'WORKSHEET']
  },
  {
    id: 'papers-pyqs',
    label: 'Practice Papers & PYQs',
    description: 'Model papers, past board exams & graded practice sets',
    maxItems: 15,
    allowedCategories: ['SAMPLE_PAPER', 'PYQ', 'QUESTION_BANK', 'WORKSHEET', 'ASSIGNMENT']
  },
  {
    id: 'complete-pack',
    label: 'Complete Chapter Pack',
    description: 'Exam papers, formulas, worksheets, chapter notes & NCERT books',
    maxItems: 20,
    allowedCategories: [
      'QUESTION_BANK',
      'SAMPLE_PAPER',
      'PYQ',
      'FORMULA_SHEET',
      'WORKSHEET',
      'ASSIGNMENT',
      'SYLLABUS',
      'LAB_MANUAL',
      'OTHER',
      'NOTES',
      'PDF'
    ]
  }
];

export const getMaterialPrimaryId = (item: StudyMaterial): string =>
  String(item.id || item.materialId || item.slug || '');

export const buildCuratedRevisionKit = (
  materials: StudyMaterial[],
  options: {
    className: string;
    subjects: string[];
    preset: Exclude<RevisionKitPreset, 'custom'>;
  }
): { items: StudyMaterial[]; title: string } => {
  const presetMeta =
    REVISION_KIT_PRESETS.find((p) => p.id === options.preset) || REVISION_KIT_PRESETS[0];
  const subjectSet = new Set(options.subjects.filter(Boolean));
  const allowedCatSet = new Set<LibraryCategoryId>(presetMeta.allowedCategories);

  const classAndSubjectScoped = materials.filter((item) => {
    if (!matchesClassFilter(item.class, options.className)) return false;
    if (subjectSet.size > 0 && !subjectSet.has(item.subject)) return false;
    return true;
  });

  const preferredMatches = classAndSubjectScoped.filter((item) =>
    allowedCatSet.has(getResourceCategoryId(item))
  );

  // Fall back to all matching class/subject resources if strict preset categories have 0 items
  const pool = preferredMatches.length > 0 ? preferredMatches : classAndSubjectScoped;

  const sorted = [...pool].sort((a, b) => {
    const prioA = getCategoryPriorityIndex(a);
    const prioB = getCategoryPriorityIndex(b);
    if (prioA !== prioB) return prioA - prioB;

    const chA = extractChapterOrderNumber(a);
    const chB = extractChapterOrderNumber(b);
    if (chA !== chB) return chA - chB;

    return a.title.localeCompare(b.title);
  });

  const selected = sorted.slice(0, presetMeta.maxItems);

  const classPrefix = options.className && options.className !== 'ALL' ? `${options.className} ` : '';
  const subjectSuffix =
    options.subjects.length === 1 ? `${options.subjects[0]} ` : '';
  const title = `${classPrefix}${subjectSuffix}${presetMeta.label}`.trim();

  return { items: selected, title };
};

const getPublicResourcesBaseUrl = (): string => {
  if (typeof window === 'undefined') return 'https://sunshineclasses.in/resources';
  return `${window.location.origin}/resources`;
};

export const buildResourceShareUrl = (item: StudyMaterial): string => {
  const base = getPublicResourcesBaseUrl();
  const docKey = item.slug || item.id || item.materialId || '';
  const params = new URLSearchParams();
  if (docKey) params.set('doc', docKey);
  if (item.class && item.class !== 'ALL') params.set('class', item.class);
  return `${base}?${params.toString()}`;
};

export const buildKitShareUrl = (
  itemIds: string[],
  title?: string,
  className?: string
): string => {
  const base = getPublicResourcesBaseUrl();
  const cleanIds = Array.from(new Set(itemIds.filter(Boolean))).slice(0, 25);
  const params = new URLSearchParams();
  if (cleanIds.length > 0) params.set('kit', cleanIds.join(','));
  if (title && title.trim()) params.set('kitTitle', title.trim().slice(0, 80));
  if (className && className !== 'ALL') params.set('class', className);
  return `${base}?${params.toString()}`;
};

export const buildResourceWhatsAppHref = (item: StudyMaterial): string => {
  const url = buildResourceShareUrl(item);
  const metaParts = [item.class, item.subject].filter(Boolean).join(' · ');
  const message = `${item.title}${metaParts ? ` (${metaParts})` : ''}\nStudy resource on Sunshine Classes:\n${url}`;
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
};

export const buildKitWhatsAppHref = (
  itemIds: string[],
  title: string,
  className?: string
): string => {
  const url = buildKitShareUrl(itemIds, title, className);
  const count = Math.min(itemIds.length, 25);
  const message = `${title} (${count} ${count === 1 ? 'study resource' : 'study resources'})\nOpen this Sunshine Classes revision kit:\n${url}`;
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
};

export const copyTextToClipboard = async (text: string): Promise<boolean> => {
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback below
    }
  }
  if (typeof document === 'undefined') return false;
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
};

export const resolveMaterialByDocParam = (
  materials: StudyMaterial[],
  docParam: string
): StudyMaterial | undefined => {
  const target = docParam.trim().toLowerCase();
  if (!target) return undefined;
  return materials.find(
    (m) =>
      (m.slug && m.slug.toLowerCase() === target) ||
      (m.id && m.id.toLowerCase() === target) ||
      (m.materialId && m.materialId.toLowerCase() === target)
  );
};

export const resolveMaterialsByKitParam = (
  materials: StudyMaterial[],
  kitParam: string
): { items: StudyMaterial[]; missingCount: number } => {
  const rawTokens = kitParam
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 25);

  const byKey = new Map<string, StudyMaterial>();
  materials.forEach((m) => {
    if (m.id) byKey.set(m.id.toLowerCase(), m);
    if (m.materialId) byKey.set(m.materialId.toLowerCase(), m);
    if (m.slug) byKey.set(m.slug.toLowerCase(), m);
  });

  const resolved: StudyMaterial[] = [];
  const addedIds = new Set<string>();
  let missingCount = 0;

  rawTokens.forEach((token) => {
    const found = byKey.get(token.toLowerCase());
    if (found) {
      const pid = getMaterialPrimaryId(found);
      if (pid && !addedIds.has(pid)) {
        addedIds.add(pid);
        resolved.push(found);
      }
    } else {
      missingCount += 1;
    }
  });

  return { items: resolved, missingCount };
};
