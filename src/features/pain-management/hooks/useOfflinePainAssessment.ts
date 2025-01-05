/**
 * @fileoverview Offline Pain Assessment Hook
 * @version 1.0.0
 * @created 2024-03-21
 * @copyright Write Care Notes Ltd
 */

import { useState, useEffect } from 'react';
import { useNetwork } from '@/hooks/useNetwork';
import { useIndexedDB } from '@/hooks/useIndexedDB';
import { PainAssessment } from '../types';

export function useOfflinePainAssessment() {
  const { isOnline } = useNetwork();
  const { store, retrieve, sync } = useIndexedDB('painAssessments');
  const [pendingSync, setPendingSync] = useState<PainAssessment[]>([]);

  // Sync when coming back online
  useEffect(() => {
    if (isOnline && pendingSync.length > 0) {
      syncPendingAssessments();
    }
  }, [isOnline, pendingSync]);

  const saveAssessment = async (assessment: PainAssessment) => {
    if (isOnline) {
      // Normal online save
      return await saveToDB(assessment);
    } else {
      // Store locally and queue for sync
      await store(assessment);
      setPendingSync(prev => [...prev, assessment]);
      return assessment;
    }
  };

  const syncPendingAssessments = async () => {
    try {
      await sync();
      setPendingSync([]);
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  return {
    saveAssessment,
    pendingSync,
    isOnline
  };
} 