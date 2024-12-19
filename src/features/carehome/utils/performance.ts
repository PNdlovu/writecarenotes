/**
 * Utility functions for monitoring and optimizing care home module performance.
 * @packageDocumentation
 */

import { useEffect } from 'react';

/**
 * Tracks component render performance using the Web Vitals API.
 * 
 * @param componentName - Name of the component being monitored
 * @param metric - Performance metric to track
 */
export function trackComponentPerformance(
  componentName: string,
  metric: 'FCP' | 'LCP' | 'CLS' | 'FID'
) {
  if (process.env.NODE_ENV === 'production') {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        // Report to analytics
        fetch('/api/analytics/performance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            component: componentName,
            metric,
            value: entry.startTime,
            timestamp: new Date().toISOString()
          })
        }).catch(console.error);
      });
    });

    observer.observe({ entryTypes: ['paint', 'layout-shift', 'first-input'] });
  }
}

/**
 * Hook to monitor component render performance.
 * 
 * @param componentName - Name of the component to monitor
 */
export function usePerformanceMonitoring(componentName: string) {
  useEffect(() => {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;

      if (process.env.NODE_ENV === 'production') {
        fetch('/api/analytics/component-lifecycle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            component: componentName,
            duration,
            timestamp: new Date().toISOString()
          })
        }).catch(console.error);
      }
    };
  }, [componentName]);
}

/**
 * Measures and reports API call performance.
 * 
 * @param endpoint - API endpoint being called
 * @param startTime - Start time of the API call
 */
export function measureApiPerformance(endpoint: string, startTime: number) {
  const duration = performance.now() - startTime;

  if (process.env.NODE_ENV === 'production') {
    fetch('/api/analytics/api-performance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint,
        duration,
        timestamp: new Date().toISOString()
      })
    }).catch(console.error);
  }
}

/**
 * Monitors memory usage of the care home module.
 */
export function monitorMemoryUsage() {
  if (process.env.NODE_ENV === 'production' && 'memory' in performance) {
    setInterval(() => {
      const memory = (performance as any).memory;
      
      fetch('/api/analytics/memory-usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          timestamp: new Date().toISOString()
        })
      }).catch(console.error);
    }, 60000); // Monitor every minute
  }
}


