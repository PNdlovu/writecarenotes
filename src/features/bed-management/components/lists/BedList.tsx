// src/features/bed-management/components/lists/BedList.tsx

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/Input/Input'
import { Select } from '@/components/ui/Select/Select'
import type { Bed } from '../../types/bed.types'
import { BedStatus, BedType } from '../../types/bed.types'

interface BedListProps {
  beds: Bed[]
  onSelect?: (bed: Bed) => void
  onAssign?: (bedId: string) => void
  onReserve?: (bedId: string) => void
  onDischarge?: (bedId: string) => void
}

export function BedList({ beds, onSelect, onAssign, onReserve, onDischarge }: BedListProps) {
  const [filter, setFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<BedStatus | ''>('')
  const [typeFilter, setTypeFilter] = useState<BedType | ''>('')

  const filteredBeds = beds.filter(bed => {
    const matchesSearch = bed.number.toLowerCase().includes(filter.toLowerCase()) ||
                         bed.wing.toLowerCase().includes(filter.toLowerCase())
    const matchesStatus = !statusFilter || bed.status === statusFilter
    const matchesType = !typeFilter || bed.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="Search beds..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as BedStatus)}
        >
          <option value="">All Statuses</option>
          {Object.values(BedStatus).map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </Select>

        <Select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as BedType)}
        >
          <option value="">All Types</option>
          {Object.values(BedType).map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Number</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Floor</TableHead>
            <TableHead>Wing</TableHead>
            <TableHead>Last Maintenance</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredBeds.map((bed) => (
            <TableRow 
              key={bed.id}
              onClick={() => onSelect?.(bed)}
              className={onSelect ? 'cursor-pointer hover:bg-gray-50' : ''}
            >
              <TableCell>{bed.number}</TableCell>
              <TableCell>{bed.type}</TableCell>
              <TableCell>{bed.status}</TableCell>
              <TableCell>{bed.floor}</TableCell>
              <TableCell>{bed.wing}</TableCell>
              <TableCell>
                {bed.lastMaintenanceDate?.toLocaleDateString()}
              </TableCell>
              <TableCell>
                {bed.status === 'AVAILABLE' && onAssign && (
                  <button onClick={() => onAssign(bed.id)}>Assign</button>
                )}
                {bed.status === 'AVAILABLE' && onReserve && (
                  <button onClick={() => onReserve(bed.id)}>Reserve</button>
                )}
                {bed.status === 'OCCUPIED' && onDischarge && (
                  <button onClick={() => onDischarge(bed.id)}>Discharge</button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}


