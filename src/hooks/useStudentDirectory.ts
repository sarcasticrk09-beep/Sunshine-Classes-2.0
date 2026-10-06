/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { SyncService } from '../services/SyncService';
import { getCachedIdToken } from '../lib/supabase';
import { SEED_STUDENTS } from '../data';
import { Student } from '../types';

export interface StudentDirectoryFilters {
  searchTerm: string;
  debouncedSearch: string;
  selectedClass: string;
  selectedTeacher: string;
  selectedStatus: string;
  selectedGender: string;
  admissionYear: string;
  joinedDate: string;
  updatedDate: string;
  hasDocuments: string;
  hasPhoto: string;
  missingMobile: string;
  missingEmail: string;
  hasConcession: string;
  concessionPercentageFilter: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  page: number;
  limit: number;
}

export interface StudentPaginationInfo {
  totalCount: number;
  totalPages: number;
  hasMore: boolean;
  lastDocId: string | null;
  page: number;
  limit: number;
}

export interface UseStudentDirectoryOptions {
  initialStudents?: any[];
  defaultLimit?: number;
}

export interface UseStudentDirectoryReturn {
  students: any[];
  paginationInfo: StudentPaginationInfo;
  loading: boolean;
  networkError: string | null;
  isOfflineFallback: boolean;
  filters: StudentDirectoryFilters;
  setSearchTerm: (val: string) => void;
  setSelectedClass: (val: string) => void;
  setSelectedTeacher: (val: string) => void;
  setSelectedStatus: (val: string) => void;
  setSelectedGender: (val: string) => void;
  setAdmissionYear: (val: string) => void;
  setJoinedDate: (val: string) => void;
  setUpdatedDate: (val: string) => void;
  setHasDocuments: (val: string) => void;
  setHasPhoto: (val: string) => void;
  setMissingMobile: (val: string) => void;
  setMissingEmail: (val: string) => void;
  setHasConcession: (val: string) => void;
  setConcessionPercentageFilter: (val: string) => void;
  setPage: (updater: number | ((prev: number) => number)) => void;
  handleSort: (field: string) => void;
  handleLimitChange: (newLimit: number) => void;
  handleResetFilters: () => void;
  refetch: () => Promise<void>;
  restoreSeedFallback: () => void;
}

export function useStudentDirectory({
  initialStudents = [],
  defaultLimit = 25
}: UseStudentDirectoryOptions = {}): UseStudentDirectoryReturn {
  // Filters State
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedGender, setSelectedGender] = useState<string>('ALL');
  const [admissionYear, setAdmissionYear] = useState<string>('');
  const [joinedDate, setJoinedDate] = useState<string>('');
  const [updatedDate, setUpdatedDate] = useState<string>('');
  const [hasDocuments, setHasDocuments] = useState<string>('ALL');
  const [hasPhoto, setHasPhoto] = useState<string>('ALL');
  const [missingMobile, setMissingMobile] = useState<string>('ALL');
  const [missingEmail, setMissingEmail] = useState<string>('ALL');
  const [hasConcession, setHasConcession] = useState<string>('ALL');
  const [concessionPercentageFilter, setConcessionPercentageFilter] = useState<string>('');

  // Sorting & Pagination State
  const [sortBy, setSortBy] = useState<string>('rollNo');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sunshine_directory_limit');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
    }
    return defaultLimit;
  });

  // Base fallback students determination
  const getInitialFallbackList = useCallback((): any[] => {
    if (Array.isArray(initialStudents) && initialStudents.length > 0) {
      return initialStudents;
    }
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('sunshine_students');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return Array.isArray(SEED_STUDENTS) ? SEED_STUDENTS : [];
  }, [initialStudents]);

  // Data & Status State
  const [students, setStudents] = useState<any[]>(() => getInitialFallbackList());
  const [paginationInfo, setPaginationInfo] = useState<StudentPaginationInfo>(() => {
    const list = getInitialFallbackList();
    return {
      totalCount: list.length,
      totalPages: Math.max(1, Math.ceil(list.length / limit)),
      hasMore: false,
      lastDocId: null,
      page: 1,
      limit
    };
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [isOfflineFallback, setIsOfflineFallback] = useState<boolean>(false);

  const isMountedRef = useRef<boolean>(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Debounce search term changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Sync initial students when provided or updated
  useEffect(() => {
    if (Array.isArray(initialStudents) && initialStudents.length > 0 && initialStudents.length !== students.length) {
      fetchStudents();
    }
  }, [initialStudents?.length]);

  // Handle Sort Toggle
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1);
  };

  // Handle Limit Change
  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sunshine_directory_limit', newLimit.toString());
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setSelectedClass('');
    setSelectedTeacher('');
    setSelectedStatus('ALL');
    setSelectedGender('ALL');
    setAdmissionYear('');
    setJoinedDate('');
    setUpdatedDate('');
    setHasDocuments('ALL');
    setHasPhoto('ALL');
    setMissingMobile('ALL');
    setMissingEmail('ALL');
    setHasConcession('ALL');
    setConcessionPercentageFilter('');
    setPage(1);
  };

  // Restore Default Seed Fallback
  const restoreSeedFallback = () => {
    const fallback = Array.isArray(SEED_STUDENTS) ? [...SEED_STUDENTS] : [];
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('sunshine_students', JSON.stringify(fallback));
      } catch {}
    }
    setStudents(fallback.slice(0, limit));
    setPaginationInfo({
      totalCount: fallback.length,
      totalPages: Math.max(1, Math.ceil(fallback.length / limit)),
      hasMore: fallback.length > limit,
      lastDocId: null,
      page: 1,
      limit
    });
    setNetworkError(null);
    setIsOfflineFallback(true);
  };

  // Primary Data Fetching Pipeline
  const fetchStudents = useCallback(async () => {
    setLoading(true);

    const token = getCachedIdToken() || '';
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
    if (hasConcession !== 'ALL') params.append('hasConcession', hasConcession);
    if (concessionPercentageFilter) params.append('concessionPercentage', concessionPercentageFilter);

    params.append('sortBy', sortBy);
    params.append('sortOrder', sortOrder);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    let fetchedList: any[] = [];
    let paginationResult: StudentPaginationInfo = {
      totalCount: 0,
      totalPages: 1,
      hasMore: false,
      lastDocId: null,
      page,
      limit
    };
    let gotRemoteSuccess = false;
    let failureReason = '';

    try {
      const response = await fetch(`/api/students?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        credentials: 'include'
      });

      const data = await response.json().catch(() => null);

      if (response.ok && data?.success) {
        const rawList = Array.isArray(data.data)
          ? data.data
          : Array.isArray(data.data?.data)
          ? data.data.data
          : Array.isArray(data.students)
          ? data.students
          : [];

        fetchedList = rawList.filter(Boolean);

        // Ensure any locally added or imported students from initialStudents or local storage are never dropped
        const localSeed = getInitialFallbackList().filter(Boolean);
        const serverIds = new Set(
          fetchedList.map(s => String(s.id || s.studentId || s.rollNo || s.rollNumber || '').toLowerCase())
        );
        const serverNames = new Set(
          fetchedList.map(s => String(s.name || s.personalInfo?.name || '').trim().toLowerCase())
        );
        const missingLocal = localSeed.filter(s => {
          const idKey = String(s.id || s.studentId || s.rollNo || s.rollNumber || '').toLowerCase();
          const nameKey = String(s.name || s.personalInfo?.name || '').trim().toLowerCase();
          return !serverIds.has(idKey) && !serverNames.has(nameKey);
        });

        if (missingLocal.length > 0) {
          fetchedList = [...fetchedList, ...missingLocal];
        }

        const effectiveTotal = Math.max(rawList.length, fetchedList.length);
        paginationResult = data.pagination || data.data?.pagination || {
          totalCount: effectiveTotal,
          totalPages: Math.max(1, Math.ceil(effectiveTotal / limit)),
          hasMore: false,
          lastDocId: null,
          page,
          limit
        };

        if (missingLocal.length > 0) {
          paginationResult.totalCount = Math.max(paginationResult.totalCount, fetchedList.length);
          paginationResult.totalPages = Math.max(1, Math.ceil(fetchedList.length / limit));
        }
        gotRemoteSuccess = true;
      } else {
        failureReason = data?.message || data?.error || `HTTP ${response.status} Network Error`;
      }
    } catch (err: any) {
      failureReason = err?.message || 'Network unreachable';
    }

    if (gotRemoteSuccess) {
      if (isMountedRef.current) {
        setStudents(fetchedList);
        setPaginationInfo(paginationResult);
        setNetworkError(null);
        setIsOfflineFallback(false);
        setLoading(false);
      }
      return;
    }

    // Remote call failed: activate resilient multi-tier fallback
    console.warn(`[useStudentDirectory] Remote sync failed (${failureReason}). Switching to resilient local/offline cache.`);
    setNetworkError(failureReason);
    setIsOfflineFallback(true);

    try {
      const localList = await SyncService.list<Student>('students').catch(() => []);
      if (Array.isArray(localList) && localList.length > 0) {
        fetchedList = localList.filter(Boolean);
      } else if (Array.isArray(initialStudents) && initialStudents.length > 0) {
        fetchedList = initialStudents.filter(Boolean);
      } else {
        fetchedList = getInitialFallbackList().filter(Boolean);
      }
    } catch {
      fetchedList = getInitialFallbackList().filter(Boolean);
    }

    // If still empty and no active filters are set, fall back to seed students
    if (
      fetchedList.length === 0 &&
      !debouncedSearch &&
      !selectedClass &&
      !selectedTeacher &&
      selectedStatus === 'ALL' &&
      Array.isArray(SEED_STUDENTS) &&
      SEED_STUDENTS.length > 0
    ) {
      fetchedList = [...SEED_STUDENTS].filter(Boolean);
    }

    // Apply defensive client-side filters on fallback dataset
    let filteredList = fetchedList.filter((s): s is any => s != null && typeof s === 'object');

    if (debouncedSearch && debouncedSearch.trim()) {
      const term = debouncedSearch.trim().toLowerCase();
      filteredList = filteredList.filter(s => {
        const name = String(s.name || s.personalInfo?.name || '').toLowerCase();
        const roll = String(s.rollNo || s.rollNumber || s.personalInfo?.rollNo || '').toLowerCase();
        const cls = String(s.class || s.className || s.preferredBatch || '').toLowerCase();
        const parent = String(s.fatherName || s.parentInfo?.fatherName || s.motherName || '').toLowerCase();
        const mobile = String(s.mobile || s.contactInfo?.mobile || '').toLowerCase();
        const email = String(s.email || s.contactInfo?.email || '').toLowerCase();
        return (
          name.includes(term) ||
          roll.includes(term) ||
          cls.includes(term) ||
          parent.includes(term) ||
          mobile.includes(term) ||
          email.includes(term)
        );
      });
    }

    if (selectedClass) {
      const classTerm = selectedClass.trim().toLowerCase();
      filteredList = filteredList.filter(s => {
        const c = String(s.class || s.className || s.preferredBatch || '').trim().toLowerCase();
        return c === classTerm || c.includes(classTerm);
      });
    }

    if (selectedTeacher) {
      const teacherTerm = selectedTeacher.trim().toLowerCase();
      filteredList = filteredList.filter(s => {
        const t = String(s.assignedTeacher || s.teacherId || '').trim().toLowerCase();
        return t === teacherTerm || t.includes(teacherTerm);
      });
    }

    if (selectedStatus && selectedStatus !== 'ALL') {
      const statusTarget = selectedStatus.trim().toUpperCase();
      filteredList = filteredList.filter(s => {
        const st = String(s.status || 'ACTIVE').trim().toUpperCase();
        return st === statusTarget;
      });
    }

    if (selectedGender && selectedGender !== 'ALL') {
      const genderTarget = selectedGender.trim().toUpperCase();
      filteredList = filteredList.filter(s => {
        const g = String(s.gender || s.personalInfo?.gender || '').trim().toUpperCase();
        return g === genderTarget;
      });
    }

    if (admissionYear && admissionYear.trim()) {
      const yearTerm = admissionYear.trim();
      filteredList = filteredList.filter(s => {
        const adm = String(s.admissionYear || s.admissionDate || s.createdAt || '');
        return adm.includes(yearTerm);
      });
    }

    if (hasDocuments !== 'ALL') {
      const wantDocs = hasDocuments === 'true';
      filteredList = filteredList.filter(s => {
        const docs = s.documents;
        const hasAny = Boolean(
          docs && typeof docs === 'object' && Object.values(docs).some(v => Boolean(v))
        );
        return wantDocs ? hasAny : !hasAny;
      });
    }

    if (hasPhoto !== 'ALL') {
      const wantPhoto = hasPhoto === 'true';
      filteredList = filteredList.filter(s => {
        const photo = s.photoUrl || s.personalInfo?.photoUrl;
        return wantPhoto ? Boolean(photo) : !photo;
      });
    }

    if (missingMobile !== 'ALL') {
      const wantMissing = missingMobile === 'true';
      filteredList = filteredList.filter(s => {
        const mob = s.mobile || s.contactInfo?.mobile;
        return wantMissing ? !mob : Boolean(mob);
      });
    }

    if (missingEmail !== 'ALL') {
      const wantMissing = missingEmail === 'true';
      filteredList = filteredList.filter(s => {
        const eml = s.email || s.contactInfo?.email;
        return wantMissing ? !eml : Boolean(eml);
      });
    }

    if (hasConcession !== 'ALL') {
      const wantConcession = hasConcession === 'true';
      filteredList = filteredList.filter(s => {
        const con = s.concession || s.feeConcession || s.scholarshipPercentage;
        return wantConcession ? Boolean(con) : !con;
      });
    }

    if (concessionPercentageFilter && concessionPercentageFilter.trim()) {
      const minVal = parseFloat(concessionPercentageFilter);
      if (!isNaN(minVal)) {
        filteredList = filteredList.filter(s => {
          const perc = parseFloat(s.concessionPercentage || s.scholarshipPercentage || '0');
          return !isNaN(perc) && perc >= minVal;
        });
      }
    }

    // Defensive client-side sorting
    filteredList.sort((a, b) => {
      let valA = a[sortBy] ?? a.personalInfo?.[sortBy];
      let valB = b[sortBy] ?? b.personalInfo?.[sortBy];
      if (sortBy === 'rollNo') {
        valA = valA ?? a.rollNumber ?? a.personalInfo?.rollNo ?? '';
        valB = valB ?? b.rollNumber ?? b.personalInfo?.rollNo ?? '';
      }
      if (sortBy === 'class') {
        valA = valA ?? a.className ?? a.preferredBatch ?? '';
        valB = valB ?? b.className ?? b.preferredBatch ?? '';
      }
      valA = valA ?? '';
      valB = valB ?? '';

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      return sortOrder === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });

    const totalCount = filteredList.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / limit));
    const safePage = Math.min(page, totalPages);
    const startIndex = (safePage - 1) * limit;
    const paginatedSlice = filteredList.slice(startIndex, startIndex + limit);

    if (isMountedRef.current) {
      setStudents(paginatedSlice);
      setPaginationInfo({
        totalCount,
        totalPages,
        hasMore: safePage < totalPages,
        lastDocId: null,
        page: safePage,
        limit
      });
      setLoading(false);
    }
  }, [
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
    limit,
    initialStudents,
    getInitialFallbackList
  ]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return {
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
    setJoinedDate,
    setUpdatedDate,
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
    refetch: fetchStudents,
    restoreSeedFallback
  };
}
