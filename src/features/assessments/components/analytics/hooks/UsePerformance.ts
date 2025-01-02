import { useState, useEffect } from 'react';
import { PerformanceData, PerformanceMetrics } from '../types';
import { AggregationService } from '../../../services/analytics';

export function usePerformance() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [data, setData] = useState<PerformanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const aggregationService = new AggregationService();

  useEffect(() => {
    let mounted = true;
    let intervalId: NodeJS.Timeout;

    async function fetchMetrics() {
      try {
        setLoading(true);
        const performanceData = await aggregationService.getPerformanceMetrics();
        
        if (mounted) {
          setData(performanceData);
          setMetrics({
            avgSyncDuration: calculateAverage(performanceData.map(d => d.syncDuration)),
            maxSyncDuration: Math.max(...performanceData.map(d => d.syncDuration)),
            storageGrowthRate: calculateGrowthRate(performanceData.map(d => d.storageSize)),
            errorRate: calculateErrorRate(performanceData)
          });
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch performance metrics'));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchMetrics();
    intervalId = setInterval(fetchMetrics, 60000); // Refresh every minute

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, []);

  return { metrics, data, loading, error };
}

function calculateAverage(values: number[]): number {
  return values.length > 0 ? values.reduce((a, b) => a + b) / values.length : 0;
}

function calculateGrowthRate(values: number[]): number {
  if (values.length < 2) return 0;
  const first = values[0];
  const last = values[values.length - 1];
  return ((last - first) / first) * 100;
}

function calculateErrorRate(data: PerformanceData[]): number {
  const totalErrors = data.reduce((sum, d) => sum + d.errorCount, 0);
  return data.length > 0 ? totalErrors / data.length : 0;
}
