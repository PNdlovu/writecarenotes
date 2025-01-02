/**
 * @fileoverview Audit log filter component
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input/Input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/Select/Select';
import { DatePicker } from '@/components/ui/date-picker';
import { Button } from '@/components/ui/Button/Button';
import { AuditFilterProps } from '../../types/ui.types';
import { AuditLogAction, AuditLogStatus } from '@/types/audit';

export function AuditFilter({
  filter,
  onFilterChange,
  stats,
  isLoading,
}: AuditFilterProps) {
  const handleChange = (
    field: keyof typeof filter,
    value: string | Date | null
  ) => {
    onFilterChange({
      ...filter,
      [field]: value,
    });
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Entity Type Filter */}
        <div className="space-y-2">
          <Label htmlFor="entityType">Entity Type</Label>
          <Select
            id="entityType"
            value={filter.entityType}
            onValueChange={(value) => handleChange('entityType', value)}
            disabled={isLoading}
          >
            <option value="">All Types</option>
            {stats?.entityTypeCounts && 
              Object.entries(stats.entityTypeCounts).map(([type, count]) => (
                <option key={type} value={type}>
                  {type} ({count})
                </option>
              ))}
          </Select>
        </div>

        {/* Action Filter */}
        <div className="space-y-2">
          <Label htmlFor="action">Action</Label>
          <Select
            id="action"
            value={filter.action}
            onValueChange={(value) => handleChange('action', value as AuditLogAction)}
            disabled={isLoading}
          >
            <option value="">All Actions</option>
            {Object.entries(stats?.actionCounts || {}).map(([action, count]) => (
              <option key={action} value={action}>
                {action} ({count})
              </option>
            ))}
          </Select>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            id="status"
            value={filter.status}
            onValueChange={(value) => handleChange('status', value as AuditLogStatus)}
            disabled={isLoading}
          >
            <option value="">All Statuses</option>
            <option value="SUCCESS">Success ({stats?.successCount || 0})</option>
            <option value="FAILURE">Failure ({stats?.failureCount || 0})</option>
          </Select>
        </div>

        {/* Entity ID Filter */}
        <div className="space-y-2">
          <Label htmlFor="entityId">Entity ID</Label>
          <Input
            id="entityId"
            value={filter.entityId || ''}
            onChange={(e) => handleChange('entityId', e.target.value)}
            placeholder="Enter entity ID"
            disabled={isLoading}
          />
        </div>

        {/* Actor ID Filter */}
        <div className="space-y-2">
          <Label htmlFor="actorId">Actor ID</Label>
          <Input
            id="actorId"
            value={filter.actorId || ''}
            onChange={(e) => handleChange('actorId', e.target.value)}
            placeholder="Enter actor ID"
            disabled={isLoading}
          />
        </div>

        {/* Date Range */}
        <div className="space-y-2">
          <Label>Date Range</Label>
          <div className="flex gap-2">
            <DatePicker
              value={filter.startDate}
              onChange={(date) => handleChange('startDate', date)}
              placeholder="Start date"
              disabled={isLoading}
            />
            <DatePicker
              value={filter.endDate}
              onChange={(date) => handleChange('endDate', date)}
              placeholder="End date"
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Filter Actions */}
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => onFilterChange({})}
          disabled={isLoading}
        >
          Clear Filters
        </Button>
        <Button
          variant="default"
          onClick={() => onFilterChange(filter)}
          disabled={isLoading}
        >
          Apply Filters
        </Button>
      </div>

      {/* Stats Summary */}
      {stats && (
        <div className="mt-4 text-sm text-gray-500">
          Showing {stats.totalLogs} logs ({stats.successCount} successful,{' '}
          {stats.failureCount} failed)
        </div>
      )}
    </Card>
  );
} 


