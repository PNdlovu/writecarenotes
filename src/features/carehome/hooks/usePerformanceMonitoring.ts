import { useEffect, useState } from 'react';
import { onCLS, onFID, onLCP, onFCP } from 'web-vitals';
import { useReportWebVitals } from '@/hooks/useReportWebVitals';

interface PerformanceMetrics {
  cls: number | null;
  fid: number | null;
  lcp: number | null;
  fcp: number | null;
  memory: {
    jsHeapSizeLimit: number;
    totalJSHeapSize: number;
    usedJSHeapSize: number;
  } | null;
  apiCalls: {
    endpoint: string;
    duration: number;
    timestamp: Date;
  }[];
}

export function usePerformanceMonitoring(careHomeId: string) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    cls: null,
    fid: null,
    lcp: null,
    fcp: null,
    memory: null,
    apiCalls: []
  });

  const { reportWebVital } = useReportWebVitals();

  useEffect(() => {
    // Web Vitals monitoring
    onCLS(metric => {
      setMetrics(prev => ({ ...prev, cls: metric.value }));
      reportWebVital({ ...metric, careHomeId });
    });

    onFID(metric => {
      setMetrics(prev => ({ ...prev, fid: metric.value }));
      reportWebVital({ ...metric, careHomeId });
    });

    onLCP(metric => {
      setMetrics(prev => ({ ...prev, lcp: metric.value }));
      reportWebVital({ ...metric, careHomeId });
    });

    onFCP(metric => {
      setMetrics(prev => ({ ...prev, fcp: metric.value }));
      reportWebVital({ ...metric, careHomeId });
    });

    // Memory monitoring
    const memoryMonitor = setInterval(() => {
      if ('memory' in performance) {
        setMetrics(prev => ({
          ...prev,
          memory: (performance as any).memory
        }));
      }
    }, 5000);

    return () => clearInterval(memoryMonitor);
  }, [careHomeId]);

  // API call performance tracking
  const trackApiCall = (endpoint: string, startTime: number) => {
    const duration = performance.now() - startTime;
    setMetrics(prev => ({
      ...prev,
      apiCalls: [
        ...prev.apiCalls,
        { endpoint, duration, timestamp: new Date() }
      ].slice(-100) // Keep last 100 calls
    }));
  };

  return {
    metrics,
    trackApiCall
  };
}


