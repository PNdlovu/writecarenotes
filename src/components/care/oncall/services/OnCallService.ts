/**
 * @writecarenotes.com
 * @fileoverview On-Call Management Service
 * @version 1.0.0
 * @created 2025-01-02
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Core service layer for managing on-call operations across different
 * care home types and regions. Implements enterprise-grade features
 * including offline support, sync management, and error handling.
 */

import { makeAutoObservable, runInAction } from 'mobx';
import { BaseCareService } from '../../base/BaseCareService';
import { OnCallRecord, Staff, Region, Priority, CallStatus } from '../types/OnCallTypes';
import { CareHome } from '../../types/CareHome';
import { Organization } from '../../base/types';
import OnCallAPI from '../../../../api/OnCallAPI';
import { OnCallStorage } from '../storage/OnCallStorage';

export class OnCallService extends BaseCareService {
    private static instance: OnCallService;
    private organization: Organization | null = null;
    private careHome: CareHome | null = null;
    private api: OnCallAPI;
    private storage: OnCallStorage;
    private syncInterval: NodeJS.Timeout | null = null;

    private constructor() {
        super();
        this.api = OnCallAPI.getInstance();
        this.storage = OnCallStorage.getInstance();
        makeAutoObservable(this);
    }

    public static getInstance(): OnCallService {
        if (!OnCallService.instance) {
            OnCallService.instance = new OnCallService();
        }
        return OnCallService.instance;
    }

    public initialize(organization: Organization, careHome: CareHome): void {
        this.organization = organization;
        this.careHome = careHome;
        this.setupNotifications();
        this.startSyncProcess();
    }

    private setupNotifications(): void {
        if (!this.organization || !this.careHome) {
            throw new Error('OnCallService not initialized with organization and care home');
        }
        
        // Setup notifications with organization and care home context
        this.notificationService.connect(
            this.careHome.id,
            this.careHome.region,
            {
                organizationId: this.organization.id,
                careType: this.careHome.type
            }
        );
    }

    private startSyncProcess(): void {
        // Attempt to sync every 5 minutes
        this.syncInterval = setInterval(() => {
            this.syncPendingChanges();
        }, 5 * 60 * 1000);

        // Initial sync
        this.syncPendingChanges();
    }

    private async syncPendingChanges(): Promise<void> {
        try {
            const pendingSyncs = await this.storage.getPendingSyncs();
            
            for (const sync of pendingSyncs) {
                try {
                    switch (sync.collection) {
                        case 'records':
                            if (sync.type === 'update') {
                                await this.api.updateRecord(sync.data.id, sync.data);
                            } else if (sync.type === 'create') {
                                await this.api.createRecord(sync.data);
                            }
                            break;
                        // Add other sync cases as needed
                    }
                    await this.storage.clearPendingSync(sync.id);
                } catch (error) {
                    console.error('Failed to sync item:', error);
                    // Keep the sync item for retry
                }
            }
        } catch (error) {
            console.error('Sync process failed:', error);
        }
    }

    public async createRecord(record: Partial<OnCallRecord>): Promise<OnCallRecord> {
        if (!this.organization || !this.careHome) {
            throw new Error('OnCallService not initialized with organization and care home');
        }

        const enrichedRecord = {
            ...record,
            organizationId: this.organization.id,
            careHomeId: this.careHome.id,
            compliance: {
                ...record.compliance,
                regulatoryRequirements: [
                    ...this.organization.regulatoryRequirements,
                    ...this.careHome.regulatoryRequirements
                ]
            }
        };

        try {
            // Try API first
            const newRecord = await this.api.createRecord(enrichedRecord);
            // Update local storage
            await this.storage.saveRecord(newRecord);
            return newRecord;
        } catch (error) {
            console.warn('Failed to create record in API, saving locally:', error);
            // Create temporary ID for offline mode
            const offlineRecord: OnCallRecord = {
                ...enrichedRecord as OnCallRecord,
                id: `temp-${Date.now()}`,
                metadata: {
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    version: 1,
                    region: enrichedRecord.careHomeId?.split('-')[0] || 'unknown'
                }
            };
            await this.storage.saveRecord(offlineRecord);
            await this.storage.addPendingSync('records', 'create', offlineRecord);
            return offlineRecord;
        }
    }

    public async updateRecord(id: string, updates: Partial<OnCallRecord>): Promise<OnCallRecord> {
        if (!this.organization || !this.careHome) {
            throw new Error('OnCallService not initialized with organization and care home');
        }

        try {
            // Try API first
            const updatedRecord = await this.api.updateRecord(id, updates);
            // Update local storage
            await this.storage.saveRecord(updatedRecord);
            return updatedRecord;
        } catch (error) {
            console.warn('Failed to update record in API, updating locally:', error);
            const existingRecord = await this.storage.getRecord(id);
            if (!existingRecord) {
                throw new Error('Record not found');
            }
            const offlineUpdate: OnCallRecord = {
                ...existingRecord,
                ...updates,
                metadata: {
                    ...existingRecord.metadata,
                    updatedAt: new Date(),
                    version: existingRecord.metadata.version + 1
                }
            };
            await this.storage.saveRecord(offlineUpdate);
            await this.storage.addPendingSync('records', 'update', offlineUpdate);
            return offlineUpdate;
        }
    }

    public async getActiveRecords(careHomeId: string): Promise<OnCallRecord[]> {
        try {
            // Try to get from API first
            const records = await this.api.getActiveRecords(careHomeId);
            // Update local storage
            for (const record of records) {
                await this.storage.saveRecord(record);
            }
            return records;
        } catch (error) {
            console.warn('Failed to fetch from API, using local storage:', error);
            // Fallback to local storage
            return this.storage.getActiveRecords(careHomeId);
        }
    }

    public async assignStaff(recordId: string, staffId: string): Promise<void> {
        const staff = await this.storage.getStaff(staffId);
        if (!staff) {
            throw new Error('Staff not found');
        }

        await this.updateRecord(recordId, {
            responderId: staffId,
            status: 'active' as CallStatus
        });
    }

    public async getAvailableStaff(region: string): Promise<Staff[]> {
        try {
            const staff = await this.api.getAvailableStaff(region);
            // Update local storage
            for (const member of staff) {
                await this.storage.saveStaff(member);
            }
            return staff;
        } catch (error) {
            console.warn('Failed to fetch staff from API, using local storage:', error);
            return this.storage.getAvailableStaff(region);
        }
    }

    dispose(): void {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }
    }
}
