/**
 * @writecarenotes.com
 * @fileoverview On-Call Local Storage Service
 * @version 1.0.0
 * @created 2025-01-02
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { OnCallRecord, Staff, Region } from '../types/OnCallTypes';

interface OnCallDB extends DBSchema {
    records: {
        key: string;
        value: OnCallRecord;
        indexes: {
            'by-care-home': string;
            'by-status': string;
            'by-priority': string;
        };
    };
    staff: {
        key: string;
        value: Staff;
        indexes: {
            'by-region': string;
            'by-availability': string;
        };
    };
    regions: {
        key: string;
        value: Region;
    };
    pendingSync: {
        key: string;
        value: {
            type: 'create' | 'update' | 'delete';
            collection: string;
            data: any;
            timestamp: number;
        };
    };
}

class OnCallStorage {
    private static instance: OnCallStorage;
    private db: IDBPDatabase<OnCallDB> | null = null;
    private dbName = 'oncall-db';
    private version = 1;

    private constructor() {}

    public static getInstance(): OnCallStorage {
        if (!OnCallStorage.instance) {
            OnCallStorage.instance = new OnCallStorage();
        }
        return OnCallStorage.instance;
    }

    async initialize(): Promise<void> {
        if (this.db) return;

        this.db = await openDB<OnCallDB>(this.dbName, this.version, {
            upgrade(db) {
                // Records store
                const recordStore = db.createObjectStore('records', {
                    keyPath: 'id'
                });
                recordStore.createIndex('by-care-home', 'careHomeId');
                recordStore.createIndex('by-status', 'status');
                recordStore.createIndex('by-priority', 'priority');

                // Staff store
                const staffStore = db.createObjectStore('staff', {
                    keyPath: 'id'
                });
                staffStore.createIndex('by-region', 'regions');
                staffStore.createIndex('by-availability', 'availability');

                // Regions store
                db.createObjectStore('regions', {
                    keyPath: 'id'
                });

                // Pending sync store
                db.createObjectStore('pendingSync', {
                    keyPath: 'id',
                    autoIncrement: true
                });
            }
        });
    }

    // Records operations
    async saveRecord(record: OnCallRecord): Promise<void> {
        await this.initialize();
        await this.db!.put('records', record);
        await this.addPendingSync('records', 'update', record);
    }

    async getRecord(id: string): Promise<OnCallRecord | undefined> {
        await this.initialize();
        return this.db!.get('records', id);
    }

    async getActiveRecords(careHomeId: string): Promise<OnCallRecord[]> {
        await this.initialize();
        return this.db!.getAllFromIndex('records', 'by-care-home', careHomeId);
    }

    // Staff operations
    async saveStaff(staff: Staff): Promise<void> {
        await this.initialize();
        await this.db!.put('staff', staff);
        await this.addPendingSync('staff', 'update', staff);
    }

    async getAvailableStaff(region: string): Promise<Staff[]> {
        await this.initialize();
        return this.db!.getAllFromIndex('staff', 'by-region', region);
    }

    // Region operations
    async saveRegion(region: Region): Promise<void> {
        await this.initialize();
        await this.db!.put('regions', region);
        await this.addPendingSync('regions', 'update', region);
    }

    async getRegion(id: string): Promise<Region | undefined> {
        await this.initialize();
        return this.db!.get('regions', id);
    }

    // Sync operations
    private async addPendingSync(
        collection: string,
        type: 'create' | 'update' | 'delete',
        data: any
    ): Promise<void> {
        await this.initialize();
        await this.db!.add('pendingSync', {
            collection,
            type,
            data,
            timestamp: Date.now()
        });
    }

    async getPendingSyncs(): Promise<any[]> {
        await this.initialize();
        return this.db!.getAll('pendingSync');
    }

    async clearPendingSync(id: string): Promise<void> {
        await this.initialize();
        await this.db!.delete('pendingSync', id);
    }

    // Cleanup
    async clearAll(): Promise<void> {
        await this.initialize();
        await this.db!.clear('records');
        await this.db!.clear('staff');
        await this.db!.clear('regions');
        await this.db!.clear('pendingSync');
    }
}
