import { useCallback } from 'react';
import { openDB } from 'idb';
import { DB_NAME, DB_VERSION, STORE_NAMES } from '../constants';
import type { OfflineDBSchema, AuditLogItem } from '../types';

export function useAuditLog() {
  const logAction = useCallback(async (action: string, details: any) => {
    try {
      const db = await openDB<OfflineDBSchema>(DB_NAME, DB_VERSION);
      const tx = db.transaction(STORE_NAMES.AUDIT_LOGS, 'readwrite');
      const store = tx.objectStore(STORE_NAMES.AUDIT_LOGS);

      const logItem: AuditLogItem = {
        action,
        timestamp: Date.now(),
        userId: 'current-user-id', // Replace with actual user ID
        tenantId: 'current-tenant-id', // Replace with actual tenant ID
        deviceId: 'device-id', // Implement device ID tracking
        details,
        ipAddress: 'client-ip', // Implement IP tracking
        userAgent: navigator.userAgent
      };

      await store.add(logItem);
    } catch (error) {
      console.error('Error logging audit action:', error);
    }
  }, []);

  const getAuditLogs = useCallback(async (options: {
    startDate?: Date;
    endDate?: Date;
    userId?: string;
    tenantId?: string;
    limit?: number;
  } = {}) => {
    try {
      const db = await openDB<OfflineDBSchema>(DB_NAME, DB_VERSION);
      const tx = db.transaction(STORE_NAMES.AUDIT_LOGS, 'readonly');
      const store = tx.objectStore(STORE_NAMES.AUDIT_LOGS);

      let index = store.index('by-date');
      let range = undefined;

      if (options.startDate && options.endDate) {
        range = IDBKeyRange.bound(options.startDate, options.endDate);
      } else if (options.startDate) {
        range = IDBKeyRange.lowerBound(options.startDate);
      } else if (options.endDate) {
        range = IDBKeyRange.upperBound(options.endDate);
      }

      if (options.userId) {
        index = store.index('by-user');
        range = IDBKeyRange.only(options.userId);
      } else if (options.tenantId) {
        index = store.index('by-tenant');
        range = IDBKeyRange.only(options.tenantId);
      }

      const logs = await index.getAll(range, options.limit);
      return logs;
    } catch (error) {
      console.error('Error retrieving audit logs:', error);
      return [];
    }
  }, []);

  return {
    logAction,
    getAuditLogs
  };
}


