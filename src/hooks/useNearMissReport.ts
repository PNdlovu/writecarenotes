import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/ui/use-toast';
import { nearMissService } from '@/services/nearMissService';
import type { 
  NearMissReport, 
  NearMissType, 
  Severity, 
  ChildSpecificDetails,
  SafeguardingReferralDetails,
  SystemImprovements 
} from '@/types/nearMiss';

interface UseNearMissReportProps {
  medicationId?: string;
  residentId: string;
  region: string;
}

export function useNearMissReport({ medicationId, residentId, region }: UseNearMissReportProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Omit<NearMissReport, 'id'>>({
    medicationId,
    residentId,
    timestamp: new Date().toISOString(),
    type: 'WRONG_MEDICATION',
    severity: 'LOW',
    description: '',
    actionTaken: '',
    preventiveMeasures: '',
    reportedBy: {
      id: session?.user?.id || '',
      name: session?.user?.name || '',
      role: session?.user?.role || '',
    },
    witnessName: '',
    regulatoryBody: '',
    isChildInvolved: false,
    requiresSafeguardingReferral: false,
    metadata: {
      version: '1.0',
      lastModified: new Date().toISOString(),
      modifiedBy: session?.user?.id || '',
      status: 'DRAFT',
    },
  });

  const updateFormData = useCallback(<K extends keyof NearMissReport>(
    field: K,
    value: NearMissReport[K]
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      metadata: {
        ...prev.metadata,
        lastModified: new Date().toISOString(),
        modifiedBy: session?.user?.id || '',
      },
    }));
  }, [session?.user?.id]);

  const updateChildDetails = useCallback((details: Partial<ChildSpecificDetails>) => {
    setFormData(prev => ({
      ...prev,
      childSpecificDetails: {
        ...prev.childSpecificDetails,
        ...details,
      },
      metadata: {
        ...prev.metadata,
        lastModified: new Date().toISOString(),
        modifiedBy: session?.user?.id || '',
      },
    }));
  }, [session?.user?.id]);

  const updateSafeguardingDetails = useCallback((details: Partial<SafeguardingReferralDetails>) => {
    setFormData(prev => ({
      ...prev,
      safeguardingReferralDetails: {
        ...prev.safeguardingReferralDetails,
        ...details,
      },
      metadata: {
        ...prev.metadata,
        lastModified: new Date().toISOString(),
        modifiedBy: session?.user?.id || '',
      },
    }));
  }, [session?.user?.id]);

  const updateSystemImprovements = useCallback((improvements: Partial<SystemImprovements>) => {
    setFormData(prev => ({
      ...prev,
      systemImprovements: {
        ...prev.systemImprovements,
        ...improvements,
      },
      metadata: {
        ...prev.metadata,
        lastModified: new Date().toISOString(),
        modifiedBy: session?.user?.id || '',
      },
    }));
  }, [session?.user?.id]);

  const submitReport = useCallback(async () => {
    setLoading(true);
    try {
      const result = await nearMissService.submitReport(formData);
      
      if (!result.success) {
        toast({
          title: 'Error Submitting Report',
          description: result.errors?.join('\n'),
          variant: 'destructive',
        });
        return false;
      }

      toast({
        title: 'Report Submitted Successfully',
        description: 'The near miss report has been recorded and relevant parties notified.',
      });

      // Reset form
      setFormData({
        medicationId,
        residentId,
        timestamp: new Date().toISOString(),
        type: 'WRONG_MEDICATION',
        severity: 'LOW',
        description: '',
        actionTaken: '',
        preventiveMeasures: '',
        reportedBy: {
          id: session?.user?.id || '',
          name: session?.user?.name || '',
          role: session?.user?.role || '',
        },
        witnessName: '',
        regulatoryBody: '',
        isChildInvolved: false,
        requiresSafeguardingReferral: false,
        metadata: {
          version: '1.0',
          lastModified: new Date().toISOString(),
          modifiedBy: session?.user?.id || '',
          status: 'DRAFT',
        },
      });

      return true;
    } catch (error) {
      console.error('Error submitting near miss report:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while submitting the report.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [formData, medicationId, residentId, session?.user, toast]);

  return {
    formData,
    loading,
    updateFormData,
    updateChildDetails,
    updateSafeguardingDetails,
    updateSystemImprovements,
    submitReport,
  };
}


