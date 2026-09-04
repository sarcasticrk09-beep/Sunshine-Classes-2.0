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

