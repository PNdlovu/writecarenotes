/**
 * @fileoverview Enhanced sync queue with real-time collaboration support
 * @version 2.0.0
 */

import { Logger } from '@/lib/logger';
import { Metrics } from '@/lib/metrics';
import { SyncError } from '../types/errors';
import { 
  SyncConfig, 
  SyncOperation, 
  SyncQueueEntry,
  RealtimeUpdate,
  SyncPriority
} from '../types';
import { IndexedDB } from '../storage/indexedDB';
import { compressionUtil } from '../utils/compression';
import { analyticsService } from '../services/analytics';
import { WebSocketClient } from '../network/websocket';
import { BatchStrategy } from './batchStrategy';

export class SyncQueue {
  private static readonly STORE_KEY = 'sync_queue';
  private logger: Logger;
  private metrics: Metrics;
  private db: IndexedDB;
  private config: SyncConfig | null = null;
  private isProcessing = false;
  private ws: WebSocketClient | null = null;
  private batchStrategy: BatchStrategy;

  constructor() {
    this.logger = new Logger('SyncQueue');
    this.metrics = new Metrics('sync');
    this.db = new IndexedDB();
    this.batchStrategy = new BatchStrategy();
  }

  /**
   * Initialize sync queue with real-time support
   */
  async initialize(config: SyncConfig): Promise<void> {
    try {
      this.config = config;
      await this.db.initialize();
      
      if (config.realtime) {
        await this.initializeWebSocket();
      }

      // Start background processing
      this.startBackgroundSync();
      
      this.logger.info('Sync queue initialized', { config });
    } catch (error) {
      this.logger.error('Failed to initialize sync queue', error);
      throw error;
    }
  }

  /**
   * Initialize WebSocket connection
   */
  private async initializeWebSocket(): Promise<void> {
    this.ws = new WebSocketClient(this.config!.websocketUrl, this.config);
    
    this.ws.onMessage(async (update: RealtimeUpdate) => {
      await this.handleRealtimeUpdate(update);
    });

    this.ws.onReconnect(async () => {
      await this.syncPendingChanges();
    });
  }

  /**
   * Add operation to sync queue
   */
  async add(operation: SyncOperation, priority: SyncPriority = 'normal'): Promise<void> {
    try {
      // Compress data before storage
      const compressedData = await compressionUtil.compress(operation.data);
      
      const entry: SyncQueueEntry = {
        id: crypto.randomUUID(),
        operation: { ...operation, data: compressedData },
        status: 'pending',
        priority,
        attempts: 0,
        timestamp: Date.now()
      };

      await this.db.add(SyncQueue.STORE_KEY, entry);
      
      // Track metrics
      this.metrics.increment('operation_queued', {
        type: operation.type,
        priority,
        entity: operation.entity
      });

      // Notify realtime subscribers if connected
      if (this.ws?.isConnected()) {
        await this.ws.send({
          type: 'operation_queued',
          operation: entry
        });
      }

      // Trigger sync if high priority
      if (priority === 'high') {
        await this.processPendingChanges();
      }
    } catch (error) {
      this.logger.error('Failed to add operation to queue', error);
      throw new SyncError('Failed to queue operation', { cause: error });
    }
  }

  /**
   * Process pending changes with batching
   */
  private async processPendingChanges(): Promise<void> {
    if (this.isProcessing) return;
    
    try {
      this.isProcessing = true;
      const startTime = performance.now();

      // Get pending changes
      const pending = await this.db.getAllByIndex(
        SyncQueue.STORE_KEY,
        'status',
        'pending'
      );

      if (pending.length === 0) return;

      // Group changes by entity and priority
      const batches = this.batchStrategy.createBatches(pending, {
        maxBatchSize: this.config?.batchSize || 100,
        priorityOrder: ['high', 'normal', 'low']
      });

      // Process batches
      for (const batch of batches) {
        await this.processBatch(batch);
      }

      // Record metrics
      const duration = performance.now() - startTime;
      this.metrics.recordTiming('sync_duration', duration);
      
      // Send analytics
      analyticsService.trackSync({
        duration,
        operationsCount: pending.length,
        batchesCount: batches.length,
        success: true
      });

    } catch (error) {
      this.logger.error('Failed to process pending changes', error);
      this.metrics.increment('sync_failure');
      
      analyticsService.trackError('sync_failure', {
        error: error.message,
        timestamp: Date.now()
      });
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process a batch of changes
   */
  private async processBatch(batch: SyncQueueEntry[]): Promise<void> {
    try {
      // Decompress all operations in batch
      const decompressedBatch = await Promise.all(
        batch.map(async entry => ({
          ...entry,
          operation: {
            ...entry.operation,
            data: await compressionUtil.decompress(entry.operation.data)
          }
        }))
      );

      // Send batch to server
      const response = await fetch(this.config!.syncEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Batch-ID': crypto.randomUUID()
        },
        body: JSON.stringify({ operations: decompressedBatch })
      });

      if (!response.ok) {
        throw new Error(`Sync failed: ${response.statusText}`);
      }

      // Update local status
      await Promise.all(
        batch.map(entry =>
          this.db.update(SyncQueue.STORE_KEY, entry.id, {
            status: 'completed',
            completedAt: Date.now()
          })
        )
      );

      // Track metrics
      this.metrics.increment('batch_processed', {
        size: batch.length,
        success: true
      });

    } catch (error) {
      this.logger.error('Batch processing failed', error);
      
      // Update retry counts and status
      await Promise.all(
        batch.map(entry =>
          this.db.update(SyncQueue.STORE_KEY, entry.id, {
            status: 'failed',
            attempts: entry.attempts + 1,
            lastError: error.message
          })
        )
      );

      this.metrics.increment('batch_failed');
      throw error;
    }
  }

  /**
   * Handle realtime update from server
   */
  private async handleRealtimeUpdate(update: RealtimeUpdate): Promise<void> {
    try {
      switch (update.type) {
        case 'conflict':
          await this.handleConflict(update.data);
          break;
        case 'sync_required':
          await this.syncPendingChanges();
          break;
        case 'data_update':
          await this.handleDataUpdate(update.data);
          break;
      }

      this.metrics.increment('realtime_update_processed', {
        type: update.type
      });
    } catch (error) {
      this.logger.error('Failed to handle realtime update', error);
      this.metrics.increment('realtime_update_failed');
    }
  }

  /**
   * Start background sync process
   */
  private startBackgroundSync(): void {
    setInterval(
      () => this.processPendingChanges(),
      this.config?.syncInterval || 5000
    );
  }

  /**
   * Force immediate sync
   */
  async forceSyncNow(): Promise<void> {
    await this.processPendingChanges();
  }

  /**
   * Get sync status
   */
  async getStatus(): Promise<{
    pendingCount: number;
    failedCount: number;
    lastSyncTime: number;
    isOnline: boolean;
  }> {
    const pending = await this.db.countByIndex(
      SyncQueue.STORE_KEY,
      'status',
      'pending'
    );
    const failed = await this.db.countByIndex(
      SyncQueue.STORE_KEY,
      'status',
      'failed'
    );

    return {
      pendingCount: pending,
      failedCount: failed,
      lastSyncTime: this.lastSyncTime,
      isOnline: this.ws?.isConnected() || false
    };
  }

  private lastSyncTime: number = 0;
}