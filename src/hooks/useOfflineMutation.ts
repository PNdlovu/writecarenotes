import { useMutation, UseMutationOptions } from '@tanstack/react-query'
import { openDB, DBSchema, IDBPDatabase } from 'idb'
import { v4 as uuidv4 } from 'uuid'

interface OfflineQueueItem {
  id: string
  queue: string
  data: unknown
  createdAt: number
  retryCount: number
  lastRetry?: number
}

interface OfflineDB extends DBSchema {
  offlineQueue: {
    key: string
    value: OfflineQueueItem
    indexes: { 'by-queue': string }
  }
}

interface OfflineOptions {
  queue: string
  retry?: boolean
  maxRetries?: number
  retryInterval?: number
}

const DB_NAME = 'careHomeOfflineDB'
const STORE_NAME = 'offlineQueue'

/**
 * Initialize IndexedDB for offline storage
 */
async function initDB(): Promise<IDBPDatabase<OfflineDB>> {
  return openDB<OfflineDB>(DB_NAME, 1, {
    upgrade(db) {
      const store = db.createObjectStore(STORE_NAME, {
        keyPath: 'id',
      })
      store.createIndex('by-queue', 'queue')
    },
  })
}

/**
 * Custom hook for handling mutations with offline support
 * 
 * @param options - Standard React Query mutation options plus offline-specific options
 * @returns Mutation object with additional offline capabilities
 */
export function useOfflineMutation<TData = unknown, TError = Error, TVariables = unknown>(
  options: UseMutationOptions<TData, TError, TVariables> & {
    offlineOptions: OfflineOptions
  }
) {
  const {
    mutationFn,
    offlineOptions,
    onSuccess,
    onError,
    ...mutationOptions
  } = options

  const { queue, retry = true, maxRetries = 3, retryInterval = 60000 } = offlineOptions

  /**
   * Add an item to the offline queue
   */
  const addToQueue = async (variables: TVariables) => {
    const db = await initDB()
    const queueItem: OfflineQueueItem = {
      id: uuidv4(),
      queue,
      data: variables,
      createdAt: Date.now(),
      retryCount: 0,
    }
    await db.add(STORE_NAME, queueItem)
  }

  /**
   * Process the offline queue
   */
  const processQueue = async () => {
    const db = await initDB()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const index = store.index('by-queue')
    const items = await index.getAll(queue)

    for (const item of items) {
      if (item.retryCount >= maxRetries) {
        await store.delete(item.id)
        continue
      }

      try {
        await mutationFn(item.data as TVariables)
        await store.delete(item.id)
      } catch (error) {
        if (retry) {
          const updatedItem = {
            ...item,
            retryCount: item.retryCount + 1,
            lastRetry: Date.now(),
          }
          await store.put(updatedItem)
        } else {
          await store.delete(item.id)
        }
      }
    }
  }

  /**
   * Set up periodic queue processing
   */
  const startQueueProcessing = () => {
    if (retry) {
      setInterval(() => {
        if (navigator.onLine) {
          processQueue()
        }
      }, retryInterval)
    }
  }

  // Start queue processing when online
  if (typeof window !== 'undefined') {
    window.addEventListener('online', processQueue)
    startQueueProcessing()
  }

  return useMutation<TData, TError, TVariables>({
    ...mutationOptions,
    mutationFn: async (variables) => {
      try {
        if (!navigator.onLine) {
          await addToQueue(variables)
          throw new Error('Offline: Operation queued')
        }
        return await mutationFn(variables)
      } catch (error) {
        if (!navigator.onLine) {
          await addToQueue(variables)
          throw new Error('Offline: Operation queued')
        }
        throw error
      }
    },
    onSuccess: async (data, variables, context) => {
      if (onSuccess) {
        await onSuccess(data, variables, context)
      }
      if (navigator.onLine) {
        processQueue()
      }
    },
    onError: async (error, variables, context) => {
      if (onError) {
        await onError(error, variables, context)
      }
      if (!navigator.onLine) {
        await addToQueue(variables)
      }
    },
  })
}

/**
 * Hook to get the current queue status
 * @param queueName - Name of the queue to check
 * @returns Object containing queue statistics
 */
export function useQueueStatus(queueName: string) {
  const getQueueStats = async () => {
    const db = await initDB()
    const tx = db.transaction(STORE_NAME, 'readonly')
    const index = tx.store.index('by-queue')
    const items = await index.getAll(queueName)

    return {
      total: items.length,
      pending: items.filter(item => item.retryCount === 0).length,
      retrying: items.filter(item => item.retryCount > 0).length,
      failed: items.filter(item => item.retryCount >= 3).length,
    }
  }

  return { getQueueStats }
}


