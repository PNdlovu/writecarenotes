import { Card } from '@/components/ui/card';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useSchedule } from '../../hooks/useSchedule';
import type { MedicationScheduleItem } from '../../types';

interface MedicationScheduleProps {
  residentId: string;
  date?: Date;
}

export function MedicationSchedule({ residentId, date = new Date() }: MedicationScheduleProps) {
  const { schedule, isLoading, error } = useSchedule(residentId, date);

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Medication Schedule</h2>
        <Badge>{format(date, 'dd MMM yyyy')}</Badge>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            <TableHead>Medication</TableHead>
            <TableHead>Dose</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Schedule items */}
        </TableBody>
      </Table>
    </Card>
  );
} 