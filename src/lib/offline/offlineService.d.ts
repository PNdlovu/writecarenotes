/**
 * @writecarenotes.com
 * @fileoverview Type declarations for offline service
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

export interface SyncQueueItem<T> {
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  id: string;
  data: T;
  timestamp?: string;
  retryCount?: number;
}

export class OfflineService<T> {
  constructor(storeName: string);
  init(): Promise<void>;
  saveData(id: string, data: T): Promise<void>;
  getData(id: string): Promise<T | null>;
  getAll(): Promise<T[]>;
  queueSync(item: SyncQueueItem<T>): Promise<void>;
  processSyncQueue(): Promise<void>;
  getPendingSyncCount(): Promise<number>;
} 