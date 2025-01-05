/**
 * @writecarenotes.com
 * @fileoverview Offline provider component for managing application-wide offline state
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Enterprise-grade offline provider that manages application-wide offline state,
 * sync operations, and network connectivity. Implements offline-first architecture
 * with background sync, conflict resolution, and queue management for UK and Ireland
 * care homes compliance.
 */

'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { OfflineService } from '@/lib/offline/offlineService'

interface OfflineContextType {
  isOnline: boolean
  isSyncing: boolean
  offlineService: OfflineService
  pendingActions: number
}

const OfflineContext = createContext<OfflineContextType>({
  isOnline: true,
  isSyncing: false,
  offlineService: new OfflineService(),
  pendingActions: 0,
})

export const useOffline = () => useContext(OfflineContext)

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [pendingActions, setPendingActions] = useState(0)
  const [offlineService] = useState(() => new OfflineService())

  useEffect(() => {
    // Initialize offline service
    offlineService.init()

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
          await offlineService.processSyncQueue()
          // Update pending actions count
          const pendingCount = await offlineService.getPendingSyncCount()
          setPendingActions(pendingCount)
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
  }, [offlineService, isSyncing])

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        isSyncing,
        offlineService,
        pendingActions,
      }}
    >
      {children}
    </OfflineContext.Provider>
  )
} 


