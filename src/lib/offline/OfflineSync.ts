type SyncHandler = (changes: any[]) => Promise<void>;

export class OfflineSync {
  private syncHandlers: Map<string, SyncHandler> = new Map();
  private isOnline: boolean = navigator.onLine;
  private syncInProgress: boolean = false;

  constructor() {
    this.setupNetworkListeners();
  }

  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.attemptSync();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  registerSyncHandler(key: string, handler: SyncHandler): void {
    this.syncHandlers.set(key, handler);
  }

  unregisterSyncHandler(key: string): void {
    this.syncHandlers.delete(key);
  }

  private async attemptSync(): Promise<void> {
    if (!this.isOnline || this.syncInProgress) {
      return;
    }

    try {
      this.syncInProgress = true;

      for (const [key, handler] of this.syncHandlers) {
        try {
          // Get pending changes from cache
          const cache = await this.getPendingChanges(key);
          if (cache && cache.length > 0) {
            // Execute sync handler
            await handler(cache);
            // Clear synced changes
            await this.clearPendingChanges(key);
          }
        } catch (error) {
          console.error(`Sync failed for handler ${key}:`, error);
          // Individual handler failures shouldn't stop other handlers
          continue;
        }
      }
    } finally {
      this.syncInProgress = false;
    }
  }

  private async getPendingChanges(key: string): Promise<any[]> {
    // Implementation would depend on your caching strategy
    // This is just a placeholder
    return [];
  }

  private async clearPendingChanges(key: string): Promise<void> {
    // Implementation would depend on your caching strategy
    // This is just a placeholder
  }

  async forceSyncNow(): Promise<void> {
    if (this.isOnline) {
      await this.attemptSync();
    }
  }
}


