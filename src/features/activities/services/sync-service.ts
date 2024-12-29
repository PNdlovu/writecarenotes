import { Activity } from '../../types';
import { ActivitiesAPI } from '../../api-client';
import { getOfflineStore } from '@/lib/offline/store';
import { logger } from '@/lib/logger';
import { exponentialBackoff } from '@/lib/utils/retry';

interface SyncConfig {
  batchSize?: number;
  maxRetries?: number;
  backoffMs?: number;
}

interface PendingChange {
  id: string;
  type: 'create' | 'update' | 'delete';
  data?: Partial<Activity>;
  timestamp: string;
  retryCount?: number;
  conflictResolution?: 'client' | 'server';
}

export class ActivitySyncService {
  private api: ActivitiesAPI;
  private store: ReturnType<typeof getOfflineStore>;
  private config: Required<SyncConfig>;
  private organizationId: string;

  constructor(
    organizationId: string, 
    config: SyncConfig = {}
  ) {
    this.api = new ActivitiesAPI(organizationId);
    this.store = getOfflineStore('activities');
    this.config = {
      batchSize: config.batchSize ?? 10,
      maxRetries: config.maxRetries ?? 3,
      backoffMs: config.backoffMs ?? 1000,
    };
    this.organizationId = organizationId;
  }

  private async processChange(
    change: PendingChange, 
    serverState?: Activity
  ): Promise<boolean> {
    try {
      // Handle conflicts if server state exists
      if (serverState) {
        const resolution = await this.resolveConflict(change, serverState);
        if (resolution === 'skip') {
          return true;
        }
        change.conflictResolution = resolution;
      }

      // Process based on change type
      switch (change.type) {
        case 'create':
          await this.api.createActivity(change.data);
          break;
        case 'update':
          await this.api.updateActivity(change.id, change.data);
          break;
        case 'delete':
          await this.api.deleteActivity(change.id);
          break;
      }

      await this.store.removePendingChange(change.id);
      logger.info(`Synced activity change: ${change.type} ${change.id}`);
      await this.auditLog(`synced_${change.type}`, { id: change.id });
      return true;
    } catch (error) {
      const shouldRetry = change.retryCount < this.config.maxRetries;
      if (shouldRetry) {
        change.retryCount = (change.retryCount ?? 0) + 1;
        await exponentialBackoff(this.config.backoffMs * change.retryCount);
        return false;
      }

      logger.error(`Failed to sync activity change after ${this.config.maxRetries} retries: ${change.type} ${change.id}`, error);
      await this.auditLog(`sync_failed_${change.type}`, { id: change.id, error });
      return true;
    }
  }

  private async resolveConflict(
    change: PendingChange, 
    serverState: Activity
  ): Promise<'client' | 'server' | 'skip'> {
    const clientTimestamp = new Date(change.timestamp);
    const serverTimestamp = new Date(serverState.updatedAt);

    // If server is newer, prefer server version
    if (serverTimestamp > clientTimestamp) {
      return 'server';
    }

    // If client is newer, prefer client version
    if (clientTimestamp > serverTimestamp) {
      return 'client';
    }

    // If same timestamp, skip to avoid duplicate updates
    return 'skip';
  }

  async syncPendingChanges(): Promise<void> {
    const pendingChanges = await this.store.getPendingChanges();
    const batches = Array(Math.ceil(pendingChanges.length / this.config.batchSize)).fill(0).map((_, index) => pendingChanges.slice(index * this.config.batchSize, (index + 1) * this.config.batchSize));

    for (const batch of batches) {
      const results = await Promise.all(batch.map(async (change) => {
        const serverState = change.type === 'update' || change.type === 'delete' ? await this.api.getActivity(change.id) : undefined;
        return this.processChange(change, serverState);
      }));

      const failedChanges = batch.filter((change, index) => !results[index]);
      if (failedChanges.length > 0) {
        await this.store.updatePendingChanges(failedChanges);
      }
    }
    await this.enforceStorageLimits();
  }

  async enqueuePendingChange(
    type: 'create' | 'update' | 'delete',
    id: string,
    data?: Partial<Activity>
  ): Promise<void> {
    const change: PendingChange = {
      id,
      type,
      data,
      timestamp: new Date().toISOString(),
      retryCount: 0
    };

    await this.store.addPendingChange(change);
    logger.info(`Enqueued activity change: ${type} ${id}`);
    await this.auditLog(`enqueued_${type}`, { id });

    // Attempt immediate sync if online
    if (navigator.onLine) {
      try {
        const serverState = type === 'update' || type === 'delete' 
          ? await this.api.getActivity(id) 
          : undefined;
        
        await this.processChange(change, serverState);
      } catch (error) {
        logger.warn(`Failed immediate sync for activity change: ${type} ${id}`, error);
      }
    }
  }

  private async enforceStorageLimits(): Promise<void> {
    const MAX_OFFLINE_ACTIVITIES = 1000;
    const MAX_PENDING_CHANGES = 500;
    const MAX_STORAGE_AGE_DAYS = 30;

    try {
      const activities = await this.store.getAll();
      const pendingChanges = await this.store.getPendingChanges();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - MAX_STORAGE_AGE_DAYS);

      // Remove old activities
      const recentActivities = activities.filter(activity => 
        new Date(activity.updatedAt) > cutoffDate
      ).slice(0, MAX_OFFLINE_ACTIVITIES);

      // Remove old pending changes
      const recentChanges = pendingChanges
        .filter(change => new Date(change.timestamp) > cutoffDate)
        .slice(0, MAX_PENDING_CHANGES);

      await Promise.all([
        this.store.setAll(recentActivities),
        this.store.setPendingChanges(recentChanges)
      ]);

      logger.info('Enforced offline storage limits', {
        activitiesRemoved: activities.length - recentActivities.length,
        changesRemoved: pendingChanges.length - recentChanges.length
      });
      await this.auditLog('enforced_storage_limits', {
        activitiesRemoved: activities.length - recentActivities.length,
        changesRemoved: pendingChanges.length - recentChanges.length
      });
    } catch (error) {
      logger.error('Failed to enforce storage limits', error);
      await this.auditLog('storage_limit_enforcement_failed', { error });
    }
  }

  private async auditLog(
    action: string,
    details: Record<string, any>
  ): Promise<void> {
    try {
      await this.api.logAudit({
        module: 'activities',
        action,
        timestamp: new Date().toISOString(),
        details: {
          ...details,
          organizationId: this.organizationId,
          origin: 'sync-service'
        }
      });
    } catch (error) {
      logger.error('Failed to create audit log', { action, details, error });
    }
  }

  async getOfflineActivities(): Promise<Activity[]> {
    try {
      const activities = await this.store.getAll();
      const pendingChanges = await this.store.getPendingChanges();

      // Apply pending changes to offline activities
      return activities.map(activity => {
        const latestChange = pendingChanges
          .filter(change => change.id === activity.id)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

        if (latestChange?.type === 'update' && latestChange.data) {
          return { ...activity, ...latestChange.data };
        }

        return activity;
      }).filter(activity => {
        // Remove activities that are pending deletion
        const isPendingDeletion = pendingChanges.some(
          change => change.id === activity.id && change.type === 'delete'
        );
        return !isPendingDeletion;
      });
    } catch (error) {
      logger.error('Failed to get offline activities', error);
      return [];
    }
  }

  async saveOfflineActivities(activities: Activity[]): Promise<void> {
    try {
      await this.store.setAll(activities);
      logger.info(`Saved ${activities.length} activities offline`);
      await this.auditLog('saved_offline_activities', { count: activities.length });
    } catch (error) {
      logger.error('Failed to save offline activities', error);
      await this.auditLog('save_offline_activities_failed', { error });
      throw error;
    }
  }

  async clearOfflineData(): Promise<void> {
    try {
      await this.store.clear();
      logger.info('Cleared offline activities data');
      await this.auditLog('cleared_offline_data');
    } catch (error) {
      logger.error('Failed to clear offline activities', error);
      await this.auditLog('clear_offline_data_failed', { error });
      throw error;
    }
  }

  async getSyncStatus(): Promise<{
    pendingChanges: number;
    lastSyncTime?: string;
    syncInProgress: boolean;
  }> {
    try {
      const pendingChanges = await this.store.getPendingChanges();
      const lastSync = await this.store.getMetadata('lastSyncTime');
      const syncStatus = await this.store.getMetadata('syncInProgress');

      return {
        pendingChanges: pendingChanges.length,
        lastSyncTime: lastSync?.value,
        syncInProgress: syncStatus?.value === 'true'
      };
    } catch (error) {
      logger.error('Failed to get sync status', error);
      return {
        pendingChanges: 0,
        syncInProgress: false
      };
    }
  }
}
