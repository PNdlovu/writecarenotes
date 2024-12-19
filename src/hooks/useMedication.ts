import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/ui/use-toast';
import { medicationService } from '@/services/medicationService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { MedicationFormData, MedicationWithResident } from '@/types/medication';

interface UseMedicationProps {
  organizationId: string;
  residentId?: string;
}

export function useMedication({ organizationId, residentId }: UseMedicationProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedMedication, setSelectedMedication] = useState<MedicationWithResident | null>(null);

  // Fetch medications
  const { data: medications, isLoading: isLoadingMedications } = useQuery({
    queryKey: ['medications', organizationId, residentId],
    queryFn: async () => {
      if (residentId) {
        return medicationService.getMedicationsByResident(residentId);
      }
      return medicationService.getMedications(organizationId);
    },
  });

  // Fetch medication stats
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['medication-stats', organizationId],
    queryFn: () => medicationService.getMedicationStats(organizationId),
  });

  // Create medication mutation
  const { mutate: createMedication, isLoading: isCreating } = useMutation({
    mutationFn: (data: MedicationFormData) =>
      medicationService.createMedication({ ...data, organizationId }),
    onSuccess: () => {
      queryClient.invalidateQueries(['medications', organizationId]);
      queryClient.invalidateQueries(['medication-stats', organizationId]);
      toast({
        title: 'Success',
        description: 'Medication created successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update medication mutation
  const { mutate: updateMedication, isLoading: isUpdating } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MedicationFormData> }) =>
      medicationService.updateMedication(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['medications', organizationId]);
      queryClient.invalidateQueries(['medication-stats', organizationId]);
      toast({
        title: 'Success',
        description: 'Medication updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Discontinue medication mutation
  const { mutate: discontinueMedication, isLoading: isDiscontinuing } = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      medicationService.discontinueMedication(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries(['medications', organizationId]);
      queryClient.invalidateQueries(['medication-stats', organizationId]);
      toast({
        title: 'Success',
        description: 'Medication discontinued successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Stock management mutations
  const { mutate: updateStock, isLoading: isUpdatingStock } = useMutation({
    mutationFn: ({
      id,
      quantity,
      type,
      reason,
      witnessId,
    }: {
      id: string;
      quantity: number;
      type: 'RECEIVED' | 'DISPOSED' | 'RETURNED' | 'ADJUSTMENT';
      reason: string;
      witnessId?: string;
    }) =>
      medicationService.updateStock(
        id,
        quantity,
        type,
        reason,
        session?.user?.id || '',
        witnessId
      ),
    onSuccess: () => {
      queryClient.invalidateQueries(['medications', organizationId]);
      queryClient.invalidateQueries(['medication-stats', organizationId]);
      toast({
        title: 'Success',
        description: 'Stock updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    medications,
    stats,
    isLoadingMedications,
    isLoadingStats,
    isCreating,
    isUpdating,
    isDiscontinuing,
    isUpdatingStock,
    selectedMedication,
    setSelectedMedication,
    createMedication,
    updateMedication,
    discontinueMedication,
    updateStock,
  };
}


