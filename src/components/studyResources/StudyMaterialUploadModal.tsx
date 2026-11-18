import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  FileText,
  Loader2,
  RotateCcw,
  Tag,
  Trash2,
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
  parseStudyMaterialFilename,
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

const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'zip', 'png', 'jpg', 'jpeg', 'webp'];
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;
const MAX_OFFLINE_DATAURL_BYTES = 4 * 1024 * 1024;
const BULK_UPLOAD_CONCURRENCY = 3;

interface StudyMaterialUploadModalProps {
  currentUser: User;
  editingMaterial?: StudyMaterial | null;
  defaultClass?: string;
  defaultSubject?: string;
  defaultMaterialType?: StudyMaterialType;
  onClose: () => void;
  onSaved: (material: StudyMaterial, isEdit: boolean) => void;
  onBulkSaved?: (materials: StudyMaterial[]) => void;
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

interface BulkUploadQueueItem {
  queueId: string;
  file: File | null;
  fileName: string;
  fileSize: string;
  title: string;
  slug: string;
  class: string;
  subject: string;
  chapter: string;
  materialType: StudyMaterialType;
  tagsInput: string;
  isPublic: boolean;
  status: 'uploading' | 'ready' | 'error';
  progress: number;
  fileUrl: string;
  fileData: string;
  errorMessage?: string;
}

const formatFileSizeLabel = (bytes: number): string =>
  bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;

const makeQueueId = (seed: number): string =>
  `q-${Date.now()}-${seed}-${Math.random().toString(36).slice(2, 7)}`;

const createMaterialId = (index: number): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `mat-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`;
};

const validateDocumentFile = (file: File): string | null => {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
    return `Unsupported file type (.${ext || 'unknown'}). Allowed: PDF, Word, PPT, ZIP, or Images.`;
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return 'File exceeds the 25 MB upload limit.';
  }
  return null;
};

const uploadDocumentFile = async (
  file: File,
  onProgress?: (pct: number) => void
): Promise<{ fileUrl: string; fileData: string; fileSize: string }> => {
  onProgress?.(25);
  const res = await uploadToSupabaseStorage(file, file.name, {
    bucket: 'sunshine-media',
    folder: 'study-materials'
  });

  let finalUrl = res.url || '';
  onProgress?.(70);

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
      // Retain DataURL fallback when offline
    }
  }

  const isDataUrl = finalUrl.startsWith('data:');
  if (isDataUrl && file.size > MAX_OFFLINE_DATAURL_BYTES) {
    throw new Error('Cloud storage is unreachable for files over 4 MB.');
  }

  onProgress?.(100);
  return {
    fileUrl: isDataUrl ? '' : finalUrl,
    fileData: isDataUrl ? finalUrl : '',
    fileSize: formatFileSizeLabel(file.size)
  };
};

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
  onBulkSaved,
  onAuditLog
}) => {
  const [formData, setFormData] = useState<UploadFormState>(() =>
    buildInitialFormState(editingMaterial, defaultClass, defaultSubject, defaultMaterialType)
  );
  const [bulkQueue, setBulkQueue] = useState<BulkUploadQueueItem[]>([]);
  const [bulkAllPublic, setBulkAllPublic] = useState<boolean>(true);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);
  const [showMoreOptions, setShowMoreOptions] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fileUploadProgress, setFileUploadProgress] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const dragDepthRef = useRef<number>(0);
  const isMountedRef = useRef<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    setFormData(buildInitialFormState(editingMaterial, defaultClass, defaultSubject, defaultMaterialType));
    setBulkQueue([]);
    setBulkAllPublic(true);
    setIsDraggingOver(false);
    dragDepthRef.current = 0;
    setFormError(null);
    setFileUploadProgress(null);
    setShowMoreOptions(false);
  }, [editingMaterial, defaultClass, defaultSubject, defaultMaterialType]);

  const isBulkMode = !editingMaterial && bulkQueue.length > 0;
  const isLinkType = formData.materialType === 'VIDEO_LINK' || formData.materialType === 'EXTERNAL_LINK';

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

  const bulkSummary = useMemo(() => {
    let uploading = 0;
    let ready = 0;
    let error = 0;
    bulkQueue.forEach((item) => {
      if (item.status === 'uploading') uploading += 1;
      else if (item.status === 'ready') ready += 1;
      else error += 1;
    });
    return { total: bulkQueue.length, uploading, ready, error };
  }, [bulkQueue]);

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

  const runConcurrentUploads = async (itemsToUpload: BulkUploadQueueItem[]) => {
    let cursor = 0;
    const worker = async () => {
      while (cursor < itemsToUpload.length) {
        const current = itemsToUpload[cursor];
        cursor += 1;
        if (!current || !current.file) continue;

        const validationError = validateDocumentFile(current.file);
        if (validationError) {
          if (!isMountedRef.current) return;
          setBulkQueue((prev) =>
            prev.map((q) =>
              q.queueId === current.queueId
                ? { ...q, status: 'error', progress: 0, errorMessage: validationError }
                : q
            )
          );
          continue;
        }

        try {
          const uploaded = await uploadDocumentFile(current.file, (pct) => {
            if (!isMountedRef.current) return;
            setBulkQueue((prev) =>
              prev.map((q) =>
                q.queueId === current.queueId ? { ...q, progress: pct } : q
              )
            );
          });
          if (!isMountedRef.current) return;
          setBulkQueue((prev) =>
            prev.map((q) =>
              q.queueId === current.queueId
                ? {
                    ...q,
                    status: 'ready',
                    progress: 100,
                    fileUrl: uploaded.fileUrl,
                    fileData: uploaded.fileData,
                    fileSize: uploaded.fileSize,
                    errorMessage: undefined
                  }
                : q
            )
          );
        } catch (err) {
          if (!isMountedRef.current) return;
          const msg = err instanceof Error ? err.message : 'Upload failed';
          setBulkQueue((prev) =>
            prev.map((q) =>
              q.queueId === current.queueId
                ? { ...q, status: 'error', progress: 0, errorMessage: msg }
                : q
            )
          );
        }
      }
    };

    const workerCount = Math.min(BULK_UPLOAD_CONCURRENCY, itemsToUpload.length);
    await Promise.all(Array.from({ length: workerCount }, () => worker()));
  };

  const processSingleDocumentFile = async (file: File) => {
    const validationError = validateDocumentFile(file);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setFormError(null);
    setFileUploadProgress(20);

    const parsed = parseStudyMaterialFilename(file.name, {
      defaultClass: formData.class,
      defaultSubject: formData.subject,
      defaultMaterialType: isLinkType ? 'QUESTION_BANK' : formData.materialType
    });

    try {
      const uploaded = await uploadDocumentFile(file, (pct) => {
        if (isMountedRef.current) setFileUploadProgress(pct);
      });
      if (!isMountedRef.current) return;

      setTimeout(() => {
        if (isMountedRef.current) setFileUploadProgress(null);
      }, 300);

      setFormData((prev) => {
        const resolvedTitle = prev.title.trim() ? prev.title : parsed.title;
        const resolvedClass = parsed.detectedClass || prev.class;
        const resolvedSubject = parsed.detectedSubject || prev.subject;
        const resolvedType =
          parsed.detectedMaterialType && !isLinkType
            ? parsed.detectedMaterialType
            : prev.materialType;
        const resolvedChapter = prev.chapter.trim() || parsed.detectedChapter || '';
        const resolvedTags =
          prev.tagsInput.trim().length > 0 ? prev.tagsInput : parsed.tags.join(', ');

        return {
          ...prev,
          title: resolvedTitle,
          slug: prev.slug || generateSlug(resolvedTitle),
          seoTitle: prev.seoTitle || `${resolvedTitle} PDF - Sunshine Classes`,
          class: resolvedClass,
          subject: resolvedSubject,
          materialType: resolvedType,
          chapter: resolvedChapter,
          tagsInput: resolvedTags,
          fileName: file.name,
          fileSize: uploaded.fileSize,
          fileUrl: uploaded.fileUrl,
          fileData: uploaded.fileData
        };
      });
    } catch (err) {
      if (!isMountedRef.current) return;
      setFileUploadProgress(null);
      setFormError(
        err instanceof Error
          ? `${err.message} Please retry or paste a direct PDF link.`
          : 'Could not upload file. Please retry or paste a direct PDF link.'
      );
    }
  };

  const handleIncomingFiles = async (incomingList: FileList | File[]) => {
    const incoming = Array.from(incomingList);
    if (incoming.length === 0) return;
    setFormError(null);

    if (editingMaterial) {
      await processSingleDocumentFile(incoming[0]);
      return;
    }

    const shouldEnterBulk = incoming.length > 1 || bulkQueue.length > 0 || Boolean(formData.fileName);

    if (!shouldEnterBulk) {
      await processSingleDocumentFile(incoming[0]);
      return;
    }

    const promotedItems: BulkUploadQueueItem[] = [];
    if (bulkQueue.length === 0 && formData.fileName && (formData.fileUrl || formData.fileData)) {
      const existingTitle = formData.title.trim() || parseStudyMaterialFilename(formData.fileName).title;
      promotedItems.push({
        queueId: makeQueueId(0),
        file: null,
        fileName: formData.fileName,
        fileSize: formData.fileSize || '1.0 MB',
        title: existingTitle,
        slug: formData.slug || generateSlug(existingTitle),
        class: formData.class,
        subject: formData.subject,
        chapter: formData.chapter,
        materialType: isLinkType ? 'QUESTION_BANK' : formData.materialType,
        tagsInput:
          formData.tagsInput.trim() ||
          parseStudyMaterialFilename(formData.fileName, {
            defaultClass: formData.class,
            defaultSubject: formData.subject,
            defaultMaterialType: formData.materialType
          }).tags.join(', '),
        isPublic: formData.isPublic,
        status: 'ready',
        progress: 100,
        fileUrl: formData.fileUrl,
        fileData: formData.fileData
      });
    }

    const baseMaterialType = isLinkType ? 'QUESTION_BANK' : formData.materialType;
    const queuedItems: BulkUploadQueueItem[] = incoming.map((file, idx) => {
      const parsed = parseStudyMaterialFilename(file.name, {
        defaultClass: formData.class,
        defaultSubject: formData.subject,
        defaultMaterialType: baseMaterialType
      });
      const resolvedClass = parsed.detectedClass || formData.class;
      const resolvedSubject = parsed.detectedSubject || formData.subject;
      const resolvedType = parsed.detectedMaterialType || baseMaterialType;
      const resolvedChapter = parsed.detectedChapter || '';
      const resolvedTags = parsed.tags.join(', ');

      return {
        queueId: makeQueueId(idx + 1),
        file,
        fileName: file.name,
        fileSize: formatFileSizeLabel(file.size),
        title: parsed.title,
        slug: generateSlug(parsed.title),
        class: resolvedClass,
        subject: resolvedSubject,
        chapter: resolvedChapter,
        materialType: resolvedType,
        tagsInput: resolvedTags,
        isPublic: bulkAllPublic,
        status: 'uploading',
        progress: 10,
        fileUrl: '',
        fileData: ''
      };
    });

    if (promotedItems.length > 0) {
      setFormData((prev) => ({
        ...prev,
        title: '',
        slug: '',
        fileName: '',
        fileSize: '',
        fileUrl: '',
        fileData: '',
        tagsInput: ''
      }));
    }

    setBulkQueue((prev) => [...prev, ...promotedItems, ...queuedItems]);
    await runConcurrentUploads(queuedItems);
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await handleIncomingFiles(e.target.files);
    }
    e.target.value = '';
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragDepthRef.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDraggingOver(true);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    if (!isDraggingOver) setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
    if (dragDepthRef.current === 0) {
      setIsDraggingOver(false);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragDepthRef.current = 0;
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleIncomingFiles(e.dataTransfer.files);
    }
  };

  const handleRetryBulkItem = async (queueId: string) => {
    const target = bulkQueue.find((q) => q.queueId === queueId);
    if (!target || !target.file) return;
    setBulkQueue((prev) =>
      prev.map((q) =>
        q.queueId === queueId
          ? { ...q, status: 'uploading', progress: 15, errorMessage: undefined }
          : q
      )
    );
    await runConcurrentUploads([target]);
  };

  const handleUpdateBulkItem = (
    queueId: string,
    patch: Partial<BulkUploadQueueItem>
  ) => {
    setBulkQueue((prev) =>
      prev.map((item) => {
        if (item.queueId !== queueId) return item;
        const next = { ...item, ...patch };
        if (patch.title !== undefined) {
          if (item.slug === '' || item.slug === generateSlug(item.title)) {
            next.slug = generateSlug(patch.title);
          }
        }
        return next;
      })
    );
  };

  const handleRemoveBulkItem = (queueId: string) => {
    setBulkQueue((prev) => prev.filter((item) => item.queueId !== queueId));
  };

  const handleApplyBatchDefaults = () => {
    setBulkQueue((prev) =>
      prev.map((item) => ({
        ...item,
        class: formData.class,
        subject: formData.subject,
        materialType: isLinkType ? item.materialType : formData.materialType,
        isPublic: bulkAllPublic
      }))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const uploaderName = currentUser?.name || currentUser?.username || 'Faculty';
    const todayStr = new Date().toISOString().split('T')[0];

    if (isBulkMode) {
      if (bulkSummary.uploading > 0) {
        setFormError('Please wait for all files in the queue to finish uploading.');
        return;
      }

      const readyItems = bulkQueue.filter((item) => item.status === 'ready');
      if (readyItems.length === 0) {
        setFormError('No uploaded files ready to publish. Fix or remove failed items first.');
        return;
      }

      const missingTitle = readyItems.find((item) => !item.title.trim());
      if (missingTitle) {
        setFormError(`Please enter a title for "${missingTitle.fileName}".`);
        return;
      }

      setFormError(null);
      setIsSaving(true);

      try {
        const createdList: StudyMaterial[] = [];
        for (let i = 0; i < readyItems.length; i += BULK_UPLOAD_CONCURRENCY) {
          const slice = readyItems.slice(i, i + BULK_UPLOAD_CONCURRENCY);
          const batchResults = await Promise.all(
            slice.map((item, offset) => {
              const trimmedTitle = item.title.trim();
              const parsedTags = item.tagsInput
                .split(',')
                .map((t) => t.trim())
                .filter((t) => t.length > 0);
              const tagsArray =
                parsedTags.length > 0
                  ? parsedTags
                  : [item.class, item.subject].filter(Boolean);
              const slug = item.slug.trim() || generateSlug(trimmedTitle);
              const category = inferCategoryFromType(item.materialType);

              return createStudyMaterial({
                id: createMaterialId(i + offset),
                title: trimmedTitle,
                slug,
                description: item.chapter
                  ? `${item.class} ${item.subject} · ${item.chapter}`
                  : `${item.class} ${item.subject}`,
                desc: '',
                class: item.class,
                subject: item.subject,
                chapter: item.chapter.trim(),
                materialType: item.materialType,
                category,
                fileUrl: item.fileUrl.trim(),
                file: item.fileName || `${slug}.pdf`,
                size: item.fileSize || '1.0 MB',
                thumbnailUrl: '',
                youtubeUrl: '',
                externalUrl: '',
                fileData: item.fileData,
                isPublic: item.isPublic,
                status: 'PUBLISHED',
                tags: tagsArray,
                seoTitle: `${trimmedTitle} PDF - Sunshine Classes`,
                metaDescription: `${trimmedTitle} for ${item.class} ${item.subject} - Sunshine Classes`,
                keywords: tagsArray,
                createdBy: uploaderName,
                uploadedBy: uploaderName,
                date: todayStr
              });
            })
          );
          createdList.push(...batchResults);
        }

        if (onAuditLog) {
          onAuditLog(
            'BULK_UPLOAD_STUDY_MATERIAL',
            `Bulk uploaded ${createdList.length} study materials`
          );
        }

        if (onBulkSaved) {
          onBulkSaved(createdList);
        } else {
          createdList.forEach((created) => onSaved(created, false));
        }
      } catch (err) {
        console.error('Error bulk saving study materials:', err);
        setFormError('Failed to save bulk upload batch. Please retry.');
      } finally {
        if (isMountedRef.current) setIsSaving(false);
      }
      return;
    }

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
          id: createMaterialId(0),
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
          date: todayStr
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
      if (isMountedRef.current) setIsSaving(false);
    }
  };

  const hasUploadedAttachment = Boolean(formData.fileName || formData.fileUrl || formData.fileData);
  const autoTagsList = useMemo(
    () =>
      formData.tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    [formData.tagsInput]
  );

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
        className={`bg-white dark:bg-slate-900 w-full sm:rounded-2xl rounded-t-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] ${
          isBulkMode ? 'max-w-3xl' : 'max-w-xl'
        }`}
      >
        {/* Modal Header */}
        <header className="px-4 sm:px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0 bg-white dark:bg-slate-900">
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              {editingMaterial
                ? 'Edit Study Resource'
                : isBulkMode
                ? `Bulk Upload Study Resources (${bulkSummary.total})`
                : 'Upload Study Resource'}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {isBulkMode
                ? 'Auto-tagged from filenames · Files upload in parallel and sync live'
                : 'Drag and drop files or pick from device · Auto-tags from filename'}
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
            <div
              id="alert-upload-modal-error"
              role="alert"
              className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-medium border border-rose-200 dark:border-rose-800 flex items-start gap-2"
            >
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* 1. Primary Dropzone or Link Inputs */}
          {!isBulkMode && formData.materialType === 'VIDEO_LINK' ? (
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
          ) : !isBulkMode && formData.materialType === 'EXTERNAL_LINK' ? (
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
            <div className="space-y-2.5">
              <div
                id="dropzone-study-material-upload"
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                aria-label="Drag and drop files here or click to browse"
                className={`flex flex-col items-center justify-center gap-1.5 w-full min-h-[104px] px-4 py-4 rounded-xl border-2 border-dashed transition-colors cursor-pointer text-center ${
                  isDraggingOver
                    ? 'border-amber-500 bg-amber-50/80 dark:bg-amber-950/35'
                    : 'border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40 hover:border-amber-500 dark:hover:border-amber-500'
                }`}
              >
                <Upload
                  size={20}
                  className={isDraggingOver ? 'text-amber-600 dark:text-amber-400' : 'text-amber-500'}
                />
                <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {isDraggingOver
                    ? editingMaterial
                      ? 'Drop file here to replace attachment'
                      : 'Drop files here to upload & auto-tag'
                    : editingMaterial
                    ? 'Drag & drop a replacement file or click to browse'
                    : isBulkMode
                    ? 'Drag & drop more files to add to batch, or click to browse'
                    : hasUploadedAttachment
                    ? 'Drop more files for bulk upload, or click to add/replace'
                    : 'Drag & drop multiple PDFs, Word, PPT, or Images here'}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {editingMaterial
                    ? 'Max 25 MB · Single file replacement'
                    : 'Supports simultaneous multi-file upload · Max 25 MB/file · Auto-tags from filename'}
                </span>
                <input
                  ref={fileInputRef}
                  id="file-input-study-material"
                  type="file"
                  multiple={!editingMaterial}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.png,.jpg,.jpeg,.webp"
                  onClick={(e) => e.stopPropagation()}
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>

              {!isBulkMode && fileUploadProgress !== null && (
                <div className="space-y-1">
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full transition-all duration-300"
                      style={{ width: `${fileUploadProgress}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                    Uploading document ({fileUploadProgress}%)...
                  </p>
                </div>
              )}

              {!isBulkMode && hasUploadedAttachment && fileUploadProgress === null && (
                <div className="space-y-1.5">
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
                  {autoTagsList.length > 0 && (
                    <div className="flex items-center justify-between gap-2 px-1 text-[11px] text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Tag size={12} className="text-amber-500 shrink-0" />
                        <span className="truncate">
                          Auto-tags: {autoTagsList.join(' · ')}
                        </span>
                      </div>
                      <button
                        id="btn-edit-single-autotags"
                        type="button"
                        onClick={() => setShowMoreOptions(true)}
                        className="text-amber-600 dark:text-amber-400 font-semibold hover:underline shrink-0 cursor-pointer"
                      >
                        Edit tags
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* BULK UPLOAD QUEUE VIEW OR SINGLE FILE FORM */}
          {isBulkMode ? (
            <div id="section-bulk-upload-queue" className="space-y-3">
              {/* Batch Summary & Quick Overrides Bar */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-100 tabular-nums">
                    <span>{bulkSummary.total} files queued</span>
                    <span className="text-slate-400 mx-1.5" aria-hidden="true">·</span>
                    <span className="text-emerald-600 dark:text-emerald-400">
                      {bulkSummary.ready} ready
                    </span>
                    {bulkSummary.uploading > 0 && (
                      <>
                        <span className="text-slate-400 mx-1.5" aria-hidden="true">·</span>
                        <span className="text-amber-600 dark:text-amber-400">
                          {bulkSummary.uploading} uploading
                        </span>
                      </>
                    )}
                    {bulkSummary.error > 0 && (
                      <>
                        <span className="text-slate-400 mx-1.5" aria-hidden="true">·</span>
                        <span className="text-rose-600 dark:text-rose-400">
                          {bulkSummary.error} failed
                        </span>
                      </>
                    )}
                  </div>

                  <button
                    id="btn-clear-bulk-queue"
                    type="button"
                    onClick={() => setBulkQueue([])}
                    disabled={isSaving}
                    className="min-h-[36px] px-2.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-white dark:hover:bg-slate-800 inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 size={13} />
                    <span>Clear batch</span>
                  </button>
                </div>

                {/* Shared Batch Override Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200/80 dark:border-slate-700/80">
                  <select
                    id="select-bulk-default-type"
                    value={formData.materialType}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        materialType: e.target.value as StudyMaterialType
                      }))
                    }
                    aria-label="Batch default category"
                    className="min-h-[40px] px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {UPLOAD_MATERIAL_TYPES.filter(
                      (t) => t.type !== 'VIDEO_LINK' && t.type !== 'EXTERNAL_LINK'
                    ).map((t) => (
                      <option key={t.type} value={t.type}>
                        {t.label}
                      </option>
                    ))}
                  </select>

                  <select
                    id="select-bulk-default-class"
                    value={formData.class}
                    onChange={(e) => setFormData((prev) => ({ ...prev, class: e.target.value }))}
                    aria-label="Batch default class"
                    className="min-h-[40px] px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {classOptions.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>

                  <select
                    id="select-bulk-default-subject"
                    value={formData.subject}
                    onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
                    aria-label="Batch default subject"
                    className="min-h-[40px] px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {subjectOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>

                  <button
                    id="btn-apply-bulk-defaults"
                    type="button"
                    onClick={handleApplyBatchDefaults}
                    className="min-h-[40px] px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Apply to All
                  </button>
                </div>

                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300 min-h-[32px]">
                  <input
                    id="checkbox-bulk-all-public"
                    type="checkbox"
                    checked={bulkAllPublic}
                    onChange={(e) => {
                      const nextVal = e.target.checked;
                      setBulkAllPublic(nextVal);
                      setBulkQueue((prev) => prev.map((q) => ({ ...q, isPublic: nextVal })));
                    }}
                    className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500 cursor-pointer"
                  />
                  <span>Publish all items to Public Website & Student Library</span>
                </label>
              </div>

              {/* Queued Files List */}
              <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                {bulkQueue.map((item, idx) => (
                  <div
                    key={item.queueId}
                    id={`bulk-item-${idx}`}
                    className="p-3 sm:p-3.5 space-y-2.5"
                  >
                    {/* Top Row: Status + Original Filename + Actions */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {item.status === 'uploading' ? (
                          <Loader2 size={15} className="text-amber-500 animate-spin shrink-0" />
                        ) : item.status === 'ready' ? (
                          <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                        ) : (
                          <AlertCircle size={15} className="text-rose-600 dark:text-rose-400 shrink-0" />
                        )}
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">
                          {item.fileName}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums shrink-0">
                          · {item.status === 'uploading' ? `${item.progress}%` : item.fileSize}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {item.status === 'error' && item.file && (
                          <button
                            id={`btn-retry-bulk-item-${idx}`}
                            type="button"
                            onClick={() => handleRetryBulkItem(item.queueId)}
                            className="min-h-[36px] px-2.5 rounded-lg text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 inline-flex items-center gap-1 cursor-pointer"
                          >
                            <RotateCcw size={13} />
                            <span>Retry</span>
                          </button>
                        )}
                        <button
                          id={`btn-remove-bulk-item-${idx}`}
                          type="button"
                          onClick={() => handleRemoveBulkItem(item.queueId)}
                          aria-label={`Remove ${item.fileName}`}
                          className="min-h-[36px] min-w-[36px] rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    </div>

                    {item.status === 'error' && item.errorMessage && (
                      <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                        {item.errorMessage}
                      </p>
                    )}

                    {/* Title Input */}
                    <input
                      id={`input-bulk-title-${idx}`}
                      type="text"
                      value={item.title}
                      onChange={(e) =>
                        handleUpdateBulkItem(item.queueId, { title: e.target.value })
                      }
                      placeholder="Document title"
                      aria-label={`Title for ${item.fileName}`}
                      className="w-full min-h-[40px] px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:outline-none focus:border-amber-500"
                    />

                    {/* Per-Item Metadata Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <select
                        id={`select-bulk-type-${idx}`}
                        value={item.materialType}
                        onChange={(e) =>
                          handleUpdateBulkItem(item.queueId, {
                            materialType: e.target.value as StudyMaterialType
                          })
                        }
                        aria-label={`Category for ${item.fileName}`}
                        className="min-h-[40px] px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 text-xs font-medium focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        {UPLOAD_MATERIAL_TYPES.filter(
                          (t) => t.type !== 'VIDEO_LINK' && t.type !== 'EXTERNAL_LINK'
                        ).map((t) => (
                          <option key={t.type} value={t.type}>
                            {t.label}
                          </option>
                        ))}
                      </select>

                      <select
                        id={`select-bulk-class-${idx}`}
                        value={item.class}
                        onChange={(e) =>
                          handleUpdateBulkItem(item.queueId, { class: e.target.value })
                        }
                        aria-label={`Class for ${item.fileName}`}
                        className="min-h-[40px] px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 text-xs font-medium focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        {UPLOAD_CLASSES_LIST.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>

                      <select
                        id={`select-bulk-subject-${idx}`}
                        value={item.subject}
                        onChange={(e) =>
                          handleUpdateBulkItem(item.queueId, { subject: e.target.value })
                        }
                        aria-label={`Subject for ${item.fileName}`}
                        className="min-h-[40px] px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 text-xs font-medium focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        {UPLOAD_SUBJECTS_LIST.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Auto-Generated Tags Row */}
                    <div className="flex items-center gap-2">
                      <Tag size={13} className="text-amber-500 shrink-0" />
                      <input
                        id={`input-bulk-tags-${idx}`}
                        type="text"
                        value={item.tagsInput}
                        onChange={(e) =>
                          handleUpdateBulkItem(item.queueId, { tagsInput: e.target.value })
                        }
                        placeholder="Auto-generated tags (comma separated)"
                        aria-label={`Tags for ${item.fileName}`}
                        className="w-full min-h-[38px] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-[11px] sm:text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
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
                    <span>More options (Chapter, tags, summary, visibility & SEO)</span>
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

                    {!isLinkType && (
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
            </>
          )}

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
              disabled={
                isSaving ||
                fileUploadProgress !== null ||
                (isBulkMode && (bulkSummary.uploading > 0 || bulkSummary.ready === 0))
              }
              className="min-h-[44px] px-5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60 whitespace-nowrap tabular-nums"
            >
              {isSaving && <Loader2 size={14} className="animate-spin" />}
              <span>
                {isSaving
                  ? isBulkMode
                    ? `Publishing ${bulkSummary.ready} files...`
                    : 'Syncing...'
                  : editingMaterial
                  ? 'Save Changes'
                  : isBulkMode
                  ? `Upload & Publish All (${bulkSummary.ready})`
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
