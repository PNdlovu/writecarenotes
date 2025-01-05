import { ErrorInfo } from 'react';

interface ErrorReport {
  error: Error;
  errorInfo?: ErrorInfo;
  context?: Record<string, unknown>;
  timestamp: string;
  url: string;
  userAgent: string;
}

export function reportError(error: Error, errorInfo?: ErrorInfo, context?: Record<string, unknown>): void {
  const errorReport: ErrorReport = {
    error,
    errorInfo,
    context,
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : '',
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : ''
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error Report:', errorReport);
  }

  // TODO: Send to error reporting service (e.g., Sentry)
  // if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  //   Sentry.captureException(error, {
  //     extra: {
  //       errorInfo,
  //       context,
  //       url: errorReport.url
  //     }
  //   });
  // }
}

export function handleApiError(error: unknown): never {
  if (error instanceof Error) {
    reportError(error);
    throw error;
  }
  
  const unknownError = new Error(
    error instanceof Object ? JSON.stringify(error) : String(error)
  );
  reportError(unknownError);
  throw unknownError;
}

export function createErrorBoundaryHandler(componentName: string) {
  return function handleError(error: Error, errorInfo: ErrorInfo) {
    reportError(error, errorInfo, { componentName });
  };
}


