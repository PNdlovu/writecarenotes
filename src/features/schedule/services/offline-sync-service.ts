/**
 * @writecarenotes.com
 * @fileoverview Schedule offline sync service
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Service for managing schedule data synchronization with offline support.
 * Handles schedule updates, conflicts, and data persistence in offline mode.
 */

import { OfflineService } from '@/lib/offline/offlineService';
import type { ScheduleData, ScheduleConfig } from '../types';

export class ScheduleOfflineService {
  private offlineService: OfflineService<ScheduleData>;

  constructor() {
    this.offlineService = new OfflineService<ScheduleData>({
      storeName: 'schedule',
      onSyncComplete: (event) => {
        console.log('Schedule sync completed:', event);
      },
      onSyncError: (error) => {
        console.error('Schedule sync error:', error);
      }
    });
  }

  async initialize() {
    await this.offlineService.init();
  }

  async saveSchedule(data: ScheduleData) {
    return this.offlineService.saveData(data.id, data);
  }

  async getSchedule(id: string) {
    return this.offlineService.getData(id);
  }

  async getAllSchedules() {
    return this.offlineService.getAll();
  }

  async syncSchedules() {
    return this.offlineService.processSyncQueue();
  }

  async getScheduleConfig(): Promise<ScheduleConfig> {
    return this.offlineService.getData('config') as Promise<ScheduleConfig>;
  }

  async updateScheduleConfig(config: ScheduleConfig) {
    return this.offlineService.saveData('config', config);
  }
}
