import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { ReportType } from '../types';
import useFinancialTranslation from '../i18n/hooks/useFinancialTranslation';

interface ReportParams {
  type: ReportType;
  startDate: Date;
  endDate: Date;
  format?: 'pdf' | 'excel' | 'csv';
}

interface UseFinancialReportsProps {
  region: string;
}

export const useFinancialReports = ({ region }: UseFinancialReportsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useFinancialTranslation();

  const getReport = async ({ type, startDate, endDate }: ReportParams) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        type,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      const response = await fetch(`/api/${region}/financial/reports?${params}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch report');
      }

      return await response.json();
    } catch (error) {
      toast({
        title: t('errors.report.fetchFailed'),
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = async ({ type, startDate, endDate, format = 'pdf' }: ReportParams) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/${region}/financial/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          format,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate report');
      }

      const result = await response.json();
      toast({
        title: t('common.success'),
        description: t('reports.generationStarted'),
      });
      return result;
    } catch (error) {
      toast({
        title: t('errors.report.generationFailed'),
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    getReport,
    generateReport,
  };
};

export default useFinancialReports;
