import { useState, useEffect } from 'react';
import { OfflineStorage } from '../services/offline/offlineStorage';
import { SyncService } from '../services/offline/syncService';
import { NetworkStatus } from '../services/offline/networkStatus';
import { Assessment } from '../types/assessment.types';
import { Visit } from '../types/visit.types';
import { ConflictResolutionStrategy } from '../services/offline/conflictResolver';
import { BatchSyncService } from '../services/offline/batchSync';

export function useOffline() {
  const [isOnline, setIsOnline] = useState(true);
  const [syncStatus, setSyncStatus] = useState<{
    lastSync: Date | null;
    pendingChanges: number;
    storageUsed: number;
    syncProgress?: {
      total: number;
      completed: number;
      failed: number;
      inProgress: number;
    };
  }>({
    lastSync: null,
    pendingChanges: 0,
    storageUsed: 0
  });

  const offlineStorage = OfflineStorage.getInstance();
  const syncService = SyncService.getInstance();
  const networkStatus = NetworkStatus.getInstance();
  const batchSync = BatchSyncService.getInstance();

  useEffect(() => {
    // Initialize online status
    setIsOnline(networkStatus.isOnline());

    // Set up network status listeners
    const handleOnline = () => {
      setIsOnline(true);
      batchSync.startSync(); // Start sync when online
    };
    const handleOffline = () => setIsOnline(false);

    networkStatus.onOnline(handleOnline);
    networkStatus.onOffline(handleOffline);

    // Set up sync progress listener
    const unsubscribe = batchSync.onProgress((progress) => {
      setSyncStatus(prev => ({
        ...prev,
        syncProgress: progress
      }));
    });

    // Update sync status periodically
    const updateSyncStatus = async () => {
      const status = await syncService.getSyncStatus();
      setSyncStatus(prev => ({
        ...status,
        syncProgress: prev.syncProgress
      }));
    };

    const statusInterval = setInterval(updateSyncStatus, 30000);
    updateSyncStatus();

    return () => {
      networkStatus.removeOnlineCallback(handleOnline);
      networkStatus.removeOfflineCallback(handleOffline);
      clearInterval(statusInterval);
      unsubscribe();
    };
  }, []);

  // Assessment operations with batch sync
  const saveAssessment = async (assessment: Assessment) => {
    await offlineStorage.saveAssessment(assessment);
    await batchSync.queueForSync(assessment);
  };

  const getAssessment = async (id: string) => {
    return await offlineStorage.getAssessment(id);
  };

  const getAllAssessments = async () => {
    return await offlineStorage.getAllAssessments();
  };

  // Visit operations with batch sync
  const saveVisit = async (visit: Visit) => {
    await offlineStorage.saveVisit(visit);
    await batchSync.queueForSync(visit);
  };

  const getVisit = async (id: string) => {
    return await offlineStorage.getVisit(id);
  };

  const getAllVisits = async () => {
    return await offlineStorage.getAllVisits();
  };

  // Conflict resolution
  const resolveConflict = async <T extends Assessment | Visit>(
    clientData: T,
    serverData: T,
    strategy?: ConflictResolutionStrategy
  ) => {
    return await offlineStorage.resolveConflict(clientData, serverData, strategy);
  };

  return {
    isOnline,
    syncStatus,
    assessment: {
      save: saveAssessment,
      get: getAssessment,
      getAll: getAllAssessments,
    },
    visit: {
      save: saveVisit,
      get: getVisit,
      getAll: getAllVisits,
    },
    sync: {
      syncAll: batchSync.startSync,
      status: syncStatus,
      resolveConflict,
      pendingCount: batchSync.getPendingCount(),
      isInProgress: batchSync.isInProgress(),
    },
  };
}
