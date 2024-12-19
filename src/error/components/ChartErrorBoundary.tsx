import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorBoundary } from './ErrorBoundary';
import { createErrorBoundaryHandler } from '../utils/errorReporting';

interface ChartErrorConfig {
  retry?: {
    count: number;
    delay: number;
  };
  reporting?: {
    level: string;
    tags: string[];
    service: string;
  };
}

interface ChartErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  config?: ChartErrorConfig;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export function ChartErrorBoundary({ children, fallback, config, onError }: ChartErrorBoundaryProps) {
  const [retryCount, setRetryCount] = React.useState(0);
  const retryTimeoutRef = React.useRef<NodeJS.Timeout>();

  const handleError = createErrorBoundaryHandler('ChartErrorBoundary');

  const handleRetry = React.useCallback(() => {
    if (config?.retry && retryCount < config.retry.count) {
      retryTimeoutRef.current = setTimeout(() => {
        setRetryCount(count => count + 1);
      }, config.retry.delay);
    }
  }, [config?.retry, retryCount]);

  React.useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  const chartFallback = React.useCallback(
    ({ error }: { error?: Error }) => {
      if (fallback) {
        return <>{fallback}</>;
      }

      const canRetry = config?.retry && retryCount < config.retry.count;

      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive flex items-center">
              <AlertCircle className="mr-2 h-4 w-4" />
              Chart Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                There was an error loading this chart.
                {canRetry && ` Retry attempt ${retryCount + 1} of ${config.retry.count}`}
              </p>
              {process.env.NODE_ENV === 'development' && error && (
                <pre className="mt-2 text-xs text-destructive/80 bg-muted p-2 rounded">
                  {error.message}
                </pre>
              )}
              {canRetry && (
                <button
                  onClick={handleRetry}
                  className="mt-2 text-sm text-primary hover:underline"
                >
                  Try Again
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      );
    },
    [config?.retry, fallback, handleRetry, retryCount]
  );

  return (
    <ErrorBoundary
      fallback={chartFallback}
      onError={(error, errorInfo) => {
        handleError(error, errorInfo);
        onError?.(error, errorInfo);
      }}
      componentName="ChartErrorBoundary"
    >
      {children}
    </ErrorBoundary>
  );
}


