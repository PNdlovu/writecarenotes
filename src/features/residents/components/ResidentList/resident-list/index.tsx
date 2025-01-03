'use client';

/**
 * @writecarenotes.com
 * @fileoverview Resident list component
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Component for displaying a list of residents with filtering,
 * sorting, and search capabilities. Supports different views
 * and status filters.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import Input from '@/components/ui/Form/Input';
import { Icons } from '@/components/ui/Icons';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';

interface ResidentListProps {
  status?: 'ACTIVE' | 'TEMPORARY' | 'HOSPITAL';
}

export function ResidentList({ status }: ResidentListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Placeholder data - replace with actual API call
  const residents = [
    {
      id: '1',
      name: 'John Smith',
      roomNumber: '101',
      dateOfBirth: '1945-06-15',
      careType: 'Residential',
      status: 'ACTIVE',
    },
    {
      id: '2',
      name: 'Mary Johnson',
      roomNumber: '102',
      dateOfBirth: '1950-03-22',
      careType: 'Nursing',
      status: 'ACTIVE',
    },
    // Add more placeholder data as needed
  ];

  const filteredResidents = residents.filter(resident => 
    (!status || resident.status === status) &&
    (!searchQuery || resident.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search residents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-[300px]"
          />
          <Button variant="outline" size="icon">
            <Icons.filter className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <Icons.grid className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Icons.list className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Room</TableHead>
            <TableHead>Date of Birth</TableHead>
            <TableHead>Care Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredResidents.map((resident) => (
            <TableRow key={resident.id}>
              <TableCell>{resident.name}</TableCell>
              <TableCell>{resident.roomNumber}</TableCell>
              <TableCell>{resident.dateOfBirth}</TableCell>
              <TableCell>{resident.careType}</TableCell>
              <TableCell>{resident.status}</TableCell>
              <TableCell>
                <Button variant="ghost" size="icon">
                  <Icons.more className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 