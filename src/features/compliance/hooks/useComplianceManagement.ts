import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/toast/useToast';
import { useOfflineSupport } from '@/lib/offline/useOfflineSupport';
import { ComplianceService } from '../services/ComplianceService';
import { ComplianceRepository } from '../repositories/complianceRepository';
import {
  ComplianceAudit,
  ComplianceEvidence,
  ComplianceSchedule,
  Region
} from '../types/compliance.types';

interface UseComplianceManagementProps {
  organizationId: string;
  careHomeId?: string;
  region: Region;
}

export function useComplianceManagement({
  organizationId,
  careHomeId,
  region
}: UseComplianceManagementProps) {
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isOnline, syncStatus } = useOfflineSupport();

  // Fetch frameworks
  const {
    data: frameworks,
    isLoading: frameworksLoading,
    error: frameworksError
  } = useQuery({
    queryKey: ['compliance', 'frameworks', region],
    queryFn: async () => {
      const response = await fetch(`/api/compliance/frameworks?region=${region}`);
      if (!response.ok) {
        throw new Error('Failed to fetch frameworks');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Fetch requirements
  const {
    data: requirements,
    isLoading: requirementsLoading,
    error: requirementsError
  } = useQuery({
    queryKey: ['compliance', 'requirements', region],
    queryFn: async () => {
      const response = await fetch(`/api/compliance/requirements?region=${region}`);
      if (!response.ok) {
        throw new Error('Failed to fetch requirements');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Fetch audits
  const {
    data: audits,
    isLoading: auditsLoading,
    error: auditsError
  } = useQuery({
    queryKey: ['compliance', 'audits', organizationId, careHomeId],
    queryFn: async () => {
      const params = new URLSearchParams({
        organizationId,
        ...(careHomeId && { careHomeId })
      });
      const response = await fetch(`/api/compliance/audits?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch audits');
      }
      return response.json();
    },
    staleTime: 1 * 60 * 1000 // 1 minute
  });

  // Validate compliance
  const validateCompliance = useMutation({
    mutationFn: async (data: {
      organizationId: string;
      careHomeId: string;
      requirements: string[];
    }) => {
      const response = await fetch('/api/compliance/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Failed to validate compliance');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['compliance', 'audits', organizationId, careHomeId]
      });
      toast({
        title: 'Compliance Validated',
        description: 'Compliance audit has been completed successfully',
        type: 'success'
      });
    },
    onError: (error: Error) => {
      setError(error);
      toast({
        title: 'Validation Failed',
        description: error.message,
        type: 'error'
      });
    }
  });

  // Add evidence
  const addEvidence = useMutation({
    mutationFn: async (evidence: {
      requirementId: string;
      file: File;
      metadata: Record<string, any>;
    }) => {
      const formData = new FormData();
      formData.append('file', evidence.file);
      formData.append('metadata', JSON.stringify(evidence.metadata));
      formData.append('requirementId', evidence.requirementId);

      const response = await fetch('/api/compliance/documents', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload evidence');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['compliance', 'requirements', region]
      });
      toast({
        title: 'Evidence Added',
        description: 'Evidence has been uploaded successfully',
        type: 'success'
      });
    },
    onError: (error: Error) => {
      setError(error);
      toast({
        title: 'Upload Failed',
        description: error.message,
        type: 'error'
      });
    }
  });

  // Update requirement status
  const updateRequirement = useMutation({
    mutationFn: async ({
      requirementId,
      status,
      notes
    }: {
      requirementId: string;
      status: string;
      notes?: string;
    }) => {
      const response = await fetch(`/api/compliance/requirements/${requirementId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, notes })
      });

      if (!response.ok) {
        throw new Error('Failed to update requirement');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['compliance', 'requirements', region]
      });
      toast({
        title: 'Requirement Updated',
        description: 'Requirement has been updated successfully',
        type: 'success'
      });
    },
    onError: (error: Error) => {
      setError(error);
      toast({
        title: 'Update Failed',
        description: error.message,
        type: 'error'
      });
    }
  });

  return {
    // Data
    frameworks,
    requirements,
    audits,
    error,

    // Loading states
    isLoading: frameworksLoading || requirementsLoading || auditsLoading,
    isError: !!frameworksError || !!requirementsError || !!auditsError,

    // Mutations
    validateCompliance: validateCompliance.mutate,
    addEvidence: addEvidence.mutate,
    updateRequirement: updateRequirement.mutate,

    // Mutation states
    isValidating: validateCompliance.isPending,
    isAddingEvidence: addEvidence.isPending,
    isUpdatingRequirement: updateRequirement.isPending
  };
}


