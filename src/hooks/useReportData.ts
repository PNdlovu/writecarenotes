import { useQuery } from '@tanstack/react-query';
import { ReportMetrics, ReportType, DateRange, ReportError } from '../types/reports';

interface FetchReportParams {
  residentId: string;
  reportType: ReportType;
  dateRange: DateRange;
  compareWithPrevious?: boolean;
}

const fetchReportData = async ({
  residentId,
  reportType,
  dateRange,
  compareWithPrevious = false,
}: FetchReportParams): Promise<ReportMetrics> => {
  const params = new URLSearchParams({
    type: reportType,
    from: dateRange.from.toISOString(),
    to: dateRange.to.toISOString(),
    compare: compareWithPrevious.toString(),
  });

  const response = await fetch(`/api/residents/${residentId}/medications/reports?${params}`);
  
  if (!response.ok) {
    const error: ReportError = await response.json();
    throw new Error(error.message || 'Failed to fetch report data');
  }

  return response.json();
};

export const useReportData = (params: FetchReportParams) => {
  return useQuery({
    queryKey: ['report', params],
    queryFn: () => fetchReportData(params),
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
    cacheTime: 30 * 60 * 1000, // Keep unused data in cache for 30 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
};


