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
            <input
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
            <input
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
            <input
              type="date"
              value={filters.startDate?.toISOString().split('T')[0] || ''}
              onChange={(e) => handleDateFilterChange('startDate', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate?.toISOString().split('T')[0] || ''}
              onChange={(e) => handleDateFilterChange('endDate', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={exportLogs}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Export Logs
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timestamp
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {log.action}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {log.userId}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {log.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={() => setSelectedLog(log)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-700">
          Page {currentPage} of {totalPages}
        </div>
        <div className="space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-semibold">Audit Log Details</h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                ×
              </button>
            </div>
            <div className="mt-4 space-y-4">
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AuditLogViewer; 