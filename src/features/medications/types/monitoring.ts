/**
 * @writecarenotes.com
 * @fileoverview Enterprise medication monitoring types
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Type definitions for enterprise-grade medication monitoring.
 * Includes system health, alerts, and performance monitoring.
 */

export interface MonitoringConfig {
  enabled: boolean;
  interval: number;
  retentionPeriod: number;
  alerting: AlertConfig;
  logging: LoggingConfig;
  metrics: MetricsConfig;
  security: SecurityConfig;
}

export interface AlertConfig {
  thresholds: {
    critical: number;
    warning: number;
    info: number;
  };
  channels: NotificationChannel[];
  escalation: EscalationPolicy[];
  suppressions: AlertSuppression[];
}

export interface LoggingConfig {
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  retention: number;
  encryption: boolean;
  archival: {
    enabled: boolean;
    period: number;
    location: string;
  };
}

export interface MetricsConfig {
  collection: {
    interval: number;
    detailed: boolean;
  };
  storage: {
    retention: number;
    aggregation: boolean;
  };
  export: {
    format: string;
    destination: string;
  };
}

export interface SecurityConfig {
  encryption: {
    algorithm: string;
    keyRotation: number;
  };
  audit: {
    enabled: boolean;
    retention: number;
  };
  access: {
    ipWhitelist: string[];
    rateLimit: number;
  };
}

export interface NotificationChannel {
  id: string;
  type: 'EMAIL' | 'SMS' | 'SLACK' | 'TEAMS' | 'WEBHOOK';
  config: {
    endpoint: string;
    credentials?: {
      username?: string;
      apiKey?: string;
    };
    template?: string;
  };
  active: boolean;
}

export interface EscalationPolicy {
  id: string;
  name: string;
  levels: {
    level: number;
    contacts: string[];
    waitTime: number;
  }[];
  repeatInterval?: number;
  maxRepetitions?: number;
}

export interface AlertSuppression {
  id: string;
  pattern: string;
  reason: string;
  startTime: string;
  endTime: string;
  createdBy: string;
}

export interface PerformanceMetrics {
  responseTime: number;
  throughput: number;
  errorRate: number;
  resourceUtilization: {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
  };
  timestamp: string;
}

export interface SystemHealth {
  status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
  components: {
    [key: string]: ComponentHealth;
  };
  lastCheck: string;
  issues?: HealthIssue[];
}

export interface ComponentHealth {
  status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
  latency: number;
  errorRate: number;
  message?: string;
  lastCheck: string;
}

export interface HealthIssue {
  id: string;
  component: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  timestamp: string;
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED';
  resolution?: string;
}

export interface MonitoringAlert {
  id: string;
  type: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  message: string;
  component: string;
  timestamp: string;
  metadata: Record<string, any>;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  escalations?: AlertEscalation[];
}

export interface AlertEscalation {
  level: number;
  timestamp: string;
  notifiedContacts: string[];
  response?: {
    respondedBy: string;
    timestamp: string;
    action: string;
  };
}

export type MonitoringEvent = {
  id: string;
  type: string;
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  message: string;
  timestamp: string;
  metadata: Record<string, any>;
}; 