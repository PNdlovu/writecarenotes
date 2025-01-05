/**
 * @fileoverview Audit log table component
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/Badge/Badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { AuditTableProps } from '../../types/ui.types';
import { AuditLogStatus } from '@/types/audit';

const statusColors: Record<AuditLogStatus, string> = {
  SUCCESS: 'bg-green-100 text-green-800',
  FAILURE: 'bg-red-100 text-red-800',
};

export function AuditTable({
  logs,
  isLoading,
  error,
  onRowClick,
  onSort,
  sortColumn,
  sortDirection,
}: AuditTableProps) {
  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error loading audit logs: {error.message}
      </div>
    );
  }

  const handleSort = (column: keyof typeof logs[0]) => {
    if (onSort) {
      onSort(column);
    }
  };

  const renderSortIndicator = (column: keyof typeof logs[0]) => {
    if (sortColumn !== column) return null;
    return (
      <span className="ml-1">
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  const renderHeader = (
    label: string,
    column: keyof typeof logs[0],
    sortable: boolean = true
  ) => (
    <TableHeader
      className={sortable ? 'cursor-pointer hover:bg-gray-50' : ''}
      onClick={sortable ? () => handleSort(column) : undefined}
    >
      {label}
      {sortable && renderSortIndicator(column)}
    </TableHeader>
  );

  if (isLoading) {
    return (
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Timestamp</TableHeader>
            <TableHeader>Action</TableHeader>
            <TableHeader>Entity</TableHeader>
            <TableHeader>Actor</TableHeader>
            <TableHeader>Status</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {[...Array(5)].map((_, i) => (
            <TableRow key={i}>
              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16" /></TableCell>
              <TableCell><Skeleton className="h-4 w-32" /></TableCell>
              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          {renderHeader('Timestamp', 'timestamp')}
          {renderHeader('Action', 'action')}
          {renderHeader('Entity Type', 'entityType')}
          {renderHeader('Entity ID', 'entityId', false)}
          {renderHeader('Actor', 'actorId')}
          {renderHeader('Status', 'status')}
        </TableRow>
      </TableHead>
      <TableBody>
        {logs.map((log) => (
          <TableRow
            key={log.id}
            onClick={() => onRowClick?.(log)}
            className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
          >
            <TableCell>
              {log.timestamp ? format(new Date(log.timestamp), 'PPpp') : 'N/A'}
            </TableCell>
            <TableCell>
              <Badge variant="outline">{log.action}</Badge>
            </TableCell>
            <TableCell>{log.entityType}</TableCell>
            <TableCell className="font-mono text-sm">{log.entityId}</TableCell>
            <TableCell>{log.actorId}</TableCell>
            <TableCell>
              <Badge className={statusColors[log.status]}>
                {log.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
        {logs.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
              No audit logs found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
} 


