import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface ScheduleDB extends DBSchema {
  schedules: {
    key: string;
    value: {
      id: string;
      data: any;
      lastModified: Date;
      syncStatus: 'synced' | 'pending' | 'error';
    };
    indexes: { 'by-sync-status': string };
  };
  changes: {
    key: string;
    value: {
      id: string;
      type: 'create' | 'update' | 'delete';
      entityType: string;
      data: any;
      timestamp: Date;
      retries: number;
      error?: string;
    };
    indexes: { 'by-timestamp': Date };
  };
  notifications: {
    key: string;
    value: {
      id: string;
      title: string;
      body: string;
      timestamp: Date;
      status: 'delivered' | 'clicked' | 'dismissed';
      data?: any;
    };
    indexes: { 'by-status': string };
  };
}

export class DatabaseManager {
  private db: IDBPDatabase<ScheduleDB> | null = null;
  private static instance: DatabaseManager;

  private constructor() {}

  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  async connect(): Promise<void> {
    if (!this.db) {
      this.db = await openDB<ScheduleDB>('schedule-db', 1, {
        upgrade(db) {
          // Schedules store
          const scheduleStore = db.createObjectStore('schedules', {
            keyPath: 'id',
          });
          scheduleStore.createIndex('by-sync-status', 'syncStatus');

          // Changes store
          const changesStore = db.createObjectStore('changes', {
            keyPath: 'id',
          });
          changesStore.createIndex('by-timestamp', 'timestamp');

          // Notifications store
          const notificationsStore = db.createObjectStore('notifications', {
            keyPath: 'id',
          });
          notificationsStore.createIndex('by-status', 'status');
        },
      });
    }
  }

  async disconnect(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  // Schedule operations
  async saveSchedule(schedule: any): Promise<string> {
    if (!this.db) throw new Error('Database not connected');

    const id = schedule.id || crypto.randomUUID();
    await this.db.put('schedules', {
      id,
      data: schedule,
      lastModified: new Date(),
      syncStatus: 'pending',
    });

    await this.trackChange({
      type: schedule.id ? 'update' : 'create',
      entityType: 'schedule',
      data: schedule,
    });

    return id;
  }

  async getSchedule(id: string): Promise<any | null> {
    if (!this.db) throw new Error('Database not connected');
    const schedule = await this.db.get('schedules', id);
    return schedule?.data || null;
  }

  async deleteSchedule(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not connected');
    const schedule = await this.getSchedule(id);
    if (schedule) {
      await this.db.delete('schedules', id);
      await this.trackChange({
        type: 'delete',
        entityType: 'schedule',
        data: { id },
      });
    }
  }

  async getPendingSchedules(): Promise<any[]> {
    if (!this.db) throw new Error('Database not connected');
    return this.db.getAllFromIndex('schedules', 'by-sync-status', 'pending');
  }

  // Change tracking
  private async trackChange(change: {
    type: 'create' | 'update' | 'delete';
    entityType: string;
    data: any;
  }): Promise<void> {
    if (!this.db) throw new Error('Database not connected');

    await this.db.add('changes', {
      id: crypto.randomUUID(),
      ...change,
      timestamp: new Date(),
      retries: 0,
    });
  }

  async getChanges(limit = 100): Promise<any[]> {
    if (!this.db) throw new Error('Database not connected');
    return this.db.getAllFromIndex('changes', 'by-timestamp', undefined, limit);
  }

  async markChangeProcessed(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not connected');
    await this.db.delete('changes', id);
  }

  async markChangeError(id: string, error: string): Promise<void> {
    if (!this.db) throw new Error('Database not connected');
    const change = await this.db.get('changes', id);
    if (change) {
      change.retries += 1;
      change.error = error;
      await this.db.put('changes', change);
    }
  }

  // Notification operations
  async saveNotification(notification: {
    title: string;
    body: string;
    data?: any;
  }): Promise<string> {
    if (!this.db) throw new Error('Database not connected');

    const id = crypto.randomUUID();
    await this.db.add('notifications', {
      id,
      ...notification,
      timestamp: new Date(),
      status: 'delivered',
    });

    return id;
  }

  async updateNotificationStatus(
    id: string,
    status: 'clicked' | 'dismissed'
  ): Promise<void> {
    if (!this.db) throw new Error('Database not connected');
    const notification = await this.db.get('notifications', id);
    if (notification) {
      notification.status = status;
      await this.db.put('notifications', notification);
    }
  }

  async getNotifications(
    status?: 'delivered' | 'clicked' | 'dismissed',
    limit = 50
  ): Promise<any[]> {
    if (!this.db) throw new Error('Database not connected');
    if (status) {
      return this.db.getAllFromIndex('notifications', 'by-status', status, limit);
    }
    return this.db.getAll('notifications', undefined, limit);
  }

  async clearOldNotifications(daysToKeep = 30): Promise<void> {
    if (!this.db) throw new Error('Database not connected');
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysToKeep);

    const tx = this.db.transaction('notifications', 'readwrite');
    const store = tx.store;
    let cursor = await store.openCursor();

    while (cursor) {
      if (cursor.value.timestamp < cutoff) {
        await cursor.delete();
      }
      cursor = await cursor.continue();
    }
  }

  // Storage management
  async getStorageEstimate(): Promise<{
    usage: number;
    quota: number;
  }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        usage: estimate.usage || 0,
        quota: estimate.quota || 0,
      };
    }
    return { usage: 0, quota: 0 };
  }

  async clearStorage(): Promise<void> {
    if (!this.db) throw new Error('Database not connected');
    await this.db.clear('schedules');
    await this.db.clear('changes');
    await this.db.clear('notifications');
  }
}
