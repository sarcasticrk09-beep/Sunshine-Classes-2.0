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
