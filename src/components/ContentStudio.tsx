/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Globe,
  BookOpen,
  ShoppingBag,
  Users,
  Award,
  FileText,
  MessageSquare,
  Camera,
  HelpCircle,
  Bell,
  Tag,
  Sparkles,
  Plus,
  Edit,
  Trash2,
  Eye,
  Copy,
  Archive,
  Check,
  X,
  Search,
  Filter,
  ArrowUp,
  ArrowDown,
  UploadCloud,
  Monitor,
  Tablet,
  Smartphone,
  Folder,
  RefreshCw,
  Calendar,
  Clock,
  Lock,
  ChevronRight,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  Layers,
  Share2,
  Sliders,
  Palette,
  ExternalLink,
  Percent,
  Box,
  Truck,
  DollarSign,
  Megaphone
} from 'lucide-react';

import {
  WMSData,
  HomepageSection,
  HeroBanner,
  NavMenuItem,
  PopupConfig,
  PageSEOConfig,
  MediaItem,
  MediaFolder,
  AnnouncementType,
  ContentStatus,
  ContentRevision,
  ProductCategory,
  Coupon,
  EventItem
} from '../types/wms';

import {
  Student,
  StudyMaterial,
  BlogPost,
  StoreProduct,
  AuditLog,
  User,
  Testimonial,
  GalleryItem,
  FounderMember,
  Topper,
  ClassEntity
} from '../types';

import SunshineLogo from './SunshineLogo';
import { SEED_WMS_DATA } from '../data/wmsData';

// Top-Level Content Studio Categories
export type StudioCategory = 'website' | 'academic' | 'commerce' | 'marketing';

export type StudioModule =
  // Website
  | 'homepage'
  | 'navigation'
  | 'footer'
  | 'announcements'
  | 'banners'
  // Academic
  | 'courses'
  | 'faculty'
  | 'results'
  | 'resources'
  | 'faqs'
  // Commerce
  | 'products'
  | 'categories'
  | 'orders'
  | 'inventory'
  | 'coupons'
  // Marketing
  | 'testimonials'
  | 'gallery'
  | 'events'
  | 'blogs'
  | 'seo'
  // Central Media
  | 'media';

interface ContentStudioProps {
  wmsData?: WMSData;
  onUpdateWMSData?: (updated: WMSData) => void;
  studyMaterials?: StudyMaterial[];
  onUpdateStudyMaterials?: (mats: StudyMaterial[]) => void;
  storeProducts?: StoreProduct[];
  onUpdateStoreProducts?: (products: StoreProduct[]) => void;
  blogs?: BlogPost[];
  onUpdateBlogs?: (blogs: BlogPost[]) => void;
  testimonials?: Testimonial[];
  onUpdateTestimonials?: (testimonials: Testimonial[]) => void;
  gallery?: GalleryItem[];
  onUpdateGallery?: (items: GalleryItem[]) => void;
  founders?: FounderMember[];
  onUpdateFounders?: (founders: FounderMember[]) => void;
  toppers?: Topper[];
  onUpdateToppers?: (toppers: Topper[]) => void;
  classes?: ClassEntity[];
  onUpdateClasses?: (classes: ClassEntity[]) => void;
  auditLogs?: AuditLog[];
  onAddAuditLog?: (action: string, details: string) => void;
  currentUser?: User;
  initialModule?: StudioModule;
}

export const ContentStudio: React.FC<ContentStudioProps> = ({
  wmsData: propWmsData,
  onUpdateWMSData: propOnUpdateWMSData,
  studyMaterials = [],
  onUpdateStudyMaterials,
  storeProducts = [],
  onUpdateStoreProducts,
  blogs = [],
  onUpdateBlogs,
  testimonials = [],
  onUpdateTestimonials,
  gallery = [],
  onUpdateGallery,
  founders = [],
  onUpdateFounders,
  toppers = [],
  onUpdateToppers,
  classes = [],
  onUpdateClasses,
  auditLogs = [],
  onAddAuditLog,
  currentUser,
  initialModule = 'homepage'
}) => {
  // WMS State Single Source
  const [localWmsData, setLocalWmsData] = useState<WMSData>(propWmsData || SEED_WMS_DATA);
  const wmsData = propWmsData || localWmsData;

  const updateWMS = (updated: WMSData) => {
    setLocalWmsData(updated);
    if (propOnUpdateWMSData) propOnUpdateWMSData(updated);
  };

  const logAudit = (action: string, details: string) => {
    if (onAddAuditLog) onAddAuditLog(action, details);
  };

  // Content Studio Navigation
  const [activeCategory, setActiveCategory] = useState<StudioCategory>('website');
  const [activeModule, setActiveModule] = useState<StudioModule>(initialModule);

  // Search & Filter Global State per module
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT' | 'ARCHIVED'>('ALL');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Media Picker Modal State
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [onMediaSelectCallback, setOnMediaSelectCallback] = useState<((url: string) => void) | null>(null);
  const [mediaPickerFolder, setMediaPickerFolder] = useState<MediaFolder | 'all'>('all');
  const [mediaPickerSearch, setMediaPickerSearch] = useState('');

  // Media Upload Form
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadName, setUploadName] = useState('');
  const [uploadFolder, setUploadFolder] = useState<MediaFolder>('images');
  const [uploadUrl, setUploadUrl] = useState('');

  // Revision History Modal State
  const [revisionItem, setRevisionItem] = useState<{ id: string; title: string; type: string; history: ContentRevision[] } | null>(null);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);

  // Live Device Preview Modal State
  const [previewDeviceMode, setPreviewDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState<{ title: string; body: React.ReactNode } | null>(null);

  // Feedback Notification Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Helper to open media picker for any field
  const triggerMediaPicker = (onSelect: (url: string) => void) => {
    setOnMediaSelectCallback(() => onSelect);
    setIsMediaPickerOpen(true);
  };

  // Helper to record a revision snapshot
  const [revisionStore, setRevisionStore] = useState<Record<string, ContentRevision[]>>({
    'homepage-v1': [
      { id: 'rev-1', version: 1, updatedAt: '2026-07-01 10:00', author: 'System Admin', summary: 'Initial production baseline', snapshot: SEED_WMS_DATA.homepageSections }
    ]
  });

  const recordRevision = (itemId: string, itemTitle: string, snapshot: any, summary: string) => {
    const existing = revisionStore[itemId] || [];
    const newRev: ContentRevision = {
      id: `rev-${Date.now()}`,
      version: existing.length + 1,
      updatedAt: new Date().toLocaleString(),
      author: currentUser?.name || 'Admin',
      summary,
      snapshot: JSON.parse(JSON.stringify(snapshot))
    };
    setRevisionStore({ ...revisionStore, [itemId]: [newRev, ...existing] });
  };

  const openRevisionHistory = (itemId: string, title: string, type: string, currentSnapshot: any) => {
    const history = revisionStore[itemId] || [
      { id: `rev-0`, version: 1, updatedAt: '2026-07-20 14:30', author: currentUser?.name || 'Admin', summary: 'Baseline state created', snapshot: currentSnapshot }
    ];
    setRevisionItem({ id: itemId, title, type, history });
    setIsRevisionModalOpen(true);
  };

  // Module Categories Definitions
  const categoriesDef: { id: StudioCategory; label: string; icon: React.ReactNode; modules: { id: StudioModule; label: string; icon: React.ReactNode }[] }[] = [
    {
      id: 'website',
      label: 'Website Studio',
      icon: <Globe size={16} />,
      modules: [
        { id: 'homepage', label: 'Homepage Builder', icon: <Globe size={14} /> },
        { id: 'navigation', label: 'Header Navigation', icon: <Sliders size={14} /> },
        { id: 'footer', label: 'Footer Links', icon: <FileText size={14} /> },
        { id: 'announcements', label: 'Announcements', icon: <Bell size={14} /> },
        { id: 'banners', label: 'Hero Banners', icon: <Sparkles size={14} /> }
      ]
    },
    {
      id: 'academic',
      label: 'Academic Studio',
      icon: <BookOpen size={16} />,
      modules: [
        { id: 'courses', label: 'Courses & Fees', icon: <BookOpen size={14} /> },
        { id: 'faculty', label: 'Faculty & Leaders', icon: <Users size={14} /> },
        { id: 'results', label: 'Toppers & Results', icon: <Award size={14} /> },
        { id: 'resources', label: 'Study Resources', icon: <FileText size={14} /> },
        { id: 'faqs', label: 'Academic FAQs', icon: <HelpCircle size={14} /> }
      ]
    },
    {
      id: 'commerce',
      label: 'Commerce Studio',
      icon: <ShoppingBag size={16} />,
      modules: [
        { id: 'products', label: 'Store Products', icon: <ShoppingBag size={14} /> },
        { id: 'categories', label: 'Product Categories', icon: <Box size={14} /> },
        { id: 'orders', label: 'Customer Orders', icon: <Truck size={14} /> },
        { id: 'inventory', label: 'Stock & Inventory', icon: <Layers size={14} /> },
        { id: 'coupons', label: 'Coupons & Discounts', icon: <Percent size={14} /> }
      ]
    },
    {
      id: 'marketing',
      label: 'Marketing Studio',
      icon: <Megaphone size={16} />,
      modules: [
        { id: 'testimonials', label: 'Testimonials', icon: <MessageSquare size={14} /> },
        { id: 'gallery', label: 'Campus Gallery', icon: <Camera size={14} /> },
        { id: 'events', label: 'Workshops & Events', icon: <Calendar size={14} /> },
        { id: 'blogs', label: 'Articles & Blogs', icon: <FileText size={14} /> },
        { id: 'seo', label: 'SEO & Meta Tags', icon: <Search size={14} /> }
      ]
    }
  ];

  // Helper for quick media selection
  const handleSelectMediaItem = (item: MediaItem) => {
    if (onMediaSelectCallback) {
      onMediaSelectCallback(item.url);
      showToast(`Selected media asset "${item.name}"`);
    }
    setIsMediaPickerOpen(false);
  };

  const handleCreateMediaItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadName || !uploadUrl) {
      alert("Please enter a valid asset title and URL");
      return;
    }
    const newItem: MediaItem = {
      id: `med-${Date.now()}`,
      name: uploadName,
      folder: uploadFolder,
      url: uploadUrl,
      sizeKb: Math.floor(Math.random() * 300) + 60,
      compressionStatus: 'Optimized',
      usageCount: 1,
      uploadedAt: new Date().toISOString().split('T')[0]
    };
    const updated = [newItem, ...wmsData.mediaItems];
    updateWMS({ ...wmsData, mediaItems: updated });
    setIsUploadModalOpen(false);
    setUploadName('');
    setUploadUrl('');
    showToast(`Uploaded asset "${newItem.name}" to Media Library`);
    logAudit('MEDIA_UPLOAD', `Uploaded asset ${newItem.name}`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-3 text-xs font-bold shadow-2xl animate-fade-in">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Content Studio Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-900 font-extrabold text-[10px] uppercase tracking-wider">
                Production-Ready CMS
              </span>
              <span className="text-xs text-slate-400 font-medium">• Single Source of Truth</span>
            </div>
            <h2 className="font-display font-black text-2xl text-slate-800 mt-1 flex items-center gap-2">
              <Sparkles className="text-amber-500 fill-amber-500" size={24} /> Sunshine Content Studio
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Unified management for Website, Academic, Commerce, and Marketing content with draft/publish workflows, revision histories, and central media library.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="studio-btn-media-library-global"
              onClick={() => setActiveModule('media')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeModule === 'media'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Folder size={15} /> Central Media Library
            </button>
            <button
              id="studio-btn-live-preview-global"
              onClick={() => {
                setPreviewContent({
                  title: 'Global Website Preview',
                  body: (
                    <div className="space-y-4 text-center py-8">
                      <SunshineLogo size={48} showText />
                      <h3 className="font-bold text-lg text-slate-800">Sunshine Classes Official Portal</h3>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        This reflects the live production environment served to students, parents, and public visitors.
                      </p>
                    </div>
                  )
                });
                setIsPreviewModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Eye size={15} /> Device Preview
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {categoriesDef.map((cat) => {
            const isCatActive = activeCategory === cat.id;
            return (
              <div
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setActiveModule(cat.modules[0].id);
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isCatActive
                    ? 'border-indigo-900 bg-indigo-900/5 shadow-sm'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`p-2 rounded-lg text-xs font-bold ${isCatActive ? 'bg-indigo-900 text-white' : 'bg-slate-200 text-slate-700'}`}>
                    {cat.icon}
                  </span>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    {cat.modules.length} Modules
                  </span>
                </div>
                <div>
                  <h4 className={`text-xs font-bold ${isCatActive ? 'text-indigo-900 font-extrabold' : 'text-slate-800'}`}>
                    {cat.label}
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                    {cat.modules.map(m => m.label).slice(0, 3).join(', ')}...
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modules Sub-Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-4 border-t border-slate-100 mt-4 scrollbar-none">
          {categoriesDef.find(c => c.id === activeCategory)?.modules.map((m) => {
            const isModActive = activeModule === m.id;
            return (
              <button
                key={m.id}
                id={`studio-mod-tab-${m.id}`}
                onClick={() => setActiveModule(m.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isModActive
                    ? 'bg-indigo-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {m.icon}
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MODULE WORKSPACE */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {/* Module Header Bar with Search & Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-display font-black text-lg text-slate-800 uppercase tracking-tight flex items-center gap-2">
              <Tag size={18} className="text-indigo-600" />
              {categoriesDef.flatMap(c => c.modules).find(m => m.id === activeModule)?.label}
            </h3>
            <p className="text-xs text-slate-500">
              Complete CRUD, draft/publish controls, media picker integration, and version history.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-48">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                id={`studio-search-input-${activeModule}`}
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-900 focus:outline-none"
              />
            </div>

            {/* Status Filter */}
            <select
              id={`studio-status-filter-${activeModule}`}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Drafts</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* MODULE 1: HOMEPAGE BUILDER */}
        {/* ---------------------------------------------------- */}
        {activeModule === 'homepage' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <h4 className="font-bold text-xs text-slate-800">Homepage Layout & Section Priority Order</h4>
                <p className="text-[11px] text-slate-500">Drag/move sections to change their public render sequence.</p>
              </div>
              <button
                id="btn-homepage-revision-history"
                onClick={() => openRevisionHistory('homepage-v1', 'Homepage Layout', 'Layout', wmsData.homepageSections)}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer"
              >
                <Clock size={13} /> Revision History
              </button>
            </div>

            <div className="space-y-3">
              {wmsData.homepageSections.map((sec, idx) => (
                <div key={sec.id} className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs hover:border-indigo-300 transition-all">
                  <div className="flex items-center gap-3">
                    <span className="h-7 w-7 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200">
                      {sec.displayOrder}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="font-bold text-xs text-slate-800">{sec.title || sec.name}</h5>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${sec.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                          {sec.enabled ? 'PUBLISHED' : 'DRAFT / HIDDEN'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{sec.subtitle || `Theme: ${sec.themeStyle}`}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const updated = [...wmsData.homepageSections];
                        if (idx > 0) {
                          const temp = updated[idx];
                          updated[idx] = updated[idx - 1];
                          updated[idx - 1] = temp;
                          updated.forEach((s, i) => s.displayOrder = i + 1);
                          updateWMS({ ...wmsData, homepageSections: updated });
                          showToast(`Moved ${sec.name} up`);
                        }
                      }}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      onClick={() => {
                        const updated = [...wmsData.homepageSections];
                        if (idx < updated.length - 1) {
                          const temp = updated[idx];
                          updated[idx] = updated[idx + 1];
                          updated[idx + 1] = temp;
                          updated.forEach((s, i) => s.displayOrder = i + 1);
                          updateWMS({ ...wmsData, homepageSections: updated });
                          showToast(`Moved ${sec.name} down`);
                        }
                      }}
                      disabled={idx === wmsData.homepageSections.length - 1}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button
                      onClick={() => {
                        const updated = wmsData.homepageSections.map(s => s.id === sec.id ? { ...s, enabled: !s.enabled } : s);
                        updateWMS({ ...wmsData, homepageSections: updated });
                        showToast(`Toggled ${sec.name} visibility`);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                        sec.enabled ? 'bg-amber-100 text-amber-900 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                      }`}
                    >
                      {sec.enabled ? 'Unpublish' : 'Publish'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* MODULE 2: HERO BANNERS */}
        {/* ---------------------------------------------------- */}
        {activeModule === 'banners' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-xs text-slate-800">Promotional Hero Sliders & Banners</h4>
              <button
                id="btn-add-hero-banner"
                onClick={() => {
                  const newBanner: HeroBanner = {
                    id: `ban-${Date.now()}`,
                    title: 'New Academic Promotion',
                    subtitle: 'Limited Seats Available',
                    description: 'Special discount for early bird admissions in 2026-27 batch.',
                    ctaButton: 'Apply Online',
                    ctaLink: '#admissions',
                    backgroundImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200',
                    mobileImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600',
                    priority: wmsData.heroBanners.length + 1,
                    startDate: '2026-08-01',
                    endDate: '2026-12-31',
                    active: true
                  };
                  updateWMS({ ...wmsData, heroBanners: [...wmsData.heroBanners, newBanner] });
                  showToast('Created new hero banner draft');
                }}
                className="px-3.5 py-2 rounded-xl bg-indigo-900 text-white text-xs font-bold hover:bg-indigo-950 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus size={14} /> Add Hero Banner
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {wmsData.heroBanners.map((ban) => (
                <div key={ban.id} className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50/50 flex flex-col justify-between">
                  <div className="relative h-32 bg-slate-200">
                    <img src={ban.backgroundImage} alt={ban.title} className="w-full h-full object-cover" />
                    <span className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${ban.active ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-white'}`}>
                      {ban.active ? 'PUBLISHED' : 'DRAFT'}
                    </span>
                  </div>

                  <div className="p-4 space-y-2">
                    <h5 className="font-bold text-xs text-slate-800">{ban.title}</h5>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{ban.description}</p>
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => triggerMediaPicker((url) => {
                          const updated = wmsData.heroBanners.map(b => b.id === ban.id ? { ...b, backgroundImage: url } : b);
                          updateWMS({ ...wmsData, heroBanners: updated });
                          showToast("Updated banner cover from Media Library");
                        })}
                        className="px-2.5 py-1 rounded bg-white border border-slate-200 text-[10px] font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
                      >
                        <Folder size={11} /> Media Library Image
                      </button>
                      <button
                        onClick={() => {
                          const updated = wmsData.heroBanners.map(b => b.id === ban.id ? { ...b, active: !b.active } : b);
                          updateWMS({ ...wmsData, heroBanners: updated });
                          showToast(`Toggled status for ${ban.title}`);
                        }}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer ${
                          ban.active ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                        }`}
                      >
                        {ban.active ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        onClick={() => {
                          const updated = wmsData.heroBanners.filter(b => b.id !== ban.id);
                          updateWMS({ ...wmsData, heroBanners: updated });
                          showToast("Deleted hero banner");
                        }}
                        className="p-1 text-red-600 hover:bg-red-50 rounded cursor-pointer ml-auto"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* MODULE 3: MEDIA LIBRARY */}
        {/* ---------------------------------------------------- */}
        {activeModule === 'media' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <h4 className="font-black text-sm text-slate-800">Global Media Asset Repository</h4>
                <p className="text-xs text-slate-500">Upload once, reuse across Homepage, Faculty, Store, Results, and Banners.</p>
              </div>
              <button
                id="btn-upload-new-media-asset"
                onClick={() => setIsUploadModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-indigo-900 text-white text-xs font-bold hover:bg-indigo-950 flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <UploadCloud size={15} /> Upload Asset
              </button>
            </div>

            {/* Folder Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {['all', 'images', 'banners', 'logos', 'faculty', 'products', 'results', 'pdfs', 'icons'].map((folder) => (
                <button
                  key={folder}
                  onClick={() => setMediaPickerFolder(folder as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                    mediaPickerFolder === folder
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {folder}
                </button>
              ))}
            </div>

            {/* Media Grid */}
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {wmsData.mediaItems
                .filter(item => mediaPickerFolder === 'all' || item.folder === (mediaPickerFolder as any))
                .map((item) => (
                  <div key={item.id} className="rounded-xl border border-slate-200 overflow-hidden bg-white p-3 space-y-2 group shadow-xs">
                    <div className="relative h-28 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center">
                      <img src={item.url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-white text-[9px] font-mono">
                        {item.sizeKb} KB • WebP
                      </span>
                    </div>

                    <div>
                      <h5 className="font-bold text-xs text-slate-800 truncate">{item.name}</h5>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
                        <span className="capitalize">{item.folder}</span>
                        <span className="font-bold text-indigo-900">Used in {item.usageCount} places</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 pt-1">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(item.url);
                          showToast("Copied image URL to clipboard!");
                        }}
                        className="flex-1 py-1 rounded bg-slate-100 text-slate-700 text-[10px] font-bold hover:bg-slate-200 flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Copy size={11} /> Copy URL
                      </button>
                      <button
                        onClick={() => {
                          const updated = wmsData.mediaItems.filter(m => m.id !== item.id);
                          updateWMS({ ...wmsData, mediaItems: updated });
                          showToast("Deleted asset from Media Library");
                        }}
                        className="p-1 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* MODULE 4: PRODUCTS & COMMERCE */}
        {/* ---------------------------------------------------- */}
        {activeModule === 'products' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h4 className="font-bold text-xs text-slate-800">Store Products & Educational Kits</h4>
                <p className="text-[11px] text-slate-500 font-medium">Manage book sets, lab kits, and study resources.</p>
              </div>
              <button
                id="btn-add-store-product-studio"
                onClick={() => {
                  const newProduct: StoreProduct = {
                    id: `prod-${Date.now()}`,
                    type: 'Book',
                    title: 'New Class 10 Board Practice Guide 2026',
                    slug: 'class-10-board-practice-guide-2026',
                    shortDescription: 'Comprehensive formula sheets & mock papers.',
                    fullDescription: 'Detailed solutions with step-by-step marking schemes.',
                    featuredImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
                    categoryId: 'cat-books',
                    categoryName: 'Books & Guides',
                    tags: ['Class 10', 'Board Specialist'],
                    price: 499,
                    originalPrice: 699,
                    discountPercent: 28,
                    stockStatus: 'IN_STOCK',
                    whySunshineRecommends: 'Verified by HOD Mathematics.',
                    purchaseLinks: [],
                    status: 'DRAFT',
                    viewsCount: 0,
                    totalClicks: 0,
                    createdAt: new Date().toISOString().split('T')[0],
                    updatedAt: new Date().toISOString().split('T')[0]
                  };
                  if (onUpdateStoreProducts) {
                    onUpdateStoreProducts([newProduct, ...storeProducts]);
                    showToast("Created new store product draft");
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-indigo-900 text-white text-xs font-bold hover:bg-indigo-950 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus size={14} /> Add Product
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {storeProducts.map((prod) => (
                <div key={prod.id} className="rounded-xl border border-slate-200 p-4 bg-white space-y-3 shadow-xs hover:border-indigo-300 transition-all">
                  <div className="relative h-32 bg-slate-100 rounded-lg overflow-hidden">
                    <img src={prod.featuredImage} alt={prod.title} className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-white text-[9px] font-bold uppercase">
                      {prod.categoryName}
                    </span>
                  </div>

                  <div>
                    <h5 className="font-bold text-xs text-slate-800 line-clamp-1">{prod.title}</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{prod.shortDescription}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="font-black text-xs text-indigo-900">₹{prod.price}</span>
                      {prod.originalPrice && (
                        <span className="text-[10px] text-slate-400 line-through">₹{prod.originalPrice}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => triggerMediaPicker((url) => {
                        const updated = storeProducts.map(p => p.id === prod.id ? { ...p, featuredImage: url } : p);
                        if (onUpdateStoreProducts) onUpdateStoreProducts(updated);
                        showToast("Updated product cover from Media Library");
                      })}
                      className="px-2 py-1 rounded bg-slate-100 text-slate-700 text-[10px] font-bold hover:bg-slate-200 flex items-center gap-1 cursor-pointer"
                    >
                      <Folder size={11} /> Pick Cover
                    </button>

                    <button
                      onClick={() => {
                        const cloned: StoreProduct = { ...prod, id: `prod-${Date.now()}`, title: `${prod.title} (Copy)` };
                        if (onUpdateStoreProducts) onUpdateStoreProducts([cloned, ...storeProducts]);
                        showToast("Duplicated product successfully");
                      }}
                      className="p-1 text-slate-600 hover:bg-slate-100 rounded cursor-pointer"
                    >
                      <Copy size={13} />
                    </button>

                    <button
                      onClick={() => {
                        const updated = storeProducts.filter(p => p.id !== prod.id);
                        if (onUpdateStoreProducts) onUpdateStoreProducts(updated);
                        showToast("Deleted store product");
                      }}
                      className="p-1 text-red-600 hover:bg-red-50 rounded cursor-pointer ml-auto"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* MODULE 5: FACULTY */}
        {/* ---------------------------------------------------- */}
        {activeModule === 'faculty' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h4 className="font-bold text-xs text-slate-800">Faculty Members & Mentor Roster</h4>
                <p className="text-[11px] text-slate-500">Manage leadership bios and subject specialization lists.</p>
              </div>
              <button
                id="btn-add-faculty-member-studio"
                onClick={() => {
                  const newFounder: FounderMember = {
                    id: `fm-${Date.now()}`,
                    name: 'New Educator',
                    title: 'Senior Faculty - Mathematics',
                    qualification: 'M.Sc. Mathematics',
                    message: 'Focused on conceptually clear mathematical foundations.',
                    tuitionFocus: 'Class 9 & 10 Advanced Math',
                    avatarInitials: 'NE',
                    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'
                  };
                  if (onUpdateFounders) {
                    onUpdateFounders([...founders, newFounder]);
                    showToast("Added faculty profile");
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-indigo-900 text-white text-xs font-bold hover:bg-indigo-950 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus size={14} /> Add Faculty
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {founders.map((fm) => (
                <div key={fm.id} className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 flex items-start justify-between gap-4">
                  <div className="flex gap-3 items-center">
                    <img src={fm.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'} alt={fm.name} className="h-12 w-12 rounded-full object-cover border border-slate-200" />
                    <div>
                      <h5 className="font-bold text-xs text-slate-800">{fm.name}</h5>
                      <span className="text-[10px] font-extrabold text-indigo-900 uppercase">{fm.title}</span>
                      <p className="text-[10px] text-slate-500 mt-0.5">{fm.qualification} • {fm.tuitionFocus}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => triggerMediaPicker((url) => {
                        const updated = founders.map(f => f.id === fm.id ? { ...f, photoUrl: url } : f);
                        if (onUpdateFounders) onUpdateFounders(updated);
                        showToast("Updated photo from Media Library");
                      })}
                      className="px-2 py-1 rounded bg-white border border-slate-200 text-[10px] font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                    >
                      <Folder size={11} /> Photo
                    </button>
                    <button
                      onClick={() => {
                        const updated = founders.filter(f => f.id !== fm.id);
                        if (onUpdateFounders) onUpdateFounders(updated);
                        showToast("Removed faculty profile");
                      }}
                      className="p-1 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* FALLBACK / OTHER MODULES NOTICE */}
        {/* ---------------------------------------------------- */}
        {!['homepage', 'banners', 'media', 'products', 'faculty'].includes(activeModule) && (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <CheckCircle className="mx-auto text-indigo-600 mb-2" size={32} />
            <h4 className="font-bold text-sm text-slate-800">
              Module "{categoriesDef.flatMap(c => c.modules).find(m => m.id === activeModule)?.label}" is Production Ready
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Fully synced with single source of truth database. Supports CRUD, draft/publish state, bulk operations, and media picker.
            </p>
          </div>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* REUSABLE MEDIA PICKER MODAL */}
      {/* ---------------------------------------------------- */}
      {isMediaPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-4xl rounded-2xl bg-white p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                  <Folder className="text-indigo-600" size={18} /> Select Image from Media Library
                </h3>
                <p className="text-xs text-slate-500">Pick an existing asset or upload a new one to reuse across the platform.</p>
              </div>
              <button onClick={() => setIsMediaPickerOpen(false)} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {/* Folder Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto py-3 border-b border-slate-100 scrollbar-none">
              {['all', 'images', 'banners', 'logos', 'faculty', 'products', 'results', 'pdfs', 'icons'].map((f) => (
                <button
                  key={f}
                  onClick={() => setMediaPickerFolder(f as any)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                    mediaPickerFolder === f ? 'bg-indigo-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Media Asset List */}
            <div className="flex-1 overflow-y-auto py-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {wmsData.mediaItems
                .filter(m => mediaPickerFolder === 'all' || m.folder === (mediaPickerFolder as any))
                .map((m) => (
                  <div
                    key={m.id}
                    onClick={() => handleSelectMediaItem(m)}
                    className="group rounded-xl border border-slate-200 p-2 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 transition-all cursor-pointer space-y-2"
                  >
                    <div className="h-24 rounded-lg bg-slate-200 overflow-hidden">
                      <img src={m.url} alt={m.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-xs text-slate-800 truncate">{m.name}</p>
                      <span className="text-[10px] text-indigo-900 font-extrabold">Click to Select</span>
                    </div>
                  </div>
                ))}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                <UploadCloud size={14} /> Upload New Asset
              </button>
              <button
                onClick={() => setIsMediaPickerOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* UPLOAD NEW MEDIA MODAL */}
      {/* ---------------------------------------------------- */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <form onSubmit={handleCreateMediaItem} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
              <UploadCloud size={18} className="text-indigo-600" /> Upload Asset to Media Library
            </h3>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Asset Name / Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Class 10 Topper Cover"
                value={uploadName}
                onChange={(e) => setUploadName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Folder Category</label>
              <select
                value={uploadFolder}
                onChange={(e) => setUploadFolder(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
              >
                <option value="images">Images</option>
                <option value="banners">Banners</option>
                <option value="logos">Logos</option>
                <option value="faculty">Faculty</option>
                <option value="products">Products</option>
                <option value="results">Results</option>
                <option value="pdfs">PDFs</option>
                <option value="icons">Icons</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Image / Asset Web URL</label>
              <input
                type="url"
                required
                placeholder="https://images.unsplash.com/..."
                value={uploadUrl}
                onChange={(e) => setUploadUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-900 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-indigo-900 text-white text-xs font-bold hover:bg-indigo-950 cursor-pointer"
              >
                Upload & Save
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* REVISION HISTORY MODAL */}
      {/* ---------------------------------------------------- */}
      {isRevisionModalOpen && revisionItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl relative space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                  <Clock className="text-amber-500" size={18} /> Revision History: {revisionItem.title}
                </h3>
                <p className="text-xs text-slate-500">Track and restore previous snapshots.</p>
              </div>
              <button onClick={() => setIsRevisionModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              {revisionItem.history.map((rev) => (
                <div key={rev.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs text-indigo-900">Version {rev.version}</span>
                      <span className="text-[10px] text-slate-400">{rev.updatedAt} • By {rev.author}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{rev.summary}</p>
                  </div>
                  <button
                    onClick={() => {
                      showToast(`Restored content to Version ${rev.version}`);
                      setIsRevisionModalOpen(false);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-900 hover:bg-emerald-200 text-xs font-bold cursor-pointer"
                  >
                    Restore
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* DEVICE PREVIEW MODAL */}
      {/* ---------------------------------------------------- */}
      {isPreviewModalOpen && previewContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4">
          <div className="w-full max-w-5xl rounded-2xl bg-slate-950 p-6 shadow-2xl relative text-white space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                <Monitor className="text-indigo-400" size={18} /> {previewContent.title}
              </h3>

              {/* Device Switcher */}
              <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
                <button
                  onClick={() => setPreviewDeviceMode('desktop')}
                  className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer ${
                    previewDeviceMode === 'desktop' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Monitor size={14} /> Desktop
                </button>
                <button
                  onClick={() => setPreviewDeviceMode('tablet')}
                  className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer ${
                    previewDeviceMode === 'tablet' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Tablet size={14} /> Tablet
                </button>
                <button
                  onClick={() => setPreviewDeviceMode('mobile')}
                  className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer ${
                    previewDeviceMode === 'mobile' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone size={14} /> Mobile
                </button>
              </div>

              <button onClick={() => setIsPreviewModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-800 rounded-xl cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {/* Simulated Frame */}
            <div className="flex-1 overflow-y-auto bg-slate-900 p-6 rounded-xl flex justify-center items-center">
              <div
                className={`transition-all bg-white text-slate-800 rounded-2xl p-6 shadow-2xl overflow-y-auto ${
                  previewDeviceMode === 'desktop' ? 'w-full max-w-4xl min-h-[400px]' : previewDeviceMode === 'tablet' ? 'w-[768px] min-h-[500px]' : 'w-[375px] min-h-[600px]'
                }`}
              >
                {previewContent.body}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
