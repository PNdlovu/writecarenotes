import { ParentalConsent } from '../types/consent';
import { SignatureVerification } from '../types/verification';

interface SyncQueueItem {
  id: string;
  type: 'CONSENT' | 'SIGNATURE' | 'WITHDRAWAL';
  data: any;
  timestamp: string;
  retryCount: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'FAILED';
  error?: string;
}

class OfflineSyncService {
  private readonly QUEUE_KEY = 'consent_sync_queue';
  private readonly MAX_RETRIES = 3;
  private isProcessing = false;

  private async getQueue(): Promise<SyncQueueItem[]> {
    const queueData = localStorage.getItem(this.QUEUE_KEY);
    return queueData ? JSON.parse(queueData) : [];
  }

  private async saveQueue(queue: SyncQueueItem[]): Promise<void> {
    localStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));
  }

  public async queueConsentForSync(consent: ParentalConsent): Promise<void> {
    const queue = await this.getQueue();
    
    queue.push({
      id: `consent_${consent.id}_${Date.now()}`,
      type: 'CONSENT',
      data: consent,
      timestamp: new Date().toISOString(),
      retryCount: 0,
      status: 'PENDING'
    });

    await this.saveQueue(queue);
    this.startSync();
  }

  public async queueSignatureForSync(
    signature: SignatureVerification,
    consentId: string
  ): Promise<void> {
    const queue = await this.getQueue();
    
    queue.push({
      id: `signature_${signature.id}_${Date.now()}`,
      type: 'SIGNATURE',
      data: { signature, consentId },
      timestamp: new Date().toISOString(),
      retryCount: 0,
      status: 'PENDING'
    });

    await this.saveQueue(queue);
    this.startSync();
  }

  private async syncItem(item: SyncQueueItem): Promise<boolean> {
    try {
      switch (item.type) {
        case 'CONSENT':
          // Implementation would sync consent to server
          await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated delay
          return true;

        case 'SIGNATURE':
          // Implementation would sync signature to server
          await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated delay
          return true;

        case 'WITHDRAWAL':
          // Implementation would sync withdrawal to server
          await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated delay
          return true;

        default:
          return false;
      }
    } catch (error) {
      console.error(`Sync failed for item ${item.id}:`, error);
      return false;
    }
  }

  private async startSync(): Promise<void> {
    if (this.isProcessing) return;

    this.isProcessing = true;
    try {
      const queue = await this.getQueue();
      const updatedQueue: SyncQueueItem[] = [];

      for (const item of queue) {
        if (item.status === 'FAILED' && item.retryCount >= this.MAX_RETRIES) {
          updatedQueue.push(item); // Keep failed items in queue for manual resolution
          continue;
        }

        if (item.status !== 'IN_PROGRESS') {
          item.status = 'IN_PROGRESS';
          const success = await this.syncItem(item);

          if (success) {
            // Item synced successfully, don't add back to queue
            this.notifySuccess(item);
          } else {
            item.status = 'FAILED';
            item.retryCount += 1;
            item.error = 'Sync failed';
            updatedQueue.push(item);
            this.notifyError(item);
          }
        }
      }

      await this.saveQueue(updatedQueue);
    } finally {
      this.isProcessing = false;
    }
  }

  private notifySuccess(item: SyncQueueItem): void {
    // Implementation would notify UI of successful sync
    const event = new CustomEvent('consentSync', {
      detail: {
        type: 'success',
        itemId: item.id,
        message: `Successfully synced ${item.type.toLowerCase()}`
      }
    });
    window.dispatchEvent(event);
  }

  private notifyError(item: SyncQueueItem): void {
    // Implementation would notify UI of sync error
    const event = new CustomEvent('consentSync', {
      detail: {
        type: 'error',
        itemId: item.id,
        message: `Failed to sync ${item.type.toLowerCase()}`,
        error: item.error
      }
    });
    window.dispatchEvent(event);
  }

  public async getStatus(): Promise<{
    pendingItems: number;
    failedItems: number;
    inProgress: boolean;
  }> {
    const queue = await this.getQueue();
    return {
      pendingItems: queue.filter(item => item.status === 'PENDING').length,
      failedItems: queue.filter(item => item.status === 'FAILED').length,
      inProgress: this.isProcessing
    };
  }

  public async retryFailedItems(): Promise<void> {
    const queue = await this.getQueue();
    const updatedQueue = queue.map(item => {
      if (item.status === 'FAILED') {
        return {
          ...item,
          status: 'PENDING',
          retryCount: 0
        };
      }
      return item;
    });

    await this.saveQueue(updatedQueue);
    this.startSync();
  }
}

export const offlineSync = new OfflineSyncService();


