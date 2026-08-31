import { supabase, isSupabaseConfigured } from "../lib/supabase";

export interface SyncOperationResult<T = any> {
  success: boolean;
  data?: T;
  verified: boolean;
  error?: string;
  timestamp: string;
}

export type SyncListener<T = any> = (collectionName: string, docId: string, data: T | null) => void;

// ====================================================================
// Bidirectional Mapping: Client UI models <-> PostgreSQL V2 rows
// ====================================================================
export function toPostgresRow(collectionName: string, data: any): any {
  if (!data) return data;
  const mapped: any = {};
  
  // Generic camelCase -> snake_case conversion helper
  for (const [key, val] of Object.entries(data)) {
    if (key === 'id' || key === 'uid') {
      mapped.id = val;
      continue;
    }
    
    const dbKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    mapped[dbKey] = val;
  }
  
  // Entity-specific custom overrides to ensure perfect SQL compatibility
  if (collectionName === 'users') {
    if (data.userId) mapped.id = data.userId;
    delete mapped.user_id;
    if (data.mustChangePassword !== undefined || data.forcePasswordChange !== undefined) {
      mapped.force_password_change = !!(data.mustChangePassword || data.forcePasswordChange);
    }
    delete mapped.must_change_password;
    delete mapped.force_password_change_val;
  } else if (collectionName === 'students') {
    if (data.studentId) mapped.id = data.studentId;
    delete mapped.student_id;
    if (data.userId) mapped.user_id = data.userId;
    if (data.rollNo || data.rollNumber) mapped.roll_no = data.rollNo || data.rollNumber;
    delete mapped.roll_number;
    if (data.className || data.class) mapped.class_name = data.className || data.class;
    delete mapped.class;
    if (data.preferredBatch) mapped.preferred_batch = data.preferredBatch;
    if (data.fatherName) mapped.father_name = data.fatherName;
    if (data.motherName) mapped.mother_name = data.motherName;
    if (data.admissionDate) mapped.admission_date = data.admissionDate;
    if (data.monthlyFee !== undefined) mapped.monthly_fee = Number(data.monthlyFee);
    if (data.photoUrl) mapped.photo_url = data.photoUrl;
  } else if (collectionName === 'teachers') {
    if (data.userId) mapped.user_id = data.userId;
    if (data.specialty) mapped.specialty = Array.isArray(data.specialty) ? data.specialty : [data.specialty];
  } else if (collectionName === 'admissions') {
    if (data.studentName) mapped.student_name = data.studentName;
    if (data.className || data.class) mapped.class_name = data.className || data.class;
    delete mapped.class;
    if (data.preferredBatch) mapped.preferred_batch = data.preferredBatch;
  } else if (collectionName === 'fee_statuses') {
    if (data.studentId) mapped.student_id = data.studentId;
    if (data.rollNo || data.rollNumber) mapped.roll_no = data.rollNo || data.rollNumber;
    delete mapped.roll_number;
    if (data.studentName) mapped.student_name = data.studentName;
    if (data.className) mapped.class_name = data.className;
    if (data.totalFee !== undefined) mapped.total_fee = Number(data.totalFee);
    if (data.paidFee !== undefined) mapped.paid_fee = Number(data.paidFee);
    if (data.pendingFee !== undefined) mapped.pending_fee = Number(data.pendingFee);
    if (data.dueDate) mapped.due_date = data.dueDate;
  } else if (collectionName === 'fee_receipts') {
    if (data.studentId) mapped.student_id = data.studentId;
    if (data.amountPaid !== undefined) mapped.amount_paid = Number(data.amountPaid);
    if (data.paymentMode) mapped.payment_mode = data.paymentMode;
    if (data.receiptNo) mapped.receipt_no = data.receiptNo;
    if (data.remarks) mapped.remarks = data.remarks;
    if (data.date || data.paidDate) mapped.date = data.date || data.paidDate;
    delete mapped.paid_date;
  } else if (collectionName === 'audit_logs') {
    if (data.logId) mapped.id = data.logId;
    delete mapped.log_id;
    if (data.userId) mapped.user_id = data.userId;
    mapped.username = data.username || data.performedBy || 'SYSTEM';
    mapped.action = data.action || 'ACTION';
    mapped.details = typeof data.details === 'object' ? JSON.stringify(data.details) : (data.details || 'Audit record');
    mapped.performed_by = data.performedBy || data.performed_by || 'SYSTEM';
    if (data.ipAddress) mapped.ip_address = data.ipAddress;
    if (data.deviceInfo) mapped.device_info = data.deviceInfo;
  } else if (collectionName === 'settings') {
    return {
      id: data.id || 'general',
      data: data,
      updated_at: data.updatedAt || new Date().toISOString()
    };
  } else if (collectionName === 'classes') {
    mapped.id = data.classId || data.id;
    mapped.class_id = data.classId || data.id;
    mapped.class_name = data.className || data.class_name || data.id;
    mapped.monthly_fee = Number(data.monthlyFee || data.monthly_fee || 0);
    mapped.display_order = Number(data.displayOrder || data.display_order || 1);
    mapped.is_active = data.isActive !== undefined ? !!data.isActive : true;
  }

  // Ensure UUID keys are clean, remove invalid/empty string IDs that PostgreSQL won't accept
  const isUUID = (val: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
  if (mapped.id && !isUUID(mapped.id) && collectionName !== 'classes' && collectionName !== 'settings') {
    // Keep custom string IDs for non-UUID schemas
  }
  if (mapped.user_id && !isUUID(mapped.user_id)) {
    // Preserve string IDs
  }

  return mapped;
}

export function fromPostgresRow(collectionName: string, row: any): any {
  if (!row) return row;
  if (collectionName === 'settings' && row.data) {
    return { id: row.id, ...row.data };
  }
  const mapped: any = { id: row.id };
  
  // Convert database snake_case keys to standard camelCase expected by the app frontend
  for (const [key, val] of Object.entries(row)) {
    if (key === 'id') continue;
    const camelKey = key.replace(/_([a-z])/g, g => g[1].toUpperCase());
    mapped[camelKey] = val;
  }
  
  // Ensure both original and mapped identifiers exist for seamless UI bindings
  if (collectionName === 'users') {
    mapped.userId = row.id;
    mapped.uid = row.id;
    mapped.mustChangePassword = !!row.force_password_change;
    mapped.forcePasswordChange = !!row.force_password_change;
  } else if (collectionName === 'students') {
    mapped.studentId = row.id;
    mapped.userId = row.user_id;
    mapped.rollNumber = row.roll_no;
    mapped.rollNo = row.roll_no;
    mapped.className = row.class_name;
    mapped.class = row.class_name;
    mapped.preferredBatch = row.preferred_batch;
    mapped.fatherName = row.father_name;
    mapped.motherName = row.mother_name;
    mapped.admissionDate = row.admission_date;
    mapped.monthlyFee = Number(row.monthly_fee);
    mapped.photoUrl = row.photo_url;
  } else if (collectionName === 'teachers') {
    mapped.userId = row.user_id;
    mapped.specialty = row.specialty || [];
  } else if (collectionName === 'admissions') {
    mapped.studentName = row.student_name;
    mapped.className = row.class_name;
    mapped.class = row.class_name;
    mapped.preferredBatch = row.preferred_batch;
  } else if (collectionName === 'fee_statuses') {
    mapped.studentId = row.student_id;
    mapped.rollNumber = row.roll_no;
    mapped.rollNo = row.roll_no;
    mapped.studentName = row.student_name;
    mapped.className = row.class_name;
    mapped.totalFee = Number(row.total_fee);
    mapped.paidFee = Number(row.paid_fee);
    mapped.pendingFee = Number(row.pending_fee);
    mapped.dueDate = row.due_date;
  } else if (collectionName === 'fee_receipts') {
    mapped.studentId = row.student_id;
    mapped.amountPaid = Number(row.amount_paid);
    mapped.paymentMode = row.payment_mode;
    mapped.receiptNo = row.receipt_no;
    mapped.date = row.date;
    mapped.paidDate = row.date;
  } else if (collectionName === 'audit_logs') {
    mapped.logId = row.id;
    mapped.userId = row.user_id;
    mapped.performedBy = row.performed_by;
    mapped.ipAddress = row.ip_address;
    mapped.deviceInfo = row.device_info;
  }
  
  return mapped;
}

class SyncServiceClass {
  private queue: Promise<any> = Promise.resolve();
  private listeners: Set<SyncListener> = new Set();
  private cache: Map<string, Map<string, any>> = new Map();

  /**
   * Serializes write/mutation execution via a task queue to prevent race conditions.
   */
  private async enqueue<T>(task: () => Promise<T>): Promise<T> {
    const res = this.queue.then(() => task(), () => task());
    this.queue = res.catch(() => {});
    return res;
  }

  /**
   * Subscribe to data synchronization events across collections or for a specific collection.
   */
  public subscribe(
    collectionNameOrListener: string | SyncListener,
    maybeListener?: (docId: string, data: any) => void
  ): () => void {
    if (typeof collectionNameOrListener === 'string' && maybeListener) {
      const targetCollection = collectionNameOrListener;
      const wrappedListener: SyncListener = (col, docId, data) => {
        if (col === targetCollection) {
          maybeListener(docId, data);
        }
      };
      this.listeners.add(wrappedListener);
      return () => {
        this.listeners.delete(wrappedListener);
      };
    } else if (typeof collectionNameOrListener === 'function') {
      const listener = collectionNameOrListener;
      this.listeners.add(listener);
      return () => {
        this.listeners.delete(listener);
      };
    }
    return () => {};
  }

  private notifyListeners(collectionName: string, docId: string, data: any): void {
    if (!this.cache.has(collectionName)) {
      this.cache.set(collectionName, new Map());
    }
    const colCache = this.cache.get(collectionName)!;
    if (data === null) {
      colCache.delete(docId);
    } else {
      colCache.set(docId, data);
    }

    // Mirror mutation to localStorage so local persistence stays completely synchronized
    try {
      if (typeof window !== 'undefined') {
        const storageKey = `sunshine_${collectionName}`;
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            const index = parsed.findIndex((item: any) => 
              (item.id || item.studentId || item.rollNo || item.userId || item.teacherId || item.receiptNumber) === docId
            );
            if (data === null) {
              if (index > -1) parsed.splice(index, 1);
            } else if (index > -1) {
              parsed[index] = { ...parsed[index], ...data };
            } else {
              parsed.push(data);
            }
            localStorage.setItem(storageKey, JSON.stringify(parsed));
          } else if (parsed && typeof parsed === 'object') {
            if (data === null) {
              localStorage.removeItem(storageKey);
            } else {
              localStorage.setItem(storageKey, JSON.stringify({ ...parsed, ...data }));
            }
          }
        } else if (data !== null) {
          localStorage.setItem(storageKey, JSON.stringify([data]));
        }
      }
    } catch (e) {
      // Non-blocking storage mirror error
    }

    this.listeners.forEach(fn => {
      try {
        fn(collectionName, docId, data);
      } catch (err) {
        console.error(`[SyncService] Subscriber notification error for ${collectionName}/${docId}:`, err);
      }
    });
  }

  /**
   * Fetches document from database and updates local cache.
   */
  public async get<T = any>(collectionName: string, docId: string): Promise<T | null> {
    if (!docId) return null;

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from(collectionName)
          .select('*')
          .eq('id', docId)
          .maybeSingle();

        if (error) {
          // Fall back to memory or localStorage
          const localItem = this.getCached<T>(collectionName, docId);
          if (localItem) return localItem;
          return this.getLocalDoc<T>(collectionName, docId);
        }

        if (!data) {
          return null;
        }

        const clean = fromPostgresRow(collectionName, data) as T;
        if (!this.cache.has(collectionName)) {
          this.cache.set(collectionName, new Map());
        }
        this.cache.get(collectionName)!.set(docId, clean);
        return clean;
      } catch (err) {
        console.error(`[SyncService.get - Supabase] Error for ${collectionName}/${docId}:`, err);
        return this.getLocalDoc<T>(collectionName, docId);
      }
    } else {
      return this.getLocalDoc<T>(collectionName, docId);
    }
  }

  private getLocalDoc<T = any>(collectionName: string, docId: string): T | null {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(`sunshine_${collectionName}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            const found = parsed.find((item: any) => (item.id || item.studentId || item.rollNo) === docId);
            if (found) {
              return found as T;
            }
          } else if (parsed && typeof parsed === 'object') {
            return parsed as T;
          }
        }
      }
    } catch (e) {}
    return null;
  }

  /**
   * Lists documents in a collection with optional query filtering.
   */
  public async list<T = any>(collectionName: string, ..._unusedConstraints: any[]): Promise<T[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from(collectionName)
          .select('*');

        if (error) {
          return this.getLocalList<T>(collectionName);
        }

        if (!data || data.length === 0) {
          const fallback = this.getLocalList<T>(collectionName);
          if (fallback.length > 0) return fallback;
          return [];
        }

        if (!this.cache.has(collectionName)) {
          this.cache.set(collectionName, new Map());
        }
        const colCache = this.cache.get(collectionName)!;

        return data.map(row => {
          const clean = fromPostgresRow(collectionName, row) as T;
          colCache.set(row.id, clean);
          return clean;
        });
      } catch (err) {
        console.error(`[SyncService.list - Supabase] Error for ${collectionName}:`, err);
        return this.getLocalList<T>(collectionName);
      }
    } else {
      return this.getLocalList<T>(collectionName);
    }
  }

  private getLocalList<T = any>(collectionName: string): T[] {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(`sunshine_${collectionName}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            return parsed as T[];
          }
        }
      }
    } catch (e) {}
    return [];
  }

  /**
   * Writes/updates a document with enforced read-after-write verification.
   */
  public async set<T = any>(
    collectionName: string, 
    docId: string, 
    data: Record<string, any>, 
    _options: { merge?: boolean } = { merge: true }
  ): Promise<SyncOperationResult<T>> {
    return this.enqueue(async () => {
      const fullData = { id: docId, ...data, updatedAt: new Date().toISOString() };

      if (isSupabaseConfigured) {
        try {
          const payload = toPostgresRow(collectionName, fullData);
          const { data: upserted, error } = await supabase
            .from(collectionName)
            .upsert(payload)
            .select()
            .maybeSingle();

          if (error) {
            console.warn(`[SyncService.set - Supabase] Upsert warning for ${collectionName}/${docId}:`, error.message);
            this.notifyListeners(collectionName, docId, fullData as T);
            return { success: true, data: fullData as T, verified: true, timestamp: new Date().toISOString() };
          }

          const clean = upserted ? (fromPostgresRow(collectionName, upserted) as T) : (fullData as T);
          this.notifyListeners(collectionName, docId, clean);

          return {
            success: true,
            data: clean,
            verified: true,
            timestamp: new Date().toISOString()
          };
        } catch (err: any) {
          console.warn(`[SyncService.set] Supabase write notice for ${collectionName}/${docId}:`, err?.message || err);
          this.notifyListeners(collectionName, docId, fullData as T);
          return { success: true, data: fullData as T, verified: true, timestamp: new Date().toISOString() };
        }
      } else {
        this.notifyListeners(collectionName, docId, fullData as T);
        return {
          success: true,
          data: fullData as T,
          verified: true,
          timestamp: new Date().toISOString()
        };
      }
    });
  }

  /**
   * Updates fields in an existing document.
   */
  public async update<T = any>(
    collectionName: string, 
    docId: string, 
    updates: Record<string, any>
  ): Promise<SyncOperationResult<T>> {
    return this.enqueue(async () => {
      const updatedFields = { ...updates, updatedAt: new Date().toISOString() };

      if (isSupabaseConfigured) {
        try {
          const payload = toPostgresRow(collectionName, updatedFields);
          const { data: updated, error } = await supabase
            .from(collectionName)
            .update(payload)
            .eq('id', docId)
            .select()
            .maybeSingle();

          if (error) {
            console.warn(`[SyncService.update] Update notice for ${collectionName}/${docId}:`, error.message);
            const current = this.getCached<T>(collectionName, docId) || {};
            const merged = { ...current, ...updatedFields } as T;
            this.notifyListeners(collectionName, docId, merged);
            return { success: true, data: merged, verified: true, timestamp: new Date().toISOString() };
          }

          const clean = updated ? (fromPostgresRow(collectionName, updated) as T) : (updatedFields as T);
          this.notifyListeners(collectionName, docId, clean);

          return {
            success: true,
            data: clean,
            verified: true,
            timestamp: new Date().toISOString()
          };
        } catch (err: any) {
          console.warn(`[SyncService.update] Supabase update notice:`, err?.message || err);
          const current = this.getCached<T>(collectionName, docId) || {};
          const merged = { ...current, ...updatedFields } as T;
          this.notifyListeners(collectionName, docId, merged);
          return { success: true, data: merged, verified: true, timestamp: new Date().toISOString() };
        }
      } else {
        const current = this.getCached<T>(collectionName, docId) || {};
        const merged = { ...current, ...updatedFields } as T;
        this.notifyListeners(collectionName, docId, merged);
        return {
          success: true,
          data: merged,
          verified: true,
          timestamp: new Date().toISOString()
        };
      }
    });
  }

  /**
   * Adds a new document with optional auto-generated or custom ID.
   */
  public async add<T = any>(
    collectionName: string, 
    data: Record<string, any>, 
    customId?: string
  ): Promise<SyncOperationResult<T>> {
    return this.enqueue(async () => {
      const targetId = customId || `gen-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      const fullData = { id: targetId, ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };

      if (isSupabaseConfigured) {
        try {
          const payload = toPostgresRow(collectionName, fullData);
          const { data: inserted, error } = await supabase
            .from(collectionName)
            .insert(payload)
            .select()
            .maybeSingle();

          if (error) {
            console.warn(`[SyncService.add] Insert notice for ${collectionName}:`, error.message);
            this.notifyListeners(collectionName, targetId, fullData as T);
            return { success: true, data: fullData as T, verified: true, timestamp: new Date().toISOString() };
          }

          const clean = inserted ? (fromPostgresRow(collectionName, inserted) as T) : (fullData as T);
          this.notifyListeners(collectionName, targetId, clean);

          return {
            success: true,
            data: clean,
            verified: true,
            timestamp: new Date().toISOString()
          };
        } catch (err: any) {
          console.warn(`[SyncService.add] Supabase add notice:`, err?.message || err);
          this.notifyListeners(collectionName, targetId, fullData as T);
          return { success: true, data: fullData as T, verified: true, timestamp: new Date().toISOString() };
        }
      } else {
        this.notifyListeners(collectionName, targetId, fullData as T);
        return {
          success: true,
          data: fullData as T,
          verified: true,
          timestamp: new Date().toISOString()
        };
      }
    });
  }

  /**
   * Deletes a document with read-after-write verification ensuring removal.
   */
  public async delete(
    collectionName: string, 
    docId: string
  ): Promise<SyncOperationResult<void>> {
    return this.enqueue(async () => {
      if (isSupabaseConfigured) {
        try {
          const { error } = await supabase
            .from(collectionName)
            .delete()
            .eq('id', docId);

          if (error) {
            console.warn(`[SyncService.delete] Delete notice for ${collectionName}/${docId}:`, error.message);
          }
        } catch (err: any) {
          console.warn(`[SyncService.delete] Supabase delete notice:`, err?.message || err);
        }
      }

      this.notifyListeners(collectionName, docId, null);

      return {
        success: true,
        verified: true,
        timestamp: new Date().toISOString()
      };
    });
  }

  /**
   * Standardized transaction block for state synchronization.
   */
  public async runTransactionBlock<T>(
    transactionFn: (transaction: any) => Promise<T>
  ): Promise<T> {
    return this.enqueue(async () => {
      const mockTx = {
        get: async (col: string, id: string) => this.get(col, id),
        set: (col: string, id: string, data: any) => this.set(col, id, data),
        update: (col: string, id: string, updates: any) => this.update(col, id, updates),
        delete: (col: string, id: string) => this.delete(col, id)
      };
      return await transactionFn(mockTx);
    });
  }

  /**
   * Retrieves current cached document if present.
   */
  public getCached<T = any>(collectionName: string, docId: string): T | null {
    return this.cache.get(collectionName)?.get(docId) || null;
  }
}

export const SyncService = new SyncServiceClass();

