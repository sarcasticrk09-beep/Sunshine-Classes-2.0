/// <reference types="vite/client" />
import { SyncService } from "../services/SyncService";
import { supabase } from "./supabase";

// In-memory token storage
let cachedAccessToken: string | null = null;

export const getCachedAccessToken = (): string | null => cachedAccessToken;
export const setCachedAccessToken = (token: string | null): void => {
  cachedAccessToken = token;
};

export function clearCachedAccessToken(): void {
  cachedAccessToken = null;
}

// In-memory Auth Token storage
let cachedIdToken: string | null = null;
export const getCachedIdToken = (): string | null => cachedIdToken;
export const setCachedIdToken = (token: string | null): void => {
  cachedIdToken = token;
};

export const auth = {
  currentUser: null,
  signOut: async () => {
    await supabase.auth.signOut();
  }
};

export const db = {} as any;

/**
 * Generic helper to fetch all items in a collection.
 */
export async function fetchCollection<T>(collectionName: string): Promise<T[]> {
  return await SyncService.list<T>(collectionName);
}

/**
 * Generic helper to save or update an item in a collection by ID.
 */
export async function saveDocument(collectionName: string, id: string, data: any): Promise<void> {
  await SyncService.set(collectionName, id, data, { merge: true });
}

/**
 * Generic helper to add a new document.
 */
export async function addDocument(collectionName: string, data: any): Promise<string> {
  const newId = data.id || `doc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  await SyncService.set(collectionName, newId, { ...data, id: newId });
  return newId;
}

/**
 * Seeds collection with default local SEED data if collection is currently empty.
 */
export async function seedFirestoreIfEmpty(
  collectionName: string, 
  seedData: any[]
): Promise<boolean> {
  try {
    const list = await SyncService.list(collectionName);
    if (list.length === 0 && seedData.length > 0) {
      for (const item of seedData) {
        const id = item.id || `seed-${Math.random().toString(36).substr(2, 9)}`;
        await SyncService.set(collectionName, id, item);
      }
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error seeding collection ${collectionName}:`, error);
    return false;
  }
}

export async function googleSignIn(): Promise<any> {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google'
  });
  if (error) throw error;
  return data;
}

export async function googleSignInForGmail(): Promise<{ user: { email?: string }; accessToken: string }> {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      scopes: 'https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly'
    }
  });
  if (error) throw error;
  const token = (data as any)?.session?.provider_token || (data as any)?.session?.access_token || '';
  const email = (data as any)?.session?.user?.email || '';
  return { user: { email }, accessToken: token };
}
