/**
 * @writecarenotes.com
 * @fileoverview Service for managing offline data storage
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Staff, DomiciliaryStaff, StaffAvailability, StaffDocument } from '@prisma/client';

interface StaffDB extends DBSchema {
  staff: {
    key: string;
    value: Staff & {
      domiciliaryStaff?: DomiciliaryStaff;
      availability?: StaffAvailability[];
      documents?: StaffDocument[];
    };
    indexes: {
      'by-organization': string;
      'by-sync-status': string;
      'by-region': string;
    };
  };
  offlineChanges: {
    key: string;
    value: {
      id: string;
      staffId: string;
      changeType: 'CREATE' | 'UPDATE' | 'DELETE';
      entityType: string;
      entityId: string;
      changes: any;
      createdAt: Date;
      status: 'PENDING' | 'SYNCED' | 'FAILED';
    };
    indexes: {
      'by-status': string;
      'by-staff': string;
    };
  };
}

export class OfflineStorageService {
  private static DB_NAME = 'staff-management';
  private static DB_VERSION = 1;
  private static db: IDBPDatabase<StaffDB>;

  /**
   * Initialize the database
   */
  static async init(): Promise<void> {
    this.db = await openDB<StaffDB>(this.DB_NAME, this.DB_VERSION, {
      upgrade(db) {
        // Staff store
        const staffStore = db.createObjectStore('staff', { keyPath: 'id' });
        staffStore.createIndex('by-organization', 'organizationId');
        staffStore.createIndex('by-sync-status', 'syncStatus');
        staffStore.createIndex('by-region', 'region');

        // Offline changes store
        const changesStore = db.createObjectStore('offlineChanges', { keyPath: 'id' });
        changesStore.createIndex('by-status', 'status');
        changesStore.createIndex('by-staff', 'staffId');
      }
    });
  }

  /**
   * Store staff data offline
   */
  static async storeStaffData(staff: Staff & {
    domiciliaryStaff?: DomiciliaryStaff;
    availability?: StaffAvailability[];
    documents?: StaffDocument[];
  }): Promise<void> {
    await this.db.put('staff', staff);
  }

  /**
   * Get staff data from offline storage
   */
  static async getStaffData(staffId: string): Promise<Staff | undefined> {
    return await this.db.get('staff', staffId);
  }

  /**
   * Get all staff for an organization
   */
  static async getOrganizationStaff(organizationId: string): Promise<Staff[]> {
    return await this.db.getAllFromIndex('staff', 'by-organization', organizationId);
  }

  /**
   * Queue an offline change
   */
  static async queueChange(change: {
    staffId: string;
    changeType: 'CREATE' | 'UPDATE' | 'DELETE';
    entityType: string;
    entityId: string;
    changes: any;
  }): Promise<void> {
    await this.db.add('offlineChanges', {
      id: crypto.randomUUID(),
      ...change,
      createdAt: new Date(),
      status: 'PENDING'
    });
  }

  /**
   * Get pending changes
   */
  static async getPendingChanges(): Promise<any[]> {
    return await this.db.getAllFromIndex('offlineChanges', 'by-status', 'PENDING');
  }

  /**
   * Update change status
   */
  static async updateChangeStatus(
    changeId: string,
    status: 'SYNCED' | 'FAILED'
  ): Promise<void> {
    const change = await this.db.get('offlineChanges', changeId);
    if (change) {
      change.status = status;
      await this.db.put('offlineChanges', change);
    }
  }

  /**
   * Clear synced changes
   */
  static async clearSyncedChanges(): Promise<void> {
    const syncedChanges = await this.db.getAllFromIndex('offlineChanges', 'by-status', 'SYNCED');
    const tx = this.db.transaction('offlineChanges', 'readwrite');
    await Promise.all(
      syncedChanges.map(change => tx.store.delete(change.id))
    );
    await tx.done;
  }

  /**
   * Get staff by region
   */
  static async getStaffByRegion(region: string): Promise<Staff[]> {
    return await this.db.getAllFromIndex('staff', 'by-region', region);
  }

  /**
   * Clear all data (for testing/development)
   */
  static async clearAllData(): Promise<void> {
    const tx = this.db.transaction(['staff', 'offlineChanges'], 'readwrite');
    await Promise.all([
      tx.objectStore('staff').clear(),
      tx.objectStore('offlineChanges').clear()
    ]);
    await tx.done;
  }

  /**
   * Check if offline data is available
   */
  static async hasOfflineData(): Promise<boolean> {
    const staffCount = await this.db.count('staff');
    return staffCount > 0;
  }

  /**
   * Get database size estimation
   */
  static async getStorageUsage(): Promise<{
    staffCount: number;
    pendingChanges: number;
    estimatedSize: number;
  }> {
    const staffCount = await this.db.count('staff');
    const pendingChanges = await this.db.countFromIndex('offlineChanges', 'by-status', 'PENDING');
    
    // Rough estimation of size (in bytes)
    const estimatedSize = (await this.db.getAll('staff')).reduce(
      (size, staff) => size + JSON.stringify(staff).length,
      0
    );

    return {
      staffCount,
      pendingChanges,
      estimatedSize
    };
  }
} 