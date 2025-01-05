import { useCallback, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { useToast } from '@/hooks/useToast'
import { useTranslation } from 'react-i18next'
import { storage } from '@/lib/storage'
import { CarePlan } from '../types'

interface PendingSync {
    id: string
    type: 'CREATE' | 'UPDATE' | 'DELETE'
    data: any
    timestamp: number
}

export function useOfflineSync() {
    const { t } = useTranslation()
    const { isOnline } = useNetworkStatus()
    const { showToast } = useToast()
    const queryClient = useQueryClient()

    // Get pending syncs
    const pendingSyncsQuery = useQuery({
        queryKey: ['pendingSyncs'],
        queryFn: async () => {
            const syncs = await storage.get<PendingSync[]>('pendingSyncs') || []
            return syncs.sort((a, b) => a.timestamp - b.timestamp)
        }
    })

    // Add to sync queue
    const addToSyncQueue = useCallback(async (
        type: PendingSync['type'],
        data: any
    ) => {
        const pendingSyncs = await storage.get<PendingSync[]>('pendingSyncs') || []
        const newSync: PendingSync = {
            id: crypto.randomUUID(),
            type,
            data,
            timestamp: Date.now()
        }
        await storage.set('pendingSyncs', [...pendingSyncs, newSync])
        queryClient.invalidateQueries({ queryKey: ['pendingSyncs'] })
    }, [queryClient])

    // Process sync queue
    const processSyncQueue = useCallback(async () => {
        if (!isOnline) return

        const pendingSyncs = await storage.get<PendingSync[]>('pendingSyncs') || []
        if (pendingSyncs.length === 0) return

        try {
            for (const sync of pendingSyncs) {
                switch (sync.type) {
                    case 'CREATE':
                        await fetch('/api/careplans', {
                            method: 'POST',
                            body: JSON.stringify(sync.data)
                        })
                        break
                    case 'UPDATE':
                        await fetch(`/api/careplans/${sync.data.id}`, {
                            method: 'PUT',
                            body: JSON.stringify(sync.data)
                        })
                        break
                    case 'DELETE':
                        await fetch(`/api/careplans/${sync.data.id}`, {
                            method: 'DELETE'
                        })
                        break
                }
            }

            // Clear sync queue after successful sync
            await storage.set('pendingSyncs', [])
            queryClient.invalidateQueries({ queryKey: ['pendingSyncs'] })
            queryClient.invalidateQueries({ queryKey: ['carePlans'] })

            showToast({
                title: t('carePlan.success.synced'),
                status: 'success'
            })
        } catch (error) {
            showToast({
                title: t('carePlan.errors.syncError'),
                status: 'error'
            })
        }
    }, [isOnline, queryClient, showToast, t])

    // Auto-sync when online
    useEffect(() => {
        if (isOnline && pendingSyncsQuery.data?.length > 0) {
            processSyncQueue()
        }
    }, [isOnline, pendingSyncsQuery.data, processSyncQueue])

    return {
        pendingSyncs: pendingSyncsQuery.data || [],
        addToSyncQueue,
        processSyncQueue,
        isOnline
    }
}


