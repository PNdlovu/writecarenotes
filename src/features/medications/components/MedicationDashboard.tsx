import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import { MedicationList } from './MedicationList';
import { MedicationForm } from './MedicationForm';
import { MedicationAdministrationRecord } from './mar/MedicationAdministrationRecord';
import { useMedications } from '../hooks/useMedications';
import { useMAR } from '../hooks/useMAR';
import { useRegionalSettings } from '@/hooks/useRegionalSettings';
import type { MedicationUnit } from '../types/mar';
import type { Region } from '@/types/region';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface MedicationDashboardProps {
  residentId: string;
  region: Region;
}

export const MedicationDashboard: React.FC<MedicationDashboardProps> = ({
  residentId,
  region,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { settings } = useRegionalSettings(region);
  const {
    medications,
    loading: medicationsLoading,
    addMedication,
    updateMedication,
    deleteMedication,
  } = useMedications(residentId);

  const {
    entries: marEntries,
    loading: marLoading,
    updateStatus,
    getEntries,
  } = useMAR(residentId);

  const handleAddMedication = async (values: {
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
    requiresDoubleSignature?: boolean;
    controlledDrug?: boolean;
    stockLevel?: number;
  }) => {
    await addMedication(values);
    setIsDialogOpen(false);
  };

  return (
    <Card className="p-6">
      <Tabs defaultValue="medications" className="space-y-6">
        <TabsList>
          <TabsTrigger value="medications">Medications</TabsTrigger>
          <TabsTrigger value="mar">Administration Record</TabsTrigger>
          {settings.stockControlEnabled && (
            <TabsTrigger value="stock">Stock Control</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="medications" className="space-y-4">
          <div className="flex justify-end">
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Medication
            </Button>
          </div>

          <MedicationList
            medications={medications}
            onEdit={updateMedication}
            onDelete={deleteMedication}
            region={region}
          />
        </TabsContent>

        <TabsContent value="mar">
          <MedicationAdministrationRecord
            entries={marEntries}
            onStatusUpdate={updateStatus}
            residentId={residentId}
            region={region}
          />
        </TabsContent>

        {settings.stockControlEnabled && (
          <TabsContent value="stock">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Stock Control</h3>
              {/* Add stock control component here */}
            </div>
          </TabsContent>
        )}
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Medication</DialogTitle>
          </DialogHeader>
          <MedicationForm
            onSubmit={handleAddMedication}
            onCancel={() => setIsDialogOpen(false)}
            region={region}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
};


