/**
 * @fileoverview Custom Monitoring System
 * @version 1.0.0
 * @created 2024-03-21
 */

import { Redis } from 'ioredis';
import { logger } from './logger';
import { CacheService } from './cache';
import { NotificationService } from './notifications';

// Enhanced metric types for better categorization
type MetricType = 
  | 'counter'    // Incremental values (requests, errors)
  | 'gauge'      // Point-in-time values (memory usage, active users)
  | 'histogram'  // Distribution of values (response times)
  | 'summary';   // Statistical summary over time

interface MetricData {
  timestamp: number;
  value: number;
  type: MetricType;
  tags: Record<string, string>;
}

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: number;
  component: string;
  message?: string;
  details?: Record<string, any>;
}

interface AlertConfig {
  metric: string;
  threshold: number;
  duration: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  notifyChannels: string[];
  comparison: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  aggregation: 'avg' | 'max' | 'min' | 'sum' | 'count';
}

// Predefined metrics for different components
const METRICS = {
  API: {
    REQUEST_COUNT: 'api.requests.total',
    ERROR_COUNT: 'api.errors.total',
    RESPONSE_TIME: 'api.response.time',
    RATE_LIMIT_HITS: 'api.ratelimit.hits'
  },
  DATABASE: {
    QUERY_TIME: 'db.query.time',
    CONNECTION_COUNT: 'db.connections.active',
    ERROR_COUNT: 'db.errors.total',
    POOL_SIZE: 'db.pool.size'
  },
  CACHE: {
    HIT_RATE: 'cache.hit.rate',
    MISS_RATE: 'cache.miss.rate',
    MEMORY_USAGE: 'cache.memory.usage',
    EVICTION_COUNT: 'cache.evictions.total'
  },
  AUTH: {
    LOGIN_SUCCESS: 'auth.login.success',
    LOGIN_FAILURE: 'auth.login.failure',
    TOKEN_VALIDATION: 'auth.token.validation',
    SESSION_COUNT: 'auth.sessions.active'
  },
  INTEGRATION: {
    NHS_LATENCY: 'integration.nhs.latency',
    GP_LATENCY: 'integration.gp.latency',
    HMRC_LATENCY: 'integration.hmrc.latency',
    PHARMACY_LATENCY: 'integration.pharmacy.latency'
  },
  SYSTEM: {
    CPU_USAGE: 'system.cpu.usage',
    MEMORY_USAGE: 'system.memory.usage',
    DISK_USAGE: 'system.disk.usage',
    NETWORK_IO: 'system.network.io'
  },
  CARE_HOME: {
    // Resident Metrics
    RESIDENTS_TOTAL: 'residents.total',
    RESIDENTS_OCCUPANCY: 'residents.occupancy.rate',
    RESIDENTS_ADMISSIONS: 'residents.admissions.count',
    RESIDENTS_DISCHARGES: 'residents.discharges.count',
    RESIDENTS_INCIDENTS: 'residents.incidents.count',
    
    // Staff Metrics
    STAFF_TOTAL: 'staff.total',
    STAFF_ON_DUTY: 'staff.on_duty.count',
    STAFF_TO_RESIDENT_RATIO: 'staff.resident.ratio',
    STAFF_TRAINING_COMPLIANCE: 'staff.training.compliance',
    STAFF_INCIDENTS: 'staff.incidents.count',
    
    // Medication Metrics
    MEDICATION_ERRORS: 'medications.errors.count',
    MEDICATION_COMPLIANCE: 'medications.compliance.rate',
    MEDICATION_STOCK_LEVELS: 'medications.stock.levels',
    MEDICATION_NEAR_EXPIRY: 'medications.near_expiry.count',
    
    // Care Plan Metrics
    CARE_PLANS_OVERDUE: 'care_plans.overdue.count',
    CARE_PLANS_UPDATED: 'care_plans.updated.count',
    CARE_PLANS_COMPLIANCE: 'care_plans.compliance.rate',
    
    // Clinical Metrics
    FALLS_INCIDENTS: 'clinical.falls.count',
    PRESSURE_ULCERS: 'clinical.pressure_ulcers.count',
    INFECTIONS: 'clinical.infections.count',
    HOSPITAL_ADMISSIONS: 'clinical.hospital_admissions.count',
    
    // Compliance Metrics
    CQC_COMPLIANCE: 'compliance.cqc.rate',
    TRAINING_COMPLIANCE: 'compliance.training.rate',
    DOCUMENTATION_COMPLIANCE: 'compliance.documentation.rate',
    INCIDENT_REPORTING_COMPLIANCE: 'compliance.incident_reporting.rate',
    
    // Financial Metrics
    OCCUPANCY_REVENUE: 'financial.occupancy.revenue',
    STAFF_COSTS: 'financial.staff.costs',
    MEDICATION_COSTS: 'financial.medication.costs',
    OPERATIONAL_COSTS: 'financial.operational.costs'
  }
};

const ALERT_CONFIGS: AlertConfig[] = [
  // Resident Safety Alerts
  {
    metric: METRICS.CARE_HOME.RESIDENTS_INCIDENTS,
    threshold: 3,
    duration: 3600, // 1 hour
    severity: 'high',
    notifyChannels: ['email', 'sms'],
    comparison: 'gt',
    aggregation: 'sum'
  },
  {
    metric: METRICS.CARE_HOME.FALLS_INCIDENTS,
    threshold: 2,
    duration: 3600,
    severity: 'high',
    notifyChannels: ['email', 'sms'],
    comparison: 'gt',
    aggregation: 'sum'
  },

  // Staff Coverage Alerts
  {
    metric: METRICS.CARE_HOME.STAFF_TO_RESIDENT_RATIO,
    threshold: 0.2, // Less than 1 staff per 5 residents
    duration: 300, // 5 minutes
    severity: 'critical',
    notifyChannels: ['email', 'sms'],
    comparison: 'lt',
    aggregation: 'avg'
  },
  {
    metric: METRICS.CARE_HOME.STAFF_TRAINING_COMPLIANCE,
    threshold: 85,
    duration: 86400, // 24 hours
    severity: 'medium',
    notifyChannels: ['email'],
    comparison: 'lt',
    aggregation: 'avg'
  },

  // Medication Alerts
  {
    metric: METRICS.CARE_HOME.MEDICATION_ERRORS,
    threshold: 1,
    duration: 3600,
    severity: 'critical',
    notifyChannels: ['email', 'sms'],
    comparison: 'gt',
    aggregation: 'sum'
  },
  {
    metric: METRICS.CARE_HOME.MEDICATION_STOCK_LEVELS,
    threshold: 20,
    duration: 3600,
    severity: 'high',
    notifyChannels: ['email'],
    comparison: 'lt',
    aggregation: 'min'
  },

  // Clinical Alerts
  {
    metric: METRICS.CARE_HOME.PRESSURE_ULCERS,
    threshold: 1,
    duration: 86400,
    severity: 'high',
    notifyChannels: ['email', 'sms'],
    comparison: 'gt',
    aggregation: 'sum'
  },
  {
    metric: METRICS.CARE_HOME.INFECTIONS,
    threshold: 2,
    duration: 86400,
    severity: 'high',
    notifyChannels: ['email', 'sms'],
    comparison: 'gt',
    aggregation: 'sum'
  },

  // Compliance Alerts
  {
    metric: METRICS.CARE_HOME.CQC_COMPLIANCE,
    threshold: 90,
    duration: 86400,
    severity: 'high',
    notifyChannels: ['email'],
    comparison: 'lt',
    aggregation: 'avg'
  },
  {
    metric: METRICS.CARE_HOME.DOCUMENTATION_COMPLIANCE,
    threshold: 95,
    duration: 86400,
    severity: 'medium',
    notifyChannels: ['email'],
    comparison: 'lt',
    aggregation: 'avg'
  },

  // Financial Alerts
  {
    metric: METRICS.CARE_HOME.OCCUPANCY_REVENUE,
    threshold: 75,
    duration: 86400,
    severity: 'medium',
    notifyChannels: ['email'],
    comparison: 'lt',
    aggregation: 'avg'
  },

  // Care Plan Alerts
  {
    metric: METRICS.CARE_HOME.CARE_PLANS_OVERDUE,
    threshold: 5,
    duration: 86400, // 24 hours
    severity: 'high',
    notifyChannels: ['email'],
    comparison: 'gt',
    aggregation: 'count'
  },
  {
    metric: METRICS.CARE_HOME.CARE_PLANS_COMPLIANCE,
    threshold: 90,
    duration: 86400,
    severity: 'medium',
    notifyChannels: ['email'],
    comparison: 'lt',
    aggregation: 'avg'
  },

  // Integration Health Alerts
  {
    metric: METRICS.INTEGRATION.NHS_LATENCY,
    threshold: 5000, // 5 seconds
    duration: 300, // 5 minutes
    severity: 'high',
    notifyChannels: ['email'],
    comparison: 'gt',
    aggregation: 'avg'
  },
  {
    metric: METRICS.INTEGRATION.GP_LATENCY,
    threshold: 5000,
    duration: 300,
    severity: 'high',
    notifyChannels: ['email'],
    comparison: 'gt',
    aggregation: 'avg'
  },
  {
    metric: METRICS.INTEGRATION.PHARMACY_LATENCY,
    threshold: 5000,
    duration: 300,
    severity: 'high',
    notifyChannels: ['email'],
    comparison: 'gt',
    aggregation: 'avg'
  },

  // System Health Alerts
  {
    metric: METRICS.SYSTEM.CPU_USAGE,
    threshold: 80,
    duration: 300,
    severity: 'high',
    notifyChannels: ['email'],
    comparison: 'gt',
    aggregation: 'avg'
  },
  {
    metric: METRICS.SYSTEM.MEMORY_USAGE,
    threshold: 85,
    duration: 300,
    severity: 'high',
    notifyChannels: ['email'],
    comparison: 'gt',
    aggregation: 'avg'
  },
  {
    metric: METRICS.SYSTEM.DISK_USAGE,
    threshold: 90,
    duration: 300,
    severity: 'high',
    notifyChannels: ['email'],
    comparison: 'gt',
    aggregation: 'avg'
  },

  // Database Health Alerts
  {
    metric: METRICS.DATABASE.QUERY_TIME,
    threshold: 1000, // 1 second
    duration: 300,
    severity: 'high',
    notifyChannels: ['email'],
    comparison: 'gt',
    aggregation: 'avg'
  },
  {
    metric: METRICS.DATABASE.ERROR_COUNT,
    threshold: 10,
    duration: 300,
    severity: 'critical',
    notifyChannels: ['email', 'sms'],
    comparison: 'gt',
    aggregation: 'sum'
  },

  // Cache Health Alerts
  {
    metric: METRICS.CACHE.HIT_RATE,
    threshold: 50,
    duration: 3600,
    severity: 'medium',
    notifyChannels: ['email'],
    comparison: 'lt',
    aggregation: 'avg'
  },
  {
    metric: METRICS.CACHE.MEMORY_USAGE,
    threshold: 85,
    duration: 300,
    severity: 'high',
    notifyChannels: ['email'],
    comparison: 'gt',
    aggregation: 'avg'
  },

  // Authentication Alerts
  {
    metric: METRICS.AUTH.LOGIN_FAILURE,
    threshold: 10,
    duration: 300, // 5 minutes
    severity: 'high',
    notifyChannels: ['email', 'sms'],
    comparison: 'gt',
    aggregation: 'sum'
  },
  {
    metric: METRICS.AUTH.TOKEN_VALIDATION,
    threshold: 20,
    duration: 300,
    severity: 'high',
    notifyChannels: ['email'],
    comparison: 'gt',
    aggregation: 'sum'
  },

  // Financial Alerts
  {
    metric: METRICS.CARE_HOME.STAFF_COSTS,
    threshold: 85, // 85% of budget
    duration: 86400,
    severity: 'medium',
    notifyChannels: ['email'],
    comparison: 'gt',
    aggregation: 'avg'
  },
  {
    metric: METRICS.CARE_HOME.OPERATIONAL_COSTS,
    threshold: 90, // 90% of budget
    duration: 86400,
    severity: 'high',
    notifyChannels: ['email'],
    comparison: 'gt',
    aggregation: 'avg'
  }
];

class MonitoringSystem {
  private static instance: MonitoringSystem;
  private redis: Redis;
  private readonly METRIC_PREFIX = 'metrics:';
  private readonly HEALTH_PREFIX = 'health:';
  private readonly ALERT_PREFIX = 'alert:';
  private readonly retentionDays = 30;
  private alertCheckers: Map<string, NodeJS.Timeout> = new Map();

  private constructor() {
    this.redis = CacheService.getInstance().getClient();
    this.startPeriodicCleanup();
    this.initializeSystemMetrics();
    this.initializeAlerts();
  }

  public static getInstance(): MonitoringSystem {
    if (!MonitoringSystem.instance) {
      MonitoringSystem.instance = new MonitoringSystem();
    }
    return MonitoringSystem.instance;
  }

  private initializeSystemMetrics(): void {
    // Monitor system metrics every minute
    setInterval(async () => {
      const metrics = await this.collectSystemMetrics();
      Object.entries(metrics).forEach(([key, value]) => {
        this.recordMetric(key, value, { type: 'gauge' });
      });
    }, 60000);
  }

  private async collectSystemMetrics(): Promise<Record<string, number>> {
    const metrics: Record<string, number> = {};
    
    try {
      // CPU Usage (process)
      const cpuUsage = process.cpuUsage();
      metrics[METRICS.SYSTEM.CPU_USAGE] = (cpuUsage.user + cpuUsage.system) / 1000000;

      // Memory Usage
      const memUsage = process.memoryUsage();
      metrics[METRICS.SYSTEM.MEMORY_USAGE] = (memUsage.heapUsed / memUsage.heapTotal) * 100;

      // Add more system metrics collection here
      
      return metrics;
    } catch (error) {
      logger.error('Failed to collect system metrics', { error });
      return metrics;
    }
  }

  public async recordMetric(
    name: string,
    value: number,
    options: {
      type?: MetricType;
      tags?: Record<string, string>;
    } = {}
  ): Promise<void> {
    const metric: MetricData = {
      timestamp: Date.now(),
      value,
      type: options.type || 'gauge',
      tags: options.tags || {}
    };

    const key = `${this.METRIC_PREFIX}${name}:${Date.now()}`;
    try {
      await this.redis.setex(
        key,
        this.retentionDays * 24 * 60 * 60,
        JSON.stringify(metric)
      );

      // Update current value
      await this.redis.set(
        `${this.METRIC_PREFIX}${name}:current`,
        JSON.stringify(metric)
      );

      // For counter types, update the running total
      if (metric.type === 'counter') {
        await this.redis.incrby(
          `${this.METRIC_PREFIX}${name}:total`,
          Math.floor(value)
        );
      }

      // For histograms, update the distribution
      if (metric.type === 'histogram') {
        await this.updateHistogram(name, value);
      }

      logger.debug('Metric recorded', { name, value, type: metric.type, tags: metric.tags });
    } catch (error) {
      logger.error('Failed to record metric', { name, value, error });
    }
  }

  private async updateHistogram(name: string, value: number): Promise<void> {
    const bucketKey = `${this.METRIC_PREFIX}${name}:histogram`;
    const bucket = Math.floor(value / 10) * 10; // 10ms buckets for response times
    await this.redis.hincrby(bucketKey, bucket.toString(), 1);
  }

  public async getHistogram(name: string): Promise<Record<string, number>> {
    const bucketKey = `${this.METRIC_PREFIX}${name}:histogram`;
    const data = await this.redis.hgetall(bucketKey);
    return Object.entries(data).reduce((acc, [bucket, count]) => ({
      ...acc,
      [bucket]: parseInt(count)
    }), {});
  }

  public async recordAPIMetrics(
    path: string,
    method: string,
    statusCode: number,
    duration: number
  ): Promise<void> {
    const tags = { path, method, statusCode: statusCode.toString() };
    
    // Record request count
    await this.recordMetric(METRICS.API.REQUEST_COUNT, 1, {
      type: 'counter',
      tags
    });

    // Record response time
    await this.recordMetric(METRICS.API.RESPONSE_TIME, duration, {
      type: 'histogram',
      tags
    });

    // Record errors
    if (statusCode >= 400) {
      await this.recordMetric(METRICS.API.ERROR_COUNT, 1, {
        type: 'counter',
        tags
      });
    }
  }

  public async recordDatabaseMetrics(
    operation: string,
    duration: number,
    success: boolean
  ): Promise<void> {
    const tags = { operation };

    await this.recordMetric(METRICS.DATABASE.QUERY_TIME, duration, {
      type: 'histogram',
      tags
    });

    if (!success) {
      await this.recordMetric(METRICS.DATABASE.ERROR_COUNT, 1, {
        type: 'counter',
        tags
      });
    }
  }

  public async recordIntegrationMetrics(
    service: 'nhs' | 'gp' | 'hmrc' | 'pharmacy',
    duration: number,
    success: boolean
  ): Promise<void> {
    const metricName = METRICS.INTEGRATION[`${service.toUpperCase()}_LATENCY`];
    const tags = { service, success: success.toString() };

    await this.recordMetric(metricName, duration, {
      type: 'histogram',
      tags
    });
  }

  // Record health status for a component
  public async recordHealth(
    component: string,
    status: HealthStatus['status'],
    message?: string,
    details?: Record<string, any>
  ): Promise<void> {
    const health: HealthStatus = {
      status,
      timestamp: Date.now(),
      component,
      message,
      details
    };

    const key = `${this.HEALTH_PREFIX}${component}`;
    try {
      await this.redis.set(key, JSON.stringify(health));
      logger.info('Health status recorded', { component, status, message });
    } catch (error) {
      logger.error('Failed to record health status', { component, status, error });
    }
  }

  // Get metrics for a specific time range
  public async getMetrics(
    name: string,
    startTime: number,
    endTime: number
  ): Promise<MetricData[]> {
    try {
      const keys = await this.redis.keys(`${this.METRIC_PREFIX}${name}:*`);
      const metrics: MetricData[] = [];

      for (const key of keys) {
        const data = await this.redis.get(key);
        if (data) {
          const metric: MetricData = JSON.parse(data);
          if (metric.timestamp >= startTime && metric.timestamp <= endTime) {
            metrics.push(metric);
          }
        }
      }

      return metrics;
    } catch (error) {
      logger.error('Failed to get metrics', { name, error });
      return [];
    }
  }

  // Get current health status for all components
  public async getHealthStatus(): Promise<HealthStatus[]> {
    try {
      const keys = await this.redis.keys(`${this.HEALTH_PREFIX}*`);
      const statuses: HealthStatus[] = [];

      for (const key of keys) {
        const data = await this.redis.get(key);
        if (data) {
          statuses.push(JSON.parse(data));
        }
      }

      return statuses;
    } catch (error) {
      logger.error('Failed to get health status', { error });
      return [];
    }
  }

  // Check if metric exceeds threshold and trigger alert
  public async checkAlert(config: AlertConfig): Promise<void> {
    try {
      const endTime = Date.now();
      const startTime = endTime - (config.duration * 1000);
      const metrics = await this.getMetrics(config.metric, startTime, endTime);

      const average = metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length;

      if (average > config.threshold) {
        await this.triggerAlert(config, average);
      }
    } catch (error) {
      logger.error('Failed to check alert', { config, error });
    }
  }

  // Trigger alert notification
  private async triggerAlert(config: AlertConfig, value: number): Promise<void> {
    const alert = {
      metric: config.metric,
      value,
      threshold: config.threshold,
      severity: config.severity,
      timestamp: Date.now()
    };

    const key = `${this.ALERT_PREFIX}${config.metric}:${Date.now()}`;
    try {
      // Store alert
      await this.redis.setex(
        key,
        this.retentionDays * 24 * 60 * 60,
        JSON.stringify(alert)
      );

      // Notify channels (implement notification logic here)
      for (const channel of config.notifyChannels) {
        await this.notifyChannel(channel, alert);
      }

      logger.warn('Alert triggered', alert);
    } catch (error) {
      logger.error('Failed to trigger alert', { alert, error });
    }
  }

  // Notify a specific channel about an alert
  private async notifyChannel(channel: string, alert: any): Promise<void> {
    const notificationService = NotificationService.getInstance();
    const { subject, text, html } = await notificationService.formatAlertMessage(alert);

    // Get recipients from environment variables
    const emailRecipients = (process.env.ALERT_EMAIL_RECIPIENTS || '').split(',').filter(Boolean);
    const smsRecipients = (process.env.ALERT_SMS_RECIPIENTS || '').split(',').filter(Boolean);

    try {
        switch (channel) {
            case 'email':
                if (emailRecipients.length > 0) {
                    await notificationService.sendEmail(emailRecipients, subject, text, html);
                }
                break;
            case 'sms':
                if (smsRecipients.length > 0) {
                    // Truncate SMS message if too long
                    const smsText = text.length > 160 ? text.substring(0, 157) + '...' : text;
                    await notificationService.sendSMS(smsRecipients, smsText);
                }
                break;
            default:
                logger.warn('Unknown notification channel', { channel });
        }
    } catch (error) {
        logger.error('Failed to send notification', { channel, error });
        // Don't throw error to prevent alert processing from failing
    }
  }

  // Periodic cleanup of old data
  private startPeriodicCleanup(): void {
    setInterval(async () => {
      try {
        const cutoff = Date.now() - (this.retentionDays * 24 * 60 * 60 * 1000);
        const keys = await this.redis.keys(`${this.METRIC_PREFIX}*`);
        
        for (const key of keys) {
          const data = await this.redis.get(key);
          if (data) {
            const metric: MetricData = JSON.parse(data);
            if (metric.timestamp < cutoff) {
              await this.redis.del(key);
            }
          }
        }
      } catch (error) {
        logger.error('Failed to cleanup old metrics', { error });
      }
    }, 24 * 60 * 60 * 1000); // Run daily
  }

  // Get aggregated metrics for dashboard
  public async getDashboardMetrics(
    metrics: string[],
    period: 'hour' | 'day' | 'week' | 'month'
  ): Promise<Record<string, any>> {
    const endTime = Date.now();
    const periodInMs = {
      hour: 60 * 60 * 1000,
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000
    };
    const startTime = endTime - periodInMs[period];

    const result: Record<string, any> = {};
    
    for (const metric of metrics) {
      const data = await this.getMetrics(metric, startTime, endTime);
      result[metric] = {
        average: data.reduce((sum, m) => sum + m.value, 0) / data.length,
        min: Math.min(...data.map(m => m.value)),
        max: Math.max(...data.map(m => m.value)),
        count: data.length,
        lastValue: data[data.length - 1]?.value
      };
    }

    return result;
  }

  public async getAggregatedMetrics(
    name: string,
    period: 'hour' | 'day' | 'week' | 'month',
    aggregation: 'avg' | 'max' | 'min' | 'sum' | 'count'
  ): Promise<number> {
    const endTime = Date.now();
    const periodInMs = {
      hour: 60 * 60 * 1000,
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000
    };
    const startTime = endTime - periodInMs[period];

    const metrics = await this.getMetrics(name, startTime, endTime);
    const values = metrics.map(m => m.value);

    switch (aggregation) {
      case 'avg':
        return values.reduce((a, b) => a + b, 0) / values.length;
      case 'max':
        return Math.max(...values);
      case 'min':
        return Math.min(...values);
      case 'sum':
        return values.reduce((a, b) => a + b, 0);
      case 'count':
        return values.length;
      default:
        throw new Error(`Unknown aggregation: ${aggregation}`);
    }
  }

  public async recordResidentMetrics(
    organizationId: string,
    metrics: {
      totalResidents?: number;
      occupancyRate?: number;
      admissions?: number;
      discharges?: number;
      incidents?: number;
    }
  ): Promise<void> {
    const tags = { organizationId };

    if (metrics.totalResidents !== undefined) {
      await this.recordMetric(METRICS.CARE_HOME.RESIDENTS_TOTAL, metrics.totalResidents, {
        type: 'gauge',
        tags
      });
    }

    if (metrics.occupancyRate !== undefined) {
      await this.recordMetric(METRICS.CARE_HOME.RESIDENTS_OCCUPANCY, metrics.occupancyRate, {
        type: 'gauge',
        tags
      });
    }

    if (metrics.admissions !== undefined) {
      await this.recordMetric(METRICS.CARE_HOME.RESIDENTS_ADMISSIONS, metrics.admissions, {
        type: 'counter',
        tags
      });
    }

    if (metrics.discharges !== undefined) {
      await this.recordMetric(METRICS.CARE_HOME.RESIDENTS_DISCHARGES, metrics.discharges, {
        type: 'counter',
        tags
      });
    }

    if (metrics.incidents !== undefined) {
      await this.recordMetric(METRICS.CARE_HOME.RESIDENTS_INCIDENTS, metrics.incidents, {
        type: 'counter',
        tags
      });
    }
  }

  public async recordStaffMetrics(
    organizationId: string,
    metrics: {
      totalStaff?: number;
      onDuty?: number;
      residentRatio?: number;
      trainingCompliance?: number;
      incidents?: number;
    }
  ): Promise<void> {
    const tags = { organizationId };

    if (metrics.totalStaff !== undefined) {
      await this.recordMetric(METRICS.CARE_HOME.STAFF_TOTAL, metrics.totalStaff, {
        type: 'gauge',
        tags
      });
    }

    if (metrics.onDuty !== undefined) {
      await this.recordMetric(METRICS.CARE_HOME.STAFF_ON_DUTY, metrics.onDuty, {
        type: 'gauge',
        tags
      });
    }

    if (metrics.residentRatio !== undefined) {
      await this.recordMetric(METRICS.CARE_HOME.STAFF_TO_RESIDENT_RATIO, metrics.residentRatio, {
        type: 'gauge',
        tags
      });
    }

    if (metrics.trainingCompliance !== undefined) {
      await this.recordMetric(METRICS.CARE_HOME.STAFF_TRAINING_COMPLIANCE, metrics.trainingCompliance, {
        type: 'gauge',
        tags
      });
    }

    if (metrics.incidents !== undefined) {
      await this.recordMetric(METRICS.CARE_HOME.STAFF_INCIDENTS, metrics.incidents, {
        type: 'counter',
        tags
      });
    }
  }

  public async recordMedicationMetrics(
    organizationId: string,
    metrics: {
      errors?: number;
      compliance?: number;
      stockLevels?: number;
      nearExpiry?: number;
    }
  ): Promise<void> {
    const tags = { organizationId };

    if (metrics.errors !== undefined) {
      await this.recordMetric(METRICS.CARE_HOME.MEDICATION_ERRORS, metrics.errors, {
        type: 'counter',
        tags
      });
    }

    if (metrics.compliance !== undefined) {
      await this.recordMetric(METRICS.CARE_HOME.MEDICATION_COMPLIANCE, metrics.compliance, {
        type: 'gauge',
        tags
      });
    }

    if (metrics.stockLevels !== undefined) {
      await this.recordMetric(METRICS.CARE_HOME.MEDICATION_STOCK_LEVELS, metrics.stockLevels, {
        type: 'gauge',
        tags
      });
    }

    if (metrics.nearExpiry !== undefined) {
      await this.recordMetric(METRICS.CARE_HOME.MEDICATION_NEAR_EXPIRY, metrics.nearExpiry, {
        type: 'gauge',
        tags
      });
    }
  }

  public async recordClinicalMetrics(
    organizationId: string,
    metrics: {
      falls?: number;
      pressureUlcers?: number;
      infections?: number;
      hospitalAdmissions?: number;
    }
  ): Promise<void> {
    const tags = { organizationId };

    if (metrics.falls !== undefined) {
      await this.recordMetric(METRICS.CARE_HOME.FALLS_INCIDENTS, metrics.falls, {
        type: 'counter',
        tags
      });
    }

    if (metrics.pressureUlcers !== undefined) {
      await this.recordMetric(METRICS.CARE_HOME.PRESSURE_ULCERS, metrics.pressureUlcers, {
        type: 'counter',
        tags
      });
    }

    if (metrics.infections !== undefined) {
      await this.recordMetric(METRICS.CARE_HOME.INFECTIONS, metrics.infections, {
        type: 'counter',
        tags
      });
    }

    if (metrics.hospitalAdmissions !== undefined) {
      await this.recordMetric(METRICS.CARE_HOME.HOSPITAL_ADMISSIONS, metrics.hospitalAdmissions, {
        type: 'counter',
        tags
      });
    }
  }

  public async recordComplianceMetrics(
    organizationId: string,
    metrics: {
      cqc?: number;
      training?: number;
      documentation?: number;
      incidentReporting?: number;
    }
  ): Promise<void> {
    const tags = { organizationId };

    if (metrics.cqc !== undefined) {
      await this.recordMetric(METRICS.CARE_HOME.CQC_COMPLIANCE, metrics.cqc, {
        type: 'gauge',
        tags
      });
    }

    if (metrics.training !== undefined) {
      await this.recordMetric(METRICS.CARE_HOME.TRAINING_COMPLIANCE, metrics.training, {
        type: 'gauge',
        tags
      });
    }

    if (metrics.documentation !== undefined) {
      await this.recordMetric(METRICS.CARE_HOME.DOCUMENTATION_COMPLIANCE, metrics.documentation, {
        type: 'gauge',
        tags
      });
    }

    if (metrics.incidentReporting !== undefined) {
      await this.recordMetric(METRICS.CARE_HOME.INCIDENT_REPORTING_COMPLIANCE, metrics.incidentReporting, {
        type: 'gauge',
        tags
      });
    }
  }

  public async recordFinancialMetrics(
    organizationId: string,
    metrics: {
      occupancyRevenue?: number;
      staffCosts?: number;
      medicationCosts?: number;
      operationalCosts?: number;
    }
  ): Promise<void> {
    const tags = { organizationId };

    if (metrics.occupancyRevenue !== undefined) {
      await this.recordMetric(METRICS.CARE_HOME.OCCUPANCY_REVENUE, metrics.occupancyRevenue, {
        type: 'gauge',
        tags
      });
    }

    if (metrics.staffCosts !== undefined) {
      await this.recordMetric(METRICS.CARE_HOME.STAFF_COSTS, metrics.staffCosts, {
        type: 'gauge',
        tags
      });
    }

    if (metrics.medicationCosts !== undefined) {
      await this.recordMetric(METRICS.CARE_HOME.MEDICATION_COSTS, metrics.medicationCosts, {
        type: 'gauge',
        tags
      });
    }

    if (metrics.operationalCosts !== undefined) {
      await this.recordMetric(METRICS.CARE_HOME.OPERATIONAL_COSTS, metrics.operationalCosts, {
        type: 'gauge',
        tags
      });
    }
  }

  private initializeAlerts(): void {
    // Clear any existing alert checkers
    for (const timer of this.alertCheckers.values()) {
        clearInterval(timer);
    }
    this.alertCheckers.clear();

    // Set up alert checkers
    for (const config of ALERT_CONFIGS) {
        const timer = setInterval(() => {
            this.checkAlert(config).catch(error => {
                logger.error('Failed to check alert', { config, error });
            });
        }, Math.min(config.duration * 1000, 60000)); // Check at least every minute

        this.alertCheckers.set(config.metric, timer);
    }
  }
}

export const monitoring = MonitoringSystem.getInstance();
export const METRIC_TYPES = METRICS; 