import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Bookmark,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
  Info,
  Link2,
  Loader2,
  Maximize2,
  Share2,
  X,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { StudyMaterial } from '../../types';
import { FormulaSheetViewer } from '../FormulaSheetViewer';
import {
  extractChapterInfo,
  formatResourceDate,
  getFileFormatLabel,
  getResourceTypeLabel,
  sanitizeElementId
} from './resourceMeta';
import {
  buildResourceShareUrl,
  buildResourceWhatsAppHref,
  copyTextToClipboard
} from './revisionKitHelpers';

interface ResourcePdfPreviewModalProps {
  material: StudyMaterial;
  siblingMaterials: StudyMaterial[];
  isBookmarked: boolean;
  isDownloading: boolean;
  onSelectMaterial: (item: StudyMaterial) => void;
  onClose: () => void;
  onDownload: (item: StudyMaterial) => void;
  onToggleBookmark: (item: StudyMaterial) => void;
  onShareFeedback?: (message: string) => void;
}

const getRawPreviewUrl = (material: StudyMaterial): string | null => {
  if (material.fileUrl && (material.fileUrl.startsWith('http') || material.fileUrl.startsWith('/') || material.fileUrl.startsWith('data:'))) {
    return material.fileUrl;
  }
  if (material.externalUrl && material.externalUrl.startsWith('http')) return material.externalUrl;
  if (
    material.fileData &&
    (material.fileData.startsWith('http') || material.fileData.startsWith('/') || material.fileData.startsWith('data:'))
  ) {
    return material.fileData;
  }
  return null;
};

export const ResourcePdfPreviewModal: React.FC<ResourcePdfPreviewModalProps> = ({
  material,
  siblingMaterials,
  isBookmarked,
  isDownloading,
  onSelectMaterial,
  onClose,
  onDownload,
  onToggleBookmark,
  onShareFeedback
}) => {
  const [pageNumber, setPageNumber] = useState(1);
  const [zoomPercent, setZoomPercent] = useState(100);
  const [isFrameLoading, setIsFrameLoading] = useState(true);
  const [hasFrameError, setHasFrameError] = useState(false);
  const [showMobileInfo, setShowMobileInfo] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement | null>(null);

  const isFormulaSheet =
    material.materialType === 'FORMULA_SHEET' ||
    material.category === 'FORMULA_SHEET' ||
    material.tags?.some((t) => t.toLowerCase().includes('formula'));

  const rawUrl = useMemo(() => getRawPreviewUrl(material), [material]);
  const whatsAppShareHref = useMemo(() => buildResourceWhatsAppHref(material), [material]);

  useEffect(() => {
    setPageNumber(1);
    setZoomPercent(100);
    setIsFrameLoading(Boolean(rawUrl && !isFormulaSheet));
    setHasFrameError(false);
    setShowMobileInfo(false);
    setShowShareMenu(false);
    setCopiedLink(false);
  }, [material.id, rawUrl, isFormulaSheet]);

  useEffect(() => {
    if (!showShareMenu) return;
    const handleOutsideClick = (event: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShowShareMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showShareMenu]);

  const handleCopyResourceLink = async () => {
    const shareUrl = buildResourceShareUrl(material);
    const copied = await copyTextToClipboard(shareUrl);
    if (copied) {
      setCopiedLink(true);
      onShareFeedback?.('Direct resource link copied');
      setTimeout(() => {
        setCopiedLink(false);
        setShowShareMenu(false);
      }, 900);
    } else {
      onShareFeedback?.('Unable to copy link automatically');
    }
  };

  const effectiveIframeUrl = useMemo(() => {
    if (!rawUrl) return null;
    if (rawUrl.startsWith('data:')) return rawUrl;
    const base = rawUrl.split('#')[0];
    return `${base}#page=${pageNumber}&zoom=${zoomPercent}`;
  }, [rawUrl, pageNumber, zoomPercent]);

  const typeLabel = getResourceTypeLabel(material);
  const formatLabel = getFileFormatLabel(material);
  const chapterInfo = extractChapterInfo(material);
  const uploadDate = formatResourceDate(material.createdAt || material.date);
  const updatedDate = formatResourceDate(material.updatedAt);

  const handleStepZoom = (delta: number) => {
    setZoomPercent((prev) => Math.min(200, Math.max(60, prev + delta)));
  };

  const handleStepPage = (delta: number) => {
    setPageNumber((prev) => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (material.pageCount && next > material.pageCount) return material.pageCount;
      return next;
    });
  };

  return (
    <div
      id="modal-pdf-preview"
      className="fixed inset-0 z-[60] flex items-center justify-center sm:p-4 lg:p-6 bg-slate-950/80 backdrop-blur-xs"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 18 }}
        transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 w-full h-dvh sm:h-[92dvh] max-w-7xl sm:rounded-2xl border-0 sm:border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden shadow-2xl"
      >
        {/* Top Reader Header Bar */}
        <header className="px-3 sm:px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2.5 shrink-0 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button
              id="btn-preview-back"
              type="button"
              onClick={onClose}
              aria-label="Back to resources"
              className="min-h-[44px] min-w-[44px] -ml-1 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            >
              <ArrowLeft size={18} />
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate tabular-nums">
                <span className="font-semibold text-amber-700 dark:text-amber-400">{material.subject}</span>
                {material.class && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{material.class}</span>
                  </>
                )}
                <span className="hidden sm:inline" aria-hidden="true">·</span>
                <span className="hidden sm:inline">{typeLabel}</span>
              </div>
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug break-words">
                {material.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              id="btn-preview-mobile-info"
              type="button"
              onClick={() => setShowMobileInfo((prev) => !prev)}
              aria-label={showMobileInfo ? 'Hide document details' : 'Show document details'}
              aria-expanded={showMobileInfo}
              className={`lg:hidden min-h-[44px] min-w-[44px] rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${
                showMobileInfo
                  ? 'bg-slate-900 dark:bg-slate-100 border-slate-900 dark:border-slate-100 text-white dark:text-slate-900'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Info size={16} />
            </button>

            <button
              id="btn-preview-modal-bookmark"
              type="button"
              onClick={() => onToggleBookmark(material)}
              aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark resource'}
              aria-pressed={isBookmarked}
              className={`min-h-[44px] min-w-[44px] rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${
                isBookmarked
                  ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-700 text-amber-600'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Bookmark
                size={16}
                className={isBookmarked ? 'fill-amber-500 text-amber-500' : ''}
              />
            </button>

            {/* Share Direct Link / WhatsApp Menu */}
            <div ref={shareMenuRef} className="relative">
              <button
                id="btn-preview-modal-share"
                type="button"
                onClick={() => setShowShareMenu((prev) => !prev)}
                aria-label="Share resource"
                aria-expanded={showShareMenu}
                aria-haspopup="menu"
                className={`min-h-[44px] min-w-[44px] rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${
                  showShareMenu
                    ? 'bg-slate-900 dark:bg-slate-100 border-slate-900 dark:border-slate-100 text-white dark:text-slate-900'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Share2 size={16} />
              </button>

              {showShareMenu && (
                <div
                  id="popover-preview-share"
                  role="menu"
                  className="absolute right-0 mt-1.5 w-52 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl p-1.5 z-30 space-y-1"
                >
                  <button
                    id="btn-preview-copy-link"
                    type="button"
                    role="menuitem"
                    onClick={handleCopyResourceLink}
                    className="w-full min-h-[42px] px-3 rounded-lg text-left text-xs font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    {copiedLink ? (
                      <Check size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : (
                      <Link2 size={14} className="text-slate-500 dark:text-slate-400 shrink-0" />
                    )}
                    <span>{copiedLink ? 'Link Copied' : 'Copy Direct Link'}</span>
                  </button>
                  <a
                    id="link-preview-whatsapp-share"
                    href={whatsAppShareHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    role="menuitem"
                    onClick={() => setShowShareMenu(false)}
                    className="w-full min-h-[42px] px-3 rounded-lg text-left text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center gap-2 transition-colors"
                  >
                    <Share2 size={14} className="shrink-0" />
                    <span>Share on WhatsApp</span>
                  </a>
                </div>
              )}
            </div>

            {rawUrl && (
              <a
                id="btn-preview-modal-open-tab"
                href={rawUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:inline-flex items-center gap-1.5 min-h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-colors whitespace-nowrap"
              >
                <ExternalLink size={14} />
                <span>Open Tab</span>
              </a>
            )}

            <button
              id="btn-preview-modal-download"
              type="button"
              onClick={() => onDownload(material)}
              disabled={isDownloading}
              className="min-h-[44px] px-3 sm:px-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap disabled:opacity-70 transition-colors"
            >
              <Download size={14} />
              <span className="hidden xs:inline sm:inline">
                {isDownloading ? 'Opening...' : 'Download'}
              </span>
            </button>

            <button
              id="btn-preview-modal-close"
              type="button"
              onClick={onClose}
              aria-label="Close Preview"
              className="hidden sm:flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        {/* Mobile Expandable Document Details Sheet */}
        <AnimatePresence initial={false}>
          {showMobileInfo && (
            <motion.div
              id="preview-mobile-info-drawer"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="lg:hidden overflow-hidden border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 shrink-0"
            >
              <div className="p-3.5 space-y-2.5 text-xs">
                <p className="font-bold text-slate-900 dark:text-white leading-snug">
                  {material.title}
                </p>
                {(material.description || material.desc) && (
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {material.description || material.desc}
                  </p>
                )}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/80 dark:border-slate-800 tabular-nums text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Category</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{typeLabel}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Format & Size</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {formatLabel}{material.size ? ` · ${material.size}` : ''}
                    </span>
                  </div>
                  {chapterInfo && (
                    <div>
                      <span className="text-slate-500 block">Chapter</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{chapterInfo}</span>
                    </div>
                  )}
                  {uploadDate && (
                    <div>
                      <span className="text-slate-500 block">Uploaded</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{uploadDate}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Body: Two-Panel Split on Desktop (lg:) / Full Canvas on Mobile */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Desktop Left Panel: Document Metadata & Sibling Directory */}
          <aside
            id="preview-desktop-sidebar"
            className="hidden lg:flex lg:w-80 xl:w-96 flex-col border-r border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 overflow-hidden shrink-0"
          >
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3 bg-white dark:bg-slate-900">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                  {typeLabel}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                  {material.title}
                </h3>
                {(material.description || material.desc) && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pt-1">
                    {material.description || material.desc}
                  </p>
                )}
              </div>

              <dl className="grid grid-cols-2 gap-2.5 text-[11px] pt-2 border-t border-slate-100 dark:border-slate-800 tabular-nums">
                <div>
                  <dt className="text-slate-500 dark:text-slate-400">Class</dt>
                  <dd className="font-semibold text-slate-900 dark:text-slate-100">
                    {material.class || 'All Classes'}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500 dark:text-slate-400">Subject</dt>
                  <dd className="font-semibold text-slate-900 dark:text-slate-100">
                    {material.subject}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500 dark:text-slate-400">Format & Size</dt>
                  <dd className="font-semibold text-slate-900 dark:text-slate-100">
                    {formatLabel} {material.size ? `· ${material.size}` : ''}
                  </dd>
                </div>
                {chapterInfo && (
                  <div>
                    <dt className="text-slate-500 dark:text-slate-400">Chapter</dt>
                    <dd className="font-semibold text-slate-900 dark:text-slate-100">{chapterInfo}</dd>
                  </div>
                )}
                {uploadDate && (
                  <div>
                    <dt className="text-slate-500 dark:text-slate-400">Uploaded</dt>
                    <dd className="font-semibold text-slate-900 dark:text-slate-100">{uploadDate}</dd>
                  </div>
                )}
                {updatedDate && updatedDate !== uploadDate && (
                  <div>
                    <dt className="text-slate-500 dark:text-slate-400">Updated</dt>
                    <dd className="font-semibold text-slate-900 dark:text-slate-100">{updatedDate}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Sibling Directory Switcher */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              <div className="px-1.5 py-1 flex items-center justify-between">
                <h4 className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  More in Directory
                </h4>
                <span className="text-[11px] font-medium text-slate-400 tabular-nums">
                  {siblingMaterials.length}
                </span>
              </div>

              {siblingMaterials.slice(0, 30).map((sib) => {
                const isActive = sib.id === material.id;
                const safeSibId = sanitizeElementId(String(sib.id || sib.slug));
                return (
                  <button
                    key={sib.id}
                    id={`btn-preview-sibling-${safeSibId}`}
                    type="button"
                    onClick={() => onSelectMaterial(sib)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl border transition-colors cursor-pointer space-y-0.5 ${
                      isActive
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-slate-900 dark:text-white'
                        : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <p className="text-xs font-semibold leading-snug break-words">{sib.title}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                      {sib.subject} · {getResourceTypeLabel(sib)}
                    </p>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Right / Mobile Full-Screen Reader Stage */}
          <div className="flex-1 flex flex-col bg-slate-100 dark:bg-slate-950 overflow-hidden relative">
            {/* Reader Controls Toolbar (Page Navigation & Zoom) */}
            {!isFormulaSheet && rawUrl && (
              <div
                id="preview-reader-toolbar"
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0"
              >
                {/* Page Navigation Controls */}
                <div className="flex items-center gap-1">
                  <button
                    id="btn-preview-prev-page"
                    type="button"
                    onClick={() => handleStepPage(-1)}
                    disabled={pageNumber <= 1}
                    aria-label="Previous page"
                    className="min-h-[38px] min-w-[38px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronLeft size={15} />
                  </button>
                  <div className="flex items-center gap-1 px-2 text-xs font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
                    <span className="hidden sm:inline text-slate-500 dark:text-slate-400 font-normal">Page</span>
                    <input
                      id="input-preview-page"
                      type="number"
                      min={1}
                      max={material.pageCount || 999}
                      value={pageNumber}
                      onChange={(e) => {
                        const v = parseInt(e.target.value, 10);
                        if (!isNaN(v) && v >= 1) setPageNumber(v);
                      }}
                      aria-label="Current page number"
                      className="w-11 h-8 text-center rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                    />
                    {material.pageCount && (
                      <span className="text-slate-500 dark:text-slate-400">/ {material.pageCount}</span>
                    )}
                  </div>
                  <button
                    id="btn-preview-next-page"
                    type="button"
                    onClick={() => handleStepPage(1)}
                    disabled={Boolean(material.pageCount && pageNumber >= material.pageCount)}
                    aria-label="Next page"
                    className="min-h-[38px] min-w-[38px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center gap-1">
                  <button
                    id="btn-preview-zoom-out"
                    type="button"
                    onClick={() => handleStepZoom(-20)}
                    disabled={zoomPercent <= 60}
                    aria-label="Zoom out"
                    className="min-h-[38px] min-w-[38px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center disabled:opacity-40 cursor-pointer"
                  >
                    <ZoomOut size={15} />
                  </button>
                  <span className="px-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 tabular-nums min-w-[44px] text-center">
                    {zoomPercent}%
                  </span>
                  <button
                    id="btn-preview-zoom-in"
                    type="button"
                    onClick={() => handleStepZoom(20)}
                    disabled={zoomPercent >= 200}
                    aria-label="Zoom in"
                    className="min-h-[38px] min-w-[38px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center disabled:opacity-40 cursor-pointer"
                  >
                    <ZoomIn size={15} />
                  </button>
                  <button
                    id="btn-preview-zoom-reset"
                    type="button"
                    onClick={() => setZoomPercent(100)}
                    aria-label="Reset zoom to fit"
                    className="hidden sm:inline-flex min-h-[38px] px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 items-center gap-1 text-xs font-semibold cursor-pointer"
                  >
                    <Maximize2 size={13} />
                    <span>Fit</span>
                  </button>
                </div>
              </div>
            )}

            {/* Viewer Viewport */}
            <div className="flex-1 relative overflow-hidden flex flex-col">
              {isFormulaSheet ? (
                <FormulaSheetViewer material={material} />
              ) : effectiveIframeUrl && !hasFrameError ? (
                <>
                  {isFrameLoading && (
                    <div
                      id="preview-loading-overlay"
                      className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2.5 bg-slate-100/95 dark:bg-slate-950/95 text-slate-600 dark:text-slate-300 p-6 text-center"
                    >
                      <Loader2 size={28} className="animate-spin text-amber-500" />
                      <p className="text-xs font-semibold">Loading document preview...</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs">
                        Some browsers block embedded external PDFs—use Open Tab or Download below if it stays blank.
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <a
                          id="btn-preview-loading-open-tab"
                          href={rawUrl || effectiveIframeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-h-[40px] px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold flex items-center gap-1.5"
                        >
                          <ExternalLink size={13} />
                          <span>Open PDF</span>
                        </a>
                        <button
                          id="btn-preview-loading-download"
                          type="button"
                          onClick={() => onDownload(material)}
                          className="min-h-[40px] px-3.5 rounded-xl bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Download size={13} />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <iframe
                    key={effectiveIframeUrl}
                    src={effectiveIframeUrl}
                    title={material.title}
                    onLoad={() => setIsFrameLoading(false)}
                    onError={() => {
                      setIsFrameLoading(false);
                      setHasFrameError(true);
                    }}
                    className="w-full h-full border-0 bg-white"
                  />

                  {/* Helpful Mobile Bottom Strip for External PDF Hosts */}
                  <div className="sm:hidden px-3 py-2 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 text-[11px]">
                    <span className="text-slate-500 dark:text-slate-400 truncate">
                      Blank screen on mobile?
                    </span>
                    <a
                      id="btn-preview-mobile-open-external"
                      href={rawUrl || effectiveIframeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[36px] px-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-semibold inline-flex items-center gap-1 shrink-0"
                    >
                      <ExternalLink size={12} />
                      <span>Open Native PDF</span>
                    </a>
                  </div>
                </>
              ) : (
                <div
                  id="preview-fallback-state"
                  className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4"
                >
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/70 dark:border-amber-900/50 flex items-center justify-center">
                    {hasFrameError ? <AlertCircle size={28} /> : <FileText size={28} />}
                  </div>

                  <div className="max-w-md space-y-1.5">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      {hasFrameError ? 'Inline preview unavailable' : material.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {hasFrameError
                        ? 'This external server blocked embedded viewing. Open the document directly in a new tab or download it for offline reading.'
                        : material.description ||
                          material.desc ||
                          'Tap Download below to open and save this study resource.'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-2.5">
                    {rawUrl && (
                      <a
                        id="btn-preview-error-open"
                        href={rawUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-h-[44px] px-5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-semibold text-xs inline-flex items-center gap-1.5"
                      >
                        <ExternalLink size={14} />
                        <span>Open in New Tab</span>
                      </a>
                    )}
                    <button
                      id="btn-preview-error-download"
                      type="button"
                      onClick={() => onDownload(material)}
                      className="min-h-[44px] px-5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download size={14} />
                      <span>Download {formatLabel}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
