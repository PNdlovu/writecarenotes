/**
 * @fileoverview Pain Assessment Error Boundary
 * @version 1.0.0
 * @created 2024-03-21
 */

import { Component, ReactNode } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { logError } from '@/lib/logging';
import { TenantContext } from '@/lib/multi-tenant/types';

interface Props {
  children: ReactNode;
  tenantContext: TenantContext;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class PainAssessmentErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logError('PainAssessmentError', {
      error,
      errorInfo,
      tenantId: this.props.tenantContext.tenantId,
      region: this.props.tenantContext.region
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 border border-red-300 bg-red-50 rounded-md">
          <h3 className="text-red-800 font-medium">Error in Pain Assessment Module</h3>
          <p className="text-red-600">{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
} 