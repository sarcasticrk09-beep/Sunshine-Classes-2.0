import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Download,
  FolderOpen,
  LayoutGrid,
  Link2,
  Lock,
  LogIn,
  RefreshCw,
  Search,
  Share2,
  ShieldAlert,
  Star,
  Unlock,
  Upload,
  X
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { FormulaSheetsData } from '../data/formulaSheetsData';
import {
  incrementDownloadCount,
  incrementViewCount,
  mergeFeaturedSeedStudyMaterials,
  normalizeStudyMaterial
} from '../services/studyMaterialService';
import { SyncService } from '../services/SyncService';
import { safeSetItem } from '../utils/safeLocalStorage';
import { StudyMaterial, User } from '../types';
import { ResourceDirectoryRow } from './studyResources/ResourceDirectoryRow';
import {
  CLASS_PRIORITY,
  extractChapterInfo,
  extractChapterOrderNumber,
  extractSearchSuggestions,
  formatSubjectDropdownLabel,
  getCategoryMeta,
  getCategoryPriorityIndex,
  getSubjectSubcategoryOrder,
  getSubjectSubcategories,
  getSubjectVisualMeta,
  LIBRARY_CATEGORIES,
  mapCategoryIdToMaterialType,
  matchesClassFilter,
  matchesImportantQuestionsSubject,
  matchesLibraryCategory,
  matchesSearchQuery,
  matchesSubjectFilter,
  matchesSubjectSubcategory,
  orderSubjectsByPriority,
  sanitizeElementId,
  StudyResourceSortMode,
  SUBJECT_FILTER_DROPDOWN_OPTIONS
} from './studyResources/resourceMeta';
import { ResourcePdfPreviewModal } from './studyResources/ResourcePdfPreviewModal';
import { RevisionKitModal } from './studyResources/RevisionKitModal';
import {
  buildKitShareUrl,
  buildKitWhatsAppHref,
  copyTextToClipboard,
  getMaterialPrimaryId,
  resolveMaterialByDocParam,
  resolveMaterialsByKitParam,
  SavedRevisionKit
} from './studyResources/revisionKitHelpers';
import { StudyMaterialUploadModal } from './studyResources/StudyMaterialUploadModal';

export type LibraryNavTab = 'browse' | 'saved' | 'downloads';

export interface StudyResourcesWorkspaceProps {
  materials: StudyMaterial[];
  loading?: boolean;
  hasError?: boolean;
  onRetry?: () => void;
  currentUser?: User | null;
  variant?: 'public' | 'embedded-public' | 'student';
  defaultClass?: string;
  initialCategory?: string;
  initialDocParam?: string;
  initialKitParam?: string;
  initialKitTitle?: string;
  headerTitle?: string;
  headerSubtitle?: string;
  cachedIds?: string[];
  onMarkDownloaded?: (item: StudyMaterial) => void;
  onNavigateHome?: () => void;
  onOpenLoginModal?: () => void;
  onActiveResourceChange?: (material: StudyMaterial | null, activeCategory?: string) => void;
  onCategoryChange?: (categoryId: string) => void;
  onAuditLog?: (action: string, details: string) => void;
  storageKeyPrefix?: string;
}

const DIRECTORY_PAGE_SIZE = 24;

export const StudyResourcesWorkspace: React.FC<StudyResourcesWorkspaceProps> = ({
  materials,
  loading = false,
  hasError = false,
  onRetry,
  currentUser = null,
  variant = 'public',
  defaultClass = 'ALL',
  initialCategory = 'ALL',
  initialDocParam = '',
  initialKitParam = '',
  initialKitTitle = '',
  headerTitle = 'Study Resources',
  headerSubtitle = 'Your complete digital learning library',
  cachedIds = [],
  onMarkDownloaded,
  onNavigateHome,
  onOpenLoginModal,
  onActiveResourceChange,
  onCategoryChange,
  onAuditLog,
  storageKeyPrefix = 'public'
}) => {
  const bookmarkStorageKey = `sunshine_bookmarked_resources_${storageKeyPrefix}`;
  const downloadHistoryKey = `sunshine_downloaded_resources_${storageKeyPrefix}`;
  const revisionKitStorageKey = `sunshine_revision_kit_${storageKeyPrefix}`;

  const [localMaterials, setLocalMaterials] = useState<StudyMaterial[]>(() =>
    mergeFeaturedSeedStudyMaterials(materials)
  );
  useEffect(() => {
    setLocalMaterials(mergeFeaturedSeedStudyMaterials(materials));
  }, [materials]);

  useEffect(() => {
    const unsubscribe = SyncService.subscribe('study_materials', (docId, data) => {
      if (docId === '*' && Array.isArray(data)) {
        setLocalMaterials(mergeFeaturedSeedStudyMaterials(data));
        return;
      }
      if (data === null) {
        setLocalMaterials((prev) =>
          prev.filter((m) => m.id !== docId && m.materialId !== docId)
        );
      } else if (data && typeof data === 'object' && !Array.isArray(data)) {
        const normalized = normalizeStudyMaterial(data as StudyMaterial);
        setLocalMaterials((prev) => {
          const targetId = docId || normalized.id || normalized.materialId;
          const idx = prev.findIndex((m) => m.id === targetId || m.materialId === targetId);
          if (idx > -1) {
            const next = [...prev];
            next[idx] = normalizeStudyMaterial({ ...next[idx], ...normalized });
            return next;
          }
          return [normalized, ...prev];
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const canStaffUpload = Boolean(
    currentUser &&
      ['ADMIN', 'SUPER_ADMIN', 'FOUNDER', 'CO_FOUNDER', 'TEACHER'].includes(
        String(currentUser.role).toUpperCase()
      )
  );

  // Consolidated 3-Tab Navigation + Drill-down State
  const [activeNavTab, setActiveNavTab] = useState<LibraryNavTab>('browse');
  const [selectedClass, setSelectedClass] = useState<string>(defaultClass || 'ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'ALL');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('ALL');
  const [viewCategoryFilesDirectly, setViewCategoryFilesDirectly] = useState(false);

  // Search, Filters & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [chapterFilter, setChapterFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<StudyResourceSortMode>('modified');
  const [showUpcomingCategories, setShowUpcomingCategories] = useState<boolean>(false);
  const [visibleLimit, setVisibleLimit] = useState<number>(DIRECTORY_PAGE_SIZE);

  // Persistent Bookmarks & Downloads
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const parsed = JSON.parse(localStorage.getItem(bookmarkStorageKey) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [localDownloadedIds, setLocalDownloadedIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const parsed = JSON.parse(localStorage.getItem(downloadHistoryKey) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  // Preview, Access Guard, Revision Kit, Quick Upload & Toast State
  const [previewMaterial, setPreviewMaterial] = useState<StudyMaterial | null>(null);
  const [restrictedModalMaterial, setRestrictedModalMaterial] = useState<StudyMaterial | null>(null);
  const [isQuickUploadOpen, setIsQuickUploadOpen] = useState<boolean>(false);
  const [isRevisionKitOpen, setIsRevisionKitOpen] = useState<boolean>(false);
  const [savedRevisionKit, setSavedRevisionKit] = useState<SavedRevisionKit | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(revisionKitStorageKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as SavedRevisionKit;
      if (parsed && Array.isArray(parsed.itemIds)) return parsed;
      return null;
    } catch {
      return null;
    }
  });
  const [sharedKitSession, setSharedKitSession] = useState<{
    kit: SavedRevisionKit;
    missingCount: number;
  } | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const handledDeepLinkRef = useRef<string>('');

  const prevInitialCategoryRef = useRef<string>(
    initialCategory && initialCategory !== 'ALL' ? initialCategory : 'ALL'
  );

  useEffect(() => {
    if (initialDocParam) return;
    const nextCategory = initialCategory && initialCategory !== 'ALL' ? initialCategory : 'ALL';
    if (prevInitialCategoryRef.current === nextCategory) return;
    prevInitialCategoryRef.current = nextCategory;
    if (selectedCategory === nextCategory) return;
    setActiveNavTab('browse');
    setSelectedCategory(nextCategory);
    setSelectedSubject('ALL');
    setSelectedSubcategory('ALL');
    setViewCategoryFilesDirectly(false);
    setChapterFilter('ALL');
    setVisibleLimit(DIRECTORY_PAGE_SIZE);
  }, [initialCategory, initialDocParam, selectedCategory]);

  useEffect(() => {
    if (defaultClass && defaultClass !== 'ALL') {
      setSelectedClass(defaultClass);
    }
  }, [defaultClass]);

  useEffect(() => {
    setSelectedSubcategory('ALL');
  }, [selectedClass, selectedCategory, selectedSubject, activeNavTab]);

  useEffect(() => {
    setVisibleLimit(DIRECTORY_PAGE_SIZE);
    setChapterFilter('ALL');
  }, [selectedClass, selectedCategory, selectedSubject, selectedSubcategory, activeNavTab, searchQuery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (previewMaterial) {
          setPreviewMaterial(null);
          onActiveResourceChange?.(null, selectedCategory);
        } else if (restrictedModalMaterial) {
          setRestrictedModalMaterial(null);
        } else if (isRevisionKitOpen) {
          setIsRevisionKitOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewMaterial, restrictedModalMaterial, isRevisionKitOpen, selectedCategory, onActiveResourceChange]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage((prev) => (prev === msg ? null : prev)), 2600);
  };

  // Visibility Guard
  const publishedMaterials = useMemo(() => {
    return localMaterials.filter(
      (m) => (m.status === 'PUBLISHED' || !m.status) && (currentUser ? true : m.isPublic !== false)
    );
  }, [localMaterials, currentUser]);

  const allDownloadedIds = useMemo(() => {
    return Array.from(new Set<string>([...cachedIds, ...localDownloadedIds]));
  }, [cachedIds, localDownloadedIds]);

  const savedCount = useMemo(() => {
    const validIds = new Set(publishedMaterials.map((m) => m.id || m.materialId));
    return bookmarkedIds.filter((id) => validIds.has(id)).length;
  }, [publishedMaterials, bookmarkedIds]);

  const downloadedCount = useMemo(() => {
    const validIds = new Set(publishedMaterials.map((m) => m.id || m.materialId));
    return allDownloadedIds.filter((id) => validIds.has(id)).length;
  }, [publishedMaterials, allDownloadedIds]);

  const activeKitProgress = useMemo(() => {
    const sourceKit = sharedKitSession?.kit || savedRevisionKit;
    if (!sourceKit || sourceKit.itemIds.length === 0) return null;
    const validIds = new Set(publishedMaterials.map(getMaterialPrimaryId));
    const existingIds = sourceKit.itemIds.filter((id) => validIds.has(id));
    if (existingIds.length === 0) return null;
    const doneCount = existingIds.filter((id) => sourceKit.completedIds.includes(id)).length;
    return { done: doneCount, total: existingIds.length };
  }, [sharedKitSession, savedRevisionKit, publishedMaterials]);

  // Hydrate deep-linked /resources/<category>/<slug>, ?doc=..., or ?kit=... URLs when materials load or route changes
  useEffect(() => {
    const deepLinkKey = `${initialCategory}|${initialDocParam}|${initialKitParam}|${initialKitTitle}`;
    if (!initialDocParam && !initialKitParam) {
      if (handledDeepLinkRef.current) {
        handledDeepLinkRef.current = '';
        setPreviewMaterial(null);
      }
      return;
    }
    if (loading || localMaterials.length === 0) return;
    if (handledDeepLinkRef.current === deepLinkKey) return;

    handledDeepLinkRef.current = deepLinkKey;

    if (initialDocParam) {
      const matched = resolveMaterialByDocParam(localMaterials, initialDocParam, initialCategory);
      if (matched) {
        const accessible = matched.isPublic !== false || Boolean(currentUser);
        if (accessible) {
          setPreviewMaterial(matched);
          incrementViewCount(matched.id).catch(() => {});
        } else {
          setRestrictedModalMaterial(matched);
        }
      } else {
        showToast('Shared document was not found');
      }
      return;
    }

    if (initialKitParam) {
      const { items, missingCount } = resolveMaterialsByKitParam(publishedMaterials, initialKitParam);
      if (items.length > 0) {
        const kitTitle = initialKitTitle.trim() || 'Shared Exam Revision Kit';
        const sharedKit: SavedRevisionKit = {
          title: kitTitle,
          className: defaultClass && defaultClass !== 'ALL' ? defaultClass : items[0].class || 'ALL',
          subjects: Array.from(new Set(items.map((m) => m.subject).filter(Boolean))),
          preset: 'custom',
          itemIds: items.map(getMaterialPrimaryId),
          completedIds: [],
          updatedAt: new Date().toISOString()
        };
        setSharedKitSession({ kit: sharedKit, missingCount });
        setIsRevisionKitOpen(true);
      } else {
        showToast('Shared revision kit has no available public files');
      }
    }
  }, [
    initialCategory,
    initialDocParam,
    initialKitParam,
    initialKitTitle,
    loading,
    localMaterials,
    publishedMaterials,
    currentUser,
    defaultClass
  ]);

  const availableClasses = useMemo(() => {
    const classSet = new Set<string>();
    publishedMaterials.forEach((m) => {
      if (m.class && m.class.trim()) classSet.add(m.class.trim());
    });
    if (defaultClass && defaultClass !== 'ALL') {
      classSet.add(defaultClass);
    }
    const ordered: string[] = ['ALL'];
    if (defaultClass && defaultClass !== 'ALL' && classSet.has(defaultClass)) {
      ordered.push(defaultClass);
    }
    CLASS_PRIORITY.forEach((cls) => {
      if (classSet.has(cls) && !ordered.includes(cls)) ordered.push(cls);
    });
    Array.from(classSet)
      .sort()
      .forEach((cls) => {
        if (!ordered.includes(cls)) ordered.push(cls);
      });
    return ordered;
  }, [publishedMaterials, defaultClass]);

  const classScopedMaterials = useMemo(() => {
    return publishedMaterials.filter((item) => matchesClassFilter(item.class, selectedClass));
  }, [publishedMaterials, selectedClass]);

  const featuredMaterials = useMemo(() => {
    return classScopedMaterials.filter((item) => item.isFeatured);
  }, [classScopedMaterials]);

  const categoriesWithCounts = useMemo(() => {
    return LIBRARY_CATEGORIES.map((cat) => {
      const count = classScopedMaterials.filter((item) => matchesLibraryCategory(item, cat.id)).length;
      return {
        ...cat,
        count
      };
    });
  }, [classScopedMaterials]);

  const activeCategories = useMemo(
    () => categoriesWithCounts.filter((c) => c.count > 0),
    [categoriesWithCounts]
  );

  const upcomingCategories = useMemo(
    () => categoriesWithCounts.filter((c) => c.count === 0),
    [categoriesWithCounts]
  );

  const categoryScopedMaterials = useMemo(() => {
    if (selectedCategory === 'ALL') return classScopedMaterials;
    return classScopedMaterials.filter((item) => matchesLibraryCategory(item, selectedCategory));
  }, [classScopedMaterials, selectedCategory]);

  const categorySubjects = useMemo(() => {
    const coreParents = ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi'];
    const subcategorySet = new Set(
      coreParents.flatMap((parent) =>
        getSubjectSubcategories(parent).map((sub) => sub.toLowerCase())
      )
    );

    if (selectedCategory === 'QUESTION_BANK') {
      const names = [...coreParents];
      categoryScopedMaterials.forEach((item) => {
        const sub = item.subject?.trim();
        if (!sub) return;
        const lower = sub.toLowerCase();
        if (
          !names.some((n) => n.toLowerCase() === lower) &&
          !subcategorySet.has(lower)
        ) {
          names.push(sub);
        }
      });
      return orderSubjectsByPriority(names).map((sub) => ({
        subject: sub,
        count: categoryScopedMaterials.filter((item) =>
          matchesImportantQuestionsSubject(item, sub)
        ).length
      }));
    }

    const map = new Map<string, number>();
    categoryScopedMaterials.forEach((item) => {
      const sub = item.subject?.trim();
      if (!sub) return;
      map.set(sub, (map.get(sub) || 0) + 1);
    });
    return orderSubjectsByPriority(Array.from(map.keys())).map((sub) => ({
      subject: sub,
      count: map.get(sub) || 0
    }));
  }, [categoryScopedMaterials, selectedCategory]);

  const workspaceSubjectScopeMaterials = useMemo(() => {
    if (activeNavTab === 'saved') {
      const savedSet = new Set(bookmarkedIds);
      return publishedMaterials.filter(
        (item) =>
          savedSet.has(item.id || item.materialId || '') &&
          matchesClassFilter(item.class, selectedClass) &&
          matchesSearchQuery(item, searchQuery)
      );
    }

    if (activeNavTab === 'downloads') {
      const dlSet = new Set(allDownloadedIds);
      return publishedMaterials.filter(
        (item) =>
          dlSet.has(item.id || item.materialId || '') &&
          matchesClassFilter(item.class, selectedClass) &&
          matchesSearchQuery(item, searchQuery)
      );
    }

    return categoryScopedMaterials.filter((item) => matchesSearchQuery(item, searchQuery));
  }, [
    activeNavTab,
    bookmarkedIds,
    allDownloadedIds,
    publishedMaterials,
    selectedClass,
    searchQuery,
    categoryScopedMaterials
  ]);

  const workspaceSubjectFilterOptions = useMemo(() => {
    const orderedNames: string[] = [...SUBJECT_FILTER_DROPDOWN_OPTIONS];
    categorySubjects.forEach((sub) => {
      if (!orderedNames.some((n) => n.toLowerCase() === sub.subject.toLowerCase())) {
        orderedNames.push(sub.subject);
      }
    });
    return orderedNames.map((subjectName) => ({
      value: subjectName,
      label: subjectName,
      count: workspaceSubjectScopeMaterials.filter((item) =>
        selectedCategory === 'QUESTION_BANK'
          ? matchesImportantQuestionsSubject(item, subjectName)
          : matchesSubjectFilter(item, subjectName)
      ).length
    }));
  }, [categorySubjects, workspaceSubjectScopeMaterials, selectedCategory]);

  const searchSuggestions = useMemo(
    () => extractSearchSuggestions(classScopedMaterials, 5),
    [classScopedMaterials]
  );

  const subjectScopedDirectoryMaterials = useMemo(() => {
    if (selectedSubject === 'ALL') {
      return workspaceSubjectScopeMaterials;
    }
    return workspaceSubjectScopeMaterials.filter((item) =>
      selectedCategory === 'QUESTION_BANK'
        ? matchesImportantQuestionsSubject(item, selectedSubject)
        : matchesSubjectFilter(item, selectedSubject)
    );
  }, [workspaceSubjectScopeMaterials, selectedCategory, selectedSubject]);

  const activeSubjectSubcategories = useMemo(() => {
    if (selectedSubject === 'ALL') return [];
    const labels = getSubjectSubcategories(selectedSubject);
    if (labels.length === 0) return [];
    return labels.map((label) => ({
      value: label,
      label,
      count: subjectScopedDirectoryMaterials.filter((item) =>
        matchesSubjectSubcategory(item, label)
      ).length
    }));
  }, [selectedSubject, subjectScopedDirectoryMaterials]);

  const directorySourceMaterials = useMemo(() => {
    if (selectedSubject === 'ALL' || selectedSubcategory === 'ALL') {
      return subjectScopedDirectoryMaterials;
    }
    return subjectScopedDirectoryMaterials.filter((item) =>
      matchesSubjectSubcategory(item, selectedSubcategory)
    );
  }, [selectedSubject, selectedSubcategory, subjectScopedDirectoryMaterials]);

  const availableChapters = useMemo(() => {
    const chSet = new Set<string>();
    directorySourceMaterials.forEach((item) => {
      const ch = extractChapterInfo(item);
      if (ch) chSet.add(ch);
    });
    return Array.from(chSet).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ''), 10) || 999;
      const numB = parseInt(b.replace(/\D/g, ''), 10) || 999;
      if (numA !== numB) return numA - numB;
      return a.localeCompare(b);
    });
  }, [directorySourceMaterials]);

  const filteredDirectoryMaterials = useMemo(() => {
    return directorySourceMaterials
      .filter((item) => {
        if (chapterFilter !== 'ALL' && extractChapterInfo(item) !== chapterFilter) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'alphabetical') {
          return a.title.localeCompare(b.title);
        }
        if (sortBy === 'modified') {
          const modDiff =
            new Date(b.updatedAt || b.createdAt || b.date || 0).getTime() -
            new Date(a.updatedAt || a.createdAt || a.date || 0).getTime();
          if (modDiff !== 0) return modDiff;
          const subA = getSubjectSubcategoryOrder(a);
          const subB = getSubjectSubcategoryOrder(b);
          if (subA !== subB) return subA - subB;
          const chA = extractChapterOrderNumber(a);
          const chB = extractChapterOrderNumber(b);
          if (chA !== chB) return chA - chB;
          return a.title.localeCompare(b.title);
        }
        if (sortBy === 'newest') {
          const createdDiff =
            new Date(b.createdAt || b.date || b.updatedAt || 0).getTime() -
            new Date(a.createdAt || a.date || a.updatedAt || 0).getTime();
          if (createdDiff !== 0) return createdDiff;
          const subA = getSubjectSubcategoryOrder(a);
          const subB = getSubjectSubcategoryOrder(b);
          if (subA !== subB) return subA - subB;
          const chA = extractChapterOrderNumber(a);
          const chB = extractChapterOrderNumber(b);
          if (chA !== chB) return chA - chB;
          return a.title.localeCompare(b.title);
        }
        const featA = a.isFeatured ? 0 : 1;
        const featB = b.isFeatured ? 0 : 1;
        if (featA !== featB) return featA - featB;
        const prioA = getCategoryPriorityIndex(a);
        const prioB = getCategoryPriorityIndex(b);
        if (prioA !== prioB) return prioA - prioB;
        const subA = getSubjectSubcategoryOrder(a);
        const subB = getSubjectSubcategoryOrder(b);
        if (subA !== subB) return subA - subB;
        const chA = extractChapterOrderNumber(a);
        const chB = extractChapterOrderNumber(b);
        if (chA !== chB) return chA - chB;
        return a.title.localeCompare(b.title);
      });
  }, [directorySourceMaterials, chapterFilter, sortBy]);

  const paginatedDirectoryMaterials = useMemo(() => {
    return filteredDirectoryMaterials.slice(0, visibleLimit);
  }, [filteredDirectoryMaterials, visibleLimit]);

  // 3 Clean Stages: Categories (Start), Category Subjects, or Directory
  const activeStage: 'categories' | 'category-subjects' | 'directory' = useMemo(() => {
    if (activeNavTab === 'saved' || activeNavTab === 'downloads') return 'directory';
    if (searchQuery.trim() !== '') return 'directory';
    if (selectedSubject !== 'ALL' || viewCategoryFilesDirectly) return 'directory';
    if (selectedCategory !== 'ALL') return 'category-subjects';
    return 'categories';
  }, [activeNavTab, searchQuery, selectedSubject, viewCategoryFilesDirectly, selectedCategory]);

  // Handlers
  const hasAccessToMaterial = (material: StudyMaterial): boolean => {
    if (material.isPublic !== false) return true;
    return Boolean(currentUser);
  };

  const handleToggleBookmark = (item: StudyMaterial) => {
    const id = item.id || item.materialId || '';
    if (!id) return;
    setBookmarkedIds((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        localStorage.setItem(bookmarkStorageKey, JSON.stringify(next));
      } catch {
        // Ignore quota errors
      }
      showToast(exists ? 'Removed from Saved' : 'Saved resource');
      return next;
    });
  };

  const handleSaveAllToBookmarks = (items: StudyMaterial[]) => {
    const incomingIds = items.map(getMaterialPrimaryId).filter(Boolean);
    if (incomingIds.length === 0) return;
    setBookmarkedIds((prev) => {
      const merged = Array.from(new Set([...prev, ...incomingIds]));
      const addedCount = merged.length - prev.length;
      try {
        localStorage.setItem(bookmarkStorageKey, JSON.stringify(merged));
      } catch {
        // Ignore quota errors
      }
      showToast(
        addedCount > 0
          ? `Saved ${addedCount} ${addedCount === 1 ? 'resource' : 'resources'}`
          : 'All kit items are already in Saved'
      );
      return merged;
    });
  };

  const handlePersistRevisionKit = (kit: SavedRevisionKit) => {
    if (sharedKitSession && kit.preset === 'custom') {
      setSharedKitSession({ kit, missingCount: sharedKitSession.missingCount });
      return;
    }
    if (sharedKitSession) {
      setSharedKitSession(null);
    }
    setSavedRevisionKit(kit);
    safeSetItem(revisionKitStorageKey, JSON.stringify(kit));
  };

  const handleAdoptSharedKit = (kit: SavedRevisionKit) => {
    setSavedRevisionKit(kit);
    safeSetItem(revisionKitStorageKey, JSON.stringify(kit));
    setSharedKitSession(null);
    showToast('Revision kit saved to this device');
  };

  const handleCopySavedListLink = async () => {
    const ids = filteredDirectoryMaterials.map(getMaterialPrimaryId).filter(Boolean);
    if (ids.length === 0) return;
    const label =
      selectedClass && selectedClass !== 'ALL'
        ? `${selectedClass} Saved Study Pack`
        : 'Sunshine Classes Saved Study Pack';
    const url = buildKitShareUrl(ids, label, selectedClass);
    const copied = await copyTextToClipboard(url);
    showToast(copied ? 'Shareable Saved list link copied' : 'Unable to copy link automatically');
  };

  const handlePreview = (item: StudyMaterial) => {
    if (!hasAccessToMaterial(item)) {
      setRestrictedModalMaterial(item);
      return;
    }
    setPreviewMaterial(item);
    onActiveResourceChange?.(item, selectedCategory);
    incrementViewCount(item.id).catch(() => {});
  };

  const handleClosePreview = () => {
    setPreviewMaterial(null);
    onActiveResourceChange?.(null, selectedCategory);
  };

  const markDownloadedLocally = (item: StudyMaterial) => {
    const id = item.id || item.materialId || '';
    if (id && !localDownloadedIds.includes(id)) {
      const next = [...localDownloadedIds, id];
      setLocalDownloadedIds(next);
      try {
        localStorage.setItem(downloadHistoryKey, JSON.stringify(next));
      } catch {
        // Ignore storage errors
      }
    }
    if (onMarkDownloaded) {
      onMarkDownloaded(item);
    }
  };

  const handleDownload = async (item: StudyMaterial) => {
    if (!hasAccessToMaterial(item)) {
      setRestrictedModalMaterial(item);
      return;
    }

    setDownloadingId(item.id);
    incrementDownloadCount(item.id)
      .then(() => {
        setLocalMaterials((prev) =>
          prev.map((m) =>
            m.id === item.id ? { ...m, downloadCount: (m.downloadCount || 0) + 1 } : m
          )
        );
      })
      .catch(() => {});

    markDownloadedLocally(item);

    try {
      if (item.fileUrl && (item.fileUrl.startsWith('http') || item.fileUrl.startsWith('/'))) {
        window.open(item.fileUrl, '_blank', 'noopener,noreferrer');
        showToast('Opening PDF');
      } else if (item.fileUrl && item.fileUrl.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = item.fileUrl;
        link.download = item.file || `${item.slug || 'study_resource'}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Downloading file');
      } else if (item.externalUrl && item.externalUrl.startsWith('http')) {
        window.open(item.externalUrl, '_blank', 'noopener,noreferrer');
        showToast('Opening link');
      } else if (item.fileData) {
        if (item.fileData.startsWith('http://') || item.fileData.startsWith('https://') || item.fileData.startsWith('/')) {
          window.open(item.fileData, '_blank', 'noopener,noreferrer');
        } else {
          const link = document.createElement('a');
          link.href = item.fileData;
          link.download = item.file || `${item.slug || 'study_resource'}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        showToast('Downloading file');
      } else {
        const formulaData = FormulaSheetsData.getFormulaSheet(item.slug || item.id);
        let content = `SUNSHINE CLASSES - OFFICIAL STUDY RESOURCE\nTitle: ${item.title}\nClass: ${item.class} | Subject: ${item.subject} | Chapter: ${item.chapter || 'All Chapters'}\n\n`;
        if (formulaData && formulaData.sections) {
          formulaData.sections.forEach((sec, sIdx) => {
            content += `${sIdx + 1}. ${sec.title.toUpperCase()}\n`;
            sec.formulas.forEach((f, fIdx) => {
              content += `  ${sIdx + 1}.${fIdx + 1} ${f.name}: ${f.formula}\n`;
              if (f.notes) content += `      (${f.notes})\n`;
            });
            content += '\n';
          });
        } else {
          content += `${item.description || item.desc || item.title}\n`;
        }
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${item.slug || 'sunshine_study_resource'}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Downloaded resource');
      }
    } finally {
      setTimeout(() => setDownloadingId(null), 600);
    }
  };

  const handleSelectNavTab = (tab: LibraryNavTab) => {
    setActiveNavTab(tab);
    if (tab === 'browse') {
      setSelectedCategory('ALL');
      setSelectedSubject('ALL');
      setSelectedSubcategory('ALL');
      setViewCategoryFilesDirectly(false);
      setSearchQuery('');
      onCategoryChange?.('ALL');
    }
  };

  const handleOpenCategory = (categoryId: string) => {
    setActiveNavTab('browse');
    setSelectedCategory(categoryId);
    setSelectedSubject('ALL');
    setSelectedSubcategory('ALL');
    setViewCategoryFilesDirectly(false);
    onCategoryChange?.(categoryId);
  };

  const handleOpenSubject = (subject: string) => {
    setSelectedSubject(subject);
    setSelectedSubcategory('ALL');
    setViewCategoryFilesDirectly(false);
  };

  const handleDirectoryBack = () => {
    if (searchQuery.trim() !== '') {
      setSearchQuery('');
      return;
    }
    if (selectedSubject !== 'ALL') {
      setSelectedSubject('ALL');
      setSelectedSubcategory('ALL');
      return;
    }
    if (viewCategoryFilesDirectly) {
      setViewCategoryFilesDirectly(false);
      return;
    }
    setActiveNavTab('browse');
    setSelectedCategory('ALL');
    onCategoryChange?.('ALL');
  };

  const handleResetToCategories = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedSubject('ALL');
    setSelectedSubcategory('ALL');
    setViewCategoryFilesDirectly(false);
    setChapterFilter('ALL');
    setActiveNavTab('browse');
    onCategoryChange?.('ALL');
  };

  const selectedCategoryMeta =
    selectedCategory !== 'ALL' ? getCategoryMeta(selectedCategory) : undefined;
  const showDesktopSidebar = variant !== 'student';

  return (
    <div
      id={`study-resources-workspace-${variant}`}
      className={
        variant === 'student'
          ? 'w-full space-y-4 font-sans pb-6'
          : 'min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans pb-20 md:pb-14'
      }
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            id="toast-study-resource-feedback"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="fixed bottom-18 md:bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-6 z-50 bg-[#0B2545] dark:bg-amber-500 text-white dark:text-slate-950 px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 text-xs font-semibold max-w-[90vw]"
          >
            <CheckCircle2 size={14} className="text-amber-400 dark:text-slate-950 shrink-0" />
            <span className="truncate">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SLIM PUBLIC TOP BAR */}
      {variant === 'public' && (
        <header className="bg-[#0B2545] text-white border-b border-white/10">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-12 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <button
                id="btn-back-home"
                type="button"
                onClick={onNavigateHome}
                className="min-h-[40px] px-2 -ml-1.5 rounded-xl flex items-center gap-1.5 text-slate-200 hover:text-white hover:bg-white/10 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <ArrowLeft size={15} />
                <span className="hidden sm:inline">Sunshine Classes</span>
                <span className="sm:hidden">Home</span>
              </button>
              <span className="text-white/25" aria-hidden="true">|</span>
              <span className="text-xs sm:text-sm font-bold text-amber-300 truncate">
                {headerTitle}
              </span>
            </div>

            <div className="shrink-0">
              {currentUser ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/10 text-amber-300 text-xs font-semibold whitespace-nowrap">
                  <Unlock size={12} />
                  <span className="hidden sm:inline">{currentUser.name || 'Enrolled'}</span>
                  <span className="sm:hidden">Student</span>
                </span>
              ) : (
                <button
                  id="btn-public-student-login"
                  type="button"
                  onClick={onOpenLoginModal}
                  className="min-h-[36px] px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <LogIn size={13} />
                  <span>Login</span>
                </button>
              )}
            </div>
          </div>
        </header>
      )}

      {/* CLEAN TOP CONTROLS: SEARCH + CLASS SELECTOR (+ 3-TAB SWITCHER WHEN EMBEDDED/STUDENT) */}
      <section
        id="library-hero-controls"
        className={
          variant === 'student'
            ? 'bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-3 sm:p-4 space-y-2.5'
            : 'bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800'
        }
      >
        <div
          className={
            variant === 'student'
              ? 'space-y-2.5'
              : 'max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4 space-y-2.5'
          }
        >
          {/* Compact Search Bar (+ Quick Upload for Staff) */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="relative flex-1 min-w-0">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  id="input-study-resource-search"
                  type="text"
                  placeholder={
                    selectedSubcategory !== 'ALL'
                      ? `Search in ${selectedSubcategory}...`
                      : selectedSubject !== 'ALL'
                      ? `Search in ${selectedSubject}...`
                      : selectedCategoryMeta
                      ? `Search in ${selectedCategoryMeta.label}...`
                      : 'Search notes, books, papers, chapters...'
                  }
                  value={searchQuery}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 180)}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 sm:h-11 pl-9 pr-10 rounded-xl bg-slate-100/90 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 text-xs sm:text-sm font-medium border border-slate-200/70 dark:border-slate-700 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-amber-500 transition-colors"
                />
                {searchQuery && (
                  <button
                    id="btn-clear-study-search"
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                    className="absolute right-0.5 top-1/2 -translate-y-1/2 min-h-[38px] min-w-[38px] flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              <button
                id="btn-open-revision-kit"
                type="button"
                onClick={() => setIsRevisionKitOpen(true)}
                aria-label="Open Exam Revision Kit builder"
                className="h-10 sm:h-11 px-3 sm:px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-amber-500 dark:hover:border-amber-500 text-slate-800 dark:text-slate-100 text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer transition-colors tabular-nums"
              >
                <ClipboardCheck size={15} className="text-amber-500 shrink-0" />
                <span className="hidden sm:inline">
                  {activeKitProgress
                    ? `Revision Kit · ${activeKitProgress.done}/${activeKitProgress.total}`
                    : 'Revision Kit'}
                </span>
                <span className="sm:hidden">
                  {activeKitProgress
                    ? `Kit ${activeKitProgress.done}/${activeKitProgress.total}`
                    : 'Kit'}
                </span>
              </button>

              {canStaffUpload && (
                <button
                  id="btn-resources-quick-upload"
                  type="button"
                  onClick={() => setIsQuickUploadOpen(true)}
                  className="h-10 sm:h-11 px-3 sm:px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer transition-colors"
                >
                  <Upload size={14} />
                  <span>Upload</span>
                </button>
              )}
            </div>

            {isSearchFocused && !searchQuery && searchSuggestions.length > 0 && (
              <div
                id="search-suggestions-strip"
                className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-0.5"
              >
                {searchSuggestions.map((term) => (
                  <button
                    key={term}
                    id={`btn-search-suggestion-${sanitizeElementId(term)}`}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setSearchQuery(term);
                    }}
                    className="h-7 px-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-[11px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap shrink-0 cursor-pointer transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Horizontal Class Selector Bar + Universal Subject Filter Dropdown */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div
              id="sticky-class-tabs-strip"
              className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5 min-w-0"
              role="tablist"
              aria-label="Select Class"
            >
              {availableClasses.map((cls) => {
                const isActive = selectedClass === cls;
                return (
                  <button
                    key={cls}
                    id={`btn-class-tab-${sanitizeElementId(cls)}`}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setSelectedClass(cls)}
                    className={`min-h-[34px] px-3 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#0B2545] dark:bg-amber-500 text-white dark:text-slate-950'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {cls === 'ALL' ? 'All Classes' : cls}
                  </button>
                );
              })}
            </div>

            <select
              id="select-study-resources-subject"
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value);
                setSelectedSubcategory('ALL');
              }}
              aria-label="Filter study resources by subject"
              className="h-[34px] px-2.5 rounded-lg bg-white dark:bg-slate-900 border border-amber-300/90 dark:border-amber-700/70 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-amber-500 cursor-pointer shrink-0 sm:max-w-[230px]"
            >
              <option value="ALL">
                All Subjects ({workspaceSubjectScopeMaterials.length})
              </option>
              {workspaceSubjectFilterOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {formatSubjectDropdownLabel(opt.label)} ({opt.count})
                </option>
              ))}
            </select>
          </div>

          {/* Consolidated 3-Tab Switcher for Student & Embedded Layouts */}
          {variant !== 'public' && (
            <div
              id="inline-library-nav-tabs"
              className="flex items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800"
              role="tablist"
              aria-label="Library views"
            >
              {(
                [
                  { id: 'browse', label: 'Browse', Icon: LayoutGrid },
                  { id: 'saved', label: `Saved (${savedCount})`, Icon: Bookmark },
                  { id: 'downloads', label: `Downloads (${downloadedCount})`, Icon: Download }
                ] as const
              ).map(({ id, label, Icon }) => {
                const active = activeNavTab === id;
                return (
                  <button
                    key={id}
                    id={`btn-inline-nav-${id}`}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => handleSelectNavTab(id)}
                    className={`min-h-[36px] px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 tabular-nums ${
                      active
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Icon size={14} className="shrink-0" />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* MAIN WORKSPACE CONTENT */}
      <div
        className={
          variant === 'student'
            ? 'space-y-4'
            : 'max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6'
        }
      >
        <div className={showDesktopSidebar ? 'grid grid-cols-1 lg:grid-cols-12 gap-6 items-start' : ''}>
          {/* Minimal Desktop Sidebar (Browse / Saved / Downloads only) */}
          {showDesktopSidebar && (
            <aside className="hidden lg:block lg:col-span-3">
              <div
                id="desktop-library-sidebar"
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-3 space-y-1 sticky top-6"
              >
                {(
                  [
                    { id: 'browse', label: 'Browse Categories', count: activeCategories.length, Icon: LayoutGrid },
                    { id: 'saved', label: 'Saved Resources', count: savedCount, Icon: Bookmark },
                    { id: 'downloads', label: 'Downloads', count: downloadedCount, Icon: Download }
                  ] as const
                ).map(({ id, label, count, Icon }) => {
                  const active = activeNavTab === id;
                  return (
                    <button
                      key={id}
                      id={`btn-sidebar-nav-${id}`}
                      type="button"
                      onClick={() => handleSelectNavTab(id)}
                      className={`w-full min-h-[42px] flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#0B2545] dark:bg-amber-500 text-white dark:text-slate-950'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Icon size={15} />
                        <span>{label}</span>
                      </span>
                      <span className="tabular-nums opacity-80">{count}</span>
                    </button>
                  );
                })}
                <div className="pt-1.5 mt-1.5 border-t border-slate-100 dark:border-slate-800">
                  <button
                    id="btn-sidebar-nav-kit"
                    type="button"
                    onClick={() => setIsRevisionKitOpen(true)}
                    className="w-full min-h-[42px] flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <ClipboardCheck size={15} />
                      <span>Exam Revision Kit</span>
                    </span>
                    {activeKitProgress && (
                      <span className="tabular-nums text-[11px] opacity-90">
                        {activeKitProgress.done}/{activeKitProgress.total}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </aside>
          )}

          {/* MAIN PANE */}
          <main className={showDesktopSidebar ? 'lg:col-span-9 space-y-4' : 'space-y-4'}>
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3.5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 h-24 animate-pulse space-y-2"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800" />
                    <div className="w-2/3 h-3.5 rounded bg-slate-200 dark:bg-slate-800" />
                  </div>
                ))}
              </div>
            ) : hasError ? (
              <div className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-8 text-center space-y-3">
                <ShieldAlert className="mx-auto text-rose-500" size={32} />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Unable to load study resources
                </h3>
                {onRetry && (
                  <button
                    id="btn-retry-load-resources"
                    type="button"
                    onClick={onRetry}
                    className="min-h-[44px] px-5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
                  >
                    <RefreshCw size={14} />
                    <span>Retry</span>
                  </button>
                )}
              </div>
            ) : activeStage === 'categories' ? (
              /* START SCREEN: HIGHLIGHTED IMPORTANT QUESTIONS + CATEGORY GRID */
              <section id="section-resource-categories" className="space-y-4">
                {featuredMaterials.length > 0 && (
                  <div
                    id="section-featured-important-questions"
                    className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/90 dark:border-amber-900/60 rounded-2xl overflow-hidden"
                  >
                    <div className="px-3.5 py-2.5 sm:px-5 sm:py-3 border-b border-amber-200/70 dark:border-amber-900/50 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Star size={15} className="fill-amber-500 text-amber-500 shrink-0" />
                        <h2 className="font-display text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                          Highlighted · Board 2027 Important Questions
                        </h2>
                      </div>
                      <button
                        id="btn-featured-open-important-questions"
                        type="button"
                        onClick={() => handleOpenCategory('QUESTION_BANK')}
                        className="min-h-[34px] px-2 -mr-1 rounded-lg text-xs font-semibold text-amber-800 dark:text-amber-300 hover:bg-amber-100/80 dark:hover:bg-amber-950/60 inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer transition-colors"
                      >
                        <span>All Important Questions</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>

                    <div className="divide-y divide-amber-200/60 dark:divide-amber-900/40">
                      {featuredMaterials.map((item) => {
                        const id = item.id || item.materialId || item.slug;
                        const safeId = sanitizeElementId(String(id));
                        const { Icon, badgeClass } = getSubjectVisualMeta(item.subject || '');
                        const isDownloaded = allDownloadedIds.includes(id);
                        return (
                          <div
                            key={id}
                            id={`row-featured-resource-${safeId}`}
                            role="button"
                            tabIndex={0}
                            onClick={() => handlePreview(item)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handlePreview(item);
                              }
                            }}
                            aria-label={`Preview ${item.title}`}
                            className="px-3.5 py-3 sm:px-5 sm:py-3.5 hover:bg-amber-100/55 dark:hover:bg-amber-950/40 active:bg-amber-100/80 dark:active:bg-amber-950/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-500 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center justify-between gap-2.5 sm:gap-4 min-w-0">
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div
                                  className={`hidden sm:flex w-9 h-9 rounded-xl border items-center justify-center shrink-0 ${badgeClass}`}
                                >
                                  <Icon size={17} />
                                </div>
                                <div className="min-w-0 flex-1 space-y-0.5">
                                  <h3
                                    title={item.title}
                                    className="text-[13px] sm:text-sm font-semibold text-slate-900 dark:text-white leading-snug break-words"
                                  >
                                    {item.title}
                                  </h3>
                                  <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 tabular-nums truncate">
                                    <span className="font-semibold text-amber-800 dark:text-amber-300">
                                      {item.highlightBadge || 'Most Repeated Board Questions'}
                                    </span>
                                    <span aria-hidden="true"> · </span>
                                    <span>{item.class}</span>
                                    {item.pageCount ? ` · ${item.pageCount} pages` : ''}
                                    {item.size ? ` · ${item.size}` : ''}
                                    {isDownloaded && (
                                      <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                                        {' · Offline'}
                                      </span>
                                    )}
                                  </p>
                                </div>
                              </div>

                              <button
                                id={`btn-featured-download-${safeId}`}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownload(item);
                                }}
                                disabled={downloadingId === item.id}
                                aria-label={`Download ${item.title}`}
                                title="Download PDF"
                                className={`min-h-[44px] min-w-[44px] -mr-1.5 sm:mr-0 rounded-xl flex items-center justify-center shrink-0 active:scale-95 transition-colors cursor-pointer disabled:opacity-60 ${
                                  isDownloaded
                                    ? 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                                    : 'text-amber-800 dark:text-amber-300 hover:bg-amber-200/60 dark:hover:bg-amber-900/50'
                                }`}
                              >
                                <Download size={17} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeCategories.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3.5">
                    {activeCategories.map((cat) => {
                      const Icon = cat.Icon;
                      return (
                        <button
                          key={cat.id}
                          id={`card-category-${sanitizeElementId(cat.id)}`}
                          type="button"
                          onClick={() => handleOpenCategory(cat.id)}
                          className={`bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 ${cat.accentBg} rounded-xl sm:rounded-2xl p-3.5 sm:p-4 text-left flex flex-col justify-between gap-2.5 transition-all cursor-pointer group active:scale-[0.98]`}
                        >
                          <div className="flex items-center justify-between gap-2 w-full">
                            <div
                              className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${cat.iconClass}`}
                            >
                              <Icon size={17} />
                            </div>
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tabular-nums">
                              {cat.count}
                            </span>
                          </div>

                          <h2 className="text-[13px] sm:text-sm font-bold text-slate-900 dark:text-white leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                            {cat.label}
                          </h2>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center space-y-2.5">
                    <BookOpen className="mx-auto text-slate-400" size={28} />
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      No resources found for {selectedClass}
                    </p>
                    <button
                      id="btn-empty-class-reset"
                      type="button"
                      onClick={() => setSelectedClass('ALL')}
                      className="min-h-[40px] px-4 rounded-xl bg-amber-500 text-white text-xs font-semibold cursor-pointer"
                    >
                      Show All Classes
                    </button>
                  </div>
                )}

                {upcomingCategories.length > 0 && (
                  <div className="pt-1">
                    <button
                      id="btn-toggle-upcoming-categories"
                      type="button"
                      onClick={() => setShowUpcomingCategories((prev) => !prev)}
                      aria-expanded={showUpcomingCategories}
                      className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 py-1.5 px-1 cursor-pointer transition-colors"
                    >
                      {showUpcomingCategories
                        ? 'Hide empty categories'
                        : `Show empty categories (${upcomingCategories.length})`}
                    </button>

                    {showUpcomingCategories && (
                      <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {upcomingCategories.map((cat) => {
                          const Icon = cat.Icon;
                          return (
                            <button
                              key={cat.id}
                              id={`card-category-${sanitizeElementId(cat.id)}`}
                              type="button"
                              onClick={() => handleOpenCategory(cat.id)}
                              className="px-3 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-left flex items-center gap-2 hover:border-amber-400 cursor-pointer transition-colors opacity-75"
                            >
                              <Icon size={15} className="text-slate-400 shrink-0" />
                              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
                                {cat.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </section>
            ) : activeStage === 'category-subjects' ? (
              /* STAGE 2: CLEAN SUBJECT SELECTION INSIDE CATEGORY */
              <section id="view-category-page" className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <button
                      id="btn-category-back-home"
                      type="button"
                      onClick={handleResetToCategories}
                      className="min-h-[38px] px-2 -ml-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <ArrowLeft size={14} />
                      <span>Categories</span>
                    </button>
                    <ChevronRight size={13} className="text-slate-400 shrink-0" />
                    <h2 className="font-display text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                      {selectedCategoryMeta?.label || selectedCategory}
                    </h2>
                  </div>

                  {categoryScopedMaterials.length > 0 && (
                    <button
                      id="btn-category-view-all-files"
                      type="button"
                      onClick={() => setViewCategoryFilesDirectly(true)}
                      className="min-h-[36px] px-3 rounded-lg text-xs font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 flex items-center gap-1 cursor-pointer shrink-0 tabular-nums"
                    >
                      <span>All ({categoryScopedMaterials.length})</span>
                      <ArrowRight size={13} />
                    </button>
                  )}
                </div>

                {categorySubjects.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-3">
                    <FolderOpen className="mx-auto text-slate-400" size={30} />
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      No {selectedCategoryMeta?.label || 'files'} in {selectedClass === 'ALL' ? 'this view' : selectedClass}
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      {selectedClass !== 'ALL' && (
                        <button
                          id="btn-empty-category-all-classes"
                          type="button"
                          onClick={() => setSelectedClass('ALL')}
                          className="min-h-[40px] px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
                        >
                          All Classes
                        </button>
                      )}
                      <button
                        id="btn-empty-category-back"
                        type="button"
                        onClick={handleResetToCategories}
                        className="min-h-[40px] px-4 rounded-xl bg-amber-500 text-white text-xs font-semibold cursor-pointer"
                      >
                        Back to Categories
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
                    {categorySubjects.map((sub) => {
                      const { Icon, badgeClass } = getSubjectVisualMeta(sub.subject);
                      const subcategories = getSubjectSubcategories(sub.subject);
                      return (
                        <button
                          key={sub.subject}
                          id={`row-category-subject-${sanitizeElementId(sub.subject)}`}
                          type="button"
                          onClick={() => handleOpenSubject(sub.subject)}
                          className="w-full px-3.5 py-3 sm:px-5 sm:py-3.5 flex items-center justify-between gap-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 active:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div
                              className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${badgeClass}`}
                            >
                              <Icon size={17} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="block text-[13px] sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                                {sub.subject}
                              </span>
                              {subcategories.length > 0 && (
                                <span className="block text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                  {subcategories.join(' · ')}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                            <span>{sub.count}</span>
                            <ChevronRight size={16} className="text-slate-400" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>
            ) : (
              /* STAGE 3: MINIMAL FILE DIRECTORY (Subject, Search, Saved, or Downloads) */
              <section id="view-directory-standalone" className="space-y-3">
                {/* Clean Header Line */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 min-w-0">
                    {activeNavTab === 'browse' && (
                      <button
                        id="btn-directory-back"
                        type="button"
                        onClick={handleDirectoryBack}
                        className="min-h-[38px] px-2 -ml-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <ArrowLeft size={14} />
                        <span>
                          {selectedCategory === 'QUESTION_BANK' && !searchQuery.trim()
                            ? 'Subjects'
                            : 'Back'}
                        </span>
                      </button>
                    )}

                    <h2 className="font-display text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                      {activeNavTab === 'saved'
                        ? 'Saved Resources'
                        : activeNavTab === 'downloads'
                        ? 'Downloads'
                        : searchQuery.trim()
                        ? `Results for "${searchQuery.trim()}"`
                        : selectedCategory === 'QUESTION_BANK'
                        ? selectedSubject !== 'ALL'
                          ? selectedSubcategory !== 'ALL'
                            ? `Important Questions · ${selectedSubcategory}`
                            : `Important Questions · ${selectedSubject}`
                          : 'Important Questions'
                        : selectedSubject !== 'ALL'
                        ? selectedSubcategory !== 'ALL'
                          ? `${selectedSubject} · ${selectedSubcategory}`
                          : selectedSubject
                        : selectedCategoryMeta?.label || 'Resources'}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {activeNavTab === 'saved' && filteredDirectoryMaterials.length > 0 && (
                      <>
                        <button
                          id="btn-share-saved-list"
                          type="button"
                          onClick={handleCopySavedListLink}
                          className="min-h-[38px] px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-amber-500 text-slate-700 dark:text-slate-200 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                        >
                          <Link2 size={13} />
                          <span>Share Saved</span>
                        </button>
                        <a
                          id="link-whatsapp-saved-list"
                          href={buildKitWhatsAppHref(
                            filteredDirectoryMaterials.map(getMaterialPrimaryId),
                            selectedClass && selectedClass !== 'ALL'
                              ? `${selectedClass} Saved Study Pack`
                              : 'Sunshine Classes Saved Study Pack',
                            selectedClass
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Share saved list on WhatsApp"
                          className="min-h-[38px] min-w-[38px] rounded-xl border border-emerald-200 dark:border-emerald-900/70 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 inline-flex items-center justify-center"
                        >
                          <Share2 size={14} />
                        </a>
                      </>
                    )}
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 tabular-nums shrink-0">
                      {filteredDirectoryMaterials.length}{' '}
                      {filteredDirectoryMaterials.length === 1 ? 'file' : 'files'}
                    </span>
                  </div>
                </div>

                {/* Optional Slim Sort / Chapter Row */}
                {filteredDirectoryMaterials.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-0.5">
                    <select
                      id="select-directory-sort"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as StudyResourceSortMode)}
                      aria-label="Sort resources"
                      className="h-9 px-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer shrink-0"
                    >
                      <option value="modified">Sort: Modified</option>
                      <option value="chapter">Order: Chapter</option>
                      <option value="newest">Order: Newest</option>
                      <option value="alphabetical">Order: A–Z</option>
                    </select>

                    {availableChapters.length > 1 && (
                      <select
                        id="select-directory-chapter"
                        value={chapterFilter}
                        onChange={(e) => setChapterFilter(e.target.value)}
                        aria-label="Filter by chapter"
                        className="h-9 max-w-[180px] sm:max-w-[240px] px-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer truncate shrink-0"
                      >
                        <option value="ALL">All Chapters</option>
                        {availableChapters.map((ch) => (
                          <option key={ch} value={ch}>
                            {ch}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}

                {/* Compact Subject Subcategory Strip (Social Science / Science / English / Hindi) */}
                {activeSubjectSubcategories.length > 0 && (
                  <div
                    id="strip-subject-subcategories"
                    role="tablist"
                    aria-label={`${selectedSubject} subcategories`}
                    className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5"
                  >
                    <button
                      id="btn-subcategory-all"
                      type="button"
                      role="tab"
                      aria-selected={selectedSubcategory === 'ALL'}
                      onClick={() => setSelectedSubcategory('ALL')}
                      className={`h-7 px-2.5 rounded-lg text-[11px] font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer tabular-nums ${
                        selectedSubcategory === 'ALL'
                          ? 'bg-[#0B2545] dark:bg-amber-500 text-white dark:text-slate-950'
                          : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-amber-400 dark:hover:border-amber-500'
                      }`}
                    >
                      All ({subjectScopedDirectoryMaterials.length})
                    </button>
                    {activeSubjectSubcategories.map((sub) => {
                      const active = selectedSubcategory === sub.value;
                      return (
                        <button
                          key={sub.value}
                          id={`btn-subcategory-${sanitizeElementId(sub.value)}`}
                          type="button"
                          role="tab"
                          aria-selected={active}
                          onClick={() => setSelectedSubcategory(sub.value)}
                          className={`h-7 px-2.5 rounded-lg text-[11px] font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer tabular-nums ${
                            active
                              ? 'bg-[#0B2545] dark:bg-amber-500 text-white dark:text-slate-950'
                              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-amber-400 dark:hover:border-amber-500'
                          }`}
                        >
                          {sub.label} ({sub.count})
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Minimal File Rows */}
                {filteredDirectoryMaterials.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-3">
                    <FolderOpen className="mx-auto text-slate-400" size={30} />
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {activeNavTab === 'saved'
                        ? 'No saved resources yet'
                        : activeNavTab === 'downloads'
                        ? 'No downloaded resources yet'
                        : selectedSubcategory !== 'ALL'
                        ? selectedCategory === 'QUESTION_BANK'
                          ? `No ${selectedSubcategory} Important Questions yet`
                          : `No ${selectedSubcategory} resources yet`
                        : selectedCategory === 'QUESTION_BANK' && selectedSubject !== 'ALL'
                        ? `No ${selectedSubject} Important Questions yet`
                        : 'No matching resources'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                      {activeNavTab === 'saved'
                        ? 'Open any file and tap Bookmark to keep it here.'
                        : activeNavTab === 'downloads'
                        ? 'Files you download appear here for quick access.'
                        : selectedSubcategory !== 'ALL'
                        ? `Choose another subcategory above or view all ${selectedSubject} resources.`
                        : selectedCategory === 'QUESTION_BANK' && selectedSubject !== 'ALL'
                        ? 'Switch subject above or view all Important Questions.'
                        : 'Try another search term or switch class above.'}
                    </p>
                    {selectedSubcategory !== 'ALL' ? (
                      <button
                        id="btn-subcategory-reset"
                        type="button"
                        onClick={() => setSelectedSubcategory('ALL')}
                        className="min-h-[40px] px-4 rounded-xl bg-amber-500 text-white text-xs font-semibold cursor-pointer"
                      >
                        Show All {selectedSubject}
                      </button>
                    ) : selectedSubject !== 'ALL' ? (
                      <button
                        id="btn-subject-filter-reset"
                        type="button"
                        onClick={() => setSelectedSubject('ALL')}
                        className="min-h-[40px] px-4 rounded-xl bg-amber-500 text-white text-xs font-semibold cursor-pointer"
                      >
                        Show All Subjects
                      </button>
                    ) : (
                      (searchQuery || chapterFilter !== 'ALL' || activeNavTab !== 'browse') && (
                        <button
                          id="btn-directory-reset-home"
                          type="button"
                          onClick={handleResetToCategories}
                          className="min-h-[40px] px-4 rounded-xl bg-amber-500 text-white text-xs font-semibold cursor-pointer"
                        >
                          Browse Categories
                        </button>
                      )
                    )}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
                    {paginatedDirectoryMaterials.map((item) => {
                      const id = item.id || item.materialId || item.slug;
                      return (
                        <ResourceDirectoryRow
                          key={id}
                          item={item}
                          isDownloaded={allDownloadedIds.includes(id)}
                          isLocked={!hasAccessToMaterial(item)}
                          isDownloading={downloadingId === item.id}
                          onPreview={handlePreview}
                          onDownload={handleDownload}
                        />
                      );
                    })}
                  </div>
                )}

                {filteredDirectoryMaterials.length > paginatedDirectoryMaterials.length && (
                  <div className="pt-1 text-center">
                    <button
                      id="btn-directory-load-more"
                      type="button"
                      onClick={() => setVisibleLimit((prev) => prev + DIRECTORY_PAGE_SIZE)}
                      className="min-h-[42px] px-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-100 cursor-pointer tabular-nums"
                    >
                      Show More ({filteredDirectoryMaterials.length - paginatedDirectoryMaterials.length})
                    </button>
                  </div>
                )}
              </section>
            )}
          </main>
        </div>
      </div>

      {/* CLEAN 3-TAB MOBILE BOTTOM NAVIGATION (Standalone Public Only) */}
      {variant === 'public' && (
        <nav
          id="nav-resources-mobile-bottom-bar"
          aria-label="Study library bottom navigation"
          className="md:hidden fixed bottom-0 inset-x-0 z-40 h-14 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 grid grid-cols-3 items-center px-2"
        >
          {(
            [
              { id: 'browse', label: 'Browse', Icon: LayoutGrid, count: 0 },
              { id: 'saved', label: 'Saved', Icon: Bookmark, count: savedCount },
              { id: 'downloads', label: 'Downloads', Icon: Download, count: downloadedCount }
            ] as const
          ).map(({ id, label, Icon, count }) => {
            const active = activeNavTab === id;
            return (
              <button
                key={id}
                id={`btn-mobile-bottom-${id}`}
                type="button"
                onClick={() => handleSelectNavTab(id)}
                className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 rounded-xl transition-colors cursor-pointer relative ${
                  active
                    ? 'text-amber-600 dark:text-amber-400 font-bold'
                    : 'text-slate-500 dark:text-slate-400 font-medium'
                }`}
              >
                <div className="relative">
                  <Icon
                    size={19}
                    className={id === 'saved' && active ? 'fill-amber-500 text-amber-500' : ''}
                  />
                  {count > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-[16px] px-1 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center tabular-nums">
                      {count > 99 ? '99+' : count}
                    </span>
                  )}
                </div>
                <span className="text-[10px] tracking-tight leading-none">{label}</span>
              </button>
            );
          })}
        </nav>
      )}

      {/* FOCUSED PDF PREVIEW & METADATA READER */}
      <AnimatePresence>
        {previewMaterial && (
          <ResourcePdfPreviewModal
            material={previewMaterial}
            siblingMaterials={
              filteredDirectoryMaterials.length > 0
                ? filteredDirectoryMaterials
                : classScopedMaterials
            }
            isBookmarked={bookmarkedIds.includes(
              previewMaterial.id || previewMaterial.materialId || ''
            )}
            isDownloading={downloadingId === previewMaterial.id}
            onSelectMaterial={(next) => handlePreview(next)}
            onClose={handleClosePreview}
            onDownload={(item) => handleDownload(item)}
            onToggleBookmark={(item) => handleToggleBookmark(item)}
            onShareFeedback={showToast}
          />
        )}
      </AnimatePresence>

      {/* EXAM REVISION KIT BUILDER & CHECKLIST SHEET */}
      <AnimatePresence>
        {isRevisionKitOpen && (
          <RevisionKitModal
            materials={publishedMaterials}
            availableClasses={availableClasses}
            activeClass={selectedClass}
            savedKit={sharedKitSession ? sharedKitSession.kit : savedRevisionKit}
            sharedKitMeta={
              sharedKitSession
                ? { isShared: true, missingCount: sharedKitSession.missingCount }
                : null
            }
            downloadingId={downloadingId}
            onSaveKit={handlePersistRevisionKit}
            onAdoptSharedKit={handleAdoptSharedKit}
            onSaveAllToBookmarks={handleSaveAllToBookmarks}
            onPreview={handlePreview}
            onDownload={handleDownload}
            onFeedback={showToast}
            onClose={() => setIsRevisionKitOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ENROLLED STUDENT ACCESS MODAL */}
      <AnimatePresence>
        {restrictedModalMaterial && (
          <div
            id="modal-restricted-resource"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs"
            onClick={() => setRestrictedModalMaterial(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.16 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
                <Lock size={22} />
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 block">
                  Enrolled Student Resource
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Student Login Required
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  "<span className="font-semibold text-slate-800 dark:text-slate-200">{restrictedModalMaterial.title}</span>" is reserved for enrolled Sunshine Classes students.
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <button
                  id="btn-login-modal-restricted"
                  type="button"
                  onClick={() => {
                    setRestrictedModalMaterial(null);
                    if (onOpenLoginModal) onOpenLoginModal();
                  }}
                  className="w-full min-h-[48px] rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogIn size={15} />
                  <span>Log In with Student Account</span>
                </button>

                <button
                  id="btn-close-restricted-modal"
                  type="button"
                  onClick={() => setRestrictedModalMaterial(null)}
                  className="w-full min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Back to Resources
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* STAFF QUICK UPLOAD MODAL */}
      <AnimatePresence>
        {isQuickUploadOpen && currentUser && (
          <StudyMaterialUploadModal
            currentUser={currentUser}
            defaultClass={selectedClass !== 'ALL' ? selectedClass : 'Class 10'}
            defaultSubject={
              selectedSubject === 'History'
                ? 'Social Science'
                : selectedSubject !== 'ALL'
                ? selectedSubject
                : 'Mathematics'
            }
            defaultMaterialType={
              selectedCategory !== 'ALL'
                ? mapCategoryIdToMaterialType(selectedCategory)
                : 'QUESTION_BANK'
            }
            onClose={() => setIsQuickUploadOpen(false)}
            onSaved={(savedMaterial, isEdit) => {
              setLocalMaterials((prev) => {
                const next = isEdit
                  ? prev.map((m) => (m.id === savedMaterial.id ? savedMaterial : m))
                  : [savedMaterial, ...prev.filter((m) => m.id !== savedMaterial.id)];
                safeSetItem('sunshine_study_materials_initialized', 'true');
                safeSetItem('sunshine_study_materials', JSON.stringify(next));
                return next;
              });
              setIsQuickUploadOpen(false);
              showToast('Uploaded & synced live');
            }}
            onBulkSaved={(savedMaterials) => {
              const newIds = new Set(savedMaterials.map((m) => m.id));
              setLocalMaterials((prev) => {
                const next = [...savedMaterials, ...prev.filter((m) => !newIds.has(m.id))];
                safeSetItem('sunshine_study_materials_initialized', 'true');
                safeSetItem('sunshine_study_materials', JSON.stringify(next));
                return next;
              });
              setIsQuickUploadOpen(false);
              showToast(`Uploaded & synced ${savedMaterials.length} files live`);
            }}
            onAuditLog={onAuditLog}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudyResourcesWorkspace;
