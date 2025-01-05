import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { Button } from '@/components/ui/Button/Button';
import { Badge } from '@/components/ui/Badge/Badge';
import { Edit, Trash2 } from 'lucide-react';
import { MedicationUnit } from '../types/mar';
import { format } from 'date-fns';

interface Medication {
  id: string;
  name: string;
  dosage: number;
  unit: MedicationUnit;
  frequency: string;
  route: string;
  startDate: string;
  endDate?: string;
  instructions?: string;
  barcode?: string;
  active: boolean;
}

interface MedicationListProps {
  medications: Medication[];
  onEdit: (medication: Medication) => void;
  onDelete: (id: string) => void;
}

export const MedicationList: React.FC<MedicationListProps> = ({
  medications,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Dosage</TableHead>
            <TableHead>Frequency</TableHead>
            <TableHead>Route</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {medications.map((medication) => (
            <TableRow key={medication.id}>
              <TableCell className="font-medium">{medication.name}</TableCell>
              <TableCell>
                {medication.dosage} {medication.unit}
              </TableCell>
              <TableCell>{medication.frequency}</TableCell>
              <TableCell>{medication.route}</TableCell>
              <TableCell>
                {format(new Date(medication.startDate), 'MMM d, yyyy')}
              </TableCell>
              <TableCell>
                {medication.endDate
                  ? format(new Date(medication.endDate), 'MMM d, yyyy')
                  : '-'}
              </TableCell>
              <TableCell>
                <Badge
                  variant={medication.active ? 'default' : 'secondary'}
                >
                  {medication.active ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(medication)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(medication.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};


