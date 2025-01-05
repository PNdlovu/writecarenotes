import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useToast } from '@/hooks/useToast';
import { useRegion } from '@/hooks/useRegion';
import { ErrorBoundaryFallback } from '@/components/ui/ErrorBoundaryFallback';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component for the Care Home module.
 * Handles runtime errors and provides graceful fallbacks.
 * 
 * @example
 * ```tsx
 * <CareHomeErrorBoundary>
 *   <CareHomeDashboard />
 * </CareHomeErrorBoundary>
 * ```
 */
export class CareHomeErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Care Home Error:', error, errorInfo);
    
    // Log to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error);
      const errorData = {
        error,
        errorInfo,
        timestamp: new Date().toISOString(),
        module: 'CareHome'
      };
      
      fetch('/api/error-logging', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorData)
      }).catch(console.error);
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <ErrorBoundaryFallback
          error={this.state.error}
          resetError={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}


