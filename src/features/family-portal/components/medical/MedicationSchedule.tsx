/**
 * @fileoverview Medication Schedule Viewer
 * @version 1.0.0
 * @created 2024-12-12
 * @copyright Phibu Cloud Solutions Ltd
 */

import React from 'react';
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge/Badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  timeSlots: string[];
  instructions: string;
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'discontinued' | 'pending';
  lastTaken?: Date;
  nextDue?: Date;
}

interface MedicationScheduleProps {
  residentId: string;
  showHistory?: boolean;
}

export const MedicationSchedule: React.FC<MedicationScheduleProps> = ({
  residentId,
  showHistory = false,
}) => {
  const [medications, setMedications] = React.useState<Medication[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchMedications();
  }, [residentId]);

  const fetchMedications = async () => {
    try {
      const response = await fetch(`/api/medications/${residentId}`);
      if (!response.ok) throw new Error('Failed to fetch medications');
      const data = await response.json();
      setMedications(data);
    } catch (error) {
      console.error('Error fetching medications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Medication['status']) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'discontinued':
        return 'destructive';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString('en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  if (loading) {
    return <div>Loading medication schedule...</div>;
  }

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold">Medication Schedule</h2>
          <p className="text-sm text-muted-foreground">
            Current and upcoming medications
          </p>
        </div>
        <Badge variant="outline">
          {medications.filter(m => m.status === 'active').length} Active Medications
        </Badge>
      </div>

      <ScrollArea className="h-[400px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Medication</TableHead>
              <TableHead>Dosage</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Next Due</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {medications.map((med) => (
              <TableRow key={med.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{med.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {med.instructions}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{med.dosage}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div>{med.frequency}</div>
                    <div className="flex gap-1">
                      {med.timeSlots.map((time, i) => (
                        <Badge key={i} variant="outline">
                          {time}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(med.status)}>
                    {med.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {med.nextDue && (
                    <div className="text-sm">
                      {formatDateTime(med.nextDue)}
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>

      {showHistory && medications.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Medication History</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medication</TableHead>
                <TableHead>Taken At</TableHead>
                <TableHead>Given By</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Medication history rows would go here */}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="mt-4 text-sm text-muted-foreground">
        <p>Important Notes:</p>
        <ul className="list-disc list-inside">
          <li>Medication schedules are managed by healthcare staff</li>
          <li>Changes require proper medical authorization</li>
          <li>Contact staff for any questions about medications</li>
        </ul>
      </div>
    </Card>
  );
};


