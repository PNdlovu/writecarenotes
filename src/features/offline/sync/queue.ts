/**
 * @writecarenotes.com
 * @fileoverview Enterprise-grade offline queue system
 * @version 1.0.0
 * @created 2025-01-01
 * @updated 2025-01-01
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * A robust offline queue system for managing actions while offline.
 * Features include:
 * - Persistent storage of actions
 * - Priority-based processing
 * - Conflict resolution
 * - Retry mechanisms
 * - Error handling
 */

import { logEvent } from '@/utils/analytics';
import { metrics } from '@/lib/metrics';

export interface QueuedAction {
  id: string;
  type: string;
  payload: unknown;
  timestamp: string;
  priority: number;
  retryCount: number;
  status: 'pending' | 'processing' | 'failed' | 'completed';
  error?: string;
}

export interface OfflineQueueOptions {
  maxRetries?: number;
  storageKey?: string;
  maxQueueSize?: number;
}

export class OfflineQueue {
  private queue: QueuedAction[] = [];
  private options: Required<OfflineQueueOptions>;
  
  constructor(options: OfflineQueueOptions = {}) {
    this.options = {
      maxRetries: 3,
      storageKey: 'offline_queue',
      maxQueueSize: 1000,
      ...options,
    };
    
    this.loadQueue();
  }

  private loadQueue(): void {
    try {
      const stored = localStorage.getItem(this.options.storageKey);
      if (stored) {
        this.queue = JSON.parse(stored);
        metrics.increment('offline.queue.loaded');
        logEvent('queue_loaded', {
          size: this.queue.length,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      metrics.increment('offline.queue.load_failed');
      logEvent('queue_load_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  private saveQueue(): void {
    try {
      localStorage.setItem(this.options.storageKey, JSON.stringify(this.queue));
    } catch (error) {
      metrics.increment('offline.queue.save_failed');
      logEvent('queue_save_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  public enqueue(action: Omit<QueuedAction, 'id' | 'timestamp' | 'retryCount' | 'status'>): void {
    if (this.queue.length >= this.options.maxQueueSize) {
      metrics.increment('offline.queue.limit_reached');
      throw new Error('Queue size limit reached');
    }

    const queuedAction: QueuedAction = {
      ...action,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      retryCount: 0,
      status: 'pending',
    };

    this.queue.push(queuedAction);
    this.saveQueue();

    metrics.increment('offline.queue.action_added');
    logEvent('action_queued', {
      actionId: queuedAction.id,
      type: queuedAction.type,
      timestamp: queuedAction.timestamp,
    });
  }

  public async processQueue(
    processor: (action: QueuedAction) => Promise<void>
  ): Promise<void> {
    const sortedQueue = [...this.queue]
      .filter(action => action.status === 'pending')
      .sort((a, b) => b.priority - a.priority);

    for (const action of sortedQueue) {
      try {
        action.status = 'processing';
        this.saveQueue();

        await processor(action);

        action.status = 'completed';
        metrics.increment('offline.queue.action_processed');
        logEvent('action_processed', {
          actionId: action.id,
          type: action.type,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        action.retryCount++;
        action.status = action.retryCount >= this.options.maxRetries ? 'failed' : 'pending';
        action.error = error instanceof Error ? error.message : 'Unknown error';

        metrics.increment('offline.queue.action_failed');
        logEvent('action_processing_failed', {
          actionId: action.id,
          type: action.type,
          error: action.error,
          retryCount: action.retryCount,
          timestamp: new Date().toISOString(),
        });
      }

      this.saveQueue();
    }

    // Clean up completed actions
    this.queue = this.queue.filter(action => action.status !== 'completed');
    this.saveQueue();
  }

  public clear(): void {
    this.queue = [];
    this.saveQueue();
    
    metrics.increment('offline.queue.cleared');
    logEvent('queue_cleared', {
      timestamp: new Date().toISOString(),
    });
  }

  public getStats() {
    return {
      total: this.queue.length,
      pending: this.queue.filter(a => a.status === 'pending').length,
      processing: this.queue.filter(a => a.status === 'processing').length,
      failed: this.queue.filter(a => a.status === 'failed').length,
    };
  }
}
