import { performance, PerformanceObserver } from 'perf_hooks';
import { ErrorBoundary } from 'react-error-boundary';

// Performance monitoring
export const setupPerformanceMonitoring = () => {
  // Performance metrics observer
  const perfObserver = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      // Send to monitoring service
      reportPerformanceMetric({
        name: entry.name,
        duration: entry.duration,
        startTime: entry.startTime,
        entryType: entry.entryType,
      });
    });
  });

  perfObserver.observe({ entryTypes: ['measure', 'navigation', 'resource'] });

  // Custom metrics
  window.addEventListener('load', () => {
    performance.mark('app-loaded');
  });
};

// Error tracking
export const errorHandler = (error: Error, info: { componentStack: string }) => {
  reportError({
    error,
    componentStack: info.componentStack,
    timestamp: new Date().toISOString(),
    module: 'SpecialNeedsAssessment',
  });
};

// Usage metrics
export const trackUsageMetrics = {
  assessmentCreated: () => {
    reportUsageMetric({
      action: 'assessment_created',
      timestamp: new Date().toISOString(),
    });
  },
  assessmentUpdated: () => {
    reportUsageMetric({
      action: 'assessment_updated',
      timestamp: new Date().toISOString(),
    });
  },
  assessmentExported: () => {
    reportUsageMetric({
      action: 'assessment_exported',
      timestamp: new Date().toISOString(),
    });
  },
};

// API monitoring
export const apiMonitoring = {
  requestStarted: (endpoint: string) => {
    performance.mark(`api-${endpoint}-start`);
  },
  requestEnded: (endpoint: string) => {
    performance.mark(`api-${endpoint}-end`);
    performance.measure(
      `api-${endpoint}`,
      `api-${endpoint}-start`,
      `api-${endpoint}-end`
    );
  },
};

// Health checks
export const healthCheck = async () => {
  try {
    const response = await fetch('/api/health');
    return response.ok;
  } catch (error) {
    reportError({
      error,
      timestamp: new Date().toISOString(),
      module: 'HealthCheck',
    });
    return false;
  }
};

// Memory monitoring
export const monitorMemoryUsage = () => {
  if (performance.memory) {
    setInterval(() => {
      reportMemoryMetric({
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
        timestamp: new Date().toISOString(),
      });
    }, 60000); // Check every minute
  }
};

// User interaction monitoring
export const trackUserInteraction = {
  tabSwitch: (tabName: string) => {
    reportInteractionMetric({
      action: 'tab_switch',
      target: tabName,
      timestamp: new Date().toISOString(),
    });
  },
  formSubmit: (formType: string) => {
    reportInteractionMetric({
      action: 'form_submit',
      target: formType,
      timestamp: new Date().toISOString(),
    });
  },
  search: (query: string) => {
    reportInteractionMetric({
      action: 'search',
      target: query,
      timestamp: new Date().toISOString(),
    });
  },
};

// Alert thresholds
export const alertThresholds = {
  apiLatency: 2000, // 2 seconds
  memoryUsage: 0.9, // 90% of heap size
  errorRate: 0.05, // 5% error rate
};

// Reporting functions (implement these based on your monitoring service)
function reportPerformanceMetric(metric: any) {
  // Implement based on monitoring service (e.g., New Relic, Datadog)
  console.log('Performance metric:', metric);
}

function reportError(error: any) {
  // Implement based on error tracking service (e.g., Sentry)
  console.error('Error:', error);
}

function reportUsageMetric(metric: any) {
  // Implement based on analytics service (e.g., Google Analytics)
  console.log('Usage metric:', metric);
}

function reportMemoryMetric(metric: any) {
  // Implement based on monitoring service
  console.log('Memory metric:', metric);
}

function reportInteractionMetric(metric: any) {
  // Implement based on analytics service
  console.log('Interaction metric:', metric);
}
