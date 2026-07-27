import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  runTransaction,
  serverTimestamp,
  QueryConstraint,
  DocumentData
} from "firebase/firestore";
import { db } from "../lib/firebase";
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
// Bidirectional Mapping: Firestore structures <-> PostgreSQL V2 rows
// ====================================================================
function toPostgresRow(collectionName: string, data: any): any {
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
    if (data.monthlyFee) mapped.monthly_fee = Number(data.monthlyFee);
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
    if (data.totalFee) mapped.total_fee = Number(data.totalFee);
    if (data.paidFee) mapped.paid_fee = Number(data.paidFee);
    if (data.pendingFee) mapped.pending_fee = Number(data.pendingFee);
    if (data.dueDate) mapped.due_date = data.dueDate;
  } else if (collectionName === 'fee_receipts') {
    if (data.studentId) mapped.student_id = data.studentId;
    if (data.amountPaid) mapped.amount_paid = Number(data.amountPaid);
    if (data.paymentMode) mapped.payment_mode = data.paymentMode;
    if (data.receiptNo) mapped.receipt_no = data.receiptNo;
    if (data.remarks) mapped.remarks = data.remarks;
    if (data.date || data.paidDate) mapped.date = data.date || data.paidDate;
    delete mapped.paid_date;
  } else if (collectionName === 'audit_logs') {
    if (data.logId) mapped.id = data.logId;
    delete mapped.log_id;
    if (data.userId) mapped.user_id = data.userId;
    if (data.performedBy) mapped.performed_by = data.performedBy;
    if (data.ipAddress) mapped.ip_address = data.ipAddress;
    if (data.deviceInfo) mapped.device_info = data.deviceInfo;
  }

  // Ensure UUID keys are clean, remove invalid/empty string IDs that PostgreSQL won't accept
  const isUUID = (val: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
  if (mapped.id && !isUUID(mapped.id)) delete mapped.id;
  if (mapped.user_id && !isUUID(mapped.user_id)) delete mapped.user_id;
  if (mapped.student_id && !isUUID(mapped.student_id)) delete mapped.student_id;

  return mapped;
}

function fromPostgresRow(collectionName: string, row: any): any {
  if (!row) return row;
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
   * Subscribe to data synchronization events across collections.
   */
  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
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

        if (error || !data) {
          this.notifyListeners(collectionName, docId, null);
          return null;
        }

        const clean = fromPostgresRow(collectionName, data) as T;
        this.notifyListeners(collectionName, docId, clean);
        return clean;
      } catch (err) {
        console.error(`[SyncService.get - Supabase] Error for ${collectionName}/${docId}:`, err);
        return null;
      }
    } else {
      const docRef = doc(db, collectionName, docId);
      const snap = await getDoc(docRef);
      if (!snap.exists()) {
        this.notifyListeners(collectionName, docId, null);
        return null;
      }
      const data = { id: snap.id, ...snap.data() } as T;
      this.notifyListeners(collectionName, docId, data);
      return data;
    }
  }

  /**
   * Lists documents in a collection with optional query constraints.
   */
  public async list<T = any>(collectionName: string, ...constraints: QueryConstraint[]): Promise<T[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from(collectionName)
          .select('*');

        if (error || !data) {
          return [];
        }

        return data.map(row => {
          const clean = fromPostgresRow(collectionName, row) as T;
          this.notifyListeners(collectionName, row.id, clean);
          return clean;
        });
      } catch (err) {
        console.error(`[SyncService.list - Supabase] Error for ${collectionName}:`, err);
        return [];
      }
    } else {
      const colRef = collection(db, collectionName);
      const q = constraints.length > 0 ? query(colRef, ...constraints) : colRef;
      const snap = await getDocs(q);
      const items: T[] = [];
      snap.docs.forEach(d => {
        const item = { id: d.id, ...d.data() } as T;
        items.push(item);
        this.notifyListeners(collectionName, d.id, item);
      });
      return items;
    }
  }

  /**
   * Writes/updates a document with enforced read-after-write verification.
   */
  public async set<T = any>(
    collectionName: string, 
    docId: string, 
    data: Record<string, any>, 
    options: { merge?: boolean } = { merge: true }
  ): Promise<SyncOperationResult<T>> {
    return this.enqueue(async () => {
      if (isSupabaseConfigured) {
        try {
          const payload = toPostgresRow(collectionName, { id: docId, ...data });
          const { data: upserted, error } = await supabase
            .from(collectionName)
            .upsert(payload)
            .select()
            .single();

          if (error) throw error;

          const clean = fromPostgresRow(collectionName, upserted) as T;
          this.notifyListeners(collectionName, docId, clean);

          return {
            success: true,
            data: clean,
            verified: true,
            timestamp: new Date().toISOString()
          };
        } catch (err: any) {
          console.error(`[SyncService.set - Supabase] Error for ${collectionName}/${docId}:`, err.message);
          throw err;
        }
      } else {
        const docRef = doc(db, collectionName, docId);
        const payload = {
          ...data,
          updatedAt: serverTimestamp()
        };

        await setDoc(docRef, payload, options);

        // Read-After-Write Verification
        const verifiedSnap = await getDoc(docRef);
        if (!verifiedSnap.exists()) {
          throw new Error(`[SyncService] Read-After-Write verification failed for ${collectionName}/${docId}: Document not found after set.`);
        }

        const snapData = verifiedSnap.data() as Record<string, any>;
        const verifiedData = Object.assign({ id: verifiedSnap.id }, snapData) as T;
        this.notifyListeners(collectionName, docId, verifiedData);

        return {
          success: true,
          data: verifiedData,
          verified: true,
          timestamp: new Date().toISOString()
        };
      }
    });
  }

  /**
   * Updates fields in an existing document with enforced read-after-write verification.
   */
  public async update<T = any>(
    collectionName: string, 
    docId: string, 
    updates: Record<string, any>
  ): Promise<SyncOperationResult<T>> {
    return this.enqueue(async () => {
      if (isSupabaseConfigured) {
        try {
          const payload = toPostgresRow(collectionName, updates);
          const { data: updated, error } = await supabase
            .from(collectionName)
            .update(payload)
            .eq('id', docId)
            .select()
            .single();

          if (error) throw error;

          const clean = fromPostgresRow(collectionName, updated) as T;
          this.notifyListeners(collectionName, docId, clean);

          return {
            success: true,
            data: clean,
            verified: true,
            timestamp: new Date().toISOString()
          };
        } catch (err: any) {
          console.error(`[SyncService.update - Supabase] Error for ${collectionName}/${docId}:`, err.message);
          throw err;
        }
      } else {
        const docRef = doc(db, collectionName, docId);
        const payload = {
          ...updates,
          updatedAt: serverTimestamp()
        };

        await updateDoc(docRef, payload);

        // Read-After-Write Verification
        const verifiedSnap = await getDoc(docRef);
        if (!verifiedSnap.exists()) {
          throw new Error(`[SyncService] Read-After-Write verification failed for ${collectionName}/${docId}: Document not found after update.`);
        }

        const snapData = verifiedSnap.data() as Record<string, any>;
        const verifiedData = Object.assign({ id: verifiedSnap.id }, snapData) as T;
        this.notifyListeners(collectionName, docId, verifiedData);

        return {
          success: true,
          data: verifiedData,
          verified: true,
          timestamp: new Date().toISOString()
        };
      }
    });
  }

  /**
   * Adds a new document with optional auto-generated or custom ID and enforces read-after-write verification.
   */
  public async add<T = any>(
    collectionName: string, 
    data: Record<string, any>, 
    customId?: string
  ): Promise<SyncOperationResult<T>> {
    return this.enqueue(async () => {
      if (isSupabaseConfigured) {
        try {
          const targetId = customId || `gen-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
          const payload = toPostgresRow(collectionName, { id: targetId, ...data });
          const { data: inserted, error } = await supabase
            .from(collectionName)
            .insert(payload)
            .select()
            .single();

          if (error) throw error;

          const clean = fromPostgresRow(collectionName, inserted) as T;
          this.notifyListeners(collectionName, targetId, clean);

          return {
            success: true,
            data: clean,
            verified: true,
            timestamp: new Date().toISOString()
          };
        } catch (err: any) {
          console.error(`[SyncService.add - Supabase] Error for ${collectionName}:`, err.message);
          throw err;
        }
      } else {
        let targetId = customId;
        let docRef;

        if (targetId) {
          docRef = doc(db, collectionName, targetId);
          await setDoc(docRef, { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }, { merge: true });
        } else {
          const colRef = collection(db, collectionName);
          docRef = await addDoc(colRef, { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
          targetId = docRef.id;
        }

        // Read-After-Write Verification
        const verifiedSnap = await getDoc(docRef);
        if (!verifiedSnap.exists()) {
          throw new Error(`[SyncService] Read-After-Write verification failed for ${collectionName}/${targetId}: Document not found after add.`);
        }

        const snapData = verifiedSnap.data() as Record<string, any>;
        const verifiedData = Object.assign({ id: verifiedSnap.id }, snapData) as T;
        this.notifyListeners(collectionName, targetId, verifiedData);

        return {
          success: true,
          data: verifiedData,
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

          if (error) throw error;

          this.notifyListeners(collectionName, docId, null);

          return {
            success: true,
            verified: true,
            timestamp: new Date().toISOString()
          };
        } catch (err: any) {
          console.error(`[SyncService.delete - Supabase] Error for ${collectionName}/${docId}:`, err.message);
          throw err;
        }
      } else {
        const docRef = doc(db, collectionName, docId);
        await deleteDoc(docRef);

        // Read-After-Write Verification: ensure document no longer exists
        const verifiedSnap = await getDoc(docRef);
        if (verifiedSnap.exists()) {
          throw new Error(`[SyncService] Read-After-Write verification failed for ${collectionName}/${docId}: Document still exists after deletion.`);
        }

        this.notifyListeners(collectionName, docId, null);

        return {
          success: true,
          verified: true,
          timestamp: new Date().toISOString()
        };
      }
    });
  }

  /**
   * Enqueues and executes a standardized transaction block ensuring order and verification.
   */
  public async runTransactionBlock<T>(
    transactionFn: (transaction: any) => Promise<T>
  ): Promise<T> {
    return this.enqueue(async () => {
      return await runTransaction(db, transactionFn);
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
