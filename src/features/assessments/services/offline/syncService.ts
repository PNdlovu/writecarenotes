import { OfflineStorage } from './offlineStorage';
import { NetworkStatus } from './networkStatus';
import { Assessment } from '../../types/assessment.types';
import { Visit } from '../../types/visit.types';

export class SyncService {
  private static instance: SyncService;
  private offlineStorage: OfflineStorage;
  private networkStatus: NetworkStatus;
  private syncInterval: number = 5 * 60 * 1000; // 5 minutes
  private syncTimer: NodeJS.Timeout | null = null;

  private constructor() {
    this.offlineStorage = OfflineStorage.getInstance();
    this.networkStatus = NetworkStatus.getInstance();
    this.setupAutoSync();
  }

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  private setupAutoSync(): void {
    // Start periodic sync when online
    this.networkStatus.onOnline(() => {
      this.startAutoSync();
    });

    // Stop sync when offline
    this.networkStatus.onOffline(() => {
      this.stopAutoSync();
    });
  }

  private startAutoSync(): void {
    if (!this.syncTimer) {
      this.syncTimer = setInterval(() => {
        this.syncAll();
      }, this.syncInterval);
    }
  }

  private stopAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }

  async syncAll(): Promise<void> {
    if (!this.networkStatus.isOnline()) {
      console.log('Cannot sync: offline');
      return;
    }

    try {
      const pendingChanges = await this.offlineStorage.getPendingChanges();
      
      for (const change of pendingChanges) {
        if (change.synced) continue;

        try {
          switch (change.entityType) {
            case 'ASSESSMENT':
              await this.syncAssessment(change.data);
              break;
            case 'VISIT':
              await this.syncVisit(change.data);
              break;
          }
          await this.offlineStorage.markChangeSynced(change.id);
        } catch (error) {
          console.error(`Failed to sync ${change.entityType} ${change.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    }
  }

  private async syncAssessment(assessment: Assessment): Promise<void> {
    // Implement API call to sync assessment
    // This would typically call your backend API
    console.log('Syncing assessment:', assessment.id);
  }

  private async syncVisit(visit: Visit): Promise<void> {
    // Implement API call to sync visit
    // This would typically call your backend API
    console.log('Syncing visit:', visit.id);
  }

  // Manual sync triggers
  async forceSyncAll(): Promise<void> {
    await this.syncAll();
  }

  async syncAssessmentById(id: string): Promise<void> {
    const assessment = await this.offlineStorage.getAssessment(id);
    if (assessment) {
      await this.syncAssessment(assessment);
    }
  }

  async syncVisitById(id: string): Promise<void> {
    const visit = await this.offlineStorage.getVisit(id);
    if (visit) {
      await this.syncVisit(visit);
    }
  }

  // Sync status
  async getSyncStatus(): Promise<{
    lastSync: Date | null;
    pendingChanges: number;
    storageUsed: number;
  }> {
    const changes = await this.offlineStorage.getPendingChanges();
    const storageSize = await this.offlineStorage.getStorageSize();

    return {
      lastSync: changes.length > 0 
        ? new Date(Math.max(...changes.filter(c => c.synced).map(c => c.timestamp)))
        : null,
      pendingChanges: changes.filter(c => !c.synced).length,
      storageUsed: storageSize
    };
  }
}
