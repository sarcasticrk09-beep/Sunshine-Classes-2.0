import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  FileText,
  Loader2,
  Upload,
  X
} from 'lucide-react';
import { motion } from 'motion/react';
import { uploadToSupabaseStorage } from '../../lib/supabase';
import {
  createStudyMaterial,
  generateSlug,
  inferCategoryFromType,
  updateStudyMaterial
} from '../../services/studyMaterialService';
import {
  StudyMaterial,
  StudyMaterialStatus,
  StudyMaterialType,
  User
} from '../../types';
import {
  UPLOAD_CLASSES_LIST,
  UPLOAD_SUBJECTS_LIST
} from './resourceMeta';

export interface UploadMaterialTypeOption {
  type: StudyMaterialType;
  label: string;
  badgeClass: string;
}

export const UPLOAD_MATERIAL_TYPES: UploadMaterialTypeOption[] = [
  { type: 'QUESTION_BANK', label: 'Question Bank / Important Questions', badgeClass: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300' },
  { type: 'SAMPLE_PAPER', label: 'Sample Paper', badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' },
  { type: 'PYQ', label: 'Previous Year Paper (PYQ)', badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' },
  { type: 'FORMULA_SHEET', label: 'Formula Sheet', badgeClass: 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300' },
  { type: 'WORKSHEET', label: 'Worksheet', badgeClass: 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300' },
  { type: 'ASSIGNMENT', label: 'Assignment', badgeClass: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300' },
  { type: 'SYLLABUS', label: 'Syllabus & Blueprint', badgeClass: 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300' },
  { type: 'LAB_MANUAL', label: 'Practical & Lab Manual', badgeClass: 'bg-lime-50 text-lime-700 dark:bg-lime-950/40 dark:text-lime-300' },
  { type: 'OTHER', label: 'Other Resource', badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  { type: 'NOTES', label: 'Chapter Notes', badgeClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' },
  { type: 'PDF', label: 'NCERT Book / PDF Document', badgeClass: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300' },
  { type: 'NCERT_SOLUTION', label: 'NCERT Solution', badgeClass: 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300' },
  { type: 'VIDEO_LINK', label: 'YouTube / Video Lecture', badgeClass: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300' },
  { type: 'EXTERNAL_LINK', label: 'External Link', badgeClass: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300' },
  { type: 'BLOG', label: 'Educational Article / Blog', badgeClass: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300' }
];

interface StudyMaterialUploadModalProps {
  currentUser: User;
  editingMaterial?: StudyMaterial | null;
  defaultClass?: string;
  defaultSubject?: string;
  defaultMaterialType?: StudyMaterialType;
  onClose: () => void;
  onSaved: (material: StudyMaterial, isEdit: boolean) => void;
  onAuditLog?: (action: string, details: string) => void;
}

interface UploadFormState {
  title: string;
  slug: string;
  description: string;
  class: string;
  subject: string;
  chapter: string;
  materialType: StudyMaterialType;
  fileUrl: string;
  thumbnailUrl: string;
  youtubeUrl: string;
  externalUrl: string;
  fileData: string;
  fileName: string;
  fileSize: string;
  isPublic: boolean;
  status: StudyMaterialStatus;
  tagsInput: string;
  seoTitle: string;
  metaDescription: string;
  keywordsInput: string;
}

const buildInitialFormState = (
  editingMaterial: StudyMaterial | null | undefined,
  defaultClass: string,
  defaultSubject: string,
  defaultMaterialType: StudyMaterialType
): UploadFormState => {
  if (editingMaterial) {
    return {
      title: editingMaterial.title || '',
      slug: editingMaterial.slug || generateSlug(editingMaterial.title || ''),
      description: editingMaterial.description || editingMaterial.desc || '',
      class: editingMaterial.class || 'Class 10',
      subject: editingMaterial.subject || 'Mathematics',
      chapter: editingMaterial.chapter || '',
      materialType: editingMaterial.materialType || 'QUESTION_BANK',
      fileUrl: editingMaterial.fileUrl || '',
      thumbnailUrl: editingMaterial.thumbnailUrl || '',
      youtubeUrl: editingMaterial.youtubeUrl || '',
      externalUrl: editingMaterial.externalUrl || '',
      fileData: editingMaterial.fileData || '',
      fileName: editingMaterial.file || '',
      fileSize: editingMaterial.size || '',
      isPublic: editingMaterial.isPublic !== undefined ? editingMaterial.isPublic : true,
      status: editingMaterial.status || 'PUBLISHED',
      tagsInput: editingMaterial.tags ? editingMaterial.tags.join(', ') : '',
      seoTitle: editingMaterial.seoTitle || '',
      metaDescription: editingMaterial.metaDescription || '',
      keywordsInput: editingMaterial.keywords ? editingMaterial.keywords.join(', ') : ''
    };
  }

  return {
    title: '',
    slug: '',
    description: '',
    class: defaultClass && defaultClass !== 'ALL' ? defaultClass : 'Class 10',
    subject: defaultSubject && defaultSubject !== 'ALL' ? defaultSubject : 'Mathematics',
    chapter: '',
    materialType: defaultMaterialType || 'QUESTION_BANK',
    fileUrl: '',
    thumbnailUrl: '',
    youtubeUrl: '',
    externalUrl: '',
    fileData: '',
    fileName: '',
    fileSize: '',
    isPublic: true,
    status: 'PUBLISHED',
    tagsInput: '',
    seoTitle: '',
    metaDescription: '',
    keywordsInput: ''
  };
};

export const StudyMaterialUploadModal: React.FC<StudyMaterialUploadModalProps> = ({
  currentUser,
  editingMaterial = null,
  defaultClass = 'Class 10',
  defaultSubject = 'Mathematics',
  defaultMaterialType = 'QUESTION_BANK',
  onClose,
  onSaved,
  onAuditLog
}) => {
  const [formData, setFormData] = useState<UploadFormState>(() =>
    buildInitialFormState(editingMaterial, defaultClass, defaultSubject, defaultMaterialType)
  );
  const [showMoreOptions, setShowMoreOptions] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fileUploadProgress, setFileUploadProgress] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    setFormData(buildInitialFormState(editingMaterial, defaultClass, defaultSubject, defaultMaterialType));
    setFormError(null);
    setFileUploadProgress(null);
    setShowMoreOptions(false);
  }, [editingMaterial, defaultClass, defaultSubject, defaultMaterialType]);

  const classOptions = useMemo(() => {
    if (formData.class && !UPLOAD_CLASSES_LIST.includes(formData.class)) {
      return [formData.class, ...UPLOAD_CLASSES_LIST];
    }
    return UPLOAD_CLASSES_LIST;
  }, [formData.class]);

  const subjectOptions = useMemo(() => {
    if (formData.subject && !UPLOAD_SUBJECTS_LIST.includes(formData.subject)) {
      return [formData.subject, ...UPLOAD_SUBJECTS_LIST];
    }
    return UPLOAD_SUBJECTS_LIST;
  }, [formData.subject]);

  const handleTitleChange = (newTitle: string) => {
    setFormData((prev) => ({
      ...prev,
      title: newTitle,
      slug:
        prev.slug === '' || prev.slug === generateSlug(prev.title)
          ? generateSlug(newTitle)
          : prev.slug,
      seoTitle:
        prev.seoTitle === '' || (prev.title && prev.seoTitle.includes(prev.title))
          ? `${newTitle} PDF - Sunshine Classes`
          : prev.seoTitle
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedExtensions = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'zip', 'png', 'jpg', 'jpeg', 'webp'];
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (!ext || !allowedExtensions.includes(ext)) {
      setFormError(`Unsupported file type (.${ext || 'unknown'}). Allowed: PDF, Word, PPT, ZIP, or Images.`);
      return;
    }

    const MAX_SIZE = 25 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setFormError('File exceeds the 25 MB upload limit.');
      return;
    }

    setFormError(null);
    setFileUploadProgress(25);

    const sizeLabel =
      file.size >= 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.max(1, Math.round(file.size / 1024))} KB`;
    const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ').trim();

    try {
      const res = await uploadToSupabaseStorage(file, file.name, {
        bucket: 'sunshine-media',
        folder: 'study-materials'
      });

      let finalUrl = res.url || '';
      setFileUploadProgress(70);

      if (finalUrl.startsWith('data:')) {
        try {
          const apiRes = await fetch('/api/storage/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileBase64: finalUrl,
              fileName: file.name,
              contentType: file.type || 'application/pdf',
              folder: 'study-materials',
              bucket: 'sunshine-media'
            })
          });
          const apiData = await apiRes.json().catch(() => null);
          if (apiData?.success && apiData?.url) {
            finalUrl = apiData.url;
          }
        } catch {
          // Keep DataURL fallback when offline
        }
      }

      const isDataUrl = finalUrl.startsWith('data:');
      if (isDataUrl && file.size > 4 * 1024 * 1024) {
        setFileUploadProgress(null);
        setFormError('Cloud storage is unreachable for files over 4 MB. Please retry when online or paste a PDF link.');
        return;
      }

      setFileUploadProgress(100);
      setTimeout(() => setFileUploadProgress(null), 400);

      setFormData((prev) => ({
        ...prev,
        title: prev.title.trim() ? prev.title : cleanTitle,
        slug: prev.slug || generateSlug(prev.title.trim() ? prev.title : cleanTitle),
        fileName: file.name,
        fileSize: sizeLabel,
        fileUrl: isDataUrl ? '' : finalUrl,
        fileData: isDataUrl ? finalUrl : ''
      }));
    } catch {
      setFileUploadProgress(null);
      setFormError('Could not upload file. Please retry or paste a direct PDF link.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = formData.title.trim();
    if (!trimmedTitle) {
      setFormError('Document title is required.');
      return;
    }

    if (formData.materialType === 'VIDEO_LINK' && !formData.youtubeUrl.trim()) {
      setFormError('Please enter a YouTube or video URL.');
      return;
    }

    if (formData.materialType === 'EXTERNAL_LINK' && !formData.externalUrl.trim()) {
      setFormError('Please enter an external resource URL.');
      return;
    }

    setFormError(null);
    setIsSaving(true);

    const defaultTags = [formData.class, formData.subject].filter(Boolean);
    const parsedTags = formData.tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    const tagsArray = parsedTags.length > 0 ? parsedTags : defaultTags;

    const keywordsArray = formData.keywordsInput
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    const autoSlug = formData.slug.trim() || generateSlug(trimmedTitle);
    const category = inferCategoryFromType(formData.materialType);
    const uploaderName = currentUser?.name || currentUser?.username || 'Faculty';

    try {
      if (editingMaterial) {
        const updates: Partial<StudyMaterial> = {
          title: trimmedTitle,
          slug: autoSlug,
          description: formData.description.trim(),
          desc: formData.description.trim(),
          class: formData.class,
          subject: formData.subject,
          chapter: formData.chapter.trim(),
          materialType: formData.materialType,
          category,
          fileUrl: formData.fileUrl.trim(),
          file: formData.fileName || editingMaterial.file || `${autoSlug}.pdf`,
          size: formData.fileSize || editingMaterial.size || '1.0 MB',
          thumbnailUrl: formData.thumbnailUrl,
          youtubeUrl: formData.youtubeUrl.trim(),
          externalUrl: formData.externalUrl.trim(),
          fileData: formData.fileData || '',
          isPublic: formData.isPublic,
          status: formData.status,
          tags: tagsArray,
          seoTitle: formData.seoTitle.trim() || `${trimmedTitle} PDF - Sunshine Classes`,
          metaDescription: formData.metaDescription.trim() || formData.description.trim(),
          keywords: keywordsArray.length > 0 ? keywordsArray : tagsArray
        };

        await updateStudyMaterial(editingMaterial.id, updates);

        const merged: StudyMaterial = {
          ...editingMaterial,
          ...updates,
          updatedAt: new Date().toISOString()
        };

        if (onAuditLog) {
          onAuditLog(
            'UPDATE_STUDY_MATERIAL',
            `Updated "${trimmedTitle}" (${formData.class} ${formData.subject})`
          );
        }

        onSaved(merged, true);
      } else {
        const created = await createStudyMaterial({
          title: trimmedTitle,
          slug: autoSlug,
          description: formData.description.trim(),
          desc: formData.description.trim(),
          class: formData.class,
          subject: formData.subject,
          chapter: formData.chapter.trim(),
          materialType: formData.materialType,
          category,
          fileUrl: formData.fileUrl.trim(),
          file: formData.fileName || `${autoSlug}.pdf`,
          size: formData.fileSize || '1.0 MB',
          thumbnailUrl: formData.thumbnailUrl,
          youtubeUrl: formData.youtubeUrl.trim(),
          externalUrl: formData.externalUrl.trim(),
          fileData: formData.fileData,
          isPublic: formData.isPublic,
          status: formData.status,
          tags: tagsArray,
          seoTitle: formData.seoTitle.trim() || `${trimmedTitle} PDF - Sunshine Classes`,
          metaDescription: formData.metaDescription.trim() || formData.description.trim(),
          keywords: keywordsArray.length > 0 ? keywordsArray : tagsArray,
          createdBy: uploaderName,
          uploadedBy: uploaderName,
          date: new Date().toISOString().split('T')[0]
        });

        if (onAuditLog) {
          onAuditLog(
            'UPLOAD_STUDY_MATERIAL',
            `Uploaded "${trimmedTitle}" for ${formData.class} ${formData.subject}`
          );
        }

        onSaved(created, false);
      }
    } catch (err) {
      console.error('Error saving study material:', err);
      setFormError('Failed to save document. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const hasUploadedAttachment = Boolean(formData.fileName || formData.fileUrl || formData.fileData);

  return (
    <div
      id="modal-study-material-upload"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-950/70 backdrop-blur-xs"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 18 }}
        transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 w-full max-w-xl sm:rounded-2xl rounded-t-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]"
      >
        {/* Clean Header */}
        <header className="px-4 sm:px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0 bg-white dark:bg-slate-900">
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              {editingMaterial ? 'Edit Study Resource' : 'Upload Study Resource'}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Syncs immediately across CMS, Student Dashboard, and Library
            </p>
          </div>
          <button
            id="btn-close-upload-modal"
            type="button"
            onClick={onClose}
            aria-label="Close upload modal"
            className="min-h-[40px] min-w-[40px] rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            <X size={18} />
          </button>
        </header>

        {/* Form Body */}
        <form
          id="form-study-material-upload"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4"
        >
          {formError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-medium border border-rose-200 dark:border-rose-800 flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* 1. Primary File Upload or Link */}
          {formData.materialType === 'VIDEO_LINK' ? (
            <div>
              <label
                htmlFor="input-material-youtube-url"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                YouTube / Video URL <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-material-youtube-url"
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={formData.youtubeUrl}
                onChange={(e) => setFormData((prev) => ({ ...prev, youtubeUrl: e.target.value }))}
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          ) : formData.materialType === 'EXTERNAL_LINK' ? (
            <div>
              <label
                htmlFor="input-material-external-url"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                Resource URL <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-material-external-url"
                type="url"
                placeholder="https://..."
                value={formData.externalUrl}
                onChange={(e) => setFormData((prev) => ({ ...prev, externalUrl: e.target.value }))}
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label
                id="label-file-upload-study-material"
                htmlFor="file-input-study-material"
                className="flex flex-col items-center justify-center gap-1.5 w-full min-h-[96px] px-4 py-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40 hover:border-amber-500 dark:hover:border-amber-500 transition-colors cursor-pointer text-center"
              >
                <Upload size={20} className="text-amber-500" />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {hasUploadedAttachment ? 'Replace attached file' : 'Choose PDF, Word, PPT, or Image'}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Max 25 MB · Auto-fills title from filename
                </span>
                <input
                  id="file-input-study-material"
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.png,.jpg,.jpeg,.webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {fileUploadProgress !== null && (
                <div className="space-y-1">
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full transition-all duration-300"
                      style={{ width: `${fileUploadProgress}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Uploading document...</p>
                </div>
              )}

              {hasUploadedAttachment && fileUploadProgress === null && (
                <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="font-medium text-slate-800 dark:text-slate-100 truncate">
                      {formData.fileName || formData.fileUrl || 'Attached document'}
                    </span>
                    {formData.fileSize && (
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums shrink-0">
                        · {formData.fileSize}
                      </span>
                    )}
                  </div>
                  <button
                    id="btn-remove-uploaded-file"
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        fileName: '',
                        fileSize: '',
                        fileUrl: '',
                        fileData: ''
                      }))
                    }
                    aria-label="Remove attached file"
                    className="min-h-[32px] min-w-[32px] rounded-lg flex items-center justify-center text-slate-500 hover:text-rose-600 hover:bg-white dark:hover:bg-slate-800 cursor-pointer shrink-0"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 2. Title */}
          <div>
            <label
              htmlFor="input-material-title"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
            >
              Document Title <span className="text-rose-500">*</span>
            </label>
            <input
              id="input-material-title"
              type="text"
              required
              placeholder="e.g., Class 10 Mathematics Important Board Questions"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* 3. Category, Class & Subject */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label
                htmlFor="select-material-type"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                Category
              </label>
              <select
                id="select-material-type"
                value={formData.materialType}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    materialType: e.target.value as StudyMaterialType
                  }))
                }
                className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                {UPLOAD_MATERIAL_TYPES.map((t) => (
                  <option key={t.type} value={t.type}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="select-material-class"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                Class
              </label>
              <select
                id="select-material-class"
                value={formData.class}
                onChange={(e) => setFormData((prev) => ({ ...prev, class: e.target.value }))}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                {classOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="select-material-subject"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                Subject
              </label>
              <select
                id="select-material-subject"
                value={formData.subject}
                onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                {subjectOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 4. Collapsible Optional Details */}
          <div className="pt-1 border-t border-slate-200 dark:border-slate-800">
            <button
              id="btn-toggle-upload-more-options"
              type="button"
              onClick={() => setShowMoreOptions((prev) => !prev)}
              aria-expanded={showMoreOptions}
              className="w-full min-h-[40px] flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <FileText size={14} className="text-slate-400" />
                <span>More options (Chapter, summary, visibility & SEO)</span>
              </span>
              <ChevronDown
                size={15}
                className={`text-slate-400 transition-transform ${showMoreOptions ? 'rotate-180' : ''}`}
              />
            </button>

            {showMoreOptions && (
              <div id="section-upload-more-options" className="pt-3 space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="input-material-chapter"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                    >
                      Chapter (Optional)
                    </label>
                    <input
                      id="input-material-chapter"
                      type="text"
                      placeholder="e.g., Chapter 1: Real Numbers"
                      value={formData.chapter}
                      onChange={(e) => setFormData((prev) => ({ ...prev, chapter: e.target.value }))}
                      className="w-full min-h-[40px] px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="select-material-status"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                    >
                      Status
                    </label>
                    <select
                      id="select-material-status"
                      value={formData.status}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          status: e.target.value as StudyMaterialStatus
                        }))
                      }
                      className="w-full min-h-[40px] px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="PUBLISHED">Published (Live)</option>
                      <option value="DRAFT">Draft (Hidden)</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                  </div>
                </div>

                {formData.materialType !== 'VIDEO_LINK' && formData.materialType !== 'EXTERNAL_LINK' && (
                  <div>
                    <label
                      htmlFor="input-material-file-url"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                    >
                      Or paste direct PDF URL
                    </label>
                    <input
                      id="input-material-file-url"
                      type="url"
                      placeholder="https://..."
                      value={formData.fileUrl}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          fileUrl: e.target.value,
                          fileData: ''
                        }))
                      }
                      className="w-full min-h-[40px] px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                )}

                <div>
                  <label
                    htmlFor="input-material-description"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Summary / Notes
                  </label>
                  <textarea
                    id="input-material-description"
                    rows={2}
                    placeholder="Brief overview of topics covered..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, description: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="input-material-tags"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Tags (Comma separated)
                  </label>
                  <input
                    id="input-material-tags"
                    type="text"
                    placeholder="Board Exam, Important Questions, 2026"
                    value={formData.tagsInput}
                    onChange={(e) => setFormData((prev) => ({ ...prev, tagsInput: e.target.value }))}
                    className="w-full min-h-[40px] px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <label className="inline-flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-200 min-h-[36px]">
                  <input
                    id="checkbox-material-is-public"
                    type="checkbox"
                    checked={formData.isPublic}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, isPublic: e.target.checked }))
                    }
                    className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500 cursor-pointer"
                  />
                  <span>Available on Public Website without student login</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <label
                      htmlFor="input-material-slug"
                      className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1"
                    >
                      URL Slug
                    </label>
                    <input
                      id="input-material-slug"
                      type="text"
                      placeholder="auto-generated-slug"
                      value={formData.slug}
                      onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                      className="w-full min-h-[38px] px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="input-material-seo-title"
                      className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1"
                    >
                      SEO Title
                    </label>
                    <input
                      id="input-material-seo-title"
                      type="text"
                      placeholder="Document Title - Sunshine Classes"
                      value={formData.seoTitle}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, seoTitle: e.target.value }))
                      }
                      className="w-full min-h-[38px] px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="input-material-meta-description"
                      className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1"
                    >
                      Meta Description
                    </label>
                    <input
                      id="input-material-meta-description"
                      type="text"
                      placeholder="Short search engine summary..."
                      value={formData.metaDescription}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, metaDescription: e.target.value }))
                      }
                      className="w-full min-h-[38px] px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              id="btn-cancel-material-form"
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="min-h-[44px] px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              id="btn-submit-material-form"
              type="submit"
              disabled={isSaving || fileUploadProgress !== null}
              className="min-h-[44px] px-5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60 whitespace-nowrap"
            >
              {isSaving && <Loader2 size={14} className="animate-spin" />}
              <span>
                {isSaving
                  ? 'Syncing...'
                  : editingMaterial
                  ? 'Save Changes'
                  : 'Upload & Publish'}
              </span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default StudyMaterialUploadModal;
