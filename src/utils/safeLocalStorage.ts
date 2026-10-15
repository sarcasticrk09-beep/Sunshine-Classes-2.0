/**
 * Utility for safe localStorage operations in Sunshine ERP.
 * Prevents QuotaExceededError crashes when local storage reaches browser limits (5MB).
 * Automatically prunes bloated caches, strips heavy base64 strings, and falls back to in-memory storage seamlessly.
 */

// Global in-memory storage fallback when localStorage quota is completely full
declare global {
  interface Window {
    __sunshine_memory_storage?: Record<string, string>;
  }
}

if (typeof window !== 'undefined') {
  window.__sunshine_memory_storage = window.__sunshine_memory_storage || {};
}

/**
 * Sanitize heavy data payload by removing large base64 data URLs / file data strings
 */
export function sanitizePayloadForStorage(value: any): any {
  if (!value) return value;
  
  if (Array.isArray(value)) {
    return value.map(item => sanitizePayloadForStorage(item));
  }

  if (typeof value === 'object') {
    const copy: Record<string, any> = {};
    for (const key of Object.keys(value)) {
      const val = value[key];
      // Strip inline base64 string if larger than 1KB
      if (typeof val === 'string' && val.startsWith('data:') && val.length > 1024) {
        copy[key] = ''; // clear heavy base64 asset from cache
      } else if (key === 'fileData' && typeof val === 'string' && val.length > 500) {
        copy[key] = '';
      } else if (key === 'pdfData' && typeof val === 'string' && val.length > 500) {
        copy[key] = '';
      } else if (typeof val === 'object' && val !== null) {
        copy[key] = sanitizePayloadForStorage(val);
      } else {
        copy[key] = val;
      }
    }
    return copy;
  }

  return value;
}

/**
 * Prune non-critical large keys in localStorage to free up space
 */
export function pruneStorageCache(): void {
  if (typeof window === 'undefined') return;

  try {
    // 1. Trim local backup archives if present
    const archivesRaw = localStorage.getItem('sunshine_local_backups_archive');
    if (archivesRaw) {
      try {
        const archives = JSON.parse(archivesRaw);
        if (Array.isArray(archives) && archives.length > 2) {
          // Keep only the 2 most recent backups
          localStorage.setItem('sunshine_local_backups_archive', JSON.stringify(archives.slice(0, 2)));
        }
      } catch {
        localStorage.removeItem('sunshine_local_backups_archive');
      }
    }

    // 2. Trim audit logs
    const auditLogsRaw = localStorage.getItem('sunshine_audit_logs');
    if (auditLogsRaw) {
      try {
        const auditLogs = JSON.parse(auditLogsRaw);
        if (Array.isArray(auditLogs) && auditLogs.length > 30) {
          localStorage.setItem('sunshine_audit_logs', JSON.stringify(auditLogs.slice(0, 30)));
        }
      } catch {
        localStorage.removeItem('sunshine_audit_logs');
      }
    }

    // 3. Trim bulk notification history & sent emails
    const notifsRaw = localStorage.getItem('sunshine_bulk_notif_history');
    if (notifsRaw) {
      try {
        const notifs = JSON.parse(notifsRaw);
        if (Array.isArray(notifs) && notifs.length > 20) {
          localStorage.setItem('sunshine_bulk_notif_history', JSON.stringify(notifs.slice(0, 20)));
        }
      } catch {
        localStorage.removeItem('sunshine_bulk_notif_history');
      }
    }

    const emailsRaw = localStorage.getItem('sunshine_sent_emails');
    if (emailsRaw) {
      try {
        const emails = JSON.parse(emailsRaw);
        if (Array.isArray(emails) && emails.length > 20) {
          localStorage.setItem('sunshine_sent_emails', JSON.stringify(emails.slice(0, 20)));
        }
      } catch {
        localStorage.removeItem('sunshine_sent_emails');
      }
    }
  } catch (e) {
    console.warn('[safeLocalStorage] Error during storage pruning:', e);
  }
}

/**
 * Safely sets an item in localStorage with quota error fallback & automatic cleanup
 */
export function safeSetItem(key: string, value: string): boolean {
  if (typeof window === 'undefined') return false;

  // 1. First attempt: standard localStorage.setItem
  try {
    localStorage.setItem(key, value);
    if (window.__sunshine_memory_storage) {
      window.__sunshine_memory_storage[key] = value;
    }
    return true;
  } catch (err: any) {
    console.warn(`[safeLocalStorage] Quota error on key "${key}". Running cache cleanup & sanitization...`);
  }

  // 2. Second attempt: Prune non-essential cache keys and retry
  try {
    pruneStorageCache();
    localStorage.setItem(key, value);
    if (window.__sunshine_memory_storage) {
      window.__sunshine_memory_storage[key] = value;
    }
    return true;
  } catch (err: any) {
    // Continue to next mitigation step
  }

  // 3. Third attempt: Try sanitizing payload (strip base64 strings if JSON)
  try {
    const parsed = JSON.parse(value);
    const sanitized = sanitizePayloadForStorage(parsed);
    const sanitizedStr = JSON.stringify(sanitized);
    localStorage.setItem(key, sanitizedStr);
    if (window.__sunshine_memory_storage) {
      window.__sunshine_memory_storage[key] = sanitizedStr;
    }
    return true;
  } catch (err: any) {
    // Continue to in-memory fallback
  }

  // 4. Final fallback: Store safely in memory so application state never breaks or crashes
  try {
    if (window.__sunshine_memory_storage) {
      window.__sunshine_memory_storage[key] = value;
    }
    console.warn(`[safeLocalStorage] LocalStorage completely full. Kept key "${key}" in safe in-memory store.`);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Safely gets an item from localStorage or in-memory fallback
 */
export function safeGetItem(key: string): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const item = localStorage.getItem(key);
    if (item !== null) return item;
  } catch (e) {
    // Quota or access error
  }

  if (window.__sunshine_memory_storage && window.__sunshine_memory_storage[key] !== undefined) {
    return window.__sunshine_memory_storage[key];
  }

  return null;
}

/**
 * Safely removes an item from localStorage and in-memory store
 */
export function safeRemoveItem(key: string): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(key);
  } catch (e) {
    // ignore
  }

  if (window.__sunshine_memory_storage) {
    delete window.__sunshine_memory_storage[key];
  }
}
