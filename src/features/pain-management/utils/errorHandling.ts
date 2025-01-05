/**
 * @fileoverview Pain Management Error Handling
 * @version 1.0.0
 * @created 2024-03-21
 */

import { logError } from '@/lib/logging';
import { TenantContext } from '@/lib/multi-tenant/types';

export class PainManagementError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'PainManagementError';
  }
}

export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  tenantContext: TenantContext,
  options: {
    retryCount?: number;
    retryDelay?: number;
    critical?: boolean;
  } = {}
): Promise<T> {
  const { retryCount = 3, retryDelay = 1000, critical = false } = options;
  let lastError: Error;

  for (let attempt = 1; attempt <= retryCount; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      logError('PainManagementOperation', {
        error,
        attempt,
        tenantId: tenantContext.tenantId,
        region: tenantContext.region,
        critical
      });

      if (attempt < retryCount) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
      }
    }
  }

  if (critical) {
    // Notify on-call team for critical failures
    await notifyCriticalError(lastError!, tenantContext);
  }

  throw new PainManagementError(
    `Operation failed after ${retryCount} attempts`,
    'OPERATION_FAILED',
    { originalError: lastError }
  );
}

async function notifyCriticalError(error: Error, tenantContext: TenantContext) {
  // Implementation for critical error notification
} 