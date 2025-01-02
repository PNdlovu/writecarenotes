import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button/Button';
import { Badge } from '@/components/ui/Badge/Badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { format } from 'date-fns';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import { MedicationVerification } from '../verification/MedicationVerification';
import { useRegionalSettings } from '@/hooks/useRegionalSettings';
import type { MAREntry, MedicationUnit } from '../../types/mar';
import type { Region } from '@/types/region';

interface MedicationAdministrationRecordProps {
  entries: MAREntry[];
  onStatusUpdate: (entryId: string, status: 'GIVEN' | 'MISSED' | 'REFUSED') => Promise<void>;
  residentId: string;
  region: Region;
}

export const MedicationAdministrationRecord: React.FC<MedicationAdministrationRecordProps> = ({
  entries,
  onStatusUpdate,
  residentId,
  region,
}) => {
  const [selectedEntry, setSelectedEntry] = useState<MAREntry | null>(null);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const { settings } = useRegionalSettings(region);

  const handleStatusUpdate = async (entry: MAREntry, status: 'GIVEN' | 'MISSED' | 'REFUSED') => {
    if (settings.requiresDoubleSignature || entry.medication.controlledDrug) {
      setSelectedEntry({ ...entry, pendingStatus: status });
      setIsVerificationOpen(true);
    } else {
      await onStatusUpdate(entry.id, status);
    }
  };

  const handleVerificationComplete = async (success: boolean) => {
    if (success && selectedEntry && selectedEntry.pendingStatus) {
      await onStatusUpdate(selectedEntry.id, selectedEntry.pendingStatus);
    }
    setIsVerificationOpen(false);
    setSelectedEntry(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'GIVEN':
        return (
          <Badge variant="success" className="gap-1">
            <ShieldCheck className="h-4 w-4" />
            Given
          </Badge>
        );
      case 'MISSED':
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="h-4 w-4" />
            Missed
          </Badge>
        );
      case 'REFUSED':
        return (
          <Badge variant="warning" className="gap-1">
            <AlertCircle className="h-4 w-4" />
            Refused
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1">
            Pending
          </Badge>
        );
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Medication</TableHead>
              <TableHead>Dosage</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
              {settings.requiresControlledDrugWitness && <TableHead>Witness</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{format(new Date(entry.scheduledTime), 'HH:mm')}</TableCell>
                <TableCell className="font-medium">
                  {entry.medication.name}
                  {entry.medication.controlledDrug && (
                    <Badge variant="destructive" className="ml-2">CD</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {entry.medication.dosage} {entry.medication.unit}
                </TableCell>
                <TableCell>{entry.medication.route}</TableCell>
                <TableCell>{getStatusBadge(entry.status)}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusUpdate(entry, 'GIVEN')}
                      disabled={entry.status !== 'PENDING'}
                    >
                      Given
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusUpdate(entry, 'MISSED')}
                      disabled={entry.status !== 'PENDING'}
                    >
                      Missed
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusUpdate(entry, 'REFUSED')}
                      disabled={entry.status !== 'PENDING'}
                    >
                      Refused
                    </Button>
                  </div>
                </TableCell>
                {settings.requiresControlledDrugWitness && (
                  <TableCell>
                    {entry.witness ? (
                      <span className="text-sm text-muted-foreground">
                        {entry.witness.name}
                      </span>
                    ) : (
                      entry.status === 'GIVEN' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedEntry(entry);
                            setIsVerificationOpen(true);
                          }}
                        >
                          Add Witness
                        </Button>
                      )
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {selectedEntry && (
          <MedicationVerification
            isOpen={isVerificationOpen}
            onClose={() => {
              setIsVerificationOpen(false);
              setSelectedEntry(null);
            }}
            onVerify={async (verification) => {
              const success = await handleVerificationComplete(true);
              return !!success;
            }}
            verificationType={settings.requiresControlledDrugWitness ? 'BARCODE' : 'PIN'}
            medicationId={selectedEntry.medication.id}
            medicationName={selectedEntry.medication.name}
          />
        )}
      </div>
    </Card>
  );
};


