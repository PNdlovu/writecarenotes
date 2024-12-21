import { TenantContext } from '@/lib/multi-tenant/types';
import { IndexedDBStorage } from '@/lib/storage/indexed-db';
import { PayrollChange, PayrollData, SyncStatus } from '../types';

export class PayrollOfflineSync {
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
  private readonly SYNC_RETRY_LIMIT = 3;
  private readonly SYNC_BATCH_SIZE = 50;

  constructor(
    private readonly tenantContext: TenantContext,
    private readonly storage: IndexedDBStorage
  ) {
    this.initNetworkListeners();
  }

  async storePayrollData(data: PayrollData): Promise<void> {
    const key = `${this.tenantContext.tenant.id}:payroll:${data.id}`;
    await this.storage.set(key, {
      data,
      timestamp: Date.now(),
      status: SyncStatus.PENDING
    });
  }

  async getPayrollData(id: string): Promise<PayrollData | null> {
    const key = `${this.tenantContext.tenant.id}:payroll:${id}`;
    const stored = await this.storage.get(key);
    return stored ? stored.data : null;
  }

  async queueChange(change: PayrollChange): Promise<void> {
    const key = `${this.tenantContext.tenant.id}:sync_queue`;
    const queue = await this.storage.get(key) || [];
    
    // Add metadata to the change
    const enhancedChange = {
      ...change,
      timestamp: Date.now(),
      tenantId: this.tenantContext.tenant.id,
      retryCount: 0,
      status: SyncStatus.PENDING
    };

    queue.push(enhancedChange);
    await this.storage.set(key, queue);
  }

  async processSyncQueue(): Promise<void> {
    if (!this.isOnline()) {
      return;
    }

    const key = `${this.tenantContext.tenant.id}:sync_queue`;
    const queue = await this.storage.get(key) || [];
    const batchesToProcess = this.createBatches(queue, this.SYNC_BATCH_SIZE);
    const failedChanges: PayrollChange[] = [];

    for (const batch of batchesToProcess) {
      for (const change of batch) {
        try {
          if (change.retryCount >= this.SYNC_RETRY_LIMIT) {
            console.error('Max retry limit reached for change:', change);
            continue;
          }

          if (await this.needsConflictResolution(change)) {
            await this.handleSyncConflict(change);
          } else {
            await this.processChange(change);
            change.status = SyncStatus.SYNCED;
          }
        } catch (error) {
          console.error('Error processing change:', error);
          change.retryCount++;
          change.status = SyncStatus.FAILED;
          change.error = error.message;
          failedChanges.push(change);
        }
      }
    }

    // Update queue with only failed changes
    if (failedChanges.length > 0) {
      await this.storage.set(key, failedChanges);
    } else {
      await this.storage.delete(key);
    }
  }

  async clearExpiredCache(): Promise<void> {
    const now = Date.now();
    const allData = await this.storage.getAll();

    for (const [key, value] of Object.entries(allData)) {
      if (value.timestamp && now - value.timestamp > this.CACHE_TTL) {
        await this.storage.delete(key);
      }
    }
  }

  isOnline(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }

  initNetworkListeners(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline.bind(this));
      window.addEventListener('offline', this.handleOffline.bind(this));
    }
  }

  private async needsConflictResolution(change: PayrollChange): Promise<boolean> {
    const serverData = await this.fetchServerData(change.entityId);
    return serverData?.lastModified > change.timestamp;
  }

  private async handleSyncConflict(change: PayrollChange): Promise<void> {
    const serverData = await this.fetchServerData(change.entityId);
    const resolution = await this.resolveConflict(change, serverData);
    
    if (resolution.keepLocal) {
      await this.processChange(change);
    } else {
      // Update local data with server version
      await this.storePayrollData(serverData);
    }
  }

  private async processChange(change: PayrollChange): Promise<void> {
    const endpoint = this.getEndpointForChange(change);
    const response = await fetch(endpoint, {
      method: change.method,
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': this.tenantContext.tenant.id
      },
      body: JSON.stringify(change.data)
    });

    if (!response.ok) {
      throw new Error(`Failed to process change: ${response.statusText}`);
    }
  }

  private async fetchServerData(entityId: string): Promise<PayrollData | null> {
    try {
      const response = await fetch(`/api/payroll/${entityId}`, {
        headers: {
          'X-Tenant-ID': this.tenantContext.tenant.id
        }
      });
      
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Error fetching server data:', error);
      return null;
    }
  }

  private async resolveConflict(change: PayrollChange, serverData: PayrollData): Promise<{ keepLocal: boolean }> {
    // Implement conflict resolution strategy
    // For now, server always wins except for specific cases
    const keepLocal = this.shouldKeepLocalChange(change, serverData);
    return { keepLocal };
  }

  private shouldKeepLocalChange(change: PayrollChange, serverData: PayrollData): boolean {
    // Implement logic to determine if local change should be kept
    // Example: Keep local changes for comments or notes
    return change.type === 'COMMENT' || change.type === 'NOTE';
  }

  private getEndpointForChange(change: PayrollChange): string {
    const baseUrl = '/api/payroll';
    switch (change.type) {
      case 'PAYMENT':
        return `${baseUrl}/payments`;
      case 'DEDUCTION':
        return `${baseUrl}/deductions`;
      case 'ADJUSTMENT':
        return `${baseUrl}/adjustments`;
      default:
        return `${baseUrl}/${change.entityId}`;
    }
  }

  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  private handleOnline(): void {
    console.log('Application is online, processing sync queue...');
    this.processSyncQueue().catch(console.error);
  }

  private handleOffline(): void {
    console.log('Application is offline, changes will be queued');
  }
}
