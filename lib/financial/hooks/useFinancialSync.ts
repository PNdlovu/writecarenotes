import { useEffect, useState } from 'react';
import { PrismaClient } from '@prisma/client';
import { FinancialSync, SyncStatus, SyncOperationType } from '../offline/sync';
import { useToast } from '@/components/ui/use-toast';
import useFinancialTranslation from '../i18n/hooks/useFinancialTranslation';

export const useFinancialSync = (tenantId: string, options = {}) => {
  const [sync, setSync] = useState<FinancialSync | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();
  const { t } = useFinancialTranslation();

  useEffect(() => {
    const prisma = new PrismaClient();
    const syncInstance = new FinancialSync(prisma, tenantId, {
      syncInterval: 30000,
      maxRetries: 3,
      conflictResolution: 'manual',
      ...options
    });

    setSync(syncInstance);

    // Listen for sync conflicts
    const handleConflict = (event: CustomEvent) => {
      const { entity, id, serverData, clientData } = event.detail;
      toast({
        title: t('errors.sync.conflict'),
        description: t('errors.sync.conflictDescription', { entity }),
        variant: 'destructive',
        action: (
          <div className="flex space-x-2">
            <button
              onClick={() => syncInstance.resolveConflict(entity, id, 'server')}
              className="px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-500"
            >
              {t('errors.sync.useServer')}
            </button>
            <button
              onClick={() => syncInstance.resolveConflict(entity, id, 'client')}
              className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-500"
            >
              {t('errors.sync.useLocal')}
            </button>
          </div>
        ),
      });
    };

    window.addEventListener('financial-sync-conflict', handleConflict as EventListener);

    // Update online status
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
      if (navigator.onLine) {
        toast({
          title: t('common.online'),
          description: t('common.syncResumed'),
          duration: 3000,
        });
      } else {
        toast({
          title: t('common.offline'),
          description: t('common.syncPaused'),
          variant: 'destructive',
          duration: null,
        });
      }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Initial online status
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('financial-sync-conflict', handleConflict as EventListener);
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, [tenantId, options, t, toast]);

  const queueSync = async (type: SyncOperationType, entity: string, data: any) => {
    if (!sync) return;
    
    try {
      setIsSyncing(true);
      await sync.queueSync(type, entity, data);
    } catch (error) {
      toast({
        title: t('errors.sync.queueFailed'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const getSyncStatus = async (entity: string, id: string): Promise<SyncStatus> => {
    if (!sync) return SyncStatus.SYNCED;
    return sync.getSyncStatus(entity, id);
  };

  const resolveConflict = async (entity: string, id: string, resolution: 'server' | 'client') => {
    if (!sync) return;
    
    try {
      setIsSyncing(true);
      await sync.resolveConflict(entity, id, resolution);
      toast({
        title: t('common.success'),
        description: t('common.conflictResolved'),
      });
    } catch (error) {
      toast({
        title: t('errors.sync.resolutionFailed'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    isOnline,
    isSyncing,
    queueSync,
    getSyncStatus,
    resolveConflict
  };
};

export default useFinancialSync;
