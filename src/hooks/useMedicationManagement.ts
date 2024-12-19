import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useOfflineQueue, useOfflineSync, useAuditLog } from '@/lib/offline/data';

export type AlertSeverity = 'INFO' | 'WARNING' | 'ERROR';
export type AlertType = 'COMPATIBILITY' | 'TITRATION' | 'TAPERING' | 'ADMIN';
export type ChangeType = 'TITRATION' | 'TAPERING' | 'ADMIN_CHANGE';

export interface MedicationAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  timestamp: Date;
  medicationIds: string[];
  metadata?: Record<string, any>;
}

export interface MedicationHistory<T = any> {
  id: string;
  medicationId: string;
  type: ChangeType;
  changeDate: Date;
  previousValue: T;
  newValue: T;
  reason?: string;
  userId: string;
}

export interface ExportedSchedule {
  medication: any;
  history: MedicationHistory[];
  alerts: MedicationAlert[];
  exportDate: Date;
}

export function useMedicationManagement() {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<MedicationAlert[]>([]);
  const [history, setHistory] = useState<MedicationHistory[]>([]);
  const { storeOfflineData, getOfflineData } = useOfflineQueue();

  const addAlert = useCallback((alert: Omit<MedicationAlert, 'id' | 'timestamp'>) => {
    const newAlert = {
      ...alert,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };
    setAlerts(prev => [newAlert, ...prev].slice(0, 100)); // Keep last 100 alerts

    if (alert.severity === 'WARNING' || alert.severity === 'ERROR') {
      toast({
        title: alert.severity === 'ERROR' ? 'Error' : 'Warning',
        description: alert.message,
        variant: alert.severity === 'ERROR' ? 'destructive' : 'default',
      });
    }

    return newAlert.id;
  }, [toast]);

  const recordHistory = useCallback(async <T>(entry: Omit<MedicationHistory<T>, 'id'>) => {
    const historyEntry = {
      ...entry,
      id: crypto.randomUUID(),
    };
    
    setHistory(prev => [historyEntry, ...prev]);
    await storeOfflineData('assessments', {
      type: 'MEDICATION_HISTORY',
      ...historyEntry,
    });

    return historyEntry.id;
  }, [storeOfflineData]);

  const clearAlerts = useCallback((medicationId?: string) => {
    if (medicationId) {
      setAlerts(prev => prev.filter(alert => !alert.medicationIds.includes(medicationId)));
    } else {
      setAlerts([]);
    }
  }, []);

  const getAlerts = useCallback((medicationId: string) => {
    return alerts.filter(alert => alert.medicationIds.includes(medicationId));
  }, [alerts]);

  const exportSchedule = useCallback(async (medicationId: string): Promise<ExportedSchedule | null> => {
    const medicationData = await getOfflineData('assessments', medicationId);
    if (!medicationData) return null;

    const historyData = history.filter(h => h.medicationId === medicationId);
    const alertData = alerts.filter(a => a.medicationIds.includes(medicationId));

    return {
      medication: medicationData,
      history: historyData,
      alerts: alertData,
      exportDate: new Date(),
    };
  }, [history, alerts, getOfflineData]);

  return {
    alerts,
    history,
    addAlert,
    recordHistory,
    clearAlerts,
    getAlerts,
    exportSchedule,
  };
}


