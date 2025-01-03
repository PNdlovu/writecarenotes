/**
 * @writecarenotes.com
 * @fileoverview MAR History Component
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Component for viewing medication administration history,
 * including filters, sorting, and detailed entry information.
 */

import React, { useState } from 'react';
import { format } from 'date-fns';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/Button';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from '@/components/ui/Table';
import { useMAR } from '../../hooks/useMAR';
import type { MAREntry } from '../../types/mar';

interface Props {
  medicationId: string;
  startDate?: string;
  endDate?: string;
}

export function MARHistory({ medicationId, startDate, endDate }: Props) {
  const [filters, setFilters] = useState({
    status: 'ALL',
    startDate: startDate || '',
    endDate: endDate || ''
  });

  const { data: entries, isLoading } = useMAR(medicationId, filters);

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'GIVEN':
        return 'text-green-600';
      case 'REFUSED':
        return 'text-red-600';
      case 'OMITTED':
        return 'text-amber-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium">Status</label>
            <Select
              value={filters.status}
              onValueChange={value => handleFilterChange('status', value)}
            >
              <option value="ALL">All</option>
              <option value="GIVEN">Given</option>
              <option value="REFUSED">Refused</option>
              <option value="OMITTED">Omitted</option>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Start Date</label>
            <Input
              type="date"
              value={filters.startDate}
              onChange={e => handleFilterChange('startDate', e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">End Date</label>
            <Input
              type="date"
              value={filters.endDate}
              onChange={e => handleFilterChange('endDate', e.target.value)}
            />
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="text-center py-4">Loading history...</div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Scheduled Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Dose Given</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Staff</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries?.map((entry: MAREntry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    {format(new Date(entry.administeredTime), 'dd/MM/yyyy HH:mm')}
                  </TableCell>
                  <TableCell>
                    {format(new Date(entry.scheduledTime), 'HH:mm')}
                  </TableCell>
                  <TableCell>
                    <span className={getStatusColor(entry.status)}>
                      {entry.status}
                    </span>
                  </TableCell>
                  <TableCell>{entry.doseGiven}</TableCell>
                  <TableCell>{entry.notes}</TableCell>
                  <TableCell>{entry.staffName}</TableCell>
                </TableRow>
              ))}
              {(!entries || entries.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No administration records found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
} 