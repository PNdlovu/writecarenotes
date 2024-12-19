import { useCallback, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClinicalService } from '../services/clinicalService';
import {
  VitalRecord,
  MedicalHistory,
  SpecialistReferral,
  ClinicalAssessment,
  VitalType,
  ReferralStatus
} from '../types';
import { useToast } from '@/components/ui/toast';

interface UseClinicalProps {
  residentId: string;
}

export function useClinical({ residentId }: UseClinicalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const clinicalService = ClinicalService.getInstance();
  const [selectedVitalType, setSelectedVitalType] = useState<VitalType | undefined>();

  // Vitals Queries
  const vitalsQuery = useQuery({
    queryKey: ['vitals', residentId, selectedVitalType],
    queryFn: () => clinicalService.getVitalsHistory(residentId, selectedVitalType)
  });

  // Medical History Queries
  const medicalHistoryQuery = useQuery({
    queryKey: ['medicalHistory', residentId],
    queryFn: () => clinicalService.getMedicalHistory(residentId)
  });

  // Referrals Queries
  const referralsQuery = useQuery({
    queryKey: ['referrals', residentId],
    queryFn: () => clinicalService.getReferrals(residentId)
  });

  // Assessments Queries
  const assessmentsQuery = useQuery({
    queryKey: ['assessments', residentId],
    queryFn: () => clinicalService.getAssessments(residentId)
  });

  // Mutations
  const recordVitalsMutation = useMutation({
    mutationFn: (vital: Omit<VitalRecord, 'id'>) => 
      clinicalService.recordVitals(vital),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vitals', residentId] });
      toast({
        title: 'Success',
        description: 'Vitals recorded successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to record vitals',
        variant: 'destructive',
      });
    }
  });

  const addMedicalHistoryMutation = useMutation({
    mutationFn: (history: Omit<MedicalHistory, 'id'>) =>
      clinicalService.addMedicalHistory(history),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicalHistory', residentId] });
      toast({
        title: 'Success',
        description: 'Medical history added successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to add medical history',
        variant: 'destructive',
      });
    }
  });

  const createReferralMutation = useMutation({
    mutationFn: (referral: Omit<SpecialistReferral, 'id'>) =>
      clinicalService.createReferral(referral),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referrals', residentId] });
      toast({
        title: 'Success',
        description: 'Referral created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create referral',
        variant: 'destructive',
      });
    }
  });

  const createAssessmentMutation = useMutation({
    mutationFn: (assessment: Omit<ClinicalAssessment, 'id'>) =>
      clinicalService.createAssessment(assessment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments', residentId] });
      toast({
        title: 'Success',
        description: 'Assessment created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create assessment',
        variant: 'destructive',
      });
    }
  });

  // Helper functions
  const recordVitals = useCallback(async (vital: Omit<VitalRecord, 'id'>) => {
    return recordVitalsMutation.mutateAsync(vital);
  }, [recordVitalsMutation]);

  const addMedicalHistory = useCallback(async (history: Omit<MedicalHistory, 'id'>) => {
    return addMedicalHistoryMutation.mutateAsync(history);
  }, [addMedicalHistoryMutation]);

  const createReferral = useCallback(async (referral: Omit<SpecialistReferral, 'id'>) => {
    return createReferralMutation.mutateAsync(referral);
  }, [createReferralMutation]);

  const createAssessment = useCallback(async (assessment: Omit<ClinicalAssessment, 'id'>) => {
    return createAssessmentMutation.mutateAsync(assessment);
  }, [createAssessmentMutation]);

  return {
    // Queries
    vitals: vitalsQuery.data ?? [],
    medicalHistory: medicalHistoryQuery.data ?? [],
    referrals: referralsQuery.data ?? [],
    assessments: assessmentsQuery.data ?? [],
    isLoading: vitalsQuery.isLoading || medicalHistoryQuery.isLoading || 
               referralsQuery.isLoading || assessmentsQuery.isLoading,
    error: vitalsQuery.error || medicalHistoryQuery.error || 
           referralsQuery.error || assessmentsQuery.error,

    // Actions
    recordVitals,
    addMedicalHistory,
    createReferral,
    createAssessment,
    setSelectedVitalType,

    // Mutation States
    isRecordingVitals: recordVitalsMutation.isPending,
    isAddingHistory: addMedicalHistoryMutation.isPending,
    isCreatingReferral: createReferralMutation.isPending,
    isCreatingAssessment: createAssessmentMutation.isPending
  };
}
