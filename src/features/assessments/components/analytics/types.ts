export interface AnalyticsEvent {
  id: string;
  type: string;
  timestamp: number;
  data: Record<string, any>;
  userId?: string;
  sessionId?: string;
}

export interface AnalyticsData {
  events: AnalyticsEvent[];
  metrics: {
    totalSize: number;
    eventCount: number;
    oldestEvent: number;
    newestEvent: number;
  };
  syncStatus: {
    pendingCount: number;
    processingCount: number;
    failedCount: number;
    completedCount: number;
  };
}

export interface PerformanceData {
  timestamp: number;
  syncDuration: number;
  storageSize: number;
  eventCount: number;
  errorCount: number;
}

export interface PerformanceMetrics {
  avgSyncDuration: number;
  maxSyncDuration: number;
  storageGrowthRate: number;
  errorRate: number;
}

export type TimeRange = '24h' | '7d' | '30d';

export interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  trend?: {
    value: number;
    label: string;
    direction: 'up' | 'down' | 'neutral';
  };
}

export interface ChartData {
  date: string;
  count: number;
  [key: string]: any;
}

export interface ErrorState {
  message: string;
  code?: string;
  timestamp: number;
}
