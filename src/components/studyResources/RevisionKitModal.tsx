import React, { useEffect, useMemo, useState } from 'react';
import {
  Bookmark,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Download,
  Link2,
  Plus,
  RotateCcw,
  Search,
  Share2,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { motion } from 'motion/react';
import { StudyMaterial } from '../../types';
import {
  getFileFormatLabel,
  getResourceTypeLabel,
  matchesClassFilter,
  matchesSearchQuery,
  orderSubjectsByPriority,
  sanitizeElementId
} from './resourceMeta';
import {
  buildCuratedRevisionKit,
  buildKitShareUrl,
  buildKitWhatsAppHref,
  copyTextToClipboard,
  getMaterialPrimaryId,
  REVISION_KIT_PRESETS,
  RevisionKitPreset,
  SavedRevisionKit
} from './revisionKitHelpers';

interface RevisionKitModalProps {
  materials: StudyMaterial[];
  availableClasses: string[];
  activeClass: string;
  savedKit: SavedRevisionKit | null;
  sharedKitMeta?: {
    isShared: boolean;
    missingCount: number;
  } | null;
  downloadingId: string | null;
  onSaveKit: (kit: SavedRevisionKit) => void;
  onAdoptSharedKit?: (kit: SavedRevisionKit) => void;
  onSaveAllToBookmarks: (items: StudyMaterial[]) => void;
  onPreview: (item: StudyMaterial) => void;
  onDownload: (item: StudyMaterial) => void;
  onFeedback: (message: string) => void;
  onClose: () => void;
}

export const RevisionKitModal: React.FC<RevisionKitModalProps> = ({
  materials,
  availableClasses,
  activeClass,
  savedKit,
  sharedKitMeta = null,
  downloadingId,
  onSaveKit,
  onAdoptSharedKit,
  onSaveAllToBookmarks,
  onPreview,
  onDownload,
  onFeedback,
  onClose
}) => {
  const hasExistingItems = Boolean(savedKit && savedKit.itemIds.length > 0);
  const [step, setStep] = useState<'configure' | 'checklist'>(
    hasExistingItems ? 'checklist' : 'configure'
  );

  const [configClass, setConfigClass] = useState<string>(() => {
    if (savedKit?.className && availableClasses.includes(savedKit.className)) {
      return savedKit.className;
    }
    if (activeClass && activeClass !== 'ALL' && availableClasses.includes(activeClass)) {
      return activeClass;
    }
    const firstSpecificClass = availableClasses.find((c) => c !== 'ALL');
    return firstSpecificClass || 'ALL';
  });

  const [configSubjects, setConfigSubjects] = useState<string[]>(() => savedKit?.subjects || []);
  const [configPreset, setConfigPreset] = useState<Exclude<RevisionKitPreset, 'custom'>>(() =>
    savedKit && savedKit.preset !== 'custom' ? savedKit.preset : 'exam-sprint'
  );

  const [showAddPicker, setShowAddPicker] = useState(false);
  const [addSearch, setAddSearch] = useState('');
  const [copiedRecently, setCopiedRecently] = useState(false);

  useEffect(() => {
    if (sharedKitMeta?.isShared && savedKit && savedKit.itemIds.length > 0) {
      setStep('checklist');
    }
  }, [sharedKitMeta, savedKit]);

  const classScopedSubjects = useMemo(() => {
    const subSet = new Set<string>();
    materials.forEach((m) => {
      if (matchesClassFilter(m.class, configClass) && m.subject?.trim()) {
        subSet.add(m.subject.trim());
      }
    });
    return orderSubjectsByPriority(Array.from(subSet));
  }, [materials, configClass]);

  // Drop selected subjects that do not exist in newly chosen class
  useEffect(() => {
    setConfigSubjects((prev) => prev.filter((s) => classScopedSubjects.includes(s)));
  }, [classScopedSubjects]);

  const previewBuild = useMemo(
    () =>
      buildCuratedRevisionKit(materials, {
        className: configClass,
        subjects: configSubjects,
        preset: configPreset
      }),
    [materials, configClass, configSubjects, configPreset]
  );

  const presetCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    REVISION_KIT_PRESETS.forEach((p) => {
      counts[p.id] = buildCuratedRevisionKit(materials, {
        className: configClass,
        subjects: configSubjects,
        preset: p.id
      }).items.length;
    });
    return counts;
  }, [materials, configClass, configSubjects]);

  const materialMap = useMemo(() => {
    const map = new Map<string, StudyMaterial>();
    materials.forEach((m) => {
      const pid = getMaterialPrimaryId(m);
      if (pid) map.set(pid, m);
      if (m.id) map.set(m.id, m);
      if (m.materialId) map.set(m.materialId, m);
    });
    return map;
  }, [materials]);

  const resolvedKitItems = useMemo(() => {
    if (!savedKit) return [];
    const list: StudyMaterial[] = [];
    const seen = new Set<string>();
    savedKit.itemIds.forEach((id) => {
      const found = materialMap.get(id);
      if (found) {
        const pid = getMaterialPrimaryId(found);
        if (!seen.has(pid)) {
          seen.add(pid);
          list.push(found);
        }
      }
    });
    return list;
  }, [savedKit, materialMap]);

  const completedSet = useMemo(
    () => new Set<string>(savedKit?.completedIds || []),
    [savedKit]
  );

  const completedCount = useMemo(
    () =>
      resolvedKitItems.filter((item) => completedSet.has(getMaterialPrimaryId(item))).length,
    [resolvedKitItems, completedSet]
  );

  const completionPercent =
    resolvedKitItems.length > 0
      ? Math.round((completedCount / resolvedKitItems.length) * 100)
      : 0;

  const addableCandidates = useMemo(() => {
    if (!showAddPicker) return [];
    const existingIds = new Set(resolvedKitItems.map(getMaterialPrimaryId));
    return materials
      .filter((m) => {
        const pid = getMaterialPrimaryId(m);
        if (!pid || existingIds.has(pid)) return false;
        if (savedKit?.className && savedKit.className !== 'ALL') {
          if (!matchesClassFilter(m.class, savedKit.className)) return false;
        }
        return matchesSearchQuery(m, addSearch);
      })
      .slice(0, 8);
  }, [showAddPicker, resolvedKitItems, materials, savedKit, addSearch]);

  const handleToggleSubject = (subject: string) => {
    setConfigSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
    );
  };

  const handleBuildKit = () => {
    if (previewBuild.items.length === 0) return;
    const itemIds = previewBuild.items.map(getMaterialPrimaryId);
    const preservedDone = (savedKit?.completedIds || []).filter((id) => itemIds.includes(id));

    const nextKit: SavedRevisionKit = {
      title: previewBuild.title,
      className: configClass,
      subjects: configSubjects,
      preset: configPreset,
      itemIds,
      completedIds: preservedDone,
      updatedAt: new Date().toISOString()
    };
    onSaveKit(nextKit);
    setStep('checklist');
    setShowAddPicker(false);
    onFeedback(`Built ${nextKit.title} (${itemIds.length} files)`);
  };

  const handleToggleItemCompleted = (itemId: string) => {
    if (!savedKit) return;
    const exists = savedKit.completedIds.includes(itemId);
    const nextCompleted = exists
      ? savedKit.completedIds.filter((id) => id !== itemId)
      : [...savedKit.completedIds, itemId];
    onSaveKit({
      ...savedKit,
      completedIds: nextCompleted,
      updatedAt: new Date().toISOString()
    });
  };

  const handleRemoveKitItem = (itemId: string) => {
    if (!savedKit) return;
    onSaveKit({
      ...savedKit,
      itemIds: savedKit.itemIds.filter((id) => id !== itemId),
      completedIds: savedKit.completedIds.filter((id) => id !== itemId),
      updatedAt: new Date().toISOString()
    });
  };

  const handleAddItemToKit = (item: StudyMaterial) => {
    if (!savedKit) return;
    const pid = getMaterialPrimaryId(item);
    if (!pid || savedKit.itemIds.includes(pid)) return;
    onSaveKit({
      ...savedKit,
      itemIds: [...savedKit.itemIds, pid],
      updatedAt: new Date().toISOString()
    });
    onFeedback('Added to revision kit');
  };

  const handleResetProgress = () => {
    if (!savedKit) return;
    onSaveKit({
      ...savedKit,
      completedIds: [],
      updatedAt: new Date().toISOString()
    });
    onFeedback('Checklist progress reset');
  };

  const handleCopyKitLink = async () => {
    if (!savedKit || resolvedKitItems.length === 0) return;
    const ids = resolvedKitItems.map(getMaterialPrimaryId);
    const url = buildKitShareUrl(ids, savedKit.title, savedKit.className);
    const copied = await copyTextToClipboard(url);
    if (copied) {
      setCopiedRecently(true);
      onFeedback('Revision kit link copied');
      setTimeout(() => setCopiedRecently(false), 1800);
    } else {
      onFeedback('Unable to copy link automatically');
    }
  };

  const whatsAppShareHref = useMemo(() => {
    if (!savedKit || resolvedKitItems.length === 0) return '#';
    return buildKitWhatsAppHref(
      resolvedKitItems.map(getMaterialPrimaryId),
      savedKit.title,
      savedKit.className
    );
  }, [savedKit, resolvedKitItems]);

  return (
    <div
      id="modal-revision-kit"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-950/75 backdrop-blur-xs"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 18 }}
        transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 w-full max-w-2xl sm:rounded-2xl rounded-t-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]"
      >
        {/* Mobile Sheet Grab Indicator */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-1 shrink-0 bg-white dark:bg-slate-900">
          <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700" aria-hidden="true" />
        </div>

        {/* Clean Header */}
        <header className="px-4 sm:px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-900/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <ClipboardCheck size={18} />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug break-words">
                {step === 'checklist' && savedKit?.title ? savedKit.title : 'Exam Revision Kit'}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {step === 'checklist'
                  ? 'Track completed papers locally · Share pack with one tap'
                  : 'Assemble a prioritized study checklist in seconds'}
              </p>
            </div>
          </div>

          <button
            id="btn-close-revision-kit"
            type="button"
            onClick={onClose}
            aria-label="Close Exam Revision Kit"
            className="min-h-[44px] min-w-[44px] -mr-1 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            <X size={18} />
          </button>
        </header>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {step === 'configure' ? (
            <div id="section-revision-kit-configure" className="space-y-5">
              {/* 1. Class Selection */}
              <div className="space-y-2">
                <span
                  id="label-kit-class"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  1. Choose Class
                </span>
                <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-labelledby="label-kit-class">
                  {availableClasses.map((cls) => {
                    const active = configClass === cls;
                    return (
                      <button
                        key={cls}
                        id={`btn-kit-class-${sanitizeElementId(cls)}`}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setConfigClass(cls)}
                        className={`min-h-[40px] px-3.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                          active
                            ? 'bg-[#0B2545] dark:bg-amber-500 text-white dark:text-slate-950'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {cls === 'ALL' ? 'All Classes' : cls}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Subject Multi-Select */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    2. Select Subjects{' '}
                    <span className="font-normal text-slate-500 dark:text-slate-400">
                      ({configSubjects.length === 0 ? 'All subjects' : `${configSubjects.length} selected`})
                    </span>
                  </span>
                  {configSubjects.length > 0 && (
                    <button
                      id="btn-kit-clear-subjects"
                      type="button"
                      onClick={() => setConfigSubjects([])}
                      className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                    >
                      Include all
                    </button>
                  )}
                </div>

                {classScopedSubjects.length === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400 py-2">
                    No subjects found for this class. Choose another class above.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {classScopedSubjects.map((subject) => {
                      const selected = configSubjects.includes(subject);
                      return (
                        <button
                          key={subject}
                          id={`btn-kit-subject-${sanitizeElementId(subject)}`}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => handleToggleSubject(subject)}
                          className={`min-h-[40px] px-3 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                            selected
                              ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-400 dark:border-amber-600 text-amber-800 dark:text-amber-300'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                          }`}
                        >
                          {selected && <Check size={13} className="shrink-0" />}
                          <span>{subject}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 3. Exam Focus Preset */}
              <div className="space-y-2">
                <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  3. Exam Focus Mode
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {REVISION_KIT_PRESETS.map((preset) => {
                    const active = configPreset === preset.id;
                    const matchCount = presetCounts[preset.id] || 0;
                    return (
                      <button
                        key={preset.id}
                        id={`btn-kit-preset-${preset.id}`}
                        type="button"
                        onClick={() => setConfigPreset(preset.id)}
                        className={`w-full min-h-[56px] p-3.5 rounded-xl border text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                          active
                            ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-500 dark:border-amber-500'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="min-w-0 space-y-0.5">
                          <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                            {preset.label}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {preset.description}
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 tabular-nums shrink-0 whitespace-nowrap">
                          {matchCount} {matchCount === 1 ? 'file' : 'files'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div id="section-revision-kit-checklist" className="space-y-4">
              {/* Shared Kit Notice Banner */}
              {sharedKitMeta?.isShared && (
                <div
                  id="banner-shared-revision-kit"
                  className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                >
                  <div className="text-xs text-slate-700 dark:text-slate-200 space-y-0.5">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      Shared Revision Kit opened from link
                    </p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      {sharedKitMeta.missingCount > 0
                        ? `${sharedKitMeta.missingCount} item(s) from this link are no longer public or available.`
                        : 'Save this kit to keep your checklist progress on this device.'}
                    </p>
                  </div>
                  {onAdoptSharedKit && savedKit && (
                    <button
                      id="btn-save-shared-kit-local"
                      type="button"
                      onClick={() => onAdoptSharedKit(savedKit)}
                      className="min-h-[40px] px-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors"
                    >
                      Save to My Device
                    </button>
                  )}
                </div>
              )}

              {/* Progress Overview Bar */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2.5">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-100 tabular-nums">
                    <CheckCircle2
                      size={15}
                      className={
                        completionPercent === 100 && resolvedKitItems.length > 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-amber-500'
                      }
                    />
                    <span>
                      {completedCount} / {resolvedKitItems.length} completed
                    </span>
                    <span className="text-slate-400" aria-hidden="true">·</span>
                    <span className="text-slate-600 dark:text-slate-300">{completionPercent}%</span>
                  </div>

                  <div className="flex items-center gap-1">
                    {completedCount > 0 && (
                      <button
                        id="btn-kit-reset-progress"
                        type="button"
                        onClick={handleResetProgress}
                        className="min-h-[36px] px-2.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 inline-flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw size={13} />
                        <span>Reset</span>
                      </button>
                    )}
                    <button
                      id="btn-kit-reconfigure"
                      type="button"
                      onClick={() => setStep('configure')}
                      className="min-h-[36px] px-2.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <SlidersHorizontal size={13} />
                      <span>Rebuild</span>
                    </button>
                  </div>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-200 ${
                      completionPercent === 100 && resolvedKitItems.length > 0
                        ? 'bg-emerald-500'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${completionPercent}%` }}
                  />
                </div>

                {/* Share & Bookmark Actions */}
                {resolvedKitItems.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      id="btn-kit-copy-link"
                      type="button"
                      onClick={handleCopyKitLink}
                      className="min-h-[40px] px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      {copiedRecently ? (
                        <Check size={14} className="text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Link2 size={14} />
                      )}
                      <span>{copiedRecently ? 'Link Copied' : 'Copy Kit Link'}</span>
                    </button>

                    <a
                      id="link-kit-whatsapp-share"
                      href={whatsAppShareHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[40px] px-3 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <Share2 size={14} />
                      <span>WhatsApp</span>
                    </a>

                    <button
                      id="btn-kit-save-all-bookmarks"
                      type="button"
                      onClick={() => onSaveAllToBookmarks(resolvedKitItems)}
                      className="min-h-[40px] px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <Bookmark size={14} />
                      <span>Save All</span>
                    </button>

                    <button
                      id="btn-kit-toggle-add-picker"
                      type="button"
                      onClick={() => setShowAddPicker((prev) => !prev)}
                      className="min-h-[40px] px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap ml-auto"
                    >
                      <Plus size={14} />
                      <span>Add File</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Inline Add Resource Picker */}
              {showAddPicker && (
                <div
                  id="section-kit-add-picker"
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5"
                >
                  <div className="relative">
                    <Search
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                    <input
                      id="input-kit-add-search"
                      type="text"
                      value={addSearch}
                      onChange={(e) => setAddSearch(e.target.value)}
                      placeholder="Search study resources to add..."
                      className="w-full min-h-[40px] pl-9 pr-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  {addableCandidates.length === 0 ? (
                    <p className="text-xs text-slate-500 dark:text-slate-400 px-1 py-1">
                      No additional matching files found.
                    </p>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-48 overflow-y-auto">
                      {addableCandidates.map((cand) => {
                        const pid = getMaterialPrimaryId(cand);
                        return (
                          <div
                            key={pid}
                            className="py-2 flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-slate-900 dark:text-white leading-snug break-words">
                                {cand.title}
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                {cand.subject} · {getResourceTypeLabel(cand)}
                              </p>
                            </div>
                            <button
                              id={`btn-kit-add-candidate-${sanitizeElementId(pid)}`}
                              type="button"
                              onClick={() => handleAddItemToKit(cand)}
                              className="min-h-[36px] px-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-white text-slate-800 dark:text-slate-100 text-xs font-semibold shrink-0 cursor-pointer transition-colors"
                            >
                              Add
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Checklist Rows */}
              {resolvedKitItems.length === 0 ? (
                <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    Your revision kit is empty
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Pick your class and subjects to build a fresh exam preparation checklist.
                  </p>
                  <button
                    id="btn-kit-empty-configure"
                    type="button"
                    onClick={() => setStep('configure')}
                    className="min-h-[44px] px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold cursor-pointer"
                  >
                    Configure Revision Kit
                  </button>
                </div>
              ) : (
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden bg-white dark:bg-slate-900">
                  {resolvedKitItems.map((item) => {
                    const pid = getMaterialPrimaryId(item);
                    const safeId = sanitizeElementId(pid);
                    const isDone = completedSet.has(pid);

                    return (
                      <div
                        key={pid}
                        id={`row-kit-item-${safeId}`}
                        className="px-2.5 sm:px-3.5 py-2.5 flex items-center gap-2 sm:gap-3 bg-white dark:bg-slate-900"
                      >
                        <button
                          id={`btn-kit-toggle-${safeId}`}
                          type="button"
                          role="checkbox"
                          aria-checked={isDone}
                          aria-label={isDone ? `Mark ${item.title} incomplete` : `Mark ${item.title} completed`}
                          onClick={() => handleToggleItemCompleted(pid)}
                          className="min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center shrink-0 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <span
                            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                              isDone
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                            }`}
                          >
                            {isDone && <Check size={13} strokeWidth={3} />}
                          </span>
                        </button>

                        <button
                          id={`btn-kit-preview-${safeId}`}
                          type="button"
                          onClick={() => onPreview(item)}
                          className="flex-1 min-w-0 text-left py-1 cursor-pointer group"
                        >
                          <p
                            className={`text-xs sm:text-sm font-semibold leading-snug break-words transition-colors ${
                              isDone
                                ? 'line-through text-slate-400 dark:text-slate-500'
                                : 'text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400'
                            }`}
                          >
                            {item.title}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums mt-0.5">
                            <span>{item.subject}</span>
                            <span aria-hidden="true"> · </span>
                            <span>{getResourceTypeLabel(item)}</span>
                            <span aria-hidden="true"> · </span>
                            <span>{getFileFormatLabel(item)}</span>
                            {item.size ? ` · ${item.size}` : ''}
                            {isDone && (
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                {' · Done'}
                              </span>
                            )}
                          </p>
                        </button>

                        <div className="flex items-center shrink-0">
                          <button
                            id={`btn-kit-download-${safeId}`}
                            type="button"
                            onClick={() => onDownload(item)}
                            disabled={downloadingId === item.id}
                            aria-label={`Download ${item.title}`}
                            title="Download"
                            className="min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <Download size={16} />
                          </button>

                          <button
                            id={`btn-kit-remove-${safeId}`}
                            type="button"
                            onClick={() => handleRemoveKitItem(pid)}
                            aria-label={`Remove ${item.title} from kit`}
                            title="Remove from kit"
                            className="min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <X size={15} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sticky Bottom Action Footer */}
        <footer className="px-4 sm:px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-2.5 shrink-0">
          {step === 'configure' ? (
            <>
              <div className="text-xs text-slate-600 dark:text-slate-400 tabular-nums">
                {hasExistingItems ? (
                  <button
                    id="btn-kit-back-to-checklist"
                    type="button"
                    onClick={() => setStep('checklist')}
                    className="min-h-[44px] px-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Back to Kit
                  </button>
                ) : (
                  <span>
                    {previewBuild.items.length}{' '}
                    {previewBuild.items.length === 1 ? 'resource' : 'resources'} matched
                  </span>
                )}
              </div>

              <button
                id="btn-build-revision-kit"
                type="button"
                disabled={previewBuild.items.length === 0}
                onClick={handleBuildKit}
                className="min-h-[44px] px-5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap tabular-nums"
              >
                <ClipboardCheck size={15} />
                <span>Build Revision Kit ({previewBuild.items.length})</span>
              </button>
            </>
          ) : (
            <>
              <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                Tap any title to preview PDF
              </span>
              <button
                id="btn-done-revision-kit"
                type="button"
                onClick={onClose}
                className="min-h-[44px] px-5 rounded-xl bg-[#0B2545] dark:bg-amber-500 hover:opacity-95 text-white dark:text-slate-950 text-xs sm:text-sm font-semibold cursor-pointer whitespace-nowrap"
              >
                Done
              </button>
            </>
          )}
        </footer>
      </motion.div>
    </div>
  );
};

export default RevisionKitModal;
