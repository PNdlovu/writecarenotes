/**
 * @fileoverview Medication Administration Component
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 *
 * Description:
 * Enterprise-grade medication administration component with offline support,
 * accessibility features, and comprehensive error handling.
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useMedications } from '../hooks/useMedications';
import { 
  Medication, 
  Administration,
  AdministrationStatus,
  MedicationType 
} from '../types';

interface MedicationAdministrationProps {
  tenantId: string;
  careHomeId: string;
  residentId: string;
}

const administrationFormSchema = z.object({
  dose: z.string().min(1, 'Dose is required'),
  notes: z.string().optional(),
  reason: z.string().optional(),
  painScore: z.number().min(0).max(10).optional(),
  effectiveness: z.string().optional(),
});

type AdministrationFormData = z.infer<typeof administrationFormSchema>;

export function MedicationAdministration({ 
  tenantId, 
  careHomeId, 
  residentId 
}: MedicationAdministrationProps) {
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [showPINModal, setShowPINModal] = useState(false);

  const { 
    medications,
    dueMedications,
    criticalAlerts,
    isOffline,
    recordAdministration,
    isLoading,
    isError 
  } = useMedications({ tenantId, careHomeId, residentId });

  const form = useForm<AdministrationFormData>({
    resolver: zodResolver(administrationFormSchema),
    defaultValues: {
      dose: '',
      notes: '',
      reason: '',
      painScore: undefined,
      effectiveness: '',
    },
  });

  useEffect(() => {
    if (selectedMedication) {
      form.setValue('dose', selectedMedication.dosage);
    }
  }, [selectedMedication, form]);

  const handleAdminister = async (data: AdministrationFormData) => {
    if (!selectedMedication) return;

    try {
      await recordAdministration({
        medicationId: selectedMedication.id,
        tenantId,
        careHomeId,
        residentId,
        status: AdministrationStatus.COMPLETED,
        administeredTime: new Date(),
        scheduledTime: new Date(),
        ...data,
      });

      form.reset();
      setSelectedMedication(null);
    } catch (error) {
      console.error('Error administering medication:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load medications. Please try again or contact support if the problem persists.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {isOffline && (
        <Alert>
          <AlertTitle>Offline Mode</AlertTitle>
          <AlertDescription>
            You are currently working offline. Changes will be synchronized when you reconnect.
          </AlertDescription>
        </Alert>
      )}

      {criticalAlerts.length > 0 && (
        <Alert variant="destructive">
          <AlertTitle>Critical Alerts</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-4">
              {criticalAlerts.map(alert => (
                <li key={alert.id}>{alert.message}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="due" className="w-full">
        <TabsList>
          <TabsTrigger value="due">Due Medications ({dueMedications.length})</TabsTrigger>
          <TabsTrigger value="all">All Medications ({medications.length})</TabsTrigger>
          <TabsTrigger value="prn">PRN Medications</TabsTrigger>
        </TabsList>

        <TabsContent value="due" className="space-y-4">
          {dueMedications.map(medication => (
            <Card key={medication.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{medication.name}</h3>
                  <p className="text-sm text-gray-500">
                    {medication.dosage} - {medication.route}
                  </p>
                  <p className="text-sm text-gray-500">
                    Due: {format(new Date(medication.startDate), 'HH:mm')}
                  </p>
                </div>
                <Button
                  onClick={() => setSelectedMedication(medication)}
                  disabled={medication.status !== 'ACTIVE'}
                >
                  Administer
                </Button>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {medications.map(medication => (
            <Card key={medication.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{medication.name}</h3>
                  <p className="text-sm text-gray-500">
                    {medication.dosage} - {medication.route}
                  </p>
                  <p className="text-sm text-gray-500">
                    Status: {medication.status}
                  </p>
                </div>
                <Button
                  onClick={() => setSelectedMedication(medication)}
                  disabled={medication.status !== 'ACTIVE'}
                >
                  Administer
                </Button>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="prn" className="space-y-4">
          {medications
            .filter(med => med.type === MedicationType.PRN)
            .map(medication => (
              <Card key={medication.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{medication.name}</h3>
                    <p className="text-sm text-gray-500">
                      {medication.dosage} - {medication.route}
                    </p>
                    <p className="text-sm text-gray-500">
                      Max Daily: {medication.maxDailyDose}
                    </p>
                  </div>
                  <Button
                    onClick={() => setSelectedMedication(medication)}
                    disabled={medication.status !== 'ACTIVE'}
                  >
                    Administer PRN
                  </Button>
                </div>
              </Card>
            ))}
        </TabsContent>
      </Tabs>

      {selectedMedication && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            Administer {selectedMedication.name}
          </h2>
          
          <form onSubmit={form.handleSubmit(handleAdminister)} className="space-y-4">
            <div>
              <Label htmlFor="dose">Dose</Label>
              <Input
                id="dose"
                {...form.register('dose')}
                aria-invalid={!!form.formState.errors.dose}
              />
              {form.formState.errors.dose && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.dose.message}
                </p>
              )}
            </div>

            {selectedMedication.type === MedicationType.PRN && (
              <>
                <div>
                  <Label htmlFor="reason">Reason for Administration</Label>
                  <Input
                    id="reason"
                    {...form.register('reason')}
                    aria-invalid={!!form.formState.errors.reason}
                  />
                </div>

                <div>
                  <Label htmlFor="painScore">Pain Score (0-10)</Label>
                  <Input
                    id="painScore"
                    type="number"
                    min="0"
                    max="10"
                    {...form.register('painScore', { valueAsNumber: true })}
                  />
                </div>
              </>
            )}

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                {...form.register('notes')}
                placeholder="Additional notes..."
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedMedication(null)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? 'Administering...' : 'Confirm Administration'}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
} 


