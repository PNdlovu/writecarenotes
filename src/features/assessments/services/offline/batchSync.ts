import { Assessment } from '../../types/assessment.types';
import { Visit } from '../../types/visit.types';
import { OfflineStorage } from './offlineStorage';
import { NetworkStatus } from './networkStatus';
import { PriorityQueue } from './priorityQueue';
import { OfflineAnalytics } from './analytics';

interface BatchConfig {
  batchSize: number;
  retryAttempts: number;
  retryDelay: number;
  priorityFields: string[];
}

interface SyncProgress {
  total: number;
  completed: number;
  failed: number;
  inProgress: number;
}

type SyncCallback = (progress: SyncProgress) => void;

export class BatchSyncService {
  private static instance: BatchSyncService;
  private offlineStorage: OfflineStorage;
  private networkStatus: NetworkStatus;
  private config: BatchConfig;
  private syncInProgress: boolean = false;
  private priorityQueue: PriorityQueue<Assessment | Visit>;
  private analytics: OfflineAnalytics;
  private progressCallbacks: Set<SyncCallback> = new Set();

  private constructor() {
    this.offlineStorage = OfflineStorage.getInstance();
    this.networkStatus = NetworkStatus.getInstance();
    this.priorityQueue = new PriorityQueue(3);
    this.analytics = OfflineAnalytics.getInstance();
    this.config = {
      batchSize: 10,
      retryAttempts: 3,
      retryDelay: 1000,
      priorityFields: ['status', 'updatedAt'],
    };
  }

  static getInstance(): BatchSyncService {
    if (!BatchSyncService.instance) {
      BatchSyncService.instance = new BatchSyncService();
    }
    return BatchSyncService.instance;
  }

  setConfig(config: Partial<BatchConfig>): void {
    this.config = { ...this.config, ...config };
  }

  onProgress(callback: SyncCallback): () => void {
    this.progressCallbacks.add(callback);
    return () => this.progressCallbacks.delete(callback);
  }

  private notifyProgress(progress: SyncProgress): void {
    this.progressCallbacks.forEach(callback => callback(progress));
  }

  async queueForSync(
    item: Assessment | Visit,
    priority: number = 0,
    dependencies: string[] = []
  ): Promise<void> {
    this.priorityQueue.enqueue(item.id, item, priority, dependencies);
    
    await this.analytics.trackSyncEvent('queued', {
      itemId: item.id,
      itemType: 'visitType' in item ? 'VISIT' : 'ASSESSMENT',
      priority,
      dependencies
    });
    
    if (this.networkStatus.isOnline() && !this.syncInProgress) {
      await this.startSync();
    }
  }

  async startSync(): Promise<void> {
    if (this.syncInProgress || !this.networkStatus.isOnline()) {
      return;
    }

    this.syncInProgress = true;
    await this.analytics.trackSyncEvent('start', {
      queueSize: this.priorityQueue.size(),
      processingCount: this.priorityQueue.getProcessingCount()
    });

    const progress: SyncProgress = {
      total: this.priorityQueue.size(),
      completed: 0,
      failed: 0,
      inProgress: 0,
    };

    try {
      while (!this.priorityQueue.isEmpty()) {
        const batch = this.getNextBatch();
        progress.inProgress = batch.length;
        this.notifyProgress(progress);

        await this.processBatch(batch, progress);
        
        progress.completed += batch.length;
        progress.inProgress = 0;
        this.notifyProgress(progress);
      }

      await this.analytics.trackSyncEvent('complete', {
        completed: progress.completed,
        failed: progress.failed
      });
    } catch (error) {
      await this.analytics.trackErrorEvent(error as Error, {
        context: 'batch_sync',
        progress
      });
      console.error('Batch sync failed:', error);
    } finally {
      this.syncInProgress = false;
      this.notifyProgress(progress);
    }
  }

  private getNextBatch(): (Assessment | Visit)[] {
    const batch: (Assessment | Visit)[] = [];
    while (batch.length < this.config.batchSize) {
      const item = this.priorityQueue.dequeue();
      if (!item) break;
      batch.push(item.data);
    }
    return batch;
  }

  private async processBatch(
    items: (Assessment | Visit)[],
    progress: SyncProgress
  ): Promise<void> {
    const batchPromises = items.map(item => this.syncItem(item, progress));
    await Promise.allSettled(batchPromises);
  }

  private async syncItem(
    item: Assessment | Visit,
    progress: SyncProgress,
    attempt: number = 1
  ): Promise<void> {
    const startTime = Date.now();
    try {
      const serverData = await this.fetchFromServer(item);
      
      if (serverData) {
        const resolvedData = await this.offlineStorage.resolveConflict(
          item,
          serverData
        );
        await this.saveToServer(resolvedData);
      } else {
        await this.saveToServer(item);
      }

      this.priorityQueue.markAsComplete(item.id);
      await this.analytics.trackSyncEvent('item_complete', {
        itemId: item.id,
        itemType: 'visitType' in item ? 'VISIT' : 'ASSESSMENT',
        attempt,
        duration: Date.now() - startTime
      });
    } catch (error) {
      if (attempt < this.config.retryAttempts) {
        await this.analytics.trackSyncEvent('item_retry', {
          itemId: item.id,
          attempt,
          error: error.message
        });
        await new Promise(resolve => 
          setTimeout(resolve, this.config.retryDelay * attempt)
        );
        return this.syncItem(item, progress, attempt + 1);
      } else {
        progress.failed++;
        this.priorityQueue.markAsFailed(item.id);
        await this.analytics.trackErrorEvent(error as Error, {
          context: 'item_sync',
          itemId: item.id,
          attempt
        });
        console.error(`Failed to sync item ${item.id} after ${attempt} attempts:`, error);
      }
    }
  }

  private async fetchFromServer(item: Assessment | Visit): Promise<any> {
    // Implement actual server fetch logic
    return null;
  }

  private async saveToServer(item: Assessment | Visit): Promise<void> {
    // Implement actual server save logic
  }

  // Utility methods
  getPendingCount(): number {
    return this.priorityQueue.size();
  }

  clearQueue(): void {
    this.priorityQueue.clear();
  }

  isInProgress(): boolean {
    return this.syncInProgress;
  }
}
