/**
 * @fileoverview Audit dashboard component
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { AuditTable } from './tables/AuditTable';
import { AuditFilter } from './filters/AuditFilter';
import { AuditExport } from './export/AuditExport';
import { AuditPagination } from './tables/AuditPagination';
import { Button } from '@/components/ui/Button/Button';
import { Icons } from '@/components/ui/icons';
import { useToast } from '@/components/ui/use-toast';
import { AuditService } from '../services/auditService';
import { 
  AuditLogEntry, 
  AuditLogFilter,
  AuditLogAction,
  AuditLogStatus 
} from '../types/audit.types';
import { ExportOptions } from '../types/export.types';

interface AuditStats {
  totalLogs: number;
  activeCount: number;
  archivedCount: number;
  actionCounts: Record<AuditLogAction, number>;
}

export function AuditDashboard() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [filter, setFilter] = useState<AuditLogFilter>({
    limit: 50,
    offset: 0
  });
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedTab, setSelectedTab] = useState('all');

  const auditService = AuditService.getInstance();
  const { toast } = useToast();

  // Load initial data
  useEffect(() => {
    loadAuditLogs();
    loadAuditStats();
  }, [filter]);

  const loadAuditLogs = async () => {
    try {
      setIsLoading(true);
      const { logs: auditLogs, total } = await auditService.searchLogs(filter);
      setLogs(auditLogs);
      setTotalPages(Math.ceil(total / (filter.limit || 50)));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load audit logs',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadAuditStats = async () => {
    try {
      const stats = await auditService.getAuditStats(filter.organizationId || 'SYSTEM');
      setStats(stats);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load audit statistics',
        variant: 'destructive'
      });
    }
  };

  const handleFilterChange = (newFilter: AuditLogFilter) => {
    setFilter(prev => ({ ...prev, ...newFilter, offset: 0 }));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setFilter(prev => ({
      ...prev,
      offset: (page - 1) * (prev.limit || 50)
    }));
  };

  const handleExport = async (format: 'CSV' | 'JSON' | 'PDF') => {
    try {
      setIsExporting(true);

      const options: ExportOptions = {
        format,
        customization: {
          title: 'Audit Log Export',
          fields: [
            { key: 'timestamp', label: 'Timestamp', include: true },
            { key: 'action', label: 'Action', include: true },
            { key: 'entityType', label: 'Entity Type', include: true },
            { key: 'entityId', label: 'Entity ID', include: true },
            { key: 'actorId', label: 'Actor', include: true },
            { key: 'status', label: 'Status', include: true }
          ],
          includeTimestamp: true,
          watermark: {
            text: 'CONFIDENTIAL',
            opacity: 0.3,
            position: 'diagonal'
          },
          security: {
            encrypt: true,
            allowPrinting: true,
            allowCopying: false,
            gdprCompliant: true
          }
        }
      };

      const data = await auditService.exportLogs(filter, options, 'SYSTEM');
      
      // Create download link
      const blob = new Blob([data], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-logs-${new Date().toISOString()}.${format.toLowerCase()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Success',
        description: 'Audit logs exported successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export audit logs',
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleArchive = async () => {
    try {
      const count = await auditService.archiveLogs(
        filter,
        'Manual archive',
        'SYSTEM'
      );

      toast({
        title: 'Success',
        description: `${count} logs archived successfully`
      });

      loadAuditLogs();
      loadAuditStats();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to archive logs',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <h3 className="text-sm font-medium">Total Logs</h3>
          <p className="text-2xl font-bold">{stats?.totalLogs || 0}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium">Active Logs</h3>
          <p className="text-2xl font-bold">{stats?.activeCount || 0}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium">Archived Logs</h3>
          <p className="text-2xl font-bold">{stats?.archivedCount || 0}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium">Success Rate</h3>
          <p className="text-2xl font-bold">
            {stats ? 
              `${Math.round((stats.actionCounts['SUCCESS'] || 0) / stats.totalLogs * 100)}%` 
              : '0%'}
          </p>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="flex items-center justify-between">
        <AuditFilter
          filter={filter}
          onFilterChange={handleFilterChange}
          stats={stats}
          isLoading={isLoading}
        />
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={handleArchive}
            disabled={isLoading}
          >
            <Icons.archive className="mr-2 h-4 w-4" />
            Archive
          </Button>
          <AuditExport
            onExport={handleExport}
            isExporting={isExporting}
          />
        </div>
      </div>

      {/* Tabs and Table */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="all">All Logs</TabsTrigger>
          <TabsTrigger value="success">Success</TabsTrigger>
          <TabsTrigger value="failure">Failure</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <AuditTable
            logs={logs}
            isLoading={isLoading}
            error={null}
          />
        </TabsContent>

        <TabsContent value="success" className="mt-4">
          <AuditTable
            logs={logs.filter(log => log.status === 'SUCCESS')}
            isLoading={isLoading}
            error={null}
          />
        </TabsContent>

        <TabsContent value="failure" className="mt-4">
          <AuditTable
            logs={logs.filter(log => log.status === 'FAILURE')}
            isLoading={isLoading}
            error={null}
          />
        </TabsContent>

        <TabsContent value="archived" className="mt-4">
          <AuditTable
            logs={logs.filter(log => log.archivedAt)}
            isLoading={isLoading}
            error={null}
          />
        </TabsContent>
      </Tabs>

      {/* Pagination */}
      <div className="mt-4">
        <AuditPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
} 


