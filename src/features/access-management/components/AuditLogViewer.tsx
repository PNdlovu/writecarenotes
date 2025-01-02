/**
 * @fileoverview Component for viewing and managing audit logs
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import React, { useState, useEffect } from 'react';
import { AuditLog } from '../types';

interface AuditLogFilters {
  action?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
}

interface AuditLogStats {
  totalLogs: number;
  uniqueUsers: number;
  actionCounts: Record<string, number>;
}

import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '@/components/ui/Table';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/Select';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { DatePicker } from '@/components/ui/DatePicker';
import { Badge } from '@/components/ui/Badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/Alert';
import { Pagination } from '@/components/ui/Pagination';

export function AuditLogViewer() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditLogStats | null>(null);
  const [filters, setFilters] = useState<AuditLogFilters>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  useEffect(() => {
    loadLogs();
  }, [filters, currentPage]);

  const loadLogs = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      if (filters.action) params.append('action', filters.action);
      if (filters.userId) params.append('userId', filters.userId);
      if (filters.startDate) params.append('startDate', filters.startDate.toISOString());
      if (filters.endDate) params.append('endDate', filters.endDate.toISOString());

      const [logsResponse, statsResponse] = await Promise.all([
        fetch(`/api/audit-logs?${params}`),
        fetch('/api/audit-logs/stats')
      ]);

      if (!logsResponse.ok || !statsResponse.ok) {
        throw new Error('Failed to load audit logs');
      }

      const { logs, totalPages: total } = await logsResponse.json();
      const stats = await statsResponse.json();

      setLogs(logs);
      setTotalPages(total);
      setStats(stats);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load logs');
      setError(error);
      console.error('Error loading audit logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (name: keyof AuditLogFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [name]: value || undefined
    }));
    setCurrentPage(1);
  };

  const handleDateFilterChange = (name: 'startDate' | 'endDate', value: string) => {
    setFilters(prev => ({
      ...prev,
      [name]: value ? new Date(value) : undefined
    }));
    setCurrentPage(1);
  };

  const exportLogs = async () => {
    try {
      const response = await fetch('/api/audit-logs/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters)
      });

      if (!response.ok) {
        throw new Error('Failed to export audit logs');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to export logs');
      setError(error);
      console.error('Error exporting logs:', error);
    }
  };

  if (isLoading) {
    return <div>Loading audit logs...</div>;
  }

  if (error) {
    return (
      <div className="text-red-500">
        Error: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900">Total Logs</h3>
            <p className="mt-2 text-3xl font-semibold text-blue-600">
              {stats.totalLogs}
            </p>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900">Unique Users</h3>
            <p className="mt-2 text-3xl font-semibold text-blue-600">
              {stats.uniqueUsers}
            </p>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900">Most Common Action</h3>
            <p className="mt-2 text-3xl font-semibold text-blue-600">
              {Object.entries(stats.actionCounts).sort((a, b) => b[1] - a[1])[0]?.[0]}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Action
            </label>
            <Input
              type="text"
              value={filters.action || ''}
              onChange={(e) => handleFilterChange('action', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              User ID
            </label>
            <Input
              type="text"
              value={filters.userId || ''}
              onChange={(e) => handleFilterChange('userId', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <DatePicker
              value={filters.startDate?.toISOString().split('T')[0] || ''}
              onChange={(e) => handleDateFilterChange('startDate', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <DatePicker
              value={filters.endDate?.toISOString().split('T')[0] || ''}
              onChange={(e) => handleDateFilterChange('endDate', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button
            onClick={exportLogs}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Export Logs
          </Button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timestamp
              </TableCell>
              <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </TableCell>
              <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User ID
              </TableCell>
              <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </TableCell>
              <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id} className="hover:bg-gray-50">
                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(log.timestamp).toLocaleString()}
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {log.action}
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {log.userId}
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-gray-500">
                  {log.description}
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <Button
                    onClick={() => setSelectedLog(log)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-700">
          Page {currentPage} of {totalPages}
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <Card className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <CardHeader>
              <h3 className="text-xl font-semibold">Audit Log Details</h3>
              <Button
                onClick={() => setSelectedLog(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                ×
              </Button>
            </CardHeader>
            <CardContent className="mt-4 space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Timestamp</h4>
                <p className="mt-1">
                  {new Date(selectedLog.timestamp).toLocaleString()}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Action</h4>
                <p className="mt-1">{selectedLog.action}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">User ID</h4>
                <p className="mt-1">{selectedLog.userId}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Description</h4>
                <p className="mt-1">{selectedLog.description}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Metadata</h4>
                <pre className="mt-1 p-2 bg-gray-50 rounded overflow-auto">
                  {JSON.stringify(selectedLog.metadata, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default AuditLogViewer; 