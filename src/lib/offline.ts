import { openDB, IDBPDatabase } from 'idb'
import { OfflineConfig } from '@/components/dashboard/visualizations/types'

interface OfflineStore {
  id: string
  data: any
  timestamp: number
  version: string
  type: string
}

class OfflineService {
  private db: IDBPDatabase | null = null
  private config: OfflineConfig
  private readonly DB_NAME = 'care-dashboard-offline'
  private readonly DB_VERSION = 1
  private readonly STORES = {
    DATA: 'offline-data',
    SYNC: 'sync-queue',
    META: 'metadata'
  }

  constructor(config: OfflineConfig) {
    this.config = config
    this.initDatabase()
  }

  private async initDatabase() {
    try {
      this.db = await openDB(this.DB_NAME, this.DB_VERSION, {
        upgrade(db) {
          // Create stores if they don't exist
          if (!db.objectStoreNames.contains('offline-data')) {
            db.createObjectStore('offline-data', { keyPath: 'id' })
          }
          if (!db.objectStoreNames.contains('sync-queue')) {
            db.createObjectStore('sync-queue', { keyPath: 'id', autoIncrement: true })
          }
          if (!db.objectStoreNames.contains('metadata')) {
            db.createObjectStore('metadata', { keyPath: 'key' })
          }
        }
      })

      // Store last sync time
      await this.updateMetadata('lastSync', new Date().toISOString())
    } catch (error) {
      console.error('Failed to initialize offline database:', error)
      throw new Error('Offline storage initialization failed')
    }
  }

  async storeData(key: string, data: any, type: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    const store: OfflineStore = {
      id: key,
      data,
      timestamp: Date.now(),
      version: '1.0',
      type
    }

    try {
      await this.db.put(this.STORES.DATA, store)
      await this.updateMetadata('lastUpdate', new Date().toISOString())
    } catch (error) {
      console.error('Failed to store offline data:', error)
      throw new Error('Failed to store offline data')
    }
  }

  async getData(key: string): Promise<any> {
    if (!this.db) throw new Error('Database not initialized')

    try {
      const store = await this.db.get(this.STORES.DATA, key)
      return store?.data
    } catch (error) {
      console.error('Failed to retrieve offline data:', error)
      throw new Error('Failed to retrieve offline data')
    }
  }

  async queueSync(operation: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    try {
      await this.db.add(this.STORES.SYNC, {
        operation,
        timestamp: Date.now(),
        retries: 0
      })

      await this.updateMetadata('pendingChanges', 
        (await this.getPendingChangesCount()) + 1
      )
    } catch (error) {
      console.error('Failed to queue sync operation:', error)
      throw new Error('Failed to queue sync operation')
    }
  }

  async processSyncQueue(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    const tx = this.db.transaction(this.STORES.SYNC, 'readwrite')
    const store = tx.objectStore(this.STORES.SYNC)
    const queue = await store.getAll()

    for (const item of queue) {
      try {
        // Process sync operation
        // Implement your sync logic here
        await store.delete(item.id)
      } catch (error) {
        console.error('Failed to process sync item:', error)
        // Update retry count and delay next attempt
        item.retries++
        if (item.retries < 3) {
          await store.put(item)
        } else {
          await store.delete(item.id)
        }
      }
    }

    await this.updateMetadata('lastSync', new Date().toISOString())
    await this.updateMetadata('pendingChanges', 0)
  }

  private async updateMetadata(key: string, value: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    try {
      await this.db.put(this.STORES.META, { key, value })
    } catch (error) {
      console.error('Failed to update metadata:', error)
      throw new Error('Failed to update metadata')
    }
  }

  async getMetadata(key: string): Promise<any> {
    if (!this.db) throw new Error('Database not initialized')

    try {
      const meta = await this.db.get(this.STORES.META, key)
      return meta?.value
    } catch (error) {
      console.error('Failed to retrieve metadata:', error)
      throw new Error('Failed to retrieve metadata')
    }
  }

  async getPendingChangesCount(): Promise<number> {
    if (!this.db) throw new Error('Database not initialized')

    try {
      const count = await this.db.count(this.STORES.SYNC)
      return count
    } catch (error) {
      console.error('Failed to get pending changes count:', error)
      throw new Error('Failed to get pending changes count')
    }
  }

  async clearOfflineData(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    try {
      await this.db.clear(this.STORES.DATA)
      await this.updateMetadata('lastClear', new Date().toISOString())
    } catch (error) {
      console.error('Failed to clear offline data:', error)
      throw new Error('Failed to clear offline data')
    }
  }

  async isOnline(): Promise<boolean> {
    return navigator.onLine
  }

  async getLastSyncTime(): Promise<string | null> {
    return this.getMetadata('lastSync')
  }

  destroy(): void {
    if (this.db) {
      this.db.close()
      this.db = null
    }
  }
}

export const offlineService = new OfflineService() 


