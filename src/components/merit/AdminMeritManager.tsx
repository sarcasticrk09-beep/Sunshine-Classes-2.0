import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Trash2, 
  Edit3, 
  Copy, 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  CheckSquare, 
  Square, 
  Sparkles, 
  FileSpreadsheet, 
  GraduationCap, 
  X, 
  Check, 
  AlertCircle,
  GripVertical,
  Star,
  RefreshCw,
  LayoutGrid,
  List
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Topper, SubscriptionConfig } from '../../types';
import { TopperCard, getTopperInitials } from './TopperCard';
import { CloudinaryUpload } from '../CloudinaryUpload';

interface AdminMeritManagerProps {
  toppers: Topper[];
  onAddOrEditTopper: (topper: Topper) => void;
  onDeleteTopper: (id: string) => void;
  onUpdateToppersList?: (updatedList: Topper[]) => void;
  subConfig?: SubscriptionConfig;
}

export const AdminMeritManager: React.FC<AdminMeritManagerProps> = ({
  toppers = [],
  onAddOrEditTopper,
  onDeleteTopper,
  onUpdateToppersList,
  subConfig
}) => {
  // State variables
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState('ALL');
  const [classFilter, setClassFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingTopper, setEditingTopper] = useState<Partial<Topper> | null>(null);
  
  const [activeTab, setActiveTab] = useState<'manager' | 'preview'>('manager');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Available Filter Options derived from current toppers list
  const availableYears = useMemo(() => {
    const years = new Set<string>(['2025-2026', '2024-2025', '2023-2024']);
    toppers.forEach(t => {
      const y = t.academicYear || t.year;
      if (y) years.add(y);
    });
    return Array.from(years).sort().reverse();
  }, [toppers]);

  const availableClasses = useMemo(() => {
    const classes = new Set<string>(['Class 10', 'Class 12', 'Class 9', 'Class 8']);
    toppers.forEach(t => {
      const c = t.studentClass || t.class;
      if (c) classes.add(c);
    });
    return Array.from(classes);
  }, [toppers]);

  // Filtered Toppers List
  const filteredToppers = useMemo(() => {
    return toppers.filter(t => {
      const name = (t.name || '').toLowerCase();
      const caption = (t.achievementCaption || t.desc || '').toLowerCase();
      const board = (t.board || '').toLowerCase();
      const term = searchTerm.toLowerCase().trim();

      const matchesSearch = !term || name.includes(term) || caption.includes(term) || board.includes(term);
      
      const tYear = t.academicYear || t.year || '2025-2026';
      const matchesYear = yearFilter === 'ALL' || tYear === yearFilter;

      const tClass = t.studentClass || t.class || 'Class 10';
      const matchesClass = classFilter === 'ALL' || tClass === classFilter;

      let matchesStatus = true;
      if (statusFilter === 'FEATURED') matchesStatus = !!t.isFeatured;
      else if (statusFilter === 'PUBLISHED') matchesStatus = t.status !== 'DRAFT';
      else if (statusFilter === 'DRAFT') matchesStatus = t.status === 'DRAFT';

      return matchesSearch && matchesYear && matchesClass && matchesStatus;
    }).sort((a, b) => (a.displayOrder ?? 99) - (b.displayOrder ?? 99));
  }, [toppers, searchTerm, yearFilter, classFilter, statusFilter]);

  // Handle Opening Form Modal for New Topper
  const handleOpenAddModal = () => {
    setEditingTopper({
      id: '',
      name: '',
      percentage: '',
      studentClass: 'Class 10',
      academicYear: '2025-2026',
      board: 'CBSE',
      achievementCaption: '',
      photoUrl: '',
      displayOrder: toppers.length + 1,
      isFeatured: true,
      status: 'PUBLISHED'
    });
    setShowFormModal(true);
  };

  // Handle Editing Existing Topper
  const handleOpenEditModal = (topper: Topper) => {
    setEditingTopper({
      id: topper.id,
      name: topper.name || '',
      percentage: topper.percentage || topper.score || '',
      studentClass: topper.studentClass || topper.class || 'Class 10',
      academicYear: topper.academicYear || topper.year || '2025-2026',
      board: topper.board || 'CBSE',
      achievementCaption: topper.achievementCaption || topper.desc || '',
      photoUrl: topper.photoUrl || topper.img || '',
      displayOrder: topper.displayOrder ?? 1,
      isFeatured: topper.isFeatured !== false,
      status: topper.status || 'PUBLISHED'
    });
    setShowFormModal(true);
  };

  // Save Topper
  const handleSaveTopper = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTopper || !editingTopper.name || !editingTopper.percentage) return;

    const formattedPercentage = editingTopper.percentage.includes('%') 
      ? editingTopper.percentage.trim() 
      : `${editingTopper.percentage.trim()}%`;

    const topperToSave: Topper = {
      id: editingTopper.id || `TOP-${Date.now()}`,
      name: editingTopper.name.trim(),
      percentage: formattedPercentage,
      score: formattedPercentage,
      studentClass: editingTopper.studentClass || 'Class 10',
      class: editingTopper.studentClass || 'Class 10',
      academicYear: editingTopper.academicYear || '2025-2026',
      year: editingTopper.academicYear || '2025-2026',
      board: editingTopper.board || 'CBSE',
      achievementCaption: editingTopper.achievementCaption || '',
      desc: editingTopper.achievementCaption || '',
      photoUrl: editingTopper.photoUrl || '',
      img: editingTopper.photoUrl || '',
      displayOrder: editingTopper.displayOrder ?? (toppers.length + 1),
      isFeatured: editingTopper.isFeatured !== false,
      status: editingTopper.status || 'PUBLISHED',
      updatedAt: new Date().toISOString()
    };

    onAddOrEditTopper(topperToSave);
    setShowFormModal(false);
    setEditingTopper(null);
  };

  // Duplicate Topper
  const handleDuplicateTopper = (topper: Topper) => {
    const dup: Topper = {
      ...topper,
      id: `TOP-${Date.now()}`,
      name: `${topper.name} (Copy)`,
      displayOrder: toppers.length + 1,
      updatedAt: new Date().toISOString()
    };
    onAddOrEditTopper(dup);
  };

  // Reorder Item (Move Up / Move Down)
  const handleMoveOrder = (index: number, direction: 'up' | 'down') => {
    if (!onUpdateToppersList) return;
    const newList = [...toppers];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newList.length) return;

    const temp = newList[index];
    newList[index] = newList[targetIndex];
    newList[targetIndex] = temp;

    // Normalize displayOrder numbers
    const reordered = newList.map((item, idx) => ({
      ...item,
      displayOrder: idx + 1
    }));

    onUpdateToppersList(reordered);
  };

  // Selection handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredToppers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredToppers.map(t => t.id));
    }
  };

  // Bulk Actions
  const handleBulkStatusChange = (newStatus: 'PUBLISHED' | 'DRAFT') => {
    if (!onUpdateToppersList || selectedIds.length === 0) return;
    const updated = toppers.map(t => 
      selectedIds.includes(t.id) ? { ...t, status: newStatus } : t
    );
    onUpdateToppersList(updated);
    setSelectedIds([]);
  };

  const handleBulkFeatureToggle = (isFeatured: boolean) => {
    if (!onUpdateToppersList || selectedIds.length === 0) return;
    const updated = toppers.map(t => 
      selectedIds.includes(t.id) ? { ...t, isFeatured } : t
    );
    onUpdateToppersList(updated);
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedIds.length} selected toppers?`)) {
      selectedIds.forEach(id => onDeleteTopper(id));
      setSelectedIds([]);
    }
  };

  // Excel Export
  const handleExportExcel = () => {
    const exportData = filteredToppers.map((t, idx) => ({
      'S.No': idx + 1,
      'Student Name': t.name,
      'Percentage': t.percentage || t.score,
      'Class': t.studentClass || t.class || 'Class 10',
      'Academic Year': t.academicYear || t.year || '2025-2026',
      'Board': t.board || 'CBSE',
      'Achievement Caption': t.achievementCaption || t.desc || '',
      'Featured on Homepage': t.isFeatured !== false ? 'YES' : 'NO',
      'Status': t.status || 'PUBLISHED',
      'Photo URL': t.photoUrl || t.img || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Merit Toppers');
    XLSX.writeFile(workbook, `Sunshine_Classes_Merit_List_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Excel Import
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus('Reading file...');
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const rows: any[] = XLSX.utils.sheet_to_json(ws);

        if (!rows || rows.length === 0) {
          setImportStatus('No rows found in Excel sheet.');
          return;
        }

        let importedCount = 0;
        rows.forEach((row, idx) => {
          const name = row['Student Name'] || row['Name'] || row['student_name'];
          const percentage = row['Percentage'] || row['Score'] || row['percentage'];

          if (name && percentage) {
            const formattedPercentage = String(percentage).includes('%') 
              ? String(percentage).trim() 
              : `${String(percentage).trim()}%`;

            const topperToSave: Topper = {
              id: `TOP-IMP-${Date.now()}-${idx}`,
              name: String(name).trim(),
              percentage: formattedPercentage,
              score: formattedPercentage,
              studentClass: row['Class'] || row['studentClass'] || 'Class 10',
              class: row['Class'] || row['studentClass'] || 'Class 10',
              academicYear: row['Academic Year'] || row['academicYear'] || '2025-2026',
              year: row['Academic Year'] || row['academicYear'] || '2025-2026',
              board: row['Board'] || 'CBSE',
              achievementCaption: row['Achievement Caption'] || row['Caption'] || '',
              desc: row['Achievement Caption'] || row['Caption'] || '',
              photoUrl: row['Photo URL'] || row['photoUrl'] || '',
              img: row['Photo URL'] || row['photoUrl'] || '',
              displayOrder: toppers.length + idx + 1,
              isFeatured: String(row['Featured on Homepage'] || row['Featured']).toUpperCase() === 'YES',
              status: String(row['Status']).toUpperCase() === 'DRAFT' ? 'DRAFT' : 'PUBLISHED'
            };

            onAddOrEditTopper(topperToSave);
            importedCount++;
          }
        });

        setImportStatus(`Successfully imported ${importedCount} topper records!`);
        setTimeout(() => setImportStatus(null), 4000);
      } catch (err: any) {
        setImportStatus(`Error parsing Excel file: ${err.message}`);
      }
    };

    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/60 inline-flex items-center gap-1">
            <GraduationCap size={12} /> Sunshine Academic Merit CMS
          </span>
          <h2 className="font-display font-black text-xl text-slate-900 mt-2">
            Merit List & Toppers Manager
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage student academic performance records, drag-and-drop order, bulk actions, and Excel synchronization.
          </p>
        </div>

        {/* Tab Switcher & Action Trigger */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              id="btn-merit-tab-manager"
              onClick={() => setActiveTab('manager')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'manager'
                  ? 'bg-white text-indigo-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List size={14} /> List View
            </button>
            <button
              id="btn-merit-tab-preview"
              onClick={() => setActiveTab('preview')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'preview'
                  ? 'bg-white text-indigo-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye size={14} className="text-amber-500" /> Live Public Preview
            </button>
          </div>

          <button
            id="btn-add-topper-trigger"
            onClick={handleOpenAddModal}
            className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs px-4 py-2 flex items-center gap-1.5 shadow-sm transition-all cursor-pointer min-h-[38px]"
          >
            <Plus size={15} /> Add New Student Record
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'preview' ? (
        /* Real-Time Live Preview Tab */
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-200 pb-4">
            <div>
              <h3 className="font-display font-black text-base text-slate-800 flex items-center gap-2">
                <Sparkles size={16} className="text-amber-500" /> Live Website Preview
              </h3>
              <p className="text-xs text-slate-500">
                This shows the exact visual component rendered on the public Sunshine Classes homepage and results section.
              </p>
            </div>
            <button
              id="btn-switch-back-to-manager"
              onClick={() => setActiveTab('manager')}
              className="text-xs font-bold text-indigo-900 hover:underline cursor-pointer"
            >
              &larr; Return to Management Controls
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 block">
                Academic Merit Honor Roll
              </span>
              <h3 className="font-display text-2xl font-black text-slate-900">
                High Academic Scorers & Board Achievers
              </h3>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
              {filteredToppers.length > 0 ? (
                filteredToppers.map((top, idx) => (
                  <TopperCard
                    key={top.id || idx}
                    topper={top}
                    idPrefix="preview-cms-topper"
                  />
                ))
              ) : (
                <div className="col-span-full py-12 text-center text-slate-400 text-xs font-medium">
                  No published toppers match current search/filters.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Management List Controls Tab */
        <div className="space-y-6">
          
          {/* Import Status Alert if any */}
          {importStatus && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900 font-bold flex items-center justify-between">
              <span>{importStatus}</span>
              <button onClick={() => setImportStatus(null)} className="text-blue-500 hover:text-blue-700">
                <X size={14} />
              </button>
            </div>
          )}

          {/* Search, Filters, and Import/Export Toolbar */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
            <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3">
              
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  id="input-merit-search"
                  type="text"
                  placeholder="Search student name, board, or caption..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 py-2 text-xs focus:bg-white focus:border-indigo-900 focus:outline-none"
                />
              </div>

              {/* Filter Dropdowns */}
              <div className="flex flex-wrap items-center gap-2">
                
                {/* Year Filter */}
                <select
                  id="select-merit-year-filter"
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none cursor-pointer"
                >
                  <option value="ALL">All Academic Years</option>
                  {availableYears.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>

                {/* Class Filter */}
                <select
                  id="select-merit-class-filter"
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none cursor-pointer"
                >
                  <option value="ALL">All Classes</option>
                  {availableClasses.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                {/* Status Filter */}
                <select
                  id="select-merit-status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="FEATURED">Featured on Homepage</option>
                  <option value="PUBLISHED">Published Only</option>
                  <option value="DRAFT">Drafts Only</option>
                </select>

                {/* Grid / Table Toggle */}
                <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                  <button
                    id="btn-merit-view-grid"
                    onClick={() => setViewMode('grid')}
                    className={`rounded-lg p-1.5 transition-all ${viewMode === 'grid' ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-400'}`}
                    title="Grid Card View"
                  >
                    <LayoutGrid size={14} />
                  </button>
                  <button
                    id="btn-merit-view-table"
                    onClick={() => setViewMode('table')}
                    className={`rounded-lg p-1.5 transition-all ${viewMode === 'table' ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-400'}`}
                    title="Table View"
                  >
                    <List size={14} />
                  </button>
                </div>

              </div>
            </div>

            {/* Bulk Actions & Excel Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
              
              {/* Select All & Bulk Operation Actions */}
              <div className="flex items-center gap-2">
                <button
                  id="checkbox-select-all-toppers"
                  onClick={handleSelectAll}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {selectedIds.length > 0 && selectedIds.length === filteredToppers.length ? (
                    <CheckSquare size={14} className="text-indigo-900" />
                  ) : (
                    <Square size={14} />
                  )}
                  <span>Select All ({filteredToppers.length})</span>
                </button>

                {selectedIds.length > 0 && (
                  <div className="flex items-center gap-1.5 animate-fade-in">
                    <button
                      id="btn-bulk-publish-merit"
                      onClick={() => handleBulkStatusChange('PUBLISHED')}
                      className="rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 text-[11px] font-bold hover:bg-emerald-100 cursor-pointer"
                    >
                      Publish
                    </button>
                    <button
                      id="btn-bulk-draft-merit"
                      onClick={() => handleBulkStatusChange('DRAFT')}
                      className="rounded-lg bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 text-[11px] font-bold hover:bg-amber-100 cursor-pointer"
                    >
                      Draft
                    </button>
                    <button
                      id="btn-bulk-feature-merit"
                      onClick={() => handleBulkFeatureToggle(true)}
                      className="rounded-lg bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 text-[11px] font-bold hover:bg-blue-100 cursor-pointer"
                    >
                      Feature
                    </button>
                    <button
                      id="btn-bulk-delete-merit"
                      onClick={handleBulkDelete}
                      className="rounded-lg bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 text-[11px] font-bold hover:bg-red-100 cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 size={12} /> Delete ({selectedIds.length})
                    </button>
                  </div>
                )}
              </div>

              {/* Excel Import / Export Tools */}
              <div className="flex items-center gap-2">
                <button
                  id="btn-export-excel-toppers"
                  onClick={handleExportExcel}
                  className="rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold px-3 py-1.5 flex items-center gap-1.5 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet size={14} className="text-emerald-600" /> Export Excel
                </button>

                <label
                  id="btn-import-excel-toppers-label"
                  className="rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold px-3 py-1.5 flex items-center gap-1.5 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <Upload size={14} className="text-indigo-600" /> Import Excel
                  <input
                    id="input-file-import-excel-merit"
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleImportExcel}
                    className="hidden"
                  />
                </label>
              </div>

            </div>
          </div>

          {/* Toppers Items Display */}
          {filteredToppers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center space-y-3">
              <GraduationCap size={36} className="mx-auto text-slate-300" />
              <h3 className="text-sm font-bold text-slate-700">No Student Topper Records Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No topper entries match your search query or applied filters. Click below to add a new student or clear filters.
              </p>
              <button
                id="btn-empty-add-topper"
                onClick={handleOpenAddModal}
                className="rounded-xl bg-amber-500 text-white font-extrabold text-xs px-4 py-2 cursor-pointer inline-flex items-center gap-1"
              >
                <Plus size={14} /> Add First Topper Record
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid View Cards with Drag Handles & CMS Quick Actions */
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredToppers.map((top, index) => {
                const isSelected = selectedIds.includes(top.id);
                const isPublished = top.status !== 'DRAFT';
                const photo = top.photoUrl || top.img;
                const initials = getTopperInitials(top.name);

                return (
                  <div
                    key={top.id}
                    className={`rounded-2xl border bg-white p-4 shadow-2xs transition-all relative flex flex-col justify-between ${
                      isSelected 
                        ? 'border-indigo-600 ring-1 ring-indigo-600 bg-indigo-50/20' 
                        : 'border-slate-200 hover:border-amber-400'
                    }`}
                  >
                    {/* Card Top Row: Checkbox, Order, Badges */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <input
                          id={`checkbox-select-topper-${top.id}`}
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(top.id)}
                          className="h-4 w-4 rounded border-slate-300 text-indigo-900 focus:ring-indigo-900 cursor-pointer"
                        />
                        <span className="text-[10px] font-black text-slate-400">
                          #{top.displayOrder ?? (index + 1)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        {top.isFeatured && (
                          <span className="rounded-full bg-amber-100 text-amber-800 text-[9px] font-black uppercase px-2 py-0.5 flex items-center gap-1">
                            <Star size={10} className="fill-amber-500 text-amber-500" /> Featured
                          </span>
                        )}
                        <span className={`rounded-full text-[9px] font-black uppercase px-2 py-0.5 ${
                          isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {isPublished ? 'PUBLISHED' : 'DRAFT'}
                        </span>
                      </div>
                    </div>

                    {/* Student Info Details */}
                    <div className="flex items-start gap-3 my-2">
                      <div className="relative h-14 w-14 rounded-full border-2 border-amber-300 overflow-hidden shrink-0 bg-indigo-950 text-white flex items-center justify-center font-black text-base">
                        {photo ? (
                          <img src={photo} alt={top.name} className="h-full w-full object-cover" />
                        ) : (
                          <span>{initials}</span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-black text-slate-900 truncate">{top.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-sm font-black text-blue-700">{top.percentage || top.score}</span>
                          <span className="text-[10px] font-bold text-slate-500">
                            {top.studentClass || top.class} ({top.board || 'CBSE'})
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-amber-700 block">
                          Year: {top.academicYear || top.year}
                        </span>
                        {(top.achievementCaption || top.desc) && (
                          <p className="text-[10px] text-slate-500 line-clamp-1 mt-1 font-medium">
                            "{top.achievementCaption || top.desc}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action Bar: Reorder & Editing */}
                    <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between">
                      {/* Reorder Buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          id={`btn-move-up-topper-${top.id}`}
                          onClick={() => handleMoveOrder(index, 'up')}
                          disabled={index === 0}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                          title="Move Up"
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button
                          id={`btn-move-down-topper-${top.id}`}
                          onClick={() => handleMoveOrder(index, 'down')}
                          disabled={index === filteredToppers.length - 1}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                          title="Move Down"
                        >
                          <ArrowDown size={13} />
                        </button>
                      </div>

                      {/* Edit, Duplicate, Delete */}
                      <div className="flex items-center gap-1">
                        <button
                          id={`btn-duplicate-topper-${top.id}`}
                          onClick={() => handleDuplicateTopper(top)}
                          className="p-1.5 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
                          title="Duplicate Record"
                        >
                          <Copy size={13} />
                        </button>
                        <button
                          id={`btn-edit-topper-${top.id}`}
                          onClick={() => handleOpenEditModal(top)}
                          className="p-1.5 rounded text-slate-600 hover:text-indigo-900 hover:bg-indigo-50 cursor-pointer"
                          title="Edit Details"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          id={`btn-delete-topper-${top.id}`}
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete ${top.name}?`)) {
                              onDeleteTopper(top.id);
                            }
                          }}
                          className="p-1.5 rounded text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                          title="Delete Topper"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase text-slate-500">
                      <th className="p-3 w-10 text-center">#</th>
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Percentage</th>
                      <th className="p-3">Class & Board</th>
                      <th className="p-3">Academic Year</th>
                      <th className="p-3">Achievement Caption</th>
                      <th className="p-3 text-center">Featured</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredToppers.map((top, idx) => (
                      <tr key={top.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 text-center text-slate-400 font-black">{idx + 1}</td>
                        <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 font-black text-[10px] flex items-center justify-center shrink-0 border border-amber-200">
                            <GraduationCap size={14} />
                          </div>
                          <span>{top.name}</span>
                        </td>
                        <td className="p-3 font-black text-blue-700">{top.percentage || top.score}</td>
                        <td className="p-3 text-slate-700">{top.studentClass || top.class} ({top.board || 'CBSE'})</td>
                        <td className="p-3 text-amber-700 font-bold">{top.academicYear || top.year}</td>
                        <td className="p-3 text-slate-500 max-w-xs truncate">{top.achievementCaption || top.desc || '-'}</td>
                        <td className="p-3 text-center">
                          {top.isFeatured ? (
                            <span className="inline-block h-2 w-2 rounded-full bg-amber-500"></span>
                          ) : (
                            <span className="inline-block h-2 w-2 rounded-full bg-slate-300"></span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                            top.status !== 'DRAFT' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {top.status || 'PUBLISHED'}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              id={`table-btn-edit-${top.id}`}
                              onClick={() => handleOpenEditModal(top)}
                              className="p-1 text-slate-600 hover:text-indigo-900"
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              id={`table-btn-del-${top.id}`}
                              onClick={() => onDeleteTopper(top.id)}
                              className="p-1 text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* ADD / EDIT TOPPER MODAL */}
      {/* ---------------------------------------------------- */}
      {showFormModal && editingTopper && (
        <div id="modal-topper-form-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <form
            id="form-save-topper-details"
            onSubmit={handleSaveTopper}
            className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl space-y-5 border border-slate-200 my-8"
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display font-black text-base text-slate-900">
                  {editingTopper.id ? 'Edit Academic Topper Record' : 'Add New Academic Topper Record'}
                </h3>
                <p className="text-xs text-slate-500">
                  Fill in student academic performance parameters. No rank fields are required.
                </p>
              </div>
              <button
                id="btn-close-topper-modal"
                type="button"
                onClick={() => { setShowFormModal(false); setEditingTopper(null); }}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form Fields Grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              
              {/* Student Name */}
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-600 mb-1">
                  Student Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="input-topper-name"
                  type="text"
                  required
                  placeholder="e.g. Priya Mishra"
                  value={editingTopper.name || ''}
                  onChange={e => setEditingTopper({ ...editingTopper, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:border-indigo-900 outline-none"
                />
              </div>

              {/* Percentage */}
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-600 mb-1">
                  Academic Percentage / Score (%) <span className="text-red-500">*</span>
                </label>
                <input
                  id="input-topper-percentage"
                  type="text"
                  required
                  placeholder="e.g. 98.4%"
                  value={editingTopper.percentage || ''}
                  onChange={e => setEditingTopper({ ...editingTopper, percentage: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:border-indigo-900 outline-none"
                />
              </div>

              {/* Student Class */}
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-600 mb-1">
                  Class / Grade
                </label>
                <select
                  id="select-topper-class"
                  value={editingTopper.studentClass || 'Class 10'}
                  onChange={e => setEditingTopper({ ...editingTopper, studentClass: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 bg-white outline-none cursor-pointer"
                >
                  <option value="Class 10">Class 10</option>
                  <option value="Class 12">Class 12</option>
                  <option value="Class 9">Class 9</option>
                  <option value="Class 8">Class 8</option>
                  <option value="Class 7">Class 7</option>
                  <option value="Class 6">Class 6</option>
                </select>
              </div>

              {/* Academic Year */}
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-600 mb-1">
                  Academic Session Year
                </label>
                <input
                  id="input-topper-academic-year"
                  type="text"
                  required
                  placeholder="e.g. 2025-2026"
                  value={editingTopper.academicYear || '2025-2026'}
                  onChange={e => setEditingTopper({ ...editingTopper, academicYear: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:border-indigo-900 outline-none"
                />
              </div>

              {/* Board */}
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-600 mb-1">
                  Education Board
                </label>
                <select
                  id="select-topper-board"
                  value={editingTopper.board || 'CBSE'}
                  onChange={e => setEditingTopper({ ...editingTopper, board: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 bg-white outline-none cursor-pointer"
                >
                  <option value="CBSE">CBSE</option>
                  <option value="ICSE">ICSE</option>
                  <option value="UP Board">UP Board</option>
                  <option value="BSEB">BSEB</option>
                  <option value="Other Board">Other Board</option>
                </select>
              </div>

              {/* Display Order */}
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-600 mb-1">
                  Display Sequence Order
                </label>
                <input
                  id="input-topper-display-order"
                  type="number"
                  min={1}
                  value={editingTopper.displayOrder ?? 1}
                  onChange={e => setEditingTopper({ ...editingTopper, displayOrder: parseInt(e.target.value) || 1 })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:border-indigo-900 outline-none"
                />
              </div>

              {/* Remark / Highlights */}
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-black uppercase text-slate-600 mb-1">
                  Remark / Achievement Details
                </label>
                <textarea
                  id="input-topper-caption"
                  rows={2}
                  placeholder="e.g. Subjects: Maths, Science, Social Science, Hindi, English"
                  value={editingTopper.achievementCaption || ''}
                  onChange={e => setEditingTopper({ ...editingTopper, achievementCaption: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:border-indigo-900 outline-none"
                />
              </div>

              {/* Student Photo Upload or URL */}
              <div className="sm:col-span-2">
                <CloudinaryUpload
                  id="admin-topper-photo-picker-cloudinary"
                  folder="results"
                  cloudName={subConfig?.cloudinaryCloudName}
                  uploadPreset={subConfig?.cloudinaryUploadPreset}
                  apiKey={subConfig?.cloudinaryApiKey}
                  maxSizeMB={subConfig?.cloudinaryMaxFileSize}
                  initialUrl={editingTopper.photoUrl || editingTopper.img}
                  onUploadSuccess={(url) => setEditingTopper({ ...editingTopper, photoUrl: url })}
                  onFileDeleted={() => setEditingTopper({ ...editingTopper, photoUrl: '' })}
                  allowedTypes={['jpg', 'jpeg', 'png', 'webp']}
                  label="Student Photo (Optional — Initial avatar will be generated if empty)"
                />
              </div>

              {/* Status & Featured Checkboxes */}
              <div className="sm:col-span-2 flex flex-wrap items-center gap-6 pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    id="checkbox-topper-featured"
                    type="checkbox"
                    checked={editingTopper.isFeatured !== false}
                    onChange={e => setEditingTopper({ ...editingTopper, isFeatured: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                  />
                  <span>Featured on Public Homepage</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    id="checkbox-topper-published-status"
                    type="checkbox"
                    checked={editingTopper.status !== 'DRAFT'}
                    onChange={e => setEditingTopper({ ...editingTopper, status: e.target.checked ? 'PUBLISHED' : 'DRAFT' })}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-900 focus:ring-indigo-900"
                  />
                  <span>Published (Visible to Visitors)</span>
                </label>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
              <button
                id="btn-cancel-topper-form"
                type="button"
                onClick={() => { setShowFormModal(false); setEditingTopper(null); }}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="btn-save-topper-submit"
                type="submit"
                className="rounded-xl bg-indigo-900 text-white px-5 py-2 text-xs font-extrabold hover:bg-indigo-950 cursor-pointer shadow-sm"
              >
                Save Topper Details
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
