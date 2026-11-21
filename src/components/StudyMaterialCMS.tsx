import React, { useState, useEffect, useMemo } from 'react';
import {
  StudyMaterial,
  StudyMaterialType,
  StudyMaterialStatus,
  User
} from '../types';
import {
  getStudyMaterials,
  deleteStudyMaterial,
  bulkDeleteStudyMaterials,
  bulkUpdateStatus,
  mergeFeaturedSeedStudyMaterials,
  normalizeStudyMaterial
} from '../services/studyMaterialService';
import { SyncService } from '../services/SyncService';
import { SEED_STUDY_MATERIALS } from '../data';
import { safeSetItem } from '../utils/safeLocalStorage';
import {
  StudyMaterialUploadModal,
  UPLOAD_MATERIAL_TYPES
} from './studyResources/StudyMaterialUploadModal';
import {
  UPLOAD_CLASSES_LIST,
  UPLOAD_SUBJECTS_LIST
} from './studyResources/resourceMeta';
import { buildResourcePath } from './studyResources/revisionKitHelpers';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  Download,
  Globe,
  Lock,
  CheckCircle,
  Archive,
  BookOpen,
  CheckSquare,
  X,
  ExternalLink,
  RefreshCw,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface StudyMaterialCMSProps {
  currentUser: User;
  onAuditLog?: (action: string, details: string) => void;
}

const MATERIAL_ICON_MAP: Record<string, string> = {
  QUESTION_BANK: '🗂️',
  SAMPLE_PAPER: '🎯',
  PYQ: '📜',
  FORMULA_SHEET: '🧮',
  WORKSHEET: '📋',
  ASSIGNMENT: '📑',
  SYLLABUS: '📘',
  LAB_MANUAL: '🧪',
  OTHER: '📦',
  NOTES: '📝',
  PDF: '📄',
  NCERT_SOLUTION: '📖',
  VIDEO_LINK: '🎥',
  EXTERNAL_LINK: '🔗',
  BLOG: '📰'
};

const MATERIAL_TYPES: { type: StudyMaterialType; label: string; icon: string; bg: string }[] =
  UPLOAD_MATERIAL_TYPES.map((opt) => ({
    type: opt.type,
    label: opt.label,
    icon: MATERIAL_ICON_MAP[opt.type] || '📄',
    bg: opt.badgeClass
  }));

const CLASSES_LIST = UPLOAD_CLASSES_LIST;

const CMS_TREE_SECTIONS = [
  { id: 'ALL', label: 'All Content', icon: '✨' },
  { id: 'STUDY_MATERIAL', label: 'Study Material', icon: '📚' },
  { id: 'BLOG_ARTICLES', label: 'Blog Articles', icon: '✍️' },
  { id: 'ANNOUNCEMENTS', label: 'Announcements', icon: '📢' },
  { id: 'NEWS', label: 'News', icon: '📰' },
  { id: 'DOWNLOADS', label: 'Downloads', icon: '📥' },
  { id: 'RESOURCES', label: 'Resources', icon: '💡' },
  { id: 'GALLERY', label: 'Gallery', icon: '🖼️', isFuture: true },
  { id: 'EVENTS', label: 'Events', icon: '📅', isFuture: true }
];

const SUBJECTS_LIST = UPLOAD_SUBJECTS_LIST;

export const StudyMaterialCMS: React.FC<StudyMaterialCMSProps> = ({ currentUser, onAuditLog }) => {
  const [materials, setMaterials] = useState<StudyMaterial[]>(() => {
    try {
      if (typeof window !== 'undefined') {
        const isInit = localStorage.getItem('sunshine_study_materials_initialized') === 'true';
        const stored = localStorage.getItem('sunshine_study_materials');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            if (isInit || parsed.length > 0) return mergeFeaturedSeedStudyMaterials(parsed);
          }
        }
        if (isInit) return [];
      }
    } catch (e) {}
    return SEED_STUDY_MATERIALS.map(normalizeStudyMaterial);
  });
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Search & Filter state
  const [selectedCmsSection, setSelectedCmsSection] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedPublic, setSelectedPublic] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'MODIFIED' | 'NEWEST' | 'OLDEST' | 'MOST_VIEWED' | 'MOST_DOWNLOADED' | 'TITLE'>('MODIFIED');

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<StudyMaterial | null>(null);
  const [previewMaterial, setPreviewMaterial] = useState<StudyMaterial | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Authorization Helpers
  const isSuperAdminOrAdmin =
    currentUser.role === 'SUPER_ADMIN' ||
    currentUser.role === 'ADMIN' ||
    currentUser.role === 'FOUNDER' ||
    currentUser.role === 'CO_FOUNDER';
  const isTeacher = currentUser.role === 'TEACHER';
  const canUpload = isSuperAdminOrAdmin || isTeacher;

  // Load materials from database on mount & subscribe to realtime changes
  useEffect(() => {
    loadMaterials();

    const unsubscribe = SyncService.subscribe('study_materials', (docId, data) => {
      if (docId === '*' && Array.isArray(data)) {
        setMaterials(mergeFeaturedSeedStudyMaterials(data));
        return;
      }
      if (data === null) {
        setMaterials((prev) => prev.filter((m) => m.id !== docId && m.materialId !== docId));
        setSelectedIds((prev) => prev.filter((i) => i !== docId));
      } else if (data && typeof data === 'object' && !Array.isArray(data)) {
        const normalized = normalizeStudyMaterial(data as StudyMaterial);
        setMaterials((prev) => {
          const targetId = docId || normalized.id || normalized.materialId;
          const index = prev.findIndex(
            (m) => m.id === targetId || m.materialId === targetId
          );
          if (index > -1) {
            const next = [...prev];
            next[index] = normalizeStudyMaterial({ ...next[index], ...normalized });
            return next;
          }
          return [normalized, ...prev];
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const loadMaterials = async () => {
    setLoading(true);
    try {
      const data = await getStudyMaterials();
      setMaterials(data);
    } catch (err) {
      console.error('Error loading materials:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreDemoMaterials = async () => {
    if (!window.confirm('Restore all 12 standard demo study notes and sample questions?')) return;
    setLoading(true);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('sunshine_study_materials', JSON.stringify(SEED_STUDY_MATERIALS));
        localStorage.setItem('sunshine_study_materials_initialized', 'true');
        fetch('/api/sync/study_materials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: SEED_STUDY_MATERIALS })
        }).catch(() => {});
      }
      setMaterials(SEED_STUDY_MATERIALS);
    } finally {
      setLoading(false);
    }
  };

  // Filtered and Sorted list
  const filteredMaterials = useMemo(() => {
    return materials.filter(m => {
      // CMS Category Filter
      let matchCmsSection = true;
      if (selectedCmsSection === 'STUDY_MATERIAL') {
        matchCmsSection = [
          'NOTES',
          'QUESTION_BANK',
          'PYQ',
          'SAMPLE_PAPER',
          'NCERT_SOLUTION',
          'WORKSHEET',
          'ASSIGNMENT',
          'LAB_MANUAL',
          'SYLLABUS',
          'OTHER',
          'PDF'
        ].includes(m.materialType || 'PDF');
      } else if (selectedCmsSection === 'BLOG_ARTICLES') {
        matchCmsSection = m.materialType === 'BLOG';
      } else if (selectedCmsSection === 'ANNOUNCEMENTS') {
        matchCmsSection = m.materialType === 'NOTES' && (m.tags?.includes('Notice') || m.tags?.includes('Announcement') || m.title.toLowerCase().includes('notice'));
      } else if (selectedCmsSection === 'NEWS') {
        matchCmsSection = m.tags?.includes('News') || m.title.toLowerCase().includes('news') || m.title.toLowerCase().includes('result');
      } else if (selectedCmsSection === 'DOWNLOADS') {
        matchCmsSection = ['PDF', 'SAMPLE_PAPER', 'WORKSHEET'].includes(m.materialType || 'PDF');
      } else if (selectedCmsSection === 'RESOURCES') {
        matchCmsSection = ['FORMULA_SHEET', 'VIDEO_LINK', 'EXTERNAL_LINK'].includes(m.materialType || 'PDF');
      }

      // Search
      const search = searchTerm.toLowerCase().trim();
      const matchSearch = !search || 
        m.title.toLowerCase().includes(search) || 
        m.subject.toLowerCase().includes(search) || 
        (m.chapter && m.chapter.toLowerCase().includes(search)) || 
        (m.description && m.description.toLowerCase().includes(search)) || 
        (m.tags && m.tags.some(t => t.toLowerCase().includes(search)));

      // Class Filter
      const matchClass = selectedClass === 'ALL' || m.class === selectedClass;

      // Subject Filter
      const matchSubject = selectedSubject === 'ALL' || m.subject === selectedSubject;

      // Type Filter
      const matchType = selectedType === 'ALL' || m.materialType === selectedType;

      // Status Filter
      const matchStatus = selectedStatus === 'ALL' || m.status === selectedStatus;

      // Public Filter
      const matchPublic = selectedPublic === 'ALL' || 
        (selectedPublic === 'PUBLIC' && m.isPublic) || 
        (selectedPublic === 'PRIVATE' && !m.isPublic);

      return matchCmsSection && matchSearch && matchClass && matchSubject && matchType && matchStatus && matchPublic;
    }).sort((a, b) => {
      if (sortBy === 'MODIFIED') {
        const modDiff =
          new Date(b.updatedAt || b.createdAt || b.date || 0).getTime() -
          new Date(a.updatedAt || a.createdAt || a.date || 0).getTime();
        if (modDiff !== 0) return modDiff;
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'NEWEST') return new Date(b.createdAt || b.date || 0).getTime() - new Date(a.createdAt || a.date || 0).getTime();
      if (sortBy === 'OLDEST') return new Date(a.createdAt || a.date || 0).getTime() - new Date(b.createdAt || b.date || 0).getTime();
      if (sortBy === 'TITLE') return a.title.localeCompare(b.title);
      return 0;
    });
  }, [materials, selectedCmsSection, searchTerm, selectedClass, selectedSubject, selectedType, selectedStatus, selectedPublic, sortBy]);

  // Stats calculation
  const stats = useMemo(() => {
    const total = materials.length;
    const published = materials.filter(m => m.status === 'PUBLISHED').length;
    const drafts = materials.filter(m => m.status === 'DRAFT').length;
    const archived = materials.filter(m => m.status === 'ARCHIVED').length;
    return { total, published, drafts, archived };
  }, [materials]);

  // Form Handlers
  const handleOpenAddForm = () => {
    setEditingMaterial(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (material: StudyMaterial) => {
    if (
      isTeacher &&
      material.createdBy !== currentUser.name &&
      material.uploadedBy !== currentUser.name &&
      !isSuperAdminOrAdmin
    ) {
      alert('Teachers can only edit their own uploaded materials.');
      return;
    }
    setEditingMaterial(material);
    setIsFormOpen(true);
  };

  const handleModalSaved = (savedMaterial: StudyMaterial, isEdit: boolean) => {
    setMaterials((prev) => {
      const next = isEdit
        ? prev.map((m) => (m.id === savedMaterial.id ? savedMaterial : m))
        : [savedMaterial, ...prev.filter((m) => m.id !== savedMaterial.id)];
      safeSetItem('sunshine_study_materials_initialized', 'true');
      safeSetItem('sunshine_study_materials', JSON.stringify(next));
      return next;
    });
    setIsFormOpen(false);
    setEditingMaterial(null);
  };

  const handleModalBulkSaved = (savedMaterials: StudyMaterial[]) => {
    const newIds = new Set(savedMaterials.map((m) => m.id));
    setMaterials((prev) => {
      const next = [...savedMaterials, ...prev.filter((m) => !newIds.has(m.id))];
      safeSetItem('sunshine_study_materials_initialized', 'true');
      safeSetItem('sunshine_study_materials', JSON.stringify(next));
      return next;
    });
    setIsFormOpen(false);
    setEditingMaterial(null);
  };

  const handleDeleteItem = async (id: string) => {
    const target = materials.find(m => m.id === id);
    if (!target) return;

    if (isTeacher && target.createdBy !== currentUser.name && target.uploadedBy !== currentUser.name && !isSuperAdminOrAdmin) {
      alert('Teachers can only delete their own uploaded materials.');
      return;
    }

    try {
      await deleteStudyMaterial(id);
      const next = materials.filter(m => m.id !== id);
      setMaterials(next);
      await SyncService.replaceCollection('study_materials', next);
      setSelectedIds(prev => prev.filter(i => i !== id));
      setDeleteConfirmId(null);

      if (onAuditLog) {
        onAuditLog('DELETE_STUDY_MATERIAL', `Deleted study material "${target.title}"`);
      }
    } catch (err) {
      console.error('Error deleting material:', err);
      alert('Failed to delete material.');
    }
  };

  // Bulk Actions
  const handleSelectAll = () => {
    if (selectedIds.length === filteredMaterials.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredMaterials.map(m => m.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to permanently delete ${selectedIds.length} selected items?`)) return;

    try {
      await bulkDeleteStudyMaterials(selectedIds);
      const toDeleteSet = new Set(selectedIds);
      const next = materials.filter(m => !toDeleteSet.has(m.id));
      setMaterials(next);
      await SyncService.replaceCollection('study_materials', next);
      setSelectedIds([]);
      if (onAuditLog) {
        onAuditLog('BULK_DELETE_STUDY_MATERIAL', `Bulk deleted ${selectedIds.length} study materials`);
      }
    } catch (err) {
      console.error('Bulk delete failed:', err);
    }
  };

  const handleBulkStatusChange = async (status: StudyMaterialStatus) => {
    if (selectedIds.length === 0) return;
    try {
      await bulkUpdateStatus(selectedIds, status, status === 'PUBLISHED' ? true : undefined);
      const next = materials.map(m => selectedIds.includes(m.id) ? { ...m, status, isPublic: status === 'PUBLISHED' ? true : m.isPublic } : m);
      setMaterials(next);
      await SyncService.replaceCollection('study_materials', next);
      setSelectedIds([]);
      if (onAuditLog) {
        onAuditLog('BULK_STATUS_STUDY_MATERIAL', `Updated ${selectedIds.length} study materials status to ${status}`);
      }
    } catch (err) {
      console.error('Bulk status update failed:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
              <BookOpen size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Content & Study Material CMS
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-semibold border border-amber-200 dark:border-amber-800">
                  Study Material
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800" id="badge-realtime-cloud-sync">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Realtime Sync Active
                </span>
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Centralized management for public notes, assignments, worksheets, PYQs, and video lectures. Deletions and uploads sync instantly across tabs and devices.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="#/study-material"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium text-sm transition-all shadow-xs"
            id="btn-public-study-material-portal"
          >
            <Globe size={16} className="text-indigo-500" />
            Public Website Portal
            <ExternalLink size={14} className="opacity-60" />
          </a>

          {canUpload ? (
            <button
              onClick={handleOpenAddForm}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all"
              id="btn-upload-new-study-material"
            >
              <Plus size={18} />
              Upload Material
            </button>
          ) : (
            <div className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
              <Lock size={14} />
              View-Only Access (Receptionist)
            </div>
          )}
        </div>
      </div>



      {/* CMS TAXONOMY TREE TABS */}
      <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800">
        <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 pb-2">
          CMS Taxonomy Categories
        </div>
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          {CMS_TREE_SECTIONS.map(sec => {
            const isActive = selectedCmsSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setSelectedCmsSection(sec.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${
                  isActive
                    ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-400'
                }`}
                id={`cms-admin-tree-tab-${sec.id.toLowerCase()}`}
              >
                <span>{sec.icon}</span>
                <span>{sec.label}</span>
                {sec.isFuture && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold uppercase">
                    Future
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by Title, Subject, Chapter, Tags or Description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              id="input-cms-search"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              id="select-filter-class"
            >
              <option value="ALL">All Classes</option>
              {CLASSES_LIST.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              id="select-filter-subject"
            >
              <option value="ALL">All Subjects</option>
              {SUBJECTS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              id="select-filter-type"
            >
              <option value="ALL">All Resource Types</option>
              {MATERIAL_TYPES.map(t => <option key={t.type} value={t.type}>{t.label}</option>)}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              id="select-filter-status"
            >
              <option value="ALL">All Statuses</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="ARCHIVED">Archived</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(
                  e.target.value as 'MODIFIED' | 'NEWEST' | 'OLDEST' | 'MOST_VIEWED' | 'MOST_DOWNLOADED' | 'TITLE'
                )
              }
              className="px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              id="select-filter-sort"
            >
              <option value="MODIFIED">Recently Modified</option>
              <option value="NEWEST">Newest First</option>
              <option value="OLDEST">Oldest First</option>
              <option value="TITLE">Title A-Z</option>
            </select>
          </div>
        </div>

        {/* BULK ACTIONS TOOLBAR */}
        {selectedIds.length > 0 && (
          <div className="bg-amber-500/10 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-200 dark:border-amber-800/60 flex items-center justify-between gap-3 text-xs">
            <span className="font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
              <CheckSquare size={16} className="text-amber-600" />
              {selectedIds.length} item(s) selected
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkStatusChange('PUBLISHED')}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-all"
                id="btn-bulk-publish"
              >
                Bulk Publish
              </button>
              <button
                onClick={() => handleBulkStatusChange('ARCHIVED')}
                className="px-3 py-1.5 rounded-lg bg-slate-600 hover:bg-slate-700 text-white font-medium transition-all"
                id="btn-bulk-archive"
              >
                Bulk Archive
              </button>
              {canUpload && (
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-medium transition-all"
                  id="btn-bulk-delete"
                >
                  Bulk Delete
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* TABLE / LIST OF MATERIALS */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredMaterials.length && filteredMaterials.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                  />
                </th>
                <th className="py-3 px-4">Title & Details</th>
                <th className="py-3 px-4">Class & Subject</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredMaterials.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <BookOpen size={40} className="mx-auto mb-2 opacity-40 text-amber-500" />
                    <p className="font-semibold text-base text-slate-800 dark:text-slate-200">No study materials in this category</p>
                    <p className="text-xs mt-1 text-slate-500 max-w-md mx-auto">
                      All items in this section have been cleared, or none match your active filters. Deletions are securely preserved in the cloud database.
                    </p>
                    <div className="mt-4 flex items-center justify-center gap-3">
                      {canUpload && (
                        <button
                          type="button"
                          onClick={handleOpenAddForm}
                          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                          id="btn-empty-upload-material"
                        >
                          <Plus size={14} /> Upload New Material
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleRestoreDemoMaterials}
                        className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer"
                        id="btn-restore-demo-materials"
                      >
                        <RefreshCw size={14} /> Restore 12 Sample Notes
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMaterials.map((item) => {
                  const typeObj = MATERIAL_TYPES.find(t => t.type === item.materialType) || MATERIAL_TYPES[0];
                  const isSelected = selectedIds.includes(item.id);

                  return (
                    <tr 
                      key={item.id} 
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                        isSelected
                          ? 'bg-amber-50/70 dark:bg-amber-950/30'
                          : item.isFeatured
                          ? 'bg-amber-50/40 dark:bg-amber-950/15'
                          : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(item.id)}
                          className="rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                        />
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        {item.isFeatured && (
                          <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400 mb-0.5">
                            <Star size={11} className="fill-amber-500 text-amber-500 shrink-0" />
                            <span>{item.highlightBadge ? `Highlighted · ${item.highlightBadge}` : 'Highlighted'}</span>
                          </div>
                        )}
                        <div className="font-semibold text-slate-900 dark:text-white break-words" title={item.title}>
                          {item.title}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                          <a
                            id={`link-cms-resource-url-${item.id}`}
                            href={buildResourcePath(item)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={`Open ${buildResourcePath(item)}`}
                            className="font-mono text-[11px] text-amber-600 dark:text-amber-400 hover:underline truncate inline-flex items-center gap-1 max-w-[230px]"
                          >
                            <span className="truncate">{buildResourcePath(item)}</span>
                            <ExternalLink size={10} className="shrink-0" />
                          </a>
                          {item.chapter && <span className="truncate">| {item.chapter}</span>}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-medium text-slate-800 dark:text-slate-200">{item.class}</div>
                        <div className="text-xs text-slate-500">{item.subject}</div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${typeObj.bg}`}>
                          <span>{typeObj.icon}</span>
                          {typeObj.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {item.status === 'PUBLISHED' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                              <CheckCircle size={12} /> Published
                            </span>
                          )}
                          {item.status === 'DRAFT' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                              Draft
                            </span>
                          )}
                          {item.status === 'ARCHIVED' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              <Archive size={12} /> Archived
                            </span>
                          )}

                          {item.isPublic ? (
                            <span className="text-xs text-emerald-600" title="Publicly accessible on website">
                              <Globe size={14} />
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400" title="Private">
                              <Lock size={14} />
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setPreviewMaterial(item)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Preview Material"
                            id={`btn-preview-${item.id}`}
                          >
                            <Eye size={16} />
                          </button>

                          {canUpload && (
                            <button
                              onClick={() => handleOpenEditForm(item)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Edit Material"
                              id={`btn-edit-${item.id}`}
                            >
                              <Edit3 size={16} />
                            </button>
                          )}

                          {canUpload && (
                            <button
                              onClick={() => setDeleteConfirmId(item.id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Delete Material"
                              id={`btn-delete-${item.id}`}
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: SIMPLIFIED ADD / EDIT MATERIAL FORM */}
      <AnimatePresence>
        {isFormOpen && (
          <StudyMaterialUploadModal
            currentUser={currentUser}
            editingMaterial={editingMaterial}
            defaultClass={selectedClass}
            defaultSubject={selectedSubject}
            onClose={() => {
              setIsFormOpen(false);
              setEditingMaterial(null);
            }}
            onSaved={handleModalSaved}
            onBulkSaved={handleModalBulkSaved}
            onAuditLog={onAuditLog}
          />
        )}
      </AnimatePresence>

      {/* PREVIEW MODAL */}
      <AnimatePresence>
        {previewMaterial && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye size={20} className="text-amber-400" />
                  <h3 className="font-bold text-base truncate">{previewMaterial.title}</h3>
                </div>
                <button
                  onClick={() => setPreviewMaterial(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-semibold">
                    {previewMaterial.class}
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold">
                    {previewMaterial.subject}
                  </span>
                  {previewMaterial.chapter && (
                    <span className="text-slate-500">| {previewMaterial.chapter}</span>
                  )}
                </div>

                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {previewMaterial.description || previewMaterial.desc}
                </p>

                {previewMaterial.tags && previewMaterial.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {previewMaterial.tags.map((t, idx) => (
                      <span key={idx} className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    <div>Format: <strong className="text-slate-900 dark:text-white">{previewMaterial.materialType}</strong></div>
                    <div>File Size: <strong className="text-slate-900 dark:text-white">{previewMaterial.size || 'Standard PDF'}</strong></div>
                  </div>

                  {previewMaterial.fileUrl ? (
                    <a
                      href={previewMaterial.fileUrl}
                      download={previewMaterial.file || 'study_material.pdf'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs shadow-xs"
                    >
                      <Download size={14} /> Download File
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 italic">No file attached</span>
                  )}
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 text-right">
                <button
                  onClick={() => setPreviewMaterial(null)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold"
                >
                  Close Preview
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full text-center space-y-4"
            >
              <div className="p-3 bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 rounded-full w-12 h-12 mx-auto flex items-center justify-center">
                <Trash2 size={24} />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Delete Study Material?</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete this material? This action cannot be undone.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteItem(deleteConfirmId)}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
                  id="btn-confirm-delete-material"
                >
                  Yes, Delete Permanently
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudyMaterialCMS;
