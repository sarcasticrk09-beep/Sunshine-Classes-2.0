import React from 'react';
import {
  CheckCircle2,
  Download,
  Lock
} from 'lucide-react';
import { StudyMaterial } from '../../types';
import {
  extractChapterInfo,
  getCategoryMeta,
  getFileFormatLabel,
  getResourceCategoryId,
  sanitizeElementId
} from './resourceMeta';

interface ResourceDirectoryRowProps {
  item: StudyMaterial;
  isExpanded?: boolean;
  isBookmarked?: boolean;
  isDownloaded: boolean;
  isLocked: boolean;
  isDownloading: boolean;
  onToggleExpand?: (id: string) => void;
  onPreview: (item: StudyMaterial) => void;
  onDownload: (item: StudyMaterial) => void;
  onToggleBookmark?: (item: StudyMaterial) => void;
}

export const ResourceDirectoryRow: React.FC<ResourceDirectoryRowProps> = ({
  item,
  isDownloaded,
  isLocked,
  isDownloading,
  onPreview,
  onDownload
}) => {
  const id = item.id || item.materialId || item.slug;
  const safeId = sanitizeElementId(String(id));
  const categoryId = getResourceCategoryId(item);
  const categoryMeta = getCategoryMeta(categoryId);
  const Icon = categoryMeta?.Icon;
  const iconClass =
    categoryMeta?.iconClass ||
    'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';

  const formatLabel = getFileFormatLabel(item);
  const chapterInfo = extractChapterInfo(item);
  const normalizedTitle = (item.title || '').toLowerCase();
  const distinctChapter =
    chapterInfo && !normalizedTitle.includes(chapterInfo.toLowerCase()) ? chapterInfo : '';

  return (
    <div
      id={`row-study-resource-${safeId}`}
      role="button"
      tabIndex={0}
      onClick={() => onPreview(item)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onPreview(item);
        }
      }}
      aria-label={`Preview ${item.title}`}
      className="px-3.5 py-3 sm:px-5 sm:py-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50/90 dark:hover:bg-slate-800/40 active:bg-slate-100/80 dark:active:bg-slate-800/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-500 transition-colors cursor-pointer"
    >
      <div className="flex items-center justify-between gap-2.5 sm:gap-4 min-w-0">
        {/* Left Zone: Minimal Category Icon (sm+) + Ellipsis Title + 1-Line Subtitle */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {Icon && (
            <div
              className={`hidden sm:flex w-9 h-9 rounded-xl border items-center justify-center shrink-0 ${iconClass}`}
            >
              <Icon size={16} />
            </div>
          )}

          <div className="min-w-0 flex-1 space-y-0.5">
            <h3
              title={item.title}
              className="text-[13px] sm:text-sm font-semibold text-slate-900 dark:text-white leading-snug break-words"
            >
              {item.title}
            </h3>

            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 tabular-nums truncate">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {item.class || item.subject}
              </span>
              <span aria-hidden="true"> · </span>
              <span>{formatLabel}</span>
              {item.size ? ` · ${item.size}` : ''}
              {distinctChapter ? ` · ${distinctChapter}` : ''}
              {isLocked && (
                <span className="text-rose-600 dark:text-rose-400 font-semibold">
                  {' · '}
                  <Lock size={10} className="inline -mt-0.5 mr-0.5" />
                  Enrolled
                </span>
              )}
              {!isLocked && isDownloaded && (
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                  {' · '}
                  <CheckCircle2 size={10} className="inline -mt-0.5 mr-0.5" />
                  Offline
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Single Clean Download Trigger (Tap row anywhere else to Preview) */}
        <button
          id={`btn-download-inline-${safeId}`}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDownload(item);
          }}
          disabled={isDownloading}
          aria-label={`Download ${item.title}`}
          title="Download"
          className={`min-h-[44px] min-w-[44px] -mr-1.5 sm:mr-0 rounded-xl flex items-center justify-center shrink-0 active:scale-95 transition-colors cursor-pointer disabled:opacity-60 ${
            isDownloaded
              ? 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
              : 'text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Download size={17} />
        </button>
      </div>
    </div>
  );
};
