'use client';

import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/navigation';
import { PlusIcon } from '@heroicons/react/24/outline';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { Resident } from '../types';

interface ResidentListProps {
  residents?: Resident[];
  isLoading: boolean;
  searchQuery: string;
  selectedFilter: string;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: string) => void;
  onReset: () => void;
}

export function ResidentList({
  residents,
  isLoading,
  searchQuery,
  selectedFilter,
  onSearchChange,
  onFilterChange,
  onReset,
}: ResidentListProps) {
  const { t } = useTranslation('residents');
  const router = useRouter();

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'temporary leave':
        return <Badge className="bg-yellow-100 text-yellow-800">Temporary Leave</Badge>;
      case 'discharged':
        return <Badge className="bg-gray-100 text-gray-800">Discharged</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const handleAddResident = () => {
    router.push('/residents/new');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Input
            placeholder={t('search')}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-[300px]"
          />
          <Select value={selectedFilter} onValueChange={onFilterChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={t('filterByCareLevel')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Care Levels</SelectItem>
              <SelectItem value="High Care">High Care</SelectItem>
              <SelectItem value="Medium Care">Medium Care</SelectItem>
              <SelectItem value="Low Care">Low Care</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleAddResident}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Resident
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white p-4 rounded-lg shadow">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Date of Birth</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Care Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Admission Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {residents?.map((resident) => (
                <TableRow
                  key={resident.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => router.push(`/residents/${resident.id}`)}
                >
                  <TableCell>{resident.id}</TableCell>
                  <TableCell className="font-medium">{resident.name}</TableCell>
                  <TableCell>{new Date(resident.dateOfBirth).toLocaleDateString()}</TableCell>
                  <TableCell>{resident.room}</TableCell>
                  <TableCell>{resident.careLevel}</TableCell>
                  <TableCell>{getStatusBadge(resident.status)}</TableCell>
                  <TableCell>{new Date(resident.admissionDate).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
