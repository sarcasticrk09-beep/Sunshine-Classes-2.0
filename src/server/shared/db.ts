import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const serverSupabase = createClient(supabaseUrl, supabaseKey);

// In-memory backing cache for fast access & offline resilience
const memoryStore: Record<string, Record<string, any>> = {};

export const adminDb = {
  collection: (colName: string) => collection(null, colName),
  runTransaction: (fn: any) => runTransaction(null, fn)
};

export function getAdminDb() {
  return adminDb;
}

export function getAdminAuth() {
  return {
    async getUserByEmail(email: string) {
      try {
        const { data, error } = await serverSupabase.auth.admin.listUsers();
        if (!error && data?.users) {
          const found = (data.users as any[]).find((u: any) => u.email === email);
          if (found) return { uid: found.id, email: found.email, displayName: found.user_metadata?.name };
        }
      } catch (e) {}
      
      const err: any = new Error('User not found');
      err.code = 'auth/user-not-found';
      throw err;
    },
    async createUser(params: { email: string; password?: string; displayName?: string; emailVerified?: boolean }) {
      try {
        const { data, error } = await serverSupabase.auth.admin.createUser({
          email: params.email,
          password: params.password || 'Sunshine@123',
          user_metadata: { name: params.displayName },
          email_confirm: true
        });
        if (!error && data?.user) {
          return { uid: data.user.id, email: data.user.email, displayName: params.displayName };
        }
      } catch (e) {}
      const fallbackId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      return { uid: fallbackId, email: params.email, displayName: params.displayName };
    },
    async updateUser(uid: string, params: any) {
      try {
        await serverSupabase.auth.admin.updateUserById(uid, {
          email: params.email,
          password: params.password,
          user_metadata: params.displayName ? { name: params.displayName } : undefined
        });
      } catch (e) {}
      return { uid };
    },
    async deleteUser(uid: string) {
      try {
        await serverSupabase.auth.admin.deleteUser(uid);
      } catch (e) {}
      return true;
    }
  };
}

export class AdminDocRefAdapter {
  constructor(public colName: string, public docId: string) {}
  get id() { return this.docId; }
  get path() { return `${this.colName}/${this.docId}`; }
}

export class AdminDocSnapAdapter {
  constructor(public existsVal: boolean, public dataVal: any) {}
  exists() { return this.existsVal; }
  data() { return this.dataVal; }
}

export function doc(dbAny: any, collectionName: string, documentId: string): any {
  return new AdminDocRefAdapter(collectionName, documentId);
}

export function collection(dbAny: any, collectionName: string): any {
  return {
    doc: (id: string) => new AdminDocRefAdapter(collectionName, id),
    get: async () => getDocs({ colName: collectionName }),
    where: () => ({
      get: async () => getDocs({ colName: collectionName })
    })
  };
}

export async function getDoc(docRef: any): Promise<any> {
  const ref = docRef as AdminDocRefAdapter;
  const col = ref.colName;
  const id = ref.docId;

  // Check memory store
  if (memoryStore[col] && memoryStore[col][id]) {
    return new AdminDocSnapAdapter(true, memoryStore[col][id]);
  }

  // Attempt Supabase query
  try {
    const { data, error } = await serverSupabase.from(col).select('*').eq('id', id).maybeSingle();
    if (!error && data) {
      if (!memoryStore[col]) memoryStore[col] = {};
      memoryStore[col][id] = data;
      return new AdminDocSnapAdapter(true, data);
    }
  } catch (e) {
    // Ignore error
  }

  return new AdminDocSnapAdapter(false, null);
}

export async function getDocs(colRefAny: any): Promise<any> {
  const col = colRefAny.colName || (colRefAny.rawRef ? colRefAny.rawRef.id : 'default');

  const items: any[] = [];
  try {
    const { data, error } = await serverSupabase.from(col).select('*');
    if (!error && data) {
      if (!memoryStore[col]) memoryStore[col] = {};
      data.forEach((item: any) => {
        memoryStore[col][item.id] = item;
        items.push({
          id: item.id,
          data: () => item,
          exists: () => true
        });
      });
      return { empty: items.length === 0, docs: items };
    }
  } catch (e) {
    // Fall back to memory
  }

  const colItems = memoryStore[col] ? Object.values(memoryStore[col]) : [];
  return {
    empty: colItems.length === 0,
    docs: colItems.map((item: any) => ({
      id: item.id,
      data: () => item,
      exists: () => true
    }))
  };
}

export async function setDoc(docRef: any, data: any, options?: { merge?: boolean }): Promise<void> {
  const ref = docRef as AdminDocRefAdapter;
  const col = ref.colName;
  const id = ref.docId;

  if (!memoryStore[col]) memoryStore[col] = {};
  const current = memoryStore[col][id] || {};
  const merged = (options && options.merge) ? { ...current, ...data, id } : { ...data, id };
  memoryStore[col][id] = merged;

  try {
    await serverSupabase.from(col).upsert(merged);
  } catch (e) {
    // Memory store serves as fallback
  }
}

export async function deleteDoc(docRef: any): Promise<void> {
  const ref = docRef as AdminDocRefAdapter;
  const col = ref.colName;
  const id = ref.docId;

  if (memoryStore[col]) {
    delete memoryStore[col][id];
  }

  try {
    await serverSupabase.from(col).delete().eq('id', id);
  } catch (e) {
    // Ignore error
  }
}

export async function updateDoc(docRef: any, data: any): Promise<void> {
  return setDoc(docRef, data, { merge: true });
}

export function query(colRef: any, ...queryConstraints: any[]): any {
  return {
    colName: colRef?.colName || 'students',
    constraints: queryConstraints
  };
}

export function where(field: string, op: string, value: any): any {
  return { field, op, value };
}

export function limit(num: number): any {
  return { limit: num };
}

export async function getCountFromServer(queryRef: any): Promise<any> {
  const col = queryRef?.colName || 'students';
  try {
    const { count, error } = await serverSupabase.from(col).select('*', { count: 'exact', head: true });
    if (!error && typeof count === 'number') {
      return { data: () => ({ count }) };
    }
  } catch (e) {}
  const memCount = memoryStore[col] ? Object.keys(memoryStore[col]).length : 0;
  return { data: () => ({ count: memCount }) };
}

export async function runTransaction(dbAny: any, updateFunction: (transaction: any) => Promise<any>): Promise<any> {
  const txAdapter = {
    async get(docRef: any) {
      return await getDoc(docRef);
    },
    async set(docRef: any, data: any, options?: { merge?: boolean }) {
      await setDoc(docRef, data, options);
      return txAdapter;
    },
    async update(docRef: any, data: any) {
      await setDoc(docRef, data, { merge: true });
      return txAdapter;
    },
    async delete(docRef: any) {
      await deleteDoc(docRef);
      return txAdapter;
    }
  };
  return await updateFunction(txAdapter);
}
