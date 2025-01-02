import { Organization } from '../types/organization.types';
import { db } from '@/lib/db';
import { OfflineManager } from '@/lib/offline/OfflineManager';

export class OrganizationOfflineManager {
  private static instance: OrganizationOfflineManager;
  private offlineManager: OfflineManager;

  private constructor() {
    this.offlineManager = new OfflineManager('organizations');
  }

  static getInstance(): OrganizationOfflineManager {
    if (!OrganizationOfflineManager.instance) {
      OrganizationOfflineManager.instance = new OrganizationOfflineManager();
    }
    return OrganizationOfflineManager.instance;
  }

  async syncOrganization(organization: Organization): Promise<void> {
    await this.offlineManager.syncItem(organization.id, organization);
  }

  async getOfflineOrganization(id: string): Promise<Organization | null> {
    return await this.offlineManager.getItem(id);
  }

  async saveOfflineOrganization(organization: Organization): Promise<void> {
    await this.offlineManager.saveItem(organization.id, organization);
  }

  async handleConflict(localOrg: Organization, remoteOrg: Organization): Promise<Organization> {
    // Implement merge strategy based on timestamps and fields
    return {
      ...localOrg,
      ...remoteOrg,
      updatedAt: new Date(),
      metadata: {
        ...localOrg.metadata,
        ...remoteOrg.metadata,
        hasConflict: true,
        conflictResolution: 'auto-merged'
      }
    };
  }
}


