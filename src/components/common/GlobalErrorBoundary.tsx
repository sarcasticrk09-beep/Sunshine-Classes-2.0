import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorPage } from '../../pages/ErrorPage';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Sunshine ERP Uncaught Error caught by GlobalErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });

    const errorMsg = String(error?.message || '');
    const isChunkError =
      error?.name === 'ChunkLoadError' ||
      errorMsg.includes('Failed to fetch dynamically imported module') ||
      errorMsg.includes('dynamically imported module') ||
      errorMsg.includes('Loading chunk') ||
      errorMsg.includes('Importing a module script failed') ||
      errorMsg.includes('error loading dynamically imported module');

    if (isChunkError && typeof window !== 'undefined') {
      const reloadKey = 'sunshine_boundary_chunk_reload';
      const lastReload = parseInt(sessionStorage.getItem(reloadKey) || '0', 10);
      const now = Date.now();
      if (now - lastReload > 12000) {
        sessionStorage.setItem(reloadKey, String(now));
        console.warn('[GlobalErrorBoundary] Dynamic chunk load failure caught. Auto-reloading to fetch current app build...');
        window.location.reload();
      }
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      const errorMsg = this.state.error?.message || 'An unexpected rendering error occurred.';
      const componentStack = this.state.errorInfo?.componentStack || '';
      const stack = this.state.error?.stack || '';
      const fullDetails = `${errorMsg}\n\nCall Stack:\n${stack}\n\nComponent Hierarchy:\n${componentStack}`;

      const isChunkError =
        this.state.error?.name === 'ChunkLoadError' ||
        errorMsg.includes('Failed to fetch dynamically imported module') ||
        errorMsg.includes('dynamically imported module') ||
        errorMsg.includes('Loading chunk') ||
        errorMsg.includes('Importing a module script failed') ||
        errorMsg.includes('error loading dynamically imported module');

      if (isChunkError) {
        return (
          <ErrorPage
            defaultStatusCode="UPDATE_AVAILABLE"
            defaultTitle="New Application Version Available"
            defaultMessage="Sunshine Classes ERP has been updated with new features and improvements. Please refresh the page to load the latest version."
            errorDetails={fullDetails}
            onRetry={() => {
              if (typeof window !== 'undefined') {
                window.location.reload();
              }
            }}
          />
        );
      }

      return (
        <ErrorPage
          defaultStatusCode="APP_RENDER_ERROR"
          defaultTitle="An Unexpected Application Error Occurred"
          defaultMessage="Sunshine ERP encountered an issue while rendering this section. Your credentials and stored student data are completely safe."
          errorDetails={fullDetails}
          onRetry={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}
