/**
 * @writecarenotes.com
 * @fileoverview Enterprise medication schedule component
 * @version 1.0.0
 * @created 2024-01-07
 * @updated 2024-01-07
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Enterprise-grade medication schedule component with offline support,
 * regional compliance, and real-time updates.
 */

import { useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge/Badge';
import { Button } from '@/components/ui/Button/Button';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Skeleton } from '@/components/ui/Skeleton';
import { format } from 'date-fns';
import { RefreshCw, WifiOff, AlertTriangle } from 'lucide-react';
import { useSchedule } from '../../hooks/useSchedule';
import { useRegionalSettings } from '@/hooks/useRegionalSettings';
import type { MedicationScheduleItem } from '../../types';
import type { Region } from '@/types/region';

interface MedicationScheduleProps {
  residentId: string;
  date?: Date;
  region?: Region;
  onScheduleUpdate?: (schedule: MedicationScheduleItem[]) => void;
}

export function MedicationSchedule({ 
  residentId, 
  date = new Date(),
  region = 'england',
  onScheduleUpdate 
}: MedicationScheduleProps) {
  const { 
    schedule, 
    isLoading, 
    error, 
    refetch,
    prefetchNextDay,
    isOffline,
    syncOfflineChanges 
  } = useSchedule(residentId, date, region);

  const { settings } = useRegionalSettings(region);

  // Notify parent of schedule updates
  useEffect(() => {
    if (schedule && onScheduleUpdate) {
      onScheduleUpdate(schedule);
    }
  }, [schedule, onScheduleUpdate]);

  // Prefetch next day's schedule
  useEffect(() => {
    prefetchNextDay();
  }, [date]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge variant="success">Completed</Badge>;
      case 'MISSED':
        return <Badge variant="destructive">Missed</Badge>;
      case 'REFUSED':
        return <Badge variant="warning">Refused</Badge>;
      case 'PENDING':
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load medication schedule. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Medication Schedule</h2>
          <p className="text-sm text-muted-foreground">
            {format(date, 'EEEE, dd MMMM yyyy')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isOffline && (
            <Badge variant="outline" className="gap-1">
              <WifiOff className="h-3 w-3" />
              Offline
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => isOffline ? syncOfflineChanges() : refetch()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            <TableHead>Medication</TableHead>
            <TableHead>Dose</TableHead>
            <TableHead>Route</TableHead>
            <TableHead>Status</TableHead>
            {settings.requiresControlledDrugWitness && <TableHead>Witness</TableHead>}
            {settings.requiresStockCheck && <TableHead>Stock Level</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                {settings.requiresControlledDrugWitness && 
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                }
                {settings.requiresStockCheck && 
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                }
              </TableRow>
            ))
          ) : schedule.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No medications scheduled for this day
              </TableCell>
            </TableRow>
          ) : (
            schedule.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{format(new Date(item.scheduledTime), 'HH:mm')}</TableCell>
                <TableCell className="font-medium">
                  {item.medication.name}
                  {item.medication.controlledDrug && (
                    <Badge variant="destructive" className="ml-2">CD</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {item.medication.dosage} {item.medication.unit}
                </TableCell>
                <TableCell>{item.medication.route}</TableCell>
                <TableCell>{getStatusBadge(item.status)}</TableCell>
                {settings.requiresControlledDrugWitness && (
                  <TableCell>
                    {item.witness ? (
                      <span className="text-sm text-muted-foreground">
                        {item.witness.name}
                      </span>
                    ) : (
                      item.medication.controlledDrug && (
                        <Badge variant="outline">Required</Badge>
                      )
                    )}
                  </TableCell>
                )}
                {settings.requiresStockCheck && (
                  <TableCell>
                    <span className={item.medication.stockLevel < 5 ? 'text-destructive' : ''}>
                      {item.medication.stockLevel}
                    </span>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
} 