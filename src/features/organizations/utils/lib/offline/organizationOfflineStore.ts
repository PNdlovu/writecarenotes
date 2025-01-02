/**
 * Organization Offline Store using IndexedDB
 */
import { openDB, DBSchema, IDBPDatabase } from 'idb'
import { Organization } from '../../types/organization.types'
import { v4 as uuidv4 } from 'uuid'

interface OrganizationDB extends DBSchema {
  organizations: {
    key: string
    value: Organization & {
      _rev: string
      _syncStatus: 'pending' | 'synced' | 'conflict'
      _lastModified: number
    }
    indexes: { '_syncStatus': string }
  }
  syncLog: {
    key: string
    value: {
      operation: 'create' | 'update' | 'delete'
      organizationId: string
      data?: Organization
      timestamp: number
      status: 'pending' | 'completed' | 'failed'
      error?: string
    }
  }
}

export class OrganizationOfflineStore {
  private static instance: OrganizationOfflineStore
  private db: IDBPDatabase<OrganizationDB> | null = null
  private readonly DB_NAME = 'organization_store'
  private readonly VERSION = 1

  private constructor() {}

  static getInstance(): OrganizationOfflineStore {
    if (!OrganizationOfflineStore.instance) {
      OrganizationOfflineStore.instance = new OrganizationOfflineStore()
    }
    return OrganizationOfflineStore.instance
  }

  async initialize(): Promise<void> {
    this.db = await openDB<OrganizationDB>(this.DB_NAME, this.VERSION, {
      upgrade(db) {
        const organizationStore = db.createObjectStore('organizations', { keyPath: 'id' })
        organizationStore.createIndex('_syncStatus', '_syncStatus')
        
        db.createObjectStore('syncLog', { keyPath: 'id', autoIncrement: true })
      },
    })
  }

  async saveOrganization(organization: Organization): Promise<void> {
    if (!this.db) await this.initialize()

    const enrichedOrg = {
      ...organization,
      _rev: uuidv4(),
      _syncStatus: 'pending' as const,
      _lastModified: Date.now(),
    }

    await this.db!.put('organizations', enrichedOrg)
    await this.logSync('create', organization.id, organization)
  }

  async getOrganization(id: string): Promise<Organization | undefined> {
    if (!this.db) await this.initialize()
    const org = await this.db!.get('organizations', id)
    return org ? this.stripMetadata(org) : undefined
  }

  async updateOrganization(organization: Organization): Promise<void> {
    if (!this.db) await this.initialize()

    const existing = await this.db!.get('organizations', organization.id)
    if (!existing) throw new Error('Organization not found in offline store')

    const updated = {
      ...organization,
      _rev: uuidv4(),
      _syncStatus: 'pending' as const,
      _lastModified: Date.now(),
    }

    await this.db!.put('organizations', updated)
    await this.logSync('update', organization.id, organization)
  }

  async deleteOrganization(id: string): Promise<void> {
    if (!this.db) await this.initialize()
    await this.db!.delete('organizations', id)
    await this.logSync('delete', id)
  }

  async getPendingSyncs(): Promise<Array<{ id: string; operation: string }>> {
    if (!this.db) await this.initialize()
    const index = this.db!.transaction('organizations').store.index('_syncStatus')
    const pending = await index.getAll('pending')
    return pending.map(org => ({
      id: org.id,
      operation: 'update'
    }))
  }

  private async logSync(
    operation: 'create' | 'update' | 'delete',
    organizationId: string,
    data?: Organization
  ): Promise<void> {
    await this.db!.add('syncLog', {
      operation,
      organizationId,
      data,
      timestamp: Date.now(),
      status: 'pending'
    })
  }

  private stripMetadata(org: Organization & { 
    _rev: string; 
    _syncStatus: string; 
    _lastModified: number 
  }): Organization {
    const { _rev, _syncStatus, _lastModified, ...clean } = org
    return clean
  }
}


