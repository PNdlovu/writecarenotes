import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from "@/components/ui/Button/Button";
import { AlertTriangle } from "lucide-react";
import { captureException } from '@/lib/error-tracking';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class StaffErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Staff module error:', error, errorInfo);
    captureException(error, {
      extra: {
        componentStack: errorInfo.componentStack,
        module: 'staff',
      },
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6 space-y-4 text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500" />
          <h2 className="text-2xl font-semibold">Something went wrong</h2>
          <p className="text-gray-600 max-w-md">
            We apologize for the inconvenience. The error has been logged and our team will investigate.
          </p>
          <div className="space-x-4">
            <Button onClick={this.handleReset}>Try Again</Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}


