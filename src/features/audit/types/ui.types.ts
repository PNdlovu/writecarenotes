/**
 * @fileoverview UI component types for audit module
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { AuditLogEntry, AuditLogFilter, AuditLogStats } from './audit.types';

export interface AuditTableProps {
  logs: AuditLogEntry[];
  isLoading?: boolean;
  error?: Error | null;
  onRowClick?: (log: AuditLogEntry) => void;
  onSort?: (column: keyof AuditLogEntry) => void;
  sortColumn?: keyof AuditLogEntry;
  sortDirection?: 'asc' | 'desc';
}

export interface AuditFilterProps {
  filter: AuditLogFilter;
  onFilterChange: (filter: AuditLogFilter) => void;
  stats?: AuditLogStats;
  isLoading?: boolean;
}

export interface AuditDetailsProps {
  log: AuditLogEntry;
  onClose: () => void;
  onArchive?: (id: string) => Promise<void>;
}

export interface AuditExportProps {
  onExport: (format: 'CSV' | 'JSON' | 'PDF') => Promise<void>;
  isExporting?: boolean;
}

export interface AuditStatsCardProps {
  stats: AuditLogStats;
  isLoading?: boolean;
}

export interface AuditTimelineProps {
  logs: AuditLogEntry[];
  isLoading?: boolean;
}

export interface AuditChangesViewerProps {
  changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };
}

export interface AuditPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
} 


