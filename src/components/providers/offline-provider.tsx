'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { OfflineSync } from '@/lib/offline/sync'

interface OfflineContextType {
  isOnline: boolean
  isSyncing: boolean
  offlineSync: OfflineSync
  pendingActions: number
}

const OfflineContext = createContext<OfflineContextType>({
  isOnline: true,
  isSyncing: false,
  offlineSync: new OfflineSync(),
  pendingActions: 0,
})

export const useOffline = () => useContext(OfflineContext)

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [pendingActions, setPendingActions] = useState(0)
  const [offlineSync] = useState(() => new OfflineSync())

  useEffect(() => {
    // Initialize offline sync
    offlineSync.init()

    // Set up online/offline listeners
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Set initial online state
    setIsOnline(navigator.onLine)

    // Set up periodic sync
    const syncInterval = setInterval(async () => {
      if (navigator.onLine && !isSyncing) {
        setIsSyncing(true)
        try {
          await offlineSync.processSyncQueue()
          // Update pending actions count
          const queue = await offlineSync.db?.getAllFromIndex('syncQueue', 'by-timestamp')
          setPendingActions(queue?.length || 0)
        } finally {
          setIsSyncing(false)
        }
      }
    }, 30000) // Check every 30 seconds

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(syncInterval)
    }
  }, [offlineSync, isSyncing])

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        isSyncing,
        offlineSync,
        pendingActions,
      }}
    >
      {children}
    </OfflineContext.Provider>
  )
} 


