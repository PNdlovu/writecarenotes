export type MetricType = 
  | 'page_view'
  | 'feature_usage'
  | 'error'
  | 'performance'
  | 'security'
  | 'api_call'
  | 'user_action';

export interface Metric {
  id: string;
  timestamp: Date;
  type: MetricType;
  userId?: string;
  data: Record<string, any>;
}

export interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    database?: HealthCheckResult;
    cache?: HealthCheckResult;
    api?: HealthCheckResult;
    storage?: HealthCheckResult;
  };
  timestamp: Date;
}

export interface HealthCheckResult {
  status: 'up' | 'down';
  latency?: number;
  message?: string;
}


