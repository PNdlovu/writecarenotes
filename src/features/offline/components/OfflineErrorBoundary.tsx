/**
 * @fileoverview Offline error boundary component
 * @version 1.0.0
 * @created 2024-03-21
 */

'use client';

import React from 'react';
import { OfflineError } from '../types/errors';

export interface OfflineErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: OfflineError) => void;
}

interface State {
  hasError: boolean;
  error: OfflineError | null;
}

export class OfflineErrorBoundary extends React.Component<OfflineErrorBoundaryProps, State> {
  constructor(props: OfflineErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error: error instanceof OfflineError ? error : new OfflineError(error.message, {
        cause: error
      })
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error
    console.error('Offline Error:', error);
    console.error('Error Info:', errorInfo);

    // Notify parent
    if (this.props.onError && error instanceof OfflineError) {
      this.props.onError(error);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="offline-error">
          <div className="offline-error__content">
            <div className="offline-error__icon">⚠️</div>
            <h2 className="offline-error__title">Offline Error</h2>
            <p className="offline-error__message">
              {this.state.error?.message || 'An error occurred while processing offline data.'}
            </p>
            {this.state.error?.options.details && (
              <pre className="offline-error__details">
                {JSON.stringify(this.state.error.options.details, null, 2)}
              </pre>
            )}
            <button
              className="offline-error__button"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </button>
          </div>

          <style jsx>{`
            .offline-error {
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 400px;
              padding: 2rem;
              background: var(--background-secondary);
              border-radius: 0.5rem;
            }

            .offline-error__content {
              text-align: center;
              max-width: 32rem;
            }

            .offline-error__icon {
              font-size: 3rem;
              margin-bottom: 1rem;
            }

            .offline-error__title {
              font-size: 1.5rem;
              font-weight: 600;
              color: var(--text-primary);
              margin-bottom: 0.5rem;
            }

            .offline-error__message {
              color: var(--text-secondary);
              margin-bottom: 1rem;
            }

            .offline-error__details {
              background: var(--background-tertiary);
              padding: 1rem;
              border-radius: 0.25rem;
              font-size: 0.875rem;
              color: var(--text-secondary);
              text-align: left;
              overflow-x: auto;
              margin-bottom: 1rem;
            }

            .offline-error__button {
              padding: 0.5rem 1rem;
              border-radius: 0.25rem;
              background: var(--primary);
              color: white;
              border: none;
              font-size: 0.875rem;
              cursor: pointer;
              transition: background 0.2s ease;
            }

            .offline-error__button:hover {
              background: var(--primary-dark);
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

export function OfflineErrorHandler({
  error,
  reset
}: {
  error: Error;
  reset: () => void;
}) {
  const offlineError = error instanceof OfflineError
    ? error
    : new OfflineError(error.message, { cause: error });

  return (
    <div className="offline-error-handler">
      <div className="offline-error-handler__content">
        <div className="offline-error-handler__icon">⚠️</div>
        <h2 className="offline-error-handler__title">Offline Error</h2>
        <p className="offline-error-handler__message">
          {offlineError.message}
        </p>
        {offlineError.options.details && (
          <pre className="offline-error-handler__details">
            {JSON.stringify(offlineError.options.details, null, 2)}
          </pre>
        )}
        <div className="offline-error-handler__actions">
          <button
            className="offline-error-handler__button offline-error-handler__button--primary"
            onClick={reset}
          >
            Try Again
          </button>
          <button
            className="offline-error-handler__button"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      </div>

      <style jsx>{`
        .offline-error-handler {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          padding: 2rem;
          background: var(--background-secondary);
          border-radius: 0.5rem;
        }

        .offline-error-handler__content {
          text-align: center;
          max-width: 32rem;
        }

        .offline-error-handler__icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .offline-error-handler__title {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .offline-error-handler__message {
          color: var(--text-secondary);
          margin-bottom: 1rem;
        }

        .offline-error-handler__details {
          background: var(--background-tertiary);
          padding: 1rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
          color: var(--text-secondary);
          text-align: left;
          overflow-x: auto;
          margin-bottom: 1rem;
        }

        .offline-error-handler__actions {
          display: flex;
          gap: 0.5rem;
          justify-content: center;
        }

        .offline-error-handler__button {
          padding: 0.5rem 1rem;
          border-radius: 0.25rem;
          background: var(--background-primary);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .offline-error-handler__button:hover {
          background: var(--background-secondary);
        }

        .offline-error-handler__button--primary {
          background: var(--primary);
          color: white;
          border: none;
        }

        .offline-error-handler__button--primary:hover {
          background: var(--primary-dark);
        }
      `}</style>
    </div>
  );
}
