import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/useToast';
import { CareHomeAPI } from '../api';
import { CareHomeService } from '../services/CareHomeService';
import { Region, ComplianceReport } from '../types/compliance';
import { generateComplianceReport, downloadBlob } from '../utils/export';

export function useRegionalCompliance(careHomeId: string, region: Region) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const api = new CareHomeAPI(new CareHomeService(region));

  // Fetch compliance data
  const { data: complianceData } = useQuery({
    queryKey: ['compliance', careHomeId],
    queryFn: () => api.getCompliance(careHomeId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000 // 30 minutes
  });

  // Validate compliance
  const validateCompliance = useMutation({
    mutationFn: async () => {
      setIsLoading(true);
      try {
        const report = await api.getCompliance(careHomeId);
        return report;
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['compliance', careHomeId], data);
      toast({
        title: 'Compliance Validated',
        description: `Overall status: ${data.status}`,
        type: 'success'
      });
    },
    onError: (error) => {
      toast({
        title: 'Validation Failed',
        description: error.message,
        type: 'error'
      });
    }
  });

  // Download compliance report
  const downloadReport = async (report: ComplianceReport) => {
    try {
      setIsLoading(true);
      // Implementation would generate and download a PDF/Excel report
      const reportBlob = await generateComplianceReport(report);
      downloadBlob(reportBlob, `compliance-report-${careHomeId}.pdf`);
      
      toast({
        title: 'Report Downloaded',
        description: 'Compliance report has been downloaded successfully',
        type: 'success'
      });
    } catch (err) {
      setError(err as Error);
      toast({
        title: 'Download Failed',
        description: 'Failed to download compliance report',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    complianceData,
    isLoading,
    error,
    validateCompliance: validateCompliance.mutate,
    downloadReport,
    isValidating: validateCompliance.isLoading
  };
}


