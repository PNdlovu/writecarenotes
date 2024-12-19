/**
 * @fileoverview Main audit page component
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import React, { useState, useEffect } from 'react';
import { AuditService } from '../services/auditService';
import { AuditTable } from './tables/AuditTable';
import { AuditFilter } from './filters/AuditFilter';
import { AuditDetails } from './details/AuditDetails';
import { AuditExport } from './export/AuditExport';
import { AuditPagination } from './tables/AuditPagination';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { useToast } from '@/components/ui/use-toast';
import type {
  AuditLogEntry,
  AuditLogFilter,
  AuditLogStats,
} from '../types/audit.types';

const PAGE_SIZE = 20;

export function AuditPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [stats, setStats] = useState<AuditLogStats | null>(null);
  const [filter, setFilter] = useState<AuditLogFilter>({});
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortColumn, setSortColumn] = useState<keyof AuditLogEntry>('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const { toast } = useToast();
  const auditService = AuditService.getInstance();

  // Load logs and stats
  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [logsData, statsData] = await Promise.all([
        auditService.searchLogs({
          ...filter,
          limit: PAGE_SIZE,
          offset: (currentPage - 1) * PAGE_SIZE,
          sortBy: sortColumn,
          sortDirection,
        }),
        auditService.getAuditStats(filter),
      ]);
      setLogs(logsData);
      setStats(statsData);
      setTotalPages(Math.ceil((statsData?.totalLogs || 0) / PAGE_SIZE));
    } catch (err) {
      setError(err as Error);
      toast({
        title: 'Error',
        description: 'Failed to load audit logs',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filter, currentPage, sortColumn, sortDirection]);

  // Handle filter changes
  const handleFilterChange = (newFilter: AuditLogFilter) => {
    setFilter(newFilter);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // Handle sorting
  const handleSort = (column: keyof AuditLogEntry) => {
    setSortDirection(prev => 
      column === sortColumn
        ? prev === 'asc' ? 'desc' : 'asc'
        : 'desc'
    );
    setSortColumn(column);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle log selection
  const handleLogSelect = (log: AuditLogEntry) => {
    setSelectedLog(log);
  };

  // Handle archive
  const handleArchive = async (id: string) => {
    try {
      await auditService.archiveOldLogs(90); // Archive logs older than 90 days
      toast({
        title: 'Success',
        description: 'Audit log archived successfully',
      });
      loadData(); // Reload data
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to archive audit log',
        variant: 'destructive',
      });
    }
  };

  // Handle export
  const handleExport = async (format: 'CSV' | 'JSON' | 'PDF') => {
    setIsExporting(true);
    try {
      const data = await auditService.exportLogs({
        format,
        filter,
        includeArchived: false,
      });

      // Create and download file
      const blob = new Blob([data], {
        type: format === 'JSON' ? 'application/json' : 
              format === 'CSV' ? 'text/csv' : 
              'application/pdf'
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs.${format.toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Success',
        description: `Audit logs exported as ${format}`,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: `Failed to export audit logs as ${format}`,
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Audit Logs</h1>
          <p className="text-gray-500">
            View and manage system audit logs
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={loadData}
            disabled={isLoading}
          >
            <Icons.refresh className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <AuditExport
            onExport={handleExport}
            isExporting={isExporting}
          />
        </div>
      </div>

      {/* Filter */}
      <AuditFilter
        filter={filter}
        onFilterChange={handleFilterChange}
        stats={stats}
        isLoading={isLoading}
      />

      {/* Table */}
      <AuditTable
        logs={logs}
        isLoading={isLoading}
        error={error}
        onRowClick={handleLogSelect}
        onSort={handleSort}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
      />

      {/* Pagination */}
      <AuditPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        isLoading={isLoading}
      />

      {/* Details Modal */}
      {selectedLog && (
        <AuditDetails
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
          onArchive={handleArchive}
        />
      )}
    </div>
  );
} 


