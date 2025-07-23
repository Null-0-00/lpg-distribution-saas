'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: Array<string | number>;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  componentDidUpdate(prevProps: Props) {
    const { resetKeys } = this.props;
    const { hasError } = this.state;

    if (hasError && prevProps.resetKeys !== resetKeys) {
      if (
        resetKeys?.some(
          (resetKey, idx) => prevProps.resetKeys?.[idx] !== resetKey
        )
      ) {
        this.resetErrorBoundary();
      }
    }
  }

  resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    this.resetTimeoutId = window.setTimeout(() => {
      this.setState({ hasError: false, error: undefined });
    }, 0);
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <div className="mb-4 flex items-center space-x-3">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <h3 className="text-sm font-medium text-red-800">
              Something went wrong
            </h3>
          </div>

          <div className="mb-4 text-sm text-red-700">
            {this.state.error?.message ||
              'An unexpected error occurred in this section.'}
          </div>

          <button
            onClick={this.resetErrorBoundary}
            className="inline-flex items-center rounded-md bg-red-100 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            <RefreshCw className="mr-1 h-4 w-4" />
            Try Again
          </button>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium text-red-800">
                Error Details (Development)
              </summary>
              <pre className="mt-2 overflow-auto rounded bg-red-100 p-2 text-xs text-red-600">
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook-based error boundary for functional components
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { captureError, resetError };
}

// Specialized dashboard section error boundary
interface DashboardSectionErrorBoundaryProps {
  children: ReactNode;
  sectionName: string;
  onRetry?: () => void;
}

export function DashboardSectionErrorBoundary({
  children,
  sectionName,
  onRetry,
}: DashboardSectionErrorBoundaryProps) {
  return (
    <ErrorBoundary
      fallback={
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
          <div className="mb-2 flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <h4 className="text-sm font-medium text-orange-800">
              {sectionName} Unavailable
            </h4>
          </div>

          <p className="mb-3 text-sm text-orange-700">
            This section encountered an error and couldn&apos;t load properly.
          </p>

          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center rounded bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700 hover:bg-orange-200 focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <RefreshCw className="mr-1 h-3 w-3" />
              Retry
            </button>
          )}
        </div>
      }
      onError={(error, errorInfo) => {
        console.error(
          `Dashboard section "${sectionName}" error:`,
          error,
          errorInfo
        );
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
