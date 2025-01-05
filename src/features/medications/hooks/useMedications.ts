/**
 * @fileoverview Medications Hook
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { medicationService } from '../services/medicationService';
import type { 
  Medication, 
  MedicationSchedule,
  MedicationStatistics,
  MedicationAdministration
} from '../types';
import { useToast } from '@/components/ui/UseToast';
import { useOrganization } from '@/hooks/useOrganization';

interface SearchFilters {
  form?: string;
  route?: string;
  controlled?: boolean;
}

export function useMedications(medicationId?: string) {
  const { organization } = useOrganization();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch single medication
  const { 
    data: medication,
    isLoading: medicationLoading,
    error: medicationError
  } = useQuery({
    queryKey: ['medication', medicationId],
    queryFn: () => medicationService.getMedication(medicationId!),
    enabled: !!medicationId
  });

  // Fetch statistics
  const { 
    data: statistics,
    isLoading: statisticsLoading,
    error: statisticsError
  } = useQuery({
    queryKey: ['medicationStatistics', organization?.id],
    queryFn: () => medicationService.getStatistics(organization?.id),
    enabled: !!organization?.id
  });

  // Create medication
  const createMutation = useMutation({
    mutationFn: medicationService.createMedication,
    onSuccess: () => {
      queryClient.invalidateQueries(['medications']);
      toast({
        title: 'Success',
        description: 'Medication created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update medication
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => medicationService.updateMedication(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['medications']);
      toast({
        title: 'Success',
        description: 'Medication updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Record administration
  const administrationMutation = useMutation({
    mutationFn: medicationService.recordAdministration,
    onSuccess: () => {
      queryClient.invalidateQueries(['medications']);
      queryClient.invalidateQueries(['medicationStatistics']);
      toast({
        title: 'Success',
        description: 'Medication administration recorded successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Create schedule
  const scheduleMutation = useMutation({
    mutationFn: medicationService.createSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries(['medications']);
      toast({
        title: 'Success',
        description: 'Medication schedule created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update stock
  const stockMutation = useMutation({
    mutationFn: ({ id, quantity, batchNumber }) => 
      medicationService.updateStock(id, quantity, batchNumber),
    onSuccess: () => {
      queryClient.invalidateQueries(['medications']);
      queryClient.invalidateQueries(['medicationStatistics']);
      toast({
        title: 'Success',
        description: 'Stock updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Search medications
  const searchMedications = async (query: string, filters?: SearchFilters) => {
    return medicationService.searchMedications(query, filters);
  };

  return {
    // Data
    medication,
    statistics,
    
    // Loading states
    isLoading: medicationId ? medicationLoading : statisticsLoading,
    
    // Error states
    error: medicationId ? medicationError : statisticsError,
    
    // Mutations
    createMedication: createMutation.mutate,
    updateMedication: updateMutation.mutate,
    recordAdministration: administrationMutation.mutate,
    createSchedule: scheduleMutation.mutate,
    updateStock: stockMutation.mutate,
    searchMedications,
    
    // Mutation states
    isCreating: createMutation.isLoading,
    isUpdating: updateMutation.isLoading,
    isAdministering: administrationMutation.isLoading,
    isScheduling: scheduleMutation.isLoading,
    isUpdatingStock: stockMutation.isLoading,
  };
}


