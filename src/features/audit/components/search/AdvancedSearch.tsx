/**
 * @fileoverview Advanced search component for audit logs
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input/Input';
import { Button } from '@/components/ui/Button/Button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/Select/Select';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Icons } from '@/components/ui/Icons';
import { 
  AuditLogAction, 
  AuditLogStatus,
  AuditLogActorType,
  AuditLogFilter 
} from '../../types/audit.types';
import { CareHomeType, CareHomeRegion } from '../../types/export.types';

interface AdvancedSearchProps {
  initialFilter: AuditLogFilter;
  onSearch: (filter: AuditLogFilter) => void;
  isLoading?: boolean;
}

export function AdvancedSearch({ 
  initialFilter, 
  onSearch, 
  isLoading 
}: AdvancedSearchProps) {
  const [filter, setFilter] = useState<AuditLogFilter>(initialFilter);
  const [showMore, setShowMore] = useState(false);

  const handleInputChange = (field: keyof AuditLogFilter, value: any) => {
    setFilter(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateRangeChange = (range: { from: Date; to: Date }) => {
    setFilter(prev => ({
      ...prev,
      startDate: range.from,
      endDate: range.to
    }));
  };

  const handleSearch = () => {
    onSearch(filter);
  };

  const handleReset = () => {
    setFilter(initialFilter);
    onSearch(initialFilter);
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Basic Search Fields */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Entity Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Entity Type</label>
            <Select
              value={filter.entityType}
              onValueChange={value => handleInputChange('entityType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select entity type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CARE_HOME">Care Home</SelectItem>
                <SelectItem value="RESIDENT">Resident</SelectItem>
                <SelectItem value="STAFF">Staff</SelectItem>
                <SelectItem value="MEDICATION">Medication</SelectItem>
                <SelectItem value="ASSESSMENT">Assessment</SelectItem>
                <SelectItem value="INCIDENT">Incident</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Action</label>
            <Select
              value={filter.action}
              onValueChange={value => handleInputChange('action', value as AuditLogAction)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CREATE">Create</SelectItem>
                <SelectItem value="UPDATE">Update</SelectItem>
                <SelectItem value="DELETE">Delete</SelectItem>
                <SelectItem value="VIEW">View</SelectItem>
                <SelectItem value="EXPORT">Export</SelectItem>
                <SelectItem value="IMPORT">Import</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select
              value={filter.status}
              onValueChange={value => handleInputChange('status', value as AuditLogStatus)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SUCCESS">Success</SelectItem>
                <SelectItem value="FAILURE">Failure</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="space-y-2 md:col-span-2 lg:col-span-3">
            <label className="text-sm font-medium">Date Range</label>
            <DateRangePicker
              from={filter.startDate}
              to={filter.endDate}
              onSelect={handleDateRangeChange}
            />
          </div>
        </div>

        {/* Advanced Search Fields */}
        {showMore && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Actor Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Actor Type</label>
              <Select
                value={filter.actorType}
                onValueChange={value => handleInputChange('actorType', value as AuditLogActorType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select actor type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="SYSTEM">System</SelectItem>
                  <SelectItem value="API">API</SelectItem>
                  <SelectItem value="INTEGRATION">Integration</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Care Home Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Care Home Type</label>
              <Select
                value={filter.careHomeType}
                onValueChange={value => handleInputChange('careHomeType', value as CareHomeType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select care home type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ELDERLY_RESIDENTIAL">Elderly Residential</SelectItem>
                  <SelectItem value="ELDERLY_NURSING">Elderly Nursing</SelectItem>
                  <SelectItem value="DEMENTIA">Dementia</SelectItem>
                  <SelectItem value="LEARNING_DISABILITIES">Learning Disabilities</SelectItem>
                  <SelectItem value="PHYSICAL_DISABILITIES">Physical Disabilities</SelectItem>
                  <SelectItem value="MENTAL_HEALTH">Mental Health</SelectItem>
                  <SelectItem value="CHILDREN_RESIDENTIAL">Children's Residential</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Region */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Region</label>
              <Select
                value={filter.region}
                onValueChange={value => handleInputChange('region', value as CareHomeRegion)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ENGLAND">England</SelectItem>
                  <SelectItem value="WALES">Wales</SelectItem>
                  <SelectItem value="SCOTLAND">Scotland</SelectItem>
                  <SelectItem value="NORTHERN_IRELAND">Northern Ireland</SelectItem>
                  <SelectItem value="IRELAND">Ireland</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* IP Address */}
            <div className="space-y-2">
              <label className="text-sm font-medium">IP Address</label>
              <Input
                type="text"
                value={filter.ipAddress || ''}
                onChange={e => handleInputChange('ipAddress', e.target.value)}
                placeholder="Search by IP address"
              />
            </div>

            {/* User Agent */}
            <div className="space-y-2">
              <label className="text-sm font-medium">User Agent</label>
              <Input
                type="text"
                value={filter.userAgent || ''}
                onChange={e => handleInputChange('userAgent', e.target.value)}
                placeholder="Search by user agent"
              />
            </div>

            {/* Organization ID */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Organization ID</label>
              <Input
                type="text"
                value={filter.organizationId || ''}
                onChange={e => handleInputChange('organizationId', e.target.value)}
                placeholder="Search by organization ID"
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setShowMore(!showMore)}
          >
            {showMore ? (
              <>
                <Icons.chevronUp className="mr-2 h-4 w-4" />
                Show Less
              </>
            ) : (
              <>
                <Icons.chevronDown className="mr-2 h-4 w-4" />
                Show More
              </>
            )}
          </Button>
          <div className="space-x-2">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={isLoading}
            >
              Reset
            </Button>
            <Button
              onClick={handleSearch}
              disabled={isLoading}
            >
              {isLoading ? (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Icons.search className="mr-2 h-4 w-4" />
              )}
              Search
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
} 


