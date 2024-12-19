// src/features/offline/api/sync.ts
import { PendingChange } from '../types';
import { SyncError, ValidationError } from '../types/errors';
import { OFFLINE_CONFIG } from '../config/constants';

interface SyncResponse {
  success: boolean;
  timestamp: number;
  changes?: PendingChange[];
  error?: string;
}

const { ENDPOINTS, TIMEOUT } = OFFLINE_CONFIG.API;
const { RETRY_ATTEMPTS, RETRY_DELAY } = OFFLINE_CONFIG.SYNC;

async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  retries = RETRY_ATTEMPTS,
  delay = RETRY_DELAY
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryWithBackoff(operation, retries - 1, delay * 2);
    }
    throw error;
  }
}

export async function syncChanges(changes: PendingChange[]): Promise<SyncResponse> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

    const response = await retryWithBackoff(async () => {
      const result = await fetch(ENDPOINTS.SYNC, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ changes }),
        signal: controller.signal,
      });

      if (!result.ok) {
        throw new SyncError(`Sync failed: ${result.statusText}`, changes);
      }

      return result;
    });

    clearTimeout(timeoutId);
    return await response.json();
  } catch (error) {
    console.error('Sync error:', error);
    throw error instanceof SyncError ? error : new SyncError('Sync failed', changes);
  }
}

export async function getLastSyncTimestamp(): Promise<number> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

    const response = await retryWithBackoff(async () => {
      const result = await fetch(ENDPOINTS.TIMESTAMP, {
        signal: controller.signal,
      });
      
      if (!result.ok) {
        throw new SyncError(`Failed to get timestamp: ${result.statusText}`);
      }

      return result;
    });

    clearTimeout(timeoutId);
    const data = await response.json();
    return data.timestamp;
  } catch (error) {
    console.error('Timestamp fetch error:', error);
    throw error instanceof SyncError ? error : new SyncError('Failed to get timestamp');
  }
}

export async function validateOfflineData(entity: string, data: any): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

    const response = await retryWithBackoff(async () => {
      const result = await fetch(ENDPOINTS.VALIDATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entity, data }),
        signal: controller.signal,
      });

      if (!result.ok) {
        throw new ValidationError(`Validation failed: ${result.statusText}`, entity, data);
      }

      return result;
    });

    clearTimeout(timeoutId);
    const result = await response.json();
    return result.valid;
  } catch (error) {
    console.error('Validation error:', error);
    throw error instanceof ValidationError 
      ? error 
      : new ValidationError('Validation failed', entity, data);
  }
}
