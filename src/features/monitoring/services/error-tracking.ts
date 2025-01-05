/**
 * @writecarenotes.com
 * @fileoverview Enterprise error tracking service
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Enterprise-grade error tracking service providing comprehensive error
 * monitoring, reporting, and analysis capabilities.
 */

import { Logger } from '@/lib/logger';
import { Metrics } from '@/lib/metrics';

interface ErrorEvent {
  id: string;
  timestamp: Date;
  type: string;
  message: string;
  stack?: string;
  context: ErrorContext;
  metadata: ErrorMetadata;
  severity: ErrorSeverity;
  status: ErrorStatus;
}

interface ErrorContext {
  userId?: string;
  tenantId?: string;
  sessionId?: string;
  url?: string;
  component?: string;
  action?: string;
  environment: string;
  browser?: {
    name: string;
    version: string;
    os: string;
  };
}

interface ErrorMetadata {
  tags: string[];
  custom: Record<string, any>;
  breadcrumbs: Breadcrumb[];
}

interface Breadcrumb {
  type: 'navigation' | 'action' | 'request' | 'state' | 'error';
  category: string;
  message: string;
  data?: Record<string, any>;
  timestamp: Date;
}

type ErrorSeverity = 'fatal' | 'error' | 'warning' | 'info';
type ErrorStatus = 'new' | 'investigating' | 'resolved' | 'ignored';

interface ErrorGroup {
  id: string;
  fingerprint: string;
  firstSeen: Date;
  lastSeen: Date;
  count: number;
  events: ErrorEvent[];
  status: ErrorStatus;
  assignee?: string;
}

export class ErrorTrackingService {
  private errors: Map<string, ErrorEvent> = new Map();
  private errorGroups: Map<string, ErrorGroup> = new Map();
  private breadcrumbs: Breadcrumb[] = [];
  private readonly maxBreadcrumbs = 50;
  private readonly maxErrorsPerGroup = 100;

  private logger: Logger;
  private metrics: Metrics;

  constructor() {
    this.logger = new Logger('ErrorTracking');
    this.metrics = new Metrics('errors');

    // Initialize global error handlers
    this.initializeErrorHandlers();
  }

  private initializeErrorHandlers(): void {
    if (typeof window !== 'undefined') {
      // Handle uncaught errors
      window.onerror = (message, source, lineno, colno, error) => {
        this.trackError(error || new Error(message as string), {
          type: 'uncaught',
          severity: 'error'
        });
      };

      // Handle unhandled promise rejections
      window.onunhandledrejection = (event) => {
        this.trackError(event.reason, {
          type: 'unhandledrejection',
          severity: 'error'
        });
      };

      // Handle network errors
      this.interceptFetchCalls();
      this.interceptXHRCalls();
    }
  }

  trackError(error: Error, options: {
    type?: string;
    severity?: ErrorSeverity;
    context?: Partial<ErrorContext>;
    metadata?: Partial<ErrorMetadata>;
  } = {}): void {
    try {
      const errorEvent = this.createErrorEvent(error, options);
      this.processError(errorEvent);
    } catch (e) {
      this.logger.error('Failed to track error', { error: e });
      this.metrics.increment('error_tracking_failures');
    }
  }

  addBreadcrumb(breadcrumb: Omit<Breadcrumb, 'timestamp'>): void {
    const fullBreadcrumb = {
      ...breadcrumb,
      timestamp: new Date()
    };

    this.breadcrumbs.push(fullBreadcrumb);

    // Keep only the most recent breadcrumbs
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs.shift();
    }
  }

  getError(id: string): ErrorEvent | null {
    return this.errors.get(id) || null;
  }

  getErrorGroup(id: string): ErrorGroup | null {
    return this.errorGroups.get(id) || null;
  }

  updateErrorStatus(id: string, status: ErrorStatus): void {
    const error = this.errors.get(id);
    if (error) {
      error.status = status;
      this.errors.set(id, error);

      // Update group status if all errors in group have same status
      const group = this.findGroupForError(error);
      if (group && group.events.every(e => e.status === status)) {
        group.status = status;
        this.errorGroups.set(group.id, group);
      }

      this.metrics.increment('error_status_updates');
    }
  }

  private createErrorEvent(error: Error, options: {
    type?: string;
    severity?: ErrorSeverity;
    context?: Partial<ErrorContext>;
    metadata?: Partial<ErrorMetadata>;
  }): ErrorEvent {
    const context = this.getErrorContext(options.context);
    const metadata = this.getErrorMetadata(options.metadata);

    return {
      id: this.generateErrorId(),
      timestamp: new Date(),
      type: options.type || 'error',
      message: error.message,
      stack: error.stack,
      context,
      metadata,
      severity: options.severity || 'error',
      status: 'new'
    };
  }

  private processError(error: ErrorEvent): void {
    // Store the error
    this.errors.set(error.id, error);

    // Group the error
    const fingerprint = this.generateErrorFingerprint(error);
    let group = Array.from(this.errorGroups.values())
      .find(g => g.fingerprint === fingerprint);

    if (!group) {
      group = {
        id: this.generateErrorId(),
        fingerprint,
        firstSeen: error.timestamp,
        lastSeen: error.timestamp,
        count: 0,
        events: [],
        status: 'new'
      };
      this.errorGroups.set(group.id, group);
    }

    // Update group
    group.lastSeen = error.timestamp;
    group.count++;
    group.events.push(error);

    // Keep only recent errors in group
    if (group.events.length > this.maxErrorsPerGroup) {
      group.events.shift();
    }

    this.errorGroups.set(group.id, group);

    // Record metrics
    this.recordErrorMetrics(error);

    // Log error
    this.logger.error('Error tracked', {
      errorId: error.id,
      groupId: group.id,
      message: error.message,
      type: error.type,
      severity: error.severity
    });
  }

  private getErrorContext(customContext: Partial<ErrorContext> = {}): ErrorContext {
    const context: ErrorContext = {
      environment: process.env.NODE_ENV || 'development',
      ...this.getBrowserContext(),
      ...customContext
    };

    if (typeof window !== 'undefined') {
      context.url = window.location.href;
    }

    return context;
  }

  private getBrowserContext(): Partial<ErrorContext> {
    if (typeof window === 'undefined') return {};

    const userAgent = window.navigator.userAgent;
    const browser = {
      name: this.getBrowserName(userAgent),
      version: this.getBrowserVersion(userAgent),
      os: this.getOperatingSystem(userAgent)
    };

    return { browser };
  }

  private getErrorMetadata(customMetadata: Partial<ErrorMetadata> = {}): ErrorMetadata {
    return {
      tags: customMetadata.tags || [],
      custom: customMetadata.custom || {},
      breadcrumbs: [...this.breadcrumbs]
    };
  }

  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateErrorFingerprint(error: ErrorEvent): string {
    // Create a fingerprint based on error properties
    const components = [
      error.type,
      error.message,
      error.stack?.split('\n')[1] || '', // First stack frame
      error.context.component || '',
      error.context.action || ''
    ];

    return components.join('|');
  }

  private findGroupForError(error: ErrorEvent): ErrorGroup | null {
    const fingerprint = this.generateErrorFingerprint(error);
    return Array.from(this.errorGroups.values())
      .find(g => g.fingerprint === fingerprint) || null;
  }

  private recordErrorMetrics(error: ErrorEvent): void {
    this.metrics.increment('errors_total');
    this.metrics.increment(`errors_by_type.${error.type}`);
    this.metrics.increment(`errors_by_severity.${error.severity}`);

    if (error.context.component) {
      this.metrics.increment(`errors_by_component.${error.context.component}`);
    }
  }

  private interceptFetchCalls(): void {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        if (!response.ok) {
          this.trackError(new Error(`HTTP ${response.status}`), {
            type: 'http',
            severity: 'error',
            context: {
              url: args[0] as string
            }
          });
        }
        return response;
      } catch (error) {
        this.trackError(error as Error, {
          type: 'network',
          severity: 'error',
          context: {
            url: args[0] as string
          }
        });
        throw error;
      }
    };
  }

  private interceptXHRCalls(): void {
    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(...args) {
      this.addEventListener('error', () => {
        this.trackError(new Error('XHR Error'), {
          type: 'network',
          severity: 'error',
          context: {
            url: args[1] as string
          }
        });
      });
      return originalOpen.apply(this, args);
    };
  }

  private getBrowserName(userAgent: string): string {
    // Implement browser name detection
    return 'unknown';
  }

  private getBrowserVersion(userAgent: string): string {
    // Implement browser version detection
    return 'unknown';
  }

  private getOperatingSystem(userAgent: string): string {
    // Implement OS detection
    return 'unknown';
  }
}

export const errorTrackingService = new ErrorTrackingService(); 