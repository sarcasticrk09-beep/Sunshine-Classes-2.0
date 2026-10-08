/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Search,
  Filter,
  Download,
  Upload,
  FileSpreadsheet,
  RefreshCw,
  UserCheck,
  UserX,
  Edit3,
  Eye,
  BookOpen,
  UserPlus,
  FileText,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight,
  Printer,
  MoreHorizontal,
  Phone,
  Mail,
  Calendar,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  SlidersHorizontal,
  User,
  ShieldAlert,
  GraduationCap
} from 'lucide-react';
import { StudentProfile } from './StudentProfile';
import { CloudinaryUpload } from './CloudinaryUpload';
import { SyncService } from '../services/SyncService';
import { getCachedIdToken } from '../lib/supabase';
import { useStudentDirectory } from '../hooks/useStudentDirectory';

interface StudentDirectoryProps {
  currentUser: {
    id?: string;
    userId?: string;
    studentId?: string;
    username?: string;
    name?: string;
    role: string;
    email?: string;
  };
  teachersList?: any[];
  classList?: string[];
  initialStudents?: any[];
  onRefreshGlobalData?: () => void;
}

class DirectoryErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error('[StudentDirectory] Uncaught rendering error caught by boundary:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div id="directory-error-fallback" className="p-10 text-center bg-white border border-rose-200 rounded-2xl shadow-sm space-y-3 my-4">
          <div className="inline-flex p-3 rounded-full bg-rose-50 text-rose-600">
            <ShieldAlert size={28} />
          </div>
          <h3 className="text-base font-bold text-slate-800">Student Directory View Restored</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            The directory encountered a display issue while rendering individual student fields. Your database records and student details remain safe and intact.
          </p>
          <button
            id="btn-retry-directory-boundary"
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-2 inline-flex items-center gap-1.5 bg-indigo-900 hover:bg-indigo-950 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
          >
            <RefreshCw size={14} /> Reload Directory Table
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export const StudentDirectory: React.FC<StudentDirectoryProps> = (props) => (
  <DirectoryErrorBoundary>
    <StudentDirectoryInner {...props} />
  </DirectoryErrorBoundary>
);

const StudentDirectoryInner: React.FC<StudentDirectoryProps> = ({
  currentUser,
  teachersList = [],
  classList = [],
  initialStudents = [],
  onRefreshGlobalData
}) => {
  const role = (currentUser?.role || 'ADMIN').toUpperCase();
  const canEditProfile = ['SUPER_ADMIN', 'ADMIN', 'RECEPTIONIST'].includes(role);
  const canChangeStatus = ['SUPER_ADMIN', 'ADMIN'].includes(role);
  const canReassignClassOrTeacher = ['SUPER_ADMIN', 'ADMIN'].includes(role);
  const canDelete = ['SUPER_ADMIN', 'ADMIN'].includes(role);

  // Hook-powered student data fetching with resilient multi-tier fallback
  const {
    students,
    paginationInfo,
    loading,
    networkError,
    isOfflineFallback,
    filters: {
      searchTerm,
      debouncedSearch,
      selectedClass,
      selectedTeacher,
      selectedStatus,
      selectedGender,
      admissionYear,
      joinedDate,
      updatedDate,
      hasDocuments,
      hasPhoto,
      missingMobile,
      missingEmail,
      hasConcession,
      concessionPercentageFilter,
      sortBy,
      sortOrder,
      page,
      limit
    },
    setSearchTerm,
    setSelectedClass,
    setSelectedTeacher,
    setSelectedStatus,
    setSelectedGender,
    setAdmissionYear,
    setHasDocuments,
    setHasPhoto,
    setMissingMobile,
    setMissingEmail,
    setHasConcession,
    setConcessionPercentageFilter,
    setPage,
    handleSort,
    handleLimitChange,
    handleResetFilters,
    refetch,
    restoreSeedFallback
  } = useStudentDirectory({
    initialStudents,
    defaultLimit: 25
  });

  // Selection & Bulk Actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [bulkModalType, setBulkModalType] = useState<'teacher' | 'class' | 'status' | null>(null);
  const [bulkTargetValue, setBulkTargetValue] = useState('');

  // Modals & Single Action State
  const [viewingStudent, setViewingStudent] = useState<any | null>(null);
  const [studentTimeline, setStudentTimeline] = useState<any[]>([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any | null>(null);
  const [activeActionModal, setActiveActionModal] = useState<{
    type: 'class' | 'teacher' | 'status' | 'documents';
    student: any;
  } | null>(null);

  // Form Inputs for Modals
  const [modalInputClass, setModalInputClass] = useState('');
  const [modalInputTeacher, setModalInputTeacher] = useState('');
  const [modalInputStatus, setModalInputStatus] = useState('ACTIVE');
  const [modalInputDocs, setModalInputDocs] = useState({
    photoUrl: '',
    documentUrl: '',
    aadhar: ''
  });
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Filter Bar Expand Toggle
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);

  // Checkbox Selection
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(students.map(s => s.id || s.studentId).filter(Boolean));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Fetch Timeline for View Profile
  const handleViewProfile = async (student: any) => {
    setViewingStudent(student);
    setLoadingTimeline(true);
    const token = getCachedIdToken();
    const stId = student?.id || student?.studentId;
    try {
      if (stId) {
        const res = await fetch(`/api/students/${stId}/timeline`, {
          headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
        });
        const data = await res.json().catch(() => null);
        if (res.ok && data?.success) {
          setStudentTimeline(data.data || []);
        } else {
          setStudentTimeline([]);
        }
      } else {
        setStudentTimeline([]);
      }
    } catch (err) {
      setStudentTimeline([]);
    } finally {
      setLoadingTimeline(false);
    }
  };

  // Open Single Action Modal
  const openActionModal = (type: 'class' | 'teacher' | 'status' | 'documents', student: any) => {
    setActiveActionModal({ type, student });
    setModalError(null);
    if (type === 'class') {
      setModalInputClass(student.class || student.className || student.preferredBatch || '');
    } else if (type === 'teacher') {
      setModalInputTeacher(student.assignedTeacher || '');
    } else if (type === 'status') {
      setModalInputStatus(student.status || 'ACTIVE');
    } else if (type === 'documents') {
      const docs = student.documents || {};
      setModalInputDocs({
        photoUrl: student.photoUrl || docs.photoUrl || '',
        documentUrl: student.documentUrl || docs.documentUrl || '',
        aadhar: docs.aadhar || student.aadhar || ''
      });
    }
  };

  // Handle Action Submit
  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeActionModal) return;

    setModalSubmitting(true);
    setModalError(null);

    const { type, student } = activeActionModal;
    const sId = student.id || student.studentId;
    let url = '';
    let method = 'PATCH';
    let body: any = {};

    if (type === 'class') {
      url = `/api/students/${sId}/class`;
      body = { className: modalInputClass };
    } else if (type === 'teacher') {
      url = `/api/students/${sId}/teacher`;
      body = { teacherId: modalInputTeacher };
    } else if (type === 'status') {
      url = `/api/students/${sId}/status`;
      body = { status: modalInputStatus };
    } else if (type === 'documents') {
      url = `/api/students/${sId}/documents`;
      body = modalInputDocs;
    }

    try {
      const token = getCachedIdToken();
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(body)
      });

      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.success) {
        throw new Error(data?.message || 'Action failed.');
      }

      setActiveActionModal(null);
      refetch();
      if (onRefreshGlobalData) onRefreshGlobalData();
    } catch (err: any) {
      setModalError(err.message || 'Failed to update student record.');
    } finally {
      setModalSubmitting(false);
    }
  };

  // Handle Edit Profile Save
  const handleEditProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    setModalSubmitting(true);
    setModalError(null);

    try {
      const token = getCachedIdToken();
      const stId = editingStudent.id || editingStudent.studentId;
      const response = await fetch(`/api/students/${stId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(editingStudent)
      });

      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.success) {
        throw new Error(data?.message || 'Failed to update profile.');
      }

      setEditingStudent(null);
      refetch();
      if (onRefreshGlobalData) onRefreshGlobalData();
    } catch (err: any) {
      setModalError(err.message || 'Profile update failed.');
    } finally {
      setModalSubmitting(false);
    }
  };

  // Export Dataset
  const handleExportDataset = async (format: 'csv' | 'json') => {
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (selectedClass) params.append('className', selectedClass);
      if (selectedTeacher) params.append('teacherId', selectedTeacher);
      if (selectedStatus && selectedStatus !== 'ALL') params.append('status', selectedStatus);
      if (selectedGender && selectedGender !== 'ALL') params.append('gender', selectedGender);
      if (admissionYear) params.append('admissionYear', admissionYear);
      if (joinedDate) params.append('joinedDate', joinedDate);
      if (updatedDate) params.append('updatedDate', updatedDate);
      if (hasDocuments !== 'ALL') params.append('hasDocuments', hasDocuments);
      if (hasPhoto !== 'ALL') params.append('hasPhoto', hasPhoto);
      if (missingMobile !== 'ALL') params.append('missingMobile', missingMobile);
      if (missingEmail !== 'ALL') params.append('missingEmail', missingEmail);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);
      params.append('format', format);

      const token = getCachedIdToken();

      if (format === 'csv') {
        window.open(`/api/students/export?${params.toString()}`, '_blank');
      } else {
        const res = await fetch(`/api/students/export?${params.toString()}`, {
          headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
        });
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `student_directory_${Date.now()}.json`;
        a.click();
      }
    } catch (err) {
      alert('Export failed. Please try again.');
    }
  };

  // CSV Bulk Student Import Handlers
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFileName, setImportFileName] = useState('');
  const [parsedImportRows, setParsedImportRows] = useState<any[]>([]);
  const [importError, setImportError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleParseCsvFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);
    setImportFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        if (lines.length < 2) {
          setImportError('CSV file must have a header row and at least one student record.');
          return;
        }

        const parseCsvLine = (line: string): string[] => {
          const res: string[] = [];
          let current = '';
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (ch === '"') {
              inQuotes = !inQuotes;
            } else if (ch === ',' && !inQuotes) {
              res.push(current.trim().replace(/^"|"$/g, ''));
              current = '';
            } else {
              current += ch;
            }
          }
          res.push(current.trim().replace(/^"|"$/g, ''));
          return res;
        };

        const headers = parseCsvLine(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
        const rows: any[] = [];

        for (let i = 1; i < lines.length; i++) {
          const cols = parseCsvLine(lines[i]);
          if (cols.length === 0 || cols.every(c => !c)) continue;
          
          const rowObj: any = {};
          headers.forEach((h, idx) => {
            rowObj[h] = cols[idx] || '';
          });

          const name = rowObj.name || rowObj.studentname || rowObj.fullname || `Student ${i}`;
          const rollNo = rowObj.rollno || rowObj.roll || rowObj.rollnumber || `SC-2026-${String(Date.now() + i).slice(-4)}`;
          const className = rowObj.class || rowObj.classname || rowObj.cohort || 'Class 10 Board Specialists';
          const fatherName = rowObj.fathername || rowObj.father || '';
          const motherName = rowObj.mothername || rowObj.mother || '';
          const mobile = rowObj.mobile || rowObj.phone || rowObj.contact || '';
          const email = rowObj.email || `${name.toLowerCase().replace(/\s+/g, '.')}${i}@sunshineclasses.net`;
          const preferredBatch = rowObj.preferredbatch || rowObj.batch || className;
          const status = (rowObj.status || 'ACTIVE').toUpperCase();

          rows.push({
            name,
            rollNo,
            class: className,
            fatherName,
            motherName,
            mobile,
            email,
            preferredBatch,
            status: ['ACTIVE', 'INACTIVE', 'ALUMNI'].includes(status) ? status : 'ACTIVE'
          });
        }

        if (rows.length === 0) {
          setImportError('No valid student rows found in the CSV file.');
          return;
        }

        setParsedImportRows(rows);
      } catch (err: any) {
        setImportError(`Failed to parse CSV: ${err.message || 'Check CSV formatting'}`);
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteCsvImport = async () => {
    if (parsedImportRows.length === 0) return;
    setIsImporting(true);
    setImportError(null);
    try {
      for (let i = 0; i < parsedImportRows.length; i++) {
        const item = parsedImportRows[i];
        const newId = `s-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`;
        const studentPayload = {
          id: newId,
          userId: `u-${newId}`,
          rollNo: item.rollNo,
          name: item.name,
          class: item.class,
          fatherName: item.fatherName,
          motherName: item.motherName,
          mobile: item.mobile,
          whatsapp: item.mobile,
          email: item.email,
          status: item.status,
          preferredBatch: item.preferredBatch,
          admissionDate: new Date().toISOString().split('T')[0],
          attendancePercentage: 100,
          dueDay: 10
        };
        await SyncService.set('students', newId, studentPayload);
      }

      alert(`Successfully imported ${parsedImportRows.length} student records!`);
      setIsImportModalOpen(false);
      setParsedImportRows([]);
      setImportFileName('');
      refetch();
      if (onRefreshGlobalData) onRefreshGlobalData();
    } catch (err: any) {
      setImportError(`Import process encountered an error: ${err.message || 'Failed to save students'}`);
    } finally {
      setIsImporting(false);
    }
  };

  const handleDownloadSampleCsv = () => {
    const csvContent = "Name,RollNo,Class,FatherName,MotherName,Mobile,Email,PreferredBatch,Status\n" +
      "Aarav Sharma,SC-2026-101,Class 10 Board Specialists,Ramesh Sharma,Sunita Sharma,9876543210,aarav.sharma@example.com,Class 10 Morning,ACTIVE\n" +
      "Diya Verma,SC-2026-102,Class 9 Foundation Course,Anil Verma,Pooja Verma,9876543211,diya.verma@example.com,Class 9 Foundation,ACTIVE\n";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'sunshine_students_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle Bulk Execution
  const handleBulkExecute = async () => {
    if (!bulkModalType || selectedIds.length === 0 || !bulkTargetValue) return;

    setIsBulkProcessing(true);
    let successCount = 0;
    let failCount = 0;
    const token = getCachedIdToken();

    for (const studentId of selectedIds) {
      try {
        let url = '';
        let body: any = {};

        if (bulkModalType === 'class') {
          url = `/api/students/${studentId}/class`;
          body = { className: bulkTargetValue };
        } else if (bulkModalType === 'teacher') {
          url = `/api/students/${studentId}/teacher`;
          body = { teacherId: bulkTargetValue };
        } else if (bulkModalType === 'status') {
          url = `/api/students/${studentId}/status`;
          body = { status: bulkTargetValue };
        }

        const res = await fetch(url, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify(body)
        });

        if (res.ok) successCount++;
        else failCount++;
      } catch (e) {
        failCount++;
      }
    }

    setIsBulkProcessing(false);
    setBulkModalType(null);
    setBulkTargetValue('');
    setSelectedIds([]);
    refetch();
    if (onRefreshGlobalData) onRefreshGlobalData();

    alert(`Bulk Operation Complete:\n- Updated: ${successCount}\n- Failed: ${failCount}`);
  };

  // Print Student List
  const handlePrintList = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Sunshine ERP - Student Directory Print</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; color: #1e293b; }
            h1 { font-size: 18px; margin-bottom: 4px; }
            p { font-size: 11px; color: #64748b; margin-top: 0; margin-bottom: 16px; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; }
            th, td { border: 1px solid #cbd5e1; padding: 6px 10px; text-align: left; }
            th { background-color: #f8fafc; font-weight: bold; uppercase; }
            .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 9px; }
            .active { background-color: #dcfce7; color: #15803d; }
            .inactive { background-color: #ffe4e6; color: #be123c; }
          </style>
        </head>
        <body>
          <h1>Sunshine Classes - Official Student Directory</h1>
          <p>Generated on ${new Date().toLocaleString()} | Total Records: ${students.length}</p>
          <table>
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Name</th>
                <th>Class</th>
                <th>Assigned Teacher</th>
                <th>Father / Parent Name</th>
                <th>Mobile</th>
                <th>Status</th>
                <th>Admission Date</th>
              </tr>
            </thead>
            <tbody>
              ${students.map(s => `
                <tr>
                  <td><strong>${s.rollNo || s.rollNumber || '-'}</strong></td>
                  <td>${s.name || s.personalInfo?.name || '-'}</td>
                  <td>${s.class || s.className || '-'}</td>
                  <td>${s.assignedTeacher || '-'}</td>
                  <td>${s.fatherName || s.parentInfo?.fatherName || '-'}</td>
                  <td>${s.mobile || s.contactInfo?.mobile || '-'}</td>
                  <td>
                    <span class="badge ${s.status === 'INACTIVE' ? 'inactive' : 'active'}">
                      ${s.status || 'ACTIVE'}
                    </span>
                  </td>
                  <td>${s.admissionDate || s.createdAt || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const hasActiveFilters = Boolean(
    searchTerm ||
    selectedClass ||
    selectedTeacher ||
    (selectedStatus && selectedStatus !== 'ALL') ||
    (selectedGender && selectedGender !== 'ALL') ||
    admissionYear ||
    hasDocuments !== 'ALL' ||
    hasPhoto !== 'ALL' ||
    missingMobile !== 'ALL' ||
    missingEmail !== 'ALL' ||
    hasConcession !== 'ALL' ||
    concessionPercentageFilter
  );

  return (
    <div className="space-y-6">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
              <GraduationCap size={20} />
            </span>
            <h2 className="font-display font-black text-lg text-slate-800">
              Student Directory Registry
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Search, filter, manage class alignments, teacher assignments, and export records.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="btn-refresh-directory"
            onClick={() => refetch()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-indigo-600' : ''} />
            Refresh
          </button>

          <button
            id="btn-export-csv"
            onClick={() => handleExportDataset('csv')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-2 text-xs font-black text-emerald-800 shadow-2xs transition-all cursor-pointer"
          >
            <Download size={14} /> Export CSV
          </button>

          <button
            id="btn-import-csv"
            onClick={() => {
              setIsImportModalOpen(true);
              setImportError(null);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 px-3.5 py-2 text-xs font-black text-blue-900 shadow-2xs transition-all cursor-pointer"
          >
            <Upload size={14} /> Import CSV
          </button>

          <button
            id="btn-print-directory"
            onClick={handlePrintList}
            className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-2 text-xs font-black text-indigo-900 shadow-2xs transition-all cursor-pointer"
          >
            <Printer size={14} /> Print List
          </button>
        </div>
      </div>

      {/* STICKY SEARCH & FILTER CONTROLS */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
        {/* TOP ROW: Search Input + Main Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* Search Box */}
          <div className="lg:col-span-5 relative">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              id="input-search-students"
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by Name, Roll No, Admission No, Father, Mobile, Email..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-9 py-2 text-xs text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Class Filter */}
          <div className="lg:col-span-2">
            <select
              id="select-filter-class"
              value={selectedClass}
              onChange={e => {
                setSelectedClass(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-semibold focus:outline-none focus:border-indigo-600 cursor-pointer"
            >
              <option value="">🎓 All Classes</option>
              {classList.map(cls => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>

          {/* Teacher Filter */}
          <div className="lg:col-span-2">
            <select
              id="select-filter-teacher"
              value={selectedTeacher}
              onChange={e => {
                setSelectedTeacher(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-semibold focus:outline-none focus:border-indigo-600 cursor-pointer"
            >
              <option value="">👨‍🏫 All Teachers</option>
              {teachersList.map(t => (
                <option key={t.id} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="lg:col-span-2">
            <select
              id="select-filter-status"
              value={selectedStatus}
              onChange={e => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-semibold focus:outline-none focus:border-indigo-600 cursor-pointer"
            >
              <option value="ALL">🔍 All Statuses</option>
              <option value="ACTIVE">🟢 Active</option>
              <option value="INACTIVE">🔴 Inactive</option>
              <option value="SUSPENDED">🟡 Suspended</option>
              <option value="PASSED_OUT">🎓 Passed Out</option>
            </select>
          </div>

          {/* Advanced Filter Toggle Button */}
          <div className="lg:col-span-1 flex justify-end">
            <button
              id="btn-toggle-advanced-filters"
              type="button"
              onClick={() => setIsAdvancedFilterOpen(!isAdvancedFilterOpen)}
              className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center w-full ${
                isAdvancedFilterOpen
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
              title="Toggle Advanced Filters"
            >
              <SlidersHorizontal size={15} />
            </button>
          </div>
        </div>

        {/* BOTTOM EXPANDABLE ROW: Advanced Combine Filters */}
        {isAdvancedFilterOpen && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 animate-fade-in">
            {/* Gender Filter */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Gender</label>
              <select
                id="select-filter-gender"
                value={selectedGender}
                onChange={e => {
                  setSelectedGender(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium"
              >
                <option value="ALL">All Genders</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            {/* Admission Year */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Adm. Year</label>
              <input
                id="input-filter-adm-year"
                type="text"
                value={admissionYear}
                onChange={e => {
                  setAdmissionYear(e.target.value);
                  setPage(1);
                }}
                placeholder="e.g. 2026"
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium placeholder-slate-300"
              />
            </div>

            {/* Has Photo */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Has Photo</label>
              <select
                id="select-filter-has-photo"
                value={hasPhoto}
                onChange={e => {
                  setHasPhoto(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium"
              >
                <option value="ALL">All</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>

            {/* Has Documents */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Has Documents</label>
              <select
                id="select-filter-has-documents"
                value={hasDocuments}
                onChange={e => {
                  setHasDocuments(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium"
              >
                <option value="ALL">All</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>

            {/* Missing Mobile */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Missing Mobile</label>
              <select
                id="select-filter-missing-mobile"
                value={missingMobile}
                onChange={e => {
                  setMissingMobile(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium"
              >
                <option value="ALL">All</option>
                <option value="true">Missing Only</option>
                <option value="false">Has Mobile</option>
              </select>
            </div>

            {/* Concession Status Filter */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Concession</label>
              <select
                id="select-filter-has-concession"
                value={hasConcession}
                onChange={e => {
                  setHasConcession(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium"
              >
                <option value="ALL">All Students</option>
                <option value="true">Has Concession</option>
                <option value="false">No Concession</option>
              </select>
            </div>

            {/* Concession % Filter */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Concession %</label>
              <input
                id="input-filter-concession-percentage"
                type="number"
                min="0"
                max="100"
                value={concessionPercentageFilter}
                onChange={e => {
                  setConcessionPercentageFilter(e.target.value);
                  setPage(1);
                }}
                placeholder="e.g. 10"
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium placeholder-slate-300"
              />
            </div>

            {/* Reset Filters */}
            <div className="flex items-end">
              <button
                id="btn-reset-filters"
                onClick={handleResetFilters}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-1.5 px-3 rounded-lg border border-slate-200 transition-all cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* BULK ACTIONS TOOLBAR */}
      {selectedIds.length > 0 && (
        <div id="bulk-actions-toolbar" className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-indigo-900 text-white p-4 rounded-2xl shadow-md animate-fade-in">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-indigo-800 text-amber-300 font-black text-xs">
              {selectedIds.length} Selected
            </span>
            <p className="text-xs text-indigo-100 font-medium">
              Choose a bulk administrative operation:
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {canReassignClassOrTeacher && (
              <button
                id="btn-bulk-assign-teacher"
                onClick={() => {
                  setBulkModalType('teacher');
                  setBulkTargetValue('');
                }}
                className="bg-indigo-800 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-indigo-700 transition-all cursor-pointer"
              >
                Assign Teacher
              </button>
            )}

            {canReassignClassOrTeacher && (
              <button
                id="btn-bulk-change-class"
                onClick={() => {
                  setBulkModalType('class');
                  setBulkTargetValue('');
                }}
                className="bg-indigo-800 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-indigo-700 transition-all cursor-pointer"
              >
                Change Class
              </button>
            )}

            {canChangeStatus && (
              <button
                id="btn-bulk-change-status"
                onClick={() => {
                  setBulkModalType('status');
                  setBulkTargetValue('ACTIVE');
                }}
                className="bg-indigo-800 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-indigo-700 transition-all cursor-pointer"
              >
                Update Status
              </button>
            )}

            <button
              id="btn-clear-selection"
              onClick={() => setSelectedIds([])}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* OFFLINE / LOCAL DATA NOTIFICATION BANNER */}
      {isOfflineFallback && (
        <div
          id="banner-directory-offline-fallback"
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-2xl text-xs animate-fade-in"
        >
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
              <ShieldAlert size={16} />
            </span>
            <div>
              <span className="font-bold">Offline / Local Mode Active:</span>
              <span className="text-amber-700 ml-1.5">
                {networkError ? `Displaying cached records (${networkError})` : 'Displaying cached local records.'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              id="btn-retry-sync-banner"
              type="button"
              onClick={() => refetch()}
              disabled={loading}
              className="inline-flex items-center gap-1 bg-amber-200/80 hover:bg-amber-200 text-amber-950 font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer text-[11px]"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Retry Server Sync
            </button>
            <button
              id="btn-restore-samples-banner"
              type="button"
              onClick={restoreSeedFallback}
              className="bg-white hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer text-[11px]"
            >
              Load Default Students
            </button>
          </div>
        </div>
      )}

      {/* MAIN DATA TABLE / SKELETON / EMPTY / ERROR STATES */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          /* SKELETON LOADING STATE */
          <div className="p-6 space-y-4">
            <div className="h-6 bg-slate-100 rounded w-1/4 animate-pulse"></div>
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-12 bg-slate-50 rounded-xl animate-pulse flex items-center justify-between px-4">
                  <div className="h-8 w-8 bg-slate-200 rounded-full"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/6"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/6"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/12"></div>
                </div>
              ))}
            </div>
          </div>
        ) : students.length === 0 && networkError ? (
          /* NETWORK ERROR FALLBACK UI */
          <div id="directory-network-error-fallback" className="p-12 text-center space-y-4">
            <div className="inline-flex p-3 rounded-full bg-rose-50 text-rose-600">
              <ShieldAlert size={32} />
            </div>
            <h3 className="text-base font-bold text-slate-800">Unable to Connect to Student Directory Server</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              {networkError}. The server could not be reached, and no cached student records were found locally.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                id="btn-retry-network-error"
                type="button"
                onClick={() => refetch()}
                disabled={loading}
                className="inline-flex items-center gap-1.5 bg-indigo-900 hover:bg-indigo-950 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Retry Server Connection
              </button>
              <button
                id="btn-restore-seed-on-error"
                type="button"
                onClick={restoreSeedFallback}
                className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-200 transition-all cursor-pointer"
              >
                <BookOpen size={14} /> Load Default Sample Students
              </button>
            </div>
          </div>
        ) : students.length === 0 ? (
          /* EMPTY STATE */
          hasActiveFilters ? (
            <div id="directory-empty-filter-state" className="p-12 text-center space-y-3">
              <div className="inline-flex p-3 rounded-full bg-slate-100 text-slate-400">
                <UserX size={28} />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No Matching Student Records Found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No students match your active filters or search criteria. Try modifying your search term or clearing filters.
              </p>
              <button
                id="btn-clear-empty-filters"
                type="button"
                onClick={handleResetFilters}
                className="mt-2 inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl border border-slate-200 transition-all cursor-pointer"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div id="directory-empty-database-state" className="p-12 text-center space-y-3">
              <div className="inline-flex p-3 rounded-full bg-indigo-50 text-indigo-600">
                <GraduationCap size={28} />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Student Directory is Empty</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                No active student records exist in the database or local storage yet. You can load sample student profiles to test all ERP features or refresh the directory.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  id="btn-load-seed-empty-state"
                  type="button"
                  onClick={restoreSeedFallback}
                  className="inline-flex items-center gap-1.5 bg-indigo-900 hover:bg-indigo-950 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  <BookOpen size={14} /> Load Default Sample Students
                </button>
                <button
                  id="btn-refresh-empty-state"
                  type="button"
                  onClick={() => refetch()}
                  className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-200 transition-all cursor-pointer"
                >
                  <RefreshCw size={14} /> Refresh Directory
                </button>
              </div>
            </div>
          )
        ) : (
          /* TABLE CONTENT */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-400 select-none">
                  <th className="p-3.5 w-10 text-center">
                    <input
                      id="checkbox-select-all"
                      type="checkbox"
                      checked={students.length > 0 && selectedIds.length === students.length}
                      onChange={handleSelectAll}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer h-4 w-4"
                    />
                  </th>
                  <th className="p-3.5">Photo</th>
                  <th className="p-3.5 cursor-pointer hover:text-slate-700" onClick={() => handleSort('rollNo')}>
                    <div className="flex items-center gap-1">
                      <span>Roll Number</span>
                      {sortBy === 'rollNo' && (sortOrder === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
                    </div>
                  </th>
                  <th className="p-3.5 cursor-pointer hover:text-slate-700" onClick={() => handleSort('name')}>
                    <div className="flex items-center gap-1">
                      <span>Student Name</span>
                      {sortBy === 'name' && (sortOrder === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
                    </div>
                  </th>
                  <th className="p-3.5 cursor-pointer hover:text-slate-700" onClick={() => handleSort('class')}>
                    <div className="flex items-center gap-1">
                      <span>Class / Batch</span>
                      {sortBy === 'class' && (sortOrder === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
                    </div>
                  </th>
                  <th className="p-3.5">Teacher</th>
                  <th className="p-3.5">Parent Info</th>
                  <th className="p-3.5">Contact</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 cursor-pointer hover:text-slate-700" onClick={() => handleSort('admissionDate')}>
                    <div className="flex items-center gap-1">
                      <span>Adm. Date</span>
                      {sortBy === 'admissionDate' && (sortOrder === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
                    </div>
                  </th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium">
                {students.map((s, idx) => {
                  if (!s) return null;
                  const sId = s.id || s.studentId || `student-${idx}`;
                  const isSelected = selectedIds.includes(sId);
                  const name = typeof s.name === 'string' ? s.name : typeof s.personalInfo?.name === 'string' ? s.personalInfo.name : 'Unnamed';
                  const roll = s.rollNo != null ? String(s.rollNo) : s.rollNumber != null ? String(s.rollNumber) : '-';
                  const cls = typeof s.class === 'string' && s.class ? s.class : typeof s.className === 'string' && s.className ? s.className : typeof s.preferredBatch === 'string' && s.preferredBatch ? s.preferredBatch : '-';
                  const teacher = typeof s.assignedTeacher === 'string' && s.assignedTeacher ? s.assignedTeacher : 'Unassigned';
                  const parent = typeof s.fatherName === 'string' ? s.fatherName : typeof s.parentInfo?.fatherName === 'string' ? s.parentInfo.fatherName : typeof s.motherName === 'string' ? s.motherName : '-';
                  const mobile = typeof s.mobile === 'string' ? s.mobile : typeof s.contactInfo?.mobile === 'string' ? s.contactInfo.mobile : '-';
                  const status = typeof s.status === 'string' ? s.status.toUpperCase() : 'ACTIVE';
                  
                  // Format admission date defensively
                  let formattedAdmDate = '-';
                  const rawAdm = s.admissionDate || s.createdAt;
                  if (typeof rawAdm === 'string') {
                    formattedAdmDate = rawAdm.includes('T') ? rawAdm.split('T')[0] : rawAdm;
                  } else if (rawAdm instanceof Date && !isNaN(rawAdm.getTime())) {
                    formattedAdmDate = rawAdm.toISOString().split('T')[0];
                  } else if (typeof rawAdm === 'number') {
                    try {
                      formattedAdmDate = new Date(rawAdm).toISOString().split('T')[0];
                    } catch {
                      formattedAdmDate = '-';
                    }
                  } else if (rawAdm && typeof rawAdm === 'object' && typeof rawAdm.seconds === 'number') {
                    try {
                      formattedAdmDate = new Date(rawAdm.seconds * 1000).toISOString().split('T')[0];
                    } catch {
                      formattedAdmDate = '-';
                    }
                  }

                  const photo = typeof s.photoUrl === 'string' ? s.photoUrl : typeof s.personalInfo?.photoUrl === 'string' ? s.personalInfo.photoUrl : '';
                  const initials = (typeof name === 'string' && name.trim()) ? name.trim().slice(0, 2).toUpperCase() : 'ST';

                  return (
                    <motion.tr
                      key={sId}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: Math.min(idx * 0.02, 0.3) }}
                      className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-indigo-50/40' : ''}`}
                    >
                      <td className="p-3.5 text-center">
                        <input
                          id={`checkbox-student-${sId}`}
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectOne(sId)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer h-4 w-4"
                        />
                      </td>

                      {/* Photo */}
                      <td className="p-3.5">
                        {photo ? (
                          <img
                            src={photo}
                            alt={name}
                            className="h-9 w-9 rounded-full object-cover border border-slate-200 shadow-2xs"
                          />
                        ) : (
                          <div className="h-9 w-9 rounded-full bg-slate-100 text-indigo-900 flex items-center justify-center font-bold text-xs border border-slate-200">
                            {initials}
                          </div>
                        )}
                      </td>

                      {/* Roll Number */}
                      <td className="p-3.5 font-bold font-mono text-indigo-900">
                        {roll}
                      </td>

                      {/* Name */}
                      <td className="p-3.5">
                        <div className="font-bold text-slate-800">{name}</div>
                        {s.email || s.contactInfo?.email ? (
                          <div className="text-[10px] text-slate-400 font-normal">{s.email || s.contactInfo?.email}</div>
                        ) : null}
                      </td>

                      {/* Class */}
                      <td className="p-3.5 text-slate-700">
                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 font-bold text-[11px] text-slate-800">
                          {cls}
                        </span>
                      </td>

                      {/* Teacher */}
                      <td className="p-3.5 text-slate-600">
                        {teacher}
                      </td>

                      {/* Parent */}
                      <td className="p-3.5 text-slate-600">
                        {parent}
                      </td>

                      {/* Mobile */}
                      <td className="p-3.5 font-mono text-slate-600">
                        {mobile}
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : status === 'INACTIVE'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {status}
                        </span>
                      </td>

                      {/* Admission Date */}
                      <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                        {formattedAdmDate}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            id={`btn-view-${sId}`}
                            onClick={() => handleViewProfile(s)}
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="View Profile & Timeline"
                          >
                            <Eye size={15} />
                          </button>

                          {canEditProfile && (
                            <button
                              id={`btn-edit-${sId}`}
                              onClick={() => setEditingStudent({ ...s })}
                              className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                              title="Edit Full Profile"
                            >
                              <Edit3 size={15} />
                            </button>
                          )}

                          {canReassignClassOrTeacher && (
                            <button
                              id={`btn-class-${sId}`}
                              onClick={() => openActionModal('class', s)}
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                              title="Change Class"
                            >
                              <BookOpen size={15} />
                            </button>
                          )}

                          {canReassignClassOrTeacher && (
                            <button
                              id={`btn-teacher-${sId}`}
                              onClick={() => openActionModal('teacher', s)}
                              className="p-1.5 rounded-lg text-teal-600 hover:bg-teal-50 transition-colors cursor-pointer"
                              title="Assign Teacher"
                            >
                              <UserPlus size={15} />
                            </button>
                          )}

                          {canEditProfile && (
                            <button
                              id={`btn-docs-${sId}`}
                              onClick={() => openActionModal('documents', s)}
                              className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                              title="Update Documents"
                            >
                              <FileText size={15} />
                            </button>
                          )}

                          {canChangeStatus && (
                            <button
                              id={`btn-status-${sId}`}
                              onClick={() => openActionModal('status', s)}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Update Status"
                            >
                              <UserCheck size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION FOOTER */}
        {!loading && students.length > 0 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 font-medium">
            <div className="flex items-center gap-3">
              <span>Rows per page:</span>
              <select
                id="select-pagination-limit"
                value={limit}
                onChange={e => handleLimitChange(Number(e.target.value))}
                className="bg-white border border-slate-200 rounded-lg px-2 py-1 font-bold text-slate-700 cursor-pointer"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>
                Showing <strong>{paginationInfo.totalCount > 0 ? ((page - 1) * limit) + 1 : 0}</strong> - <strong>{((page - 1) * limit) + students.length}</strong> of <strong>{Math.max(paginationInfo.totalCount, ((page - 1) * limit) + students.length)}</strong> students
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                id="btn-prev-page"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition-all cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>

              <span className="px-3 font-bold text-slate-700">
                Page {page} of {paginationInfo.totalPages || 1}
              </span>

              <button
                id="btn-next-page"
                onClick={() => setPage(p => p + 1)}
                disabled={page >= (paginationInfo.totalPages || 1)}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition-all cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* VIEW STUDENT PROFILE & TIMELINE MODAL */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/60 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto animate-fade-in">
          <div className="max-w-5xl w-full my-6">
            <StudentProfile
              studentId={viewingStudent.id || viewingStudent.studentId}
              currentUser={currentUser}
              teachersList={teachersList}
              classList={classList}
              onClose={() => setViewingStudent(null)}
              onStudentUpdated={() => {
                refetch();
                if (onRefreshGlobalData) onRefreshGlobalData();
              }}
            />
          </div>
        </div>
      )}

      {/* QUICK SINGLE ACTION MODAL (Change Class / Assign Teacher / Update Status / Documents) */}
      {activeActionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display font-black text-sm text-slate-800 uppercase tracking-wider">
                {activeActionModal.type === 'class' && 'Reassign Class'}
                {activeActionModal.type === 'teacher' && 'Assign Teacher'}
                {activeActionModal.type === 'status' && 'Update Student Status'}
                {activeActionModal.type === 'documents' && 'Update Document Attachments'}
              </h3>
              <button onClick={() => setActiveActionModal(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer">
                <X size={16} />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                {modalError}
              </div>
            )}

            <form onSubmit={handleActionSubmit} className="space-y-4">
              {activeActionModal.type === 'class' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Select New Class</label>
                  <select
                    value={modalInputClass}
                    onChange={e => setModalInputClass(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-600"
                  >
                    <option value="">Select Class...</option>
                    {classList.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>
              )}

              {activeActionModal.type === 'teacher' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Select Assigned Teacher</label>
                  <select
                    value={modalInputTeacher}
                    onChange={e => setModalInputTeacher(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-600"
                  >
                    <option value="">Select Teacher...</option>
                    {teachersList.map(t => (
                      <option key={t.id} value={t.name}>{t.name} ({t.specialty?.join(', ') || 'Teacher'})</option>
                    ))}
                  </select>
                </div>
              )}

              {activeActionModal.type === 'status' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Select Status</label>
                  <select
                    value={modalInputStatus}
                    onChange={e => setModalInputStatus(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-600"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                    <option value="PASSED_OUT">PASSED OUT</option>
                  </select>
                </div>
              )}

              {activeActionModal.type === 'documents' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Passport Photo URL</label>
                    <input
                      type="text"
                      value={modalInputDocs.photoUrl}
                      onChange={e => setModalInputDocs({ ...modalInputDocs, photoUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Document Attachment URL</label>
                    <input
                      type="text"
                      value={modalInputDocs.documentUrl}
                      onChange={e => setModalInputDocs({ ...modalInputDocs, documentUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Aadhar Number</label>
                    <input
                      type="text"
                      value={modalInputDocs.aadhar}
                      onChange={e => setModalInputDocs({ ...modalInputDocs, aadhar: e.target.value })}
                      placeholder="12-digit Aadhar"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveActionModal(null)}
                  className="bg-slate-100 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="bg-indigo-900 hover:bg-indigo-950 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  {modalSubmitting ? 'Saving...' : 'Confirm Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL EDIT PROFILE MODAL */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display font-black text-sm text-slate-800 uppercase tracking-wider">
                Edit Student Profile: {editingStudent.name}
              </h3>
              <button onClick={() => setEditingStudent(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                {modalError}
              </div>
            )}

            <form onSubmit={handleEditProfileSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Student Name</label>
                  <input
                    type="text"
                    value={editingStudent.name || ''}
                    onChange={e => setEditingStudent({ ...editingStudent, name: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Roll Number</label>
                  <input
                    type="text"
                    value={editingStudent.rollNo || editingStudent.rollNumber || ''}
                    disabled
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-slate-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Father Name</label>
                  <input
                    type="text"
                    value={editingStudent.fatherName || ''}
                    onChange={e => setEditingStudent({ ...editingStudent, fatherName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mother Name</label>
                  <input
                    type="text"
                    value={editingStudent.motherName || ''}
                    onChange={e => setEditingStudent({ ...editingStudent, motherName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile</label>
                  <input
                    type="text"
                    value={editingStudent.mobile || ''}
                    onChange={e => setEditingStudent({ ...editingStudent, mobile: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editingStudent.email || ''}
                    onChange={e => setEditingStudent({ ...editingStudent, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700 mb-1">Student Photo</label>
                <CloudinaryUpload
                  id="edit-student-modal-photo-upload"
                  folder="students"
                  initialUrl={editingStudent.photoUrl || ''}
                  onUploadSuccess={(url) => setEditingStudent({ ...editingStudent, photoUrl: url })}
                  onFileDeleted={() => setEditingStudent({ ...editingStudent, photoUrl: '' })}
                  allowedTypes={['jpg', 'jpeg', 'png', 'webp']}
                  label="Upload / Replace Photo"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="bg-slate-100 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="bg-indigo-900 hover:bg-indigo-950 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  {modalSubmitting ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK EXECUTION CONFIRMATION MODAL */}
      {bulkModalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="font-display font-black text-sm text-slate-800 uppercase tracking-wider">
              Bulk Operation: {selectedIds.length} Students Selected
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {bulkModalType === 'class' && 'Select Class to Assign to All'}
                {bulkModalType === 'teacher' && 'Select Teacher to Assign to All'}
                {bulkModalType === 'status' && 'Select New Status for All'}
              </label>

              {bulkModalType === 'class' && (
                <select
                  value={bulkTargetValue}
                  onChange={e => setBulkTargetValue(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                >
                  <option value="">Select Target Class...</option>
                  {classList.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              )}

              {bulkModalType === 'teacher' && (
                <select
                  value={bulkTargetValue}
                  onChange={e => setBulkTargetValue(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                >
                  <option value="">Select Target Teacher...</option>
                  {teachersList.map(t => (
                    <option key={t.id} value={t.name}>{t.name}</option>
                  ))}
                </select>
              )}

              {bulkModalType === 'status' && (
                <select
                  value={bulkTargetValue}
                  onChange={e => setBulkTargetValue(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                  <option value="PASSED_OUT">PASSED OUT</option>
                </select>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setBulkModalType(null)}
                className="bg-slate-100 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkExecute}
                disabled={isBulkProcessing || !bulkTargetValue}
                className="bg-indigo-900 hover:bg-indigo-950 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                {isBulkProcessing ? 'Executing...' : 'Apply Bulk Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV BULK IMPORT MODAL */}
      {isImportModalOpen && (
        <div id="modal-csv-import-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in overflow-y-auto">
          <div id="modal-csv-import-card" className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center font-bold">
                  <Upload size={18} />
                </div>
                <div>
                  <h3 className="font-display font-black text-sm text-slate-800 uppercase tracking-wide">
                    Bulk Student Roster Import (CSV)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Upload a spreadsheet exported as .csv to quickly enroll multiple students simultaneously.
                  </p>
                </div>
              </div>
              <button
                id="btn-close-csv-import-modal"
                type="button"
                onClick={() => {
                  setIsImportModalOpen(false);
                  setParsedImportRows([]);
                  setImportError(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>

            {/* Template Download Prompt */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <FileSpreadsheet size={14} className="text-emerald-600" /> Standard CSV Format Template
                </h4>
                <p className="text-[10px] text-slate-500">
                  Headers: Name, RollNo, Class, FatherName, MotherName, Mobile, Email, PreferredBatch, Status
                </p>
              </div>
              <button
                id="btn-download-sample-csv"
                type="button"
                onClick={handleDownloadSampleCsv}
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-300 bg-white text-emerald-800 text-xs font-bold hover:bg-emerald-50 transition cursor-pointer"
              >
                <Download size={13} /> Download Template (.csv)
              </button>
            </div>

            {/* File Upload Zone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Select CSV File from Computer</label>
              <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-blue-50/20 transition-all cursor-pointer relative">
                <input
                  id="input-file-csv-picker"
                  type="file"
                  accept=".csv, text/csv"
                  onChange={handleParseCsvFile}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                  <div className="h-10 w-10 rounded-2xl bg-blue-100 text-blue-900 flex items-center justify-center">
                    <Upload size={20} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-blue-900 hover:underline">Click to browse or drop your CSV file here</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">Supports comma-separated values (.csv) with UTF-8 encoding</p>
                  </div>
                  {importFileName && (
                    <span className="inline-block mt-2 px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-700 shadow-2xs">
                      📄 {importFileName}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Error Message */}
            {importError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {importError}
              </div>
            )}

            {/* Parsed Rows Preview */}
            {parsedImportRows.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    Preview: {parsedImportRows.length} Students Ready to Import
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    Validated
                  </span>
                </div>
                <div className="border border-slate-200 rounded-xl max-h-48 overflow-y-auto overflow-x-auto text-[11px]">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-100 text-[10px] font-black uppercase text-slate-500 sticky top-0">
                      <tr>
                        <th className="p-2">#</th>
                        <th className="p-2">Name</th>
                        <th className="p-2">Roll No</th>
                        <th className="p-2">Class</th>
                        <th className="p-2">Mobile</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parsedImportRows.map((r, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2 text-slate-400 font-bold">{idx + 1}</td>
                          <td className="p-2 font-bold text-slate-800">{r.name}</td>
                          <td className="p-2 font-mono text-slate-500">{r.rollNo}</td>
                          <td className="p-2 text-slate-600">{r.class}</td>
                          <td className="p-2 font-mono text-slate-600">{r.mobile || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                id="btn-cancel-csv-import"
                type="button"
                onClick={() => {
                  setIsImportModalOpen(false);
                  setParsedImportRows([]);
                  setImportError(null);
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-csv-import"
                type="button"
                onClick={handleExecuteCsvImport}
                disabled={isImporting || parsedImportRows.length === 0}
                className="px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold shadow-md transition disabled:opacity-50 cursor-pointer"
              >
                {isImporting ? 'Importing Students...' : `Confirm & Import ${parsedImportRows.length} Students`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
