/**
 * @fileoverview Hook for managing audit log functionality
 */

import { useState, useCallback } from 'react';
import { format } from 'date-fns';
import { AuditEntry } from '../components/privacy/AuditLog';
import { AuditService } from '@/lib/audit';

interface UseAuditLogProps {
  residentId: string;
  familyMemberId: string;
}

interface FilterParams {
  category?: AuditEntry['category'];
  action?: AuditEntry['action'];
  dateRange?: {
    from: Date;
    to: Date;
  };
  searchQuery?: string;
}

export const useAuditLog = ({ residentId, familyMemberId }: UseAuditLogProps) => {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const auditService = AuditService.getInstance();

  const fetchEntries = useCallback(async () => {
    setIsLoading(true);
    try {
      const logs = await auditService.getAuditLogs({
        entityType: 'RESIDENT',
        entityId: residentId,
        actorId: familyMemberId,
      });

      // Transform backend logs to frontend format
      const transformedLogs: AuditEntry[] = logs.map(log => ({
        id: log.id,
        timestamp: new Date(log.timestamp),
        action: log.action.toLowerCase() as AuditEntry['action'],
        category: log.entityType.toLowerCase() as AuditEntry['category'],
        resource: {
          id: log.entityId,
          type: log.entityType,
          name: log.details?.resourceName || log.entityType,
        },
        user: {
          id: log.actorId,
          name: log.details?.actorName || 'Unknown',
          role: log.actorType,
          email: log.details?.actorEmail || '',
        },
        details: {
          changes: log.changes ? Object.entries(log.changes).map(([field, { old, new: newValue }]) => ({
            field,
            oldValue: String(old),
            newValue: String(newValue),
          })) : undefined,
          reason: log.details?.reason,
          location: log.details?.location,
          device: log.details?.device,
          ip: log.ipAddress,
        },
        status: log.status.toLowerCase() as AuditEntry['status'],
      }));

      setEntries(transformedLogs);
    } catch (error) {
      console.error('Error fetching audit log entries:', error);
    } finally {
      setIsLoading(false);
    }
  }, [residentId, familyMemberId, auditService]);

  const filterEntries = useCallback(async (params: FilterParams) => {
    setIsLoading(true);
    try {
      const logs = await auditService.getAuditLogs({
        entityType: 'RESIDENT',
        entityId: residentId,
        actorId: familyMemberId,
        action: params.action?.toUpperCase(),
        startDate: params.dateRange?.from,
        endDate: params.dateRange?.to,
      });

      let filteredLogs = logs;

      // Additional client-side filtering for category and search
      if (params.category) {
        filteredLogs = filteredLogs.filter(log => 
          log.entityType.toLowerCase() === params.category
        );
      }

      if (params.searchQuery) {
        const query = params.searchQuery.toLowerCase();
        filteredLogs = filteredLogs.filter(log =>
          log.details?.resourceName?.toLowerCase().includes(query) ||
          log.details?.actorName?.toLowerCase().includes(query) ||
          log.details?.reason?.toLowerCase().includes(query)
        );
      }

      // Transform to frontend format
      const transformedLogs: AuditEntry[] = filteredLogs.map(log => ({
        id: log.id,
        timestamp: new Date(log.timestamp),
        action: log.action.toLowerCase() as AuditEntry['action'],
        category: log.entityType.toLowerCase() as AuditEntry['category'],
        resource: {
          id: log.entityId,
          type: log.entityType,
          name: log.details?.resourceName || log.entityType,
        },
        user: {
          id: log.actorId,
          name: log.details?.actorName || 'Unknown',
          role: log.actorType,
          email: log.details?.actorEmail || '',
        },
        details: {
          changes: log.changes ? Object.entries(log.changes).map(([field, { old, new: newValue }]) => ({
            field,
            oldValue: String(old),
            newValue: String(newValue),
          })) : undefined,
          reason: log.details?.reason,
          location: log.details?.location,
          device: log.details?.device,
          ip: log.ipAddress,
        },
        status: log.status.toLowerCase() as AuditEntry['status'],
      }));
      setEntries(transformedLogs);
    } catch (error) {
      console.error('Error filtering audit log entries:', error);
    } finally {
      setIsLoading(false);
    }
  }, [residentId, familyMemberId, auditService]);

  const exportLog = useCallback(async (from: Date, to: Date) => {
    try {
      const logs = await auditService.getAuditLogs({
        entityType: 'RESIDENT',
        entityId: residentId,
        actorId: familyMemberId,
        startDate: from,
        endDate: to,
      });

      const csvContent = [
        ['Timestamp', 'Action', 'Category', 'Resource', 'User', 'Status', 'Details'].join(','),
        ...logs.map(log => [
          format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss'),
          log.action,
          log.entityType,
          log.details?.resourceName || log.entityType,
          log.details?.actorName || 'Unknown',
          log.status,
          log.details?.reason || ''
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-log-${format(from, 'yyyy-MM-dd')}-to-${format(to, 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting audit log:', error);
    }
  }, [residentId, familyMemberId, auditService]);

  return {
    entries,
    isLoading,
    fetchEntries,
    filterEntries,
    exportLog,
  };
};


