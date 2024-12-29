import { Activity } from '../../types';
import { ActivitiesAPI } from '../../api-client';
import { getOfflineStore } from '@/lib/offline/store';
import { logger } from '@/lib/logger';

export class ActivitySyncService {
  private api: ActivitiesAPI;
  private store: ReturnType<typeof getOfflineStore>;

  constructor(organizationId: string) {
    this.api = new ActivitiesAPI(organizationId);
    this.store = getOfflineStore('activities');
  }

  async syncPendingChanges(): Promise<void> {
    const pendingChanges = await this.store.getPendingChanges();
    
    for (const change of pendingChanges) {
      try {
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
      } catch (error) {
        logger.error(`Failed to sync activity change: ${change.type} ${change.id}`, error);
      }
    }
  }

  async enqueuePendingChange(
    type: 'create' | 'update' | 'delete',
    id: string,
    data?: Partial<Activity>
  ): Promise<void> {
    await this.store.addPendingChange({
      id,
      type,
      data,
      timestamp: new Date().toISOString()
    });
    logger.info(`Enqueued activity change: ${type} ${id}`);
  }

  async getOfflineActivities(): Promise<Activity[]> {
    return this.store.getAll();
  }

  async saveOfflineActivities(activities: Activity[]): Promise<void> {
    await this.store.setAll(activities);
    logger.info(`Saved ${activities.length} activities offline`);
  }

  async clearOfflineData(): Promise<void> {
    await this.store.clear();
    logger.info('Cleared offline activities data');
  }
}
