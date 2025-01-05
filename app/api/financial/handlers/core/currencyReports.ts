/**
 * @fileoverview Currency Reports Handler
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 *
 * Description:
 * Detailed reporting handler for currency operations
 */

import { Redis } from '@/lib/redis';
import { Logger } from '@/lib/logger';
import { Metrics } from '@/lib/metrics';
import { SupportedCurrency } from './types';

const logger = new Logger('currency-reports');
const redis = new Redis();
const metrics = new Metrics('currency_reports');

interface ReportConfig {
  period: string;
  granularity: 'hour' | 'day' | 'week' | 'month';
  metrics: string[];
  format: 'json' | 'csv' | 'pdf';
}

interface ReportData {
  summary: {
    totalTransactions: number;
    totalVolume: number;
    successRate: number;
    averageLatency: number;
    uniqueUsers: number;
    topCurrencyPairs: Record<string, number>;
  };
  trends: {
    volumeByPeriod: Record<string, number>;
    errorsByType: Record<string, number>;
    latencyPercentiles: Record<string, number>;
    cachePerformance: {
      hitRate: number;
      missRate: number;
      avgLatency: number;
    };
  };
  compliance: {
    rateLimitBreaches: number;
    errorRates: Record<string, number>;
    auditLog: any[];
  };
  regional: {
    volumeByRegion: Record<string, number>;
    currencyPairsByRegion: Record<string, Record<string, number>>;
    performanceByRegion: Record<string, {
      latency: number;
      errorRate: number;
      successRate: number;
    }>;
  };
}

export async function generateDetailedReport(
  organizationId: string,
  config: ReportConfig
): Promise<ReportData> {
  try {
    const [
      summary,
      trends,
      compliance,
      regional,
    ] = await Promise.all([
      generateSummaryMetrics(organizationId, config),
      generateTrendAnalysis(organizationId, config),
      generateComplianceMetrics(organizationId, config),
      generateRegionalMetrics(organizationId, config),
    ]);

    return {
      summary,
      trends,
      compliance,
      regional,
    };
  } catch (error) {
    logger.error('Failed to generate detailed report', error);
    throw error;
  }
}

async function generateSummaryMetrics(
  organizationId: string,
  config: ReportConfig
): Promise<ReportData['summary']> {
  const metrics = await Promise.all([
    getTransactionMetrics(organizationId, config.period),
    getVolumeMetrics(organizationId, config.period),
    getPerformanceMetrics(organizationId, config.period),
    getUserMetrics(organizationId, config.period),
    getCurrencyPairMetrics(organizationId, config.period),
  ]);

  return {
    totalTransactions: metrics[0].total,
    totalVolume: metrics[1].total,
    successRate: metrics[0].successRate,
    averageLatency: metrics[2].averageLatency,
    uniqueUsers: metrics[3].uniqueUsers,
    topCurrencyPairs: metrics[4].pairs,
  };
}

async function generateTrendAnalysis(
  organizationId: string,
  config: ReportConfig
): Promise<ReportData['trends']> {
  const [volumeTrends, errorTrends, latencyTrends, cacheTrends] = await Promise.all([
    getVolumeTrends(organizationId, config),
    getErrorTrends(organizationId, config),
    getLatencyTrends(organizationId, config),
    getCacheTrends(organizationId, config),
  ]);

  return {
    volumeByPeriod: volumeTrends,
    errorsByType: errorTrends,
    latencyPercentiles: latencyTrends,
    cachePerformance: cacheTrends,
  };
}

async function generateComplianceMetrics(
  organizationId: string,
  config: ReportConfig
): Promise<ReportData['compliance']> {
  const [rateLimits, errors, audit] = await Promise.all([
    getRateLimitMetrics(organizationId, config.period),
    getErrorMetrics(organizationId, config.period),
    getAuditLog(organizationId, config.period),
  ]);

  return {
    rateLimitBreaches: rateLimits.breaches,
    errorRates: errors,
    auditLog: audit,
  };
}

async function generateRegionalMetrics(
  organizationId: string,
  config: ReportConfig
): Promise<ReportData['regional']> {
  const [volume, pairs, performance] = await Promise.all([
    getRegionalVolume(organizationId, config.period),
    getRegionalCurrencyPairs(organizationId, config.period),
    getRegionalPerformance(organizationId, config.period),
  ]);

  return {
    volumeByRegion: volume,
    currencyPairsByRegion: pairs,
    performanceByRegion: performance,
  };
}

// Helper functions for metrics collection
async function getTransactionMetrics(organizationId: string, period: string): Promise<any> {
  const [total, successful] = await Promise.all([
    metrics.getCount(METRIC_KEYS.CONVERSION_COUNT, { organizationId, period }),
    metrics.getCount(METRIC_KEYS.CONVERSION_COUNT, { organizationId, period, success: true }),
  ]);

  return {
    total,
    successRate: total > 0 ? successful / total : 1,
  };
}

async function getVolumeMetrics(organizationId: string, period: string): Promise<any> {
  return {
    total: await metrics.getSum(METRIC_KEYS.CONVERSION_AMOUNT, { organizationId, period }),
  };
}

async function getPerformanceMetrics(organizationId: string, period: string): Promise<any> {
  return {
    averageLatency: await metrics.getAverage('currency_conversion_duration', { organizationId, period }),
  };
}

async function getUserMetrics(organizationId: string, period: string): Promise<any> {
  const users = await metrics.getDistinct('userId', { organizationId, period });
  return {
    uniqueUsers: users.length,
  };
}

async function getCurrencyPairMetrics(organizationId: string, period: string): Promise<any> {
  const pairs = await metrics.getGroupedCount(METRIC_KEYS.CONVERSION_COUNT, 'currencyPair', { organizationId, period });
  return {
    pairs: Object.fromEntries(
      Object.entries(pairs)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
    ),
  };
}

// Helper functions for trend analysis
async function getVolumeTrends(organizationId: string, config: ReportConfig): Promise<Record<string, number>> {
  return metrics.getTimeSeries(
    METRIC_KEYS.CONVERSION_AMOUNT,
    { organizationId },
    config.granularity,
    config.period
  );
}

async function getErrorTrends(organizationId: string, config: ReportConfig): Promise<Record<string, number>> {
  return metrics.getGroupedTimeSeries(
    METRIC_KEYS.API_ERROR,
    'errorType',
    { organizationId },
    config.granularity,
    config.period
  );
}

async function getLatencyTrends(organizationId: string, config: ReportConfig): Promise<Record<string, number>> {
  const percentiles = [50, 75, 90, 95, 99];
  const results: Record<string, number> = {};

  for (const p of percentiles) {
    results[`p${p}`] = await metrics.getPercentile(
      'currency_conversion_duration',
      p,
      { organizationId, period: config.period }
    );
  }

  return results;
}

async function getCacheTrends(organizationId: string, config: ReportConfig): Promise<any> {
  const [hits, misses, latency] = await Promise.all([
    metrics.getCount(METRIC_KEYS.CACHE_HIT, { organizationId, period: config.period }),
    metrics.getCount(METRIC_KEYS.CACHE_MISS, { organizationId, period: config.period }),
    metrics.getAverage('cache_operation_duration', { organizationId, period: config.period }),
  ]);

  const total = hits + misses;
  return {
    hitRate: total > 0 ? hits / total : 0,
    missRate: total > 0 ? misses / total : 0,
    avgLatency: latency,
  };
}

// Helper functions for regional metrics
async function getRegionalVolume(organizationId: string, period: string): Promise<Record<string, number>> {
  return metrics.getGroupedSum(
    METRIC_KEYS.CONVERSION_AMOUNT,
    'region',
    { organizationId, period }
  );
}

async function getRegionalCurrencyPairs(
  organizationId: string,
  period: string
): Promise<Record<string, Record<string, number>>> {
  return metrics.getGroupedCount(
    METRIC_KEYS.CONVERSION_COUNT,
    ['region', 'currencyPair'],
    { organizationId, period }
  );
}

async function getRegionalPerformance(
  organizationId: string,
  period: string
): Promise<Record<string, { latency: number; errorRate: number; successRate: number }>> {
  const regions = await metrics.getDistinct('region', { organizationId, period });
  const results: Record<string, any> = {};

  for (const region of regions) {
    const [latency, errors, total] = await Promise.all([
      metrics.getAverage('currency_conversion_duration', { organizationId, period, region }),
      metrics.getCount(METRIC_KEYS.API_ERROR, { organizationId, period, region }),
      metrics.getCount(METRIC_KEYS.CONVERSION_COUNT, { organizationId, period, region }),
    ]);

    results[region] = {
      latency,
      errorRate: total > 0 ? errors / total : 0,
      successRate: total > 0 ? (total - errors) / total : 1,
    };
  }

  return results;
} 
