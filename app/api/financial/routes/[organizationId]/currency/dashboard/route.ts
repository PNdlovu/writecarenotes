/**
 * @fileoverview Currency Dashboard Routes
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 *
 * Description:
 * API routes for currency dashboard data
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { Redis } from '@/lib/redis';
import { Metrics } from '@/lib/metrics';
import { Logger } from '@/lib/logger';

const logger = new Logger('currency-dashboard');
const redis = new Redis();
const metrics = new Metrics('currency_dashboard');

interface DashboardData {
  realtime: {
    activeConversions: number;
    queueLength: number;
    errorRate: number;
    avgLatency: number;
    cacheHitRate: number;
  };
  today: {
    totalTransactions: number;
    totalVolume: number;
    successRate: number;
    topPairs: Record<string, number>;
    alerts: any[];
  };
  trends: {
    hourly: Record<string, number>;
    volumeByRegion: Record<string, number>;
    errorsByType: Record<string, number>;
  };
  health: {
    apiStatus: 'healthy' | 'degraded' | 'down';
    cacheStatus: 'healthy' | 'degraded' | 'down';
    lastUpdate: string;
    incidents: any[];
  };
}

export async function GET(
  req: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId === params.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get cached dashboard data first
    const cacheKey = `dashboard:${params.organizationId}`;
    const cachedData = await redis.get(cacheKey);
    
    if (cachedData) {
      return NextResponse.json(JSON.parse(cachedData));
    }

    // Generate fresh dashboard data
    const dashboard = await generateDashboardData(params.organizationId);

    // Cache for 1 minute
    await redis.set(cacheKey, JSON.stringify(dashboard), 'EX', 60);

    return NextResponse.json(dashboard);
  } catch (error) {
    logger.error('Failed to fetch dashboard data', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

async function generateDashboardData(organizationId: string): Promise<DashboardData> {
  const [realtime, today, trends, health] = await Promise.all([
    getRealtimeMetrics(organizationId),
    getTodayMetrics(organizationId),
    getTrendMetrics(organizationId),
    getHealthMetrics(organizationId),
  ]);

  return {
    realtime,
    today,
    trends,
    health,
  };
}

async function getRealtimeMetrics(organizationId: string): Promise<DashboardData['realtime']> {
  const now = new Date();
  const oneMinuteAgo = new Date(now.getTime() - 60000);

  const [active, queue, errors, latency, cache] = await Promise.all([
    metrics.getCount(METRIC_KEYS.CONVERSION_COUNT, {
      organizationId,
      start: oneMinuteAgo,
      end: now,
    }),
    redis.llen(`offline_queue:${organizationId}`),
    metrics.getErrorRate({
      organizationId,
      start: oneMinuteAgo,
      end: now,
    }),
    metrics.getAverage('currency_conversion_duration', {
      organizationId,
      start: oneMinuteAgo,
      end: now,
    }),
    metrics.getCacheHitRate({
      organizationId,
      start: oneMinuteAgo,
      end: now,
    }),
  ]);

  return {
    activeConversions: active,
    queueLength: queue,
    errorRate: errors,
    avgLatency: latency,
    cacheHitRate: cache,
  };
}

async function getTodayMetrics(organizationId: string): Promise<DashboardData['today']> {
  const today = new Date().toISOString().split('T')[0];

  const [transactions, volume, success, pairs, alerts] = await Promise.all([
    metrics.getCount(METRIC_KEYS.CONVERSION_COUNT, {
      organizationId,
      period: today,
    }),
    metrics.getSum(METRIC_KEYS.CONVERSION_AMOUNT, {
      organizationId,
      period: today,
    }),
    metrics.getSuccessRate({
      organizationId,
      period: today,
    }),
    metrics.getTopPairs({
      organizationId,
      period: today,
      limit: 5,
    }),
    getActiveAlerts(organizationId),
  ]);

  return {
    totalTransactions: transactions,
    totalVolume: volume,
    successRate: success,
    topPairs: pairs,
    alerts,
  };
}

async function getTrendMetrics(organizationId: string): Promise<DashboardData['trends']> {
  const [hourly, regional, errors] = await Promise.all([
    metrics.getHourlyTrends({
      organizationId,
      metric: METRIC_KEYS.CONVERSION_COUNT,
      hours: 24,
    }),
    metrics.getRegionalVolume({
      organizationId,
      period: 'today',
    }),
    metrics.getErrorTrends({
      organizationId,
      period: 'today',
    }),
  ]);

  return {
    hourly,
    volumeByRegion: regional,
    errorsByType: errors,
  };
}

async function getHealthMetrics(organizationId: string): Promise<DashboardData['health']> {
  const [apiHealth, cacheHealth, incidents] = await Promise.all([
    checkApiHealth(),
    checkCacheHealth(),
    getActiveIncidents(organizationId),
  ]);

  return {
    apiStatus: apiHealth,
    cacheStatus: cacheHealth,
    lastUpdate: new Date().toISOString(),
    incidents,
  };
}

async function getActiveAlerts(organizationId: string): Promise<any[]> {
  const alerts = await redis.lrange(`alerts:${organizationId}`, 0, -1);
  return alerts.map(alert => JSON.parse(alert));
}

async function getActiveIncidents(organizationId: string): Promise<any[]> {
  const incidents = await redis.lrange(`incidents:${organizationId}`, 0, -1);
  return incidents.map(incident => JSON.parse(incident));
}

async function checkApiHealth(): Promise<'healthy' | 'degraded' | 'down'> {
  const errorRate = await metrics.getErrorRate({ period: '5m' });
  if (errorRate > 0.1) return 'down';
  if (errorRate > 0.05) return 'degraded';
  return 'healthy';
}

async function checkCacheHealth(): Promise<'healthy' | 'degraded' | 'down'> {
  const hitRate = await metrics.getCacheHitRate({ period: '5m' });
  if (hitRate < 0.5) return 'down';
  if (hitRate < 0.8) return 'degraded';
  return 'healthy';
} 