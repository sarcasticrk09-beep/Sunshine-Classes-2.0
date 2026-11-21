import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { AuthProvider } from './auth/AuthProvider.tsx';
import { GlobalErrorBoundary } from './components/common/GlobalErrorBoundary.tsx';
import { registerServiceWorker } from './serviceWorkerRegistration.ts';
import './index.css';

// Register PWA Service Worker
registerServiceWorker();

// Handle Vite dynamic import preload failures and Google Maps Platform quota events
if (typeof window !== 'undefined') {
  (window as unknown as { gm_authFailure?: () => void }).gm_authFailure = () => {
    window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
  };

  const origConsoleError = console.error;
  console.error = (...args: unknown[]) => {
    origConsoleError.apply(console, args);
    const msg = args.map((a) => String(a)).join(' ');
    if (msg.includes('OverQuotaMapError') || msg.includes('QuotaExceededError')) {
      window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
    }
  };

  window.addEventListener('vite:preloadError', (event) => {
    console.warn('[Vite] Dynamic import preload error detected. Auto-refreshing to load current deployment bundle...', event);
    const reloadKey = 'sunshine_vite_preload_reload';
    const lastReload = parseInt(sessionStorage.getItem(reloadKey) || '0', 10);
    const now = Date.now();
    if (now - lastReload > 12000) {
      sessionStorage.setItem(reloadKey, String(now));
      window.location.reload();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <GlobalErrorBoundary>
        <AuthProvider>
          <App />
        </AuthProvider>
      </GlobalErrorBoundary>
    </BrowserRouter>
  </StrictMode>,
);

