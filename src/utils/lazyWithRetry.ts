import { lazy, ComponentType, LazyExoticComponent } from 'react';

/**
 * Enhanced React.lazy wrapper that automatically handles chunk loading failures,
 * transient network interruptions, and stale chunk hash mismatches following new deployments.
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  componentName?: string
): LazyExoticComponent<T> {
  return lazy(async () => {
    const key = `sunshine_chunk_reload_${componentName || 'chunk'}`;
    const hasReloaded = typeof window !== 'undefined' && sessionStorage.getItem(key) === 'true';

    try {
      const module = await factory();
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(key);
      }
      return module;
    } catch (error: any) {
      console.warn(`[lazyWithRetry] Error loading chunk "${componentName || 'component'}":`, error);

      const errorMsg = String(error?.message || '');
      const isChunkError =
        error?.name === 'ChunkLoadError' ||
        errorMsg.includes('Failed to fetch dynamically imported module') ||
        errorMsg.includes('dynamically imported module') ||
        errorMsg.includes('Loading chunk') ||
        errorMsg.includes('Importing a module script failed') ||
        errorMsg.includes('error loading dynamically imported module');

      // Attempt one automatic cache-busting refresh if a version mismatch / chunk error occurs
      if (typeof window !== 'undefined' && !hasReloaded && isChunkError) {
        sessionStorage.setItem(key, 'true');
        console.info(`[lazyWithRetry] Stale chunk detected for "${componentName || 'component'}". Refreshing window to synchronize with latest release...`);

        // If service worker exists, ask it to skip waiting and clear stale asset caches
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
        }

        // Force browser reload
        window.location.reload();

        // Return an unresolving promise so React does not crash before reload finishes
        return new Promise<{ default: T }>(() => {});
      }

      // If we already refreshed or error persists, propagate to GlobalErrorBoundary
      throw error;
    }
  });
}
