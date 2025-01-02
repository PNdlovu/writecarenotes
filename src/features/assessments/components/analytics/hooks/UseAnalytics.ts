import { useState, useEffect } from 'react';
import { AnalyticsData, TimeRange } from '../types';
import { AlertService, AggregationService } from '../../../services/analytics';

export function useAnalytics(timeRange: TimeRange = '24h') {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const alertService = new AlertService();
  const aggregationService = new AggregationService();

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      try {
        setLoading(true);
        const [alerts, insights] = await Promise.all([
          alertService.getAlerts(),
          aggregationService.getAggregatedData(timeRange)
        ]);

        if (mounted) {
          setData({
            events: alerts,
            metrics: insights.metrics,
            syncStatus: insights.syncStatus
          });
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch analytics data'));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      mounted = false;
    };
  }, [timeRange]);

  return { data, loading, error };
}
