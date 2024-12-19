/**
 * Organization Offline Service
 * Handles offline data management and synchronization
 */
import { Organization } from '../types/organization.types'
import { OrganizationOfflineStore } from '../lib/offline/organizationOfflineStore'
import { OrganizationService } from './organizationService'
import { OrganizationError, OrganizationErrorCode } from '../types/errors'

export class OrganizationOfflineService {
  private static instance: OrganizationOfflineService
  private store: OrganizationOfflineStore
  private onlineService: OrganizationService
  private syncInProgress = false

  private constructor() {
    this.store = OrganizationOfflineStore.getInstance()
    this.onlineService = OrganizationService.getInstance()
  }

  static getInstance(): OrganizationOfflineService {
    if (!OrganizationOfflineService.instance) {
      OrganizationOfflineService.instance = new OrganizationOfflineService()
    }
    return OrganizationOfflineService.instance
  }

  async initialize(): Promise<void> {
    await this.store.initialize()
    this.setupNetworkListeners()
  }

  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      this.syncWithServer()
    })
  }

  async getOrganization(id: string): Promise<Organization> {
    try {
      // Try online first if available
      if (navigator.onLine) {
        const org = await this.onlineService.getOrganization(id, {
          userId: 'current-user',
          tenantId: 'current-tenant',
          region: 'en-GB',
          language: 'en'
        })
        await this.store.saveOrganization(org)
        return org
      }
    } catch (error) {
      console.warn('Failed to fetch organization online, falling back to offline store')
    }

    // Fallback to offline store
    const offlineOrg = await this.store.getOrganization(id)
    if (!offlineOrg) {
      throw new OrganizationError(
        'Organization not found in offline store',
        OrganizationErrorCode.NOT_FOUND
      )
    }
    return offlineOrg
  }

  async updateOrganization(organization: Organization): Promise<void> {
    try {
      if (navigator.onLine) {
        await this.onlineService.updateOrganization(organization, {
          userId: 'current-user',
          tenantId: 'current-tenant',
          region: 'en-GB',
          language: 'en'
        })
      }
      await this.store.updateOrganization(organization)
    } catch (error) {
      if (!navigator.onLine) {
        await this.store.updateOrganization(organization)
      } else {
        throw error
      }
    }
  }

  async syncWithServer(): Promise<void> {
    if (this.syncInProgress || !navigator.onLine) return

    try {
      this.syncInProgress = true
      const pendingSyncs = await this.store.getPendingSyncs()

      for (const sync of pendingSyncs) {
        try {
          const offlineOrg = await this.store.getOrganization(sync.id)
          if (!offlineOrg) continue

          await this.onlineService.updateOrganization(offlineOrg, {
            userId: 'current-user',
            tenantId: 'current-tenant',
            region: 'en-GB',
            language: 'en'
          })
        } catch (error) {
          console.error(`Failed to sync organization ${sync.id}:`, error)
          // Handle conflict resolution here if needed
        }
      }
    } finally {
      this.syncInProgress = false
    }
  }

  async resolveConflict(
    organizationId: string,
    resolution: 'local' | 'remote'
  ): Promise<void> {
    const localOrg = await this.store.getOrganization(organizationId)
    const remoteOrg = await this.onlineService.getOrganization(organizationId, {
      userId: 'current-user',
      tenantId: 'current-tenant',
      region: 'en-GB',
      language: 'en'
    })

    if (resolution === 'local' && localOrg) {
      await this.onlineService.updateOrganization(localOrg, {
        userId: 'current-user',
        tenantId: 'current-tenant',
        region: 'en-GB',
        language: 'en'
      })
    } else if (resolution === 'remote' && remoteOrg) {
      await this.store.updateOrganization(remoteOrg)
    }
  }
}


