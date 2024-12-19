import { redis } from './cache';
import { NextRequest } from 'next/server';

export interface RequestLog {
  timestamp: string;
  method: string;
  path: string;
  query: Record<string, string>;
  userId?: string;
  organizationId?: string;
  duration: number;
  status: number;
  error?: string;
  region?: string;
  userAgent?: string;
  ip?: string;
}

const LOG_PREFIX = 'request_logs';
const MAX_LOGS = 10000; // Maximum number of logs to keep

/**
 * Logs API request details
 */
export async function logRequest(
  request: NextRequest,
  response: Response,
  userId?: string,
  organizationId?: string,
  error?: Error,
  startTime: number = Date.now()
): Promise<void> {
  const duration = Date.now() - startTime;
  const url = new URL(request.url);

  const log: RequestLog = {
    timestamp: new Date().toISOString(),
    method: request.method,
    path: url.pathname,
    query: Object.fromEntries(url.searchParams.entries()),
    userId,
    organizationId,
    duration,
    status: response.status,
    error: error?.message,
    region: url.searchParams.get('region') || undefined,
    userAgent: request.headers.get('user-agent') || undefined,
    ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined
  };

  // Store log in Redis with expiration
  const logKey = `${LOG_PREFIX}:${Date.now()}:${Math.random().toString(36).substring(7)}`;
  await redis.set(logKey, log, { ex: 60 * 60 * 24 * 7 }); // Keep logs for 7 days

  // Trim old logs if needed
  const allKeys = await redis.keys(`${LOG_PREFIX}:*`);
  if (allKeys.length > MAX_LOGS) {
    const keysToDelete = allKeys
      .sort()
      .slice(0, allKeys.length - MAX_LOGS);
    if (keysToDelete.length > 0) {
      await redis.del(...keysToDelete);
    }
  }
}

/**
 * Retrieves request logs with filtering and pagination
 */
export async function getRequestLogs(
  filters: Partial<RequestLog> = {},
  page: number = 1,
  pageSize: number = 50
): Promise<{ logs: RequestLog[]; total: number }> {
  const allKeys = await redis.keys(`${LOG_PREFIX}:*`);
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  // Get logs for the current page
  const pageKeys = allKeys.sort().reverse().slice(start, end);
  const logs = await Promise.all(
    pageKeys.map(async (key) => await redis.get<RequestLog>(key))
  );

  // Apply filters
  const filteredLogs = logs.filter((log) => {
    if (!log) return false;
    return Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      return log[key as keyof RequestLog] === value;
    });
  });

  return {
    logs: filteredLogs,
    total: allKeys.length
  };
}

/**
 * Gets error rate for monitoring
 */
export async function getErrorRate(
  timeWindow: number = 60 * 5 // 5 minutes
): Promise<number> {
  const timeThreshold = Date.now() - timeWindow * 1000;
  const recentKeys = await redis.keys(`${LOG_PREFIX}:${timeThreshold}*`);
  const logs = await Promise.all(
    recentKeys.map(async (key) => await redis.get<RequestLog>(key))
  );

  const errorCount = logs.filter(log => log?.status >= 400).length;
  return errorCount / logs.length || 0;
}

/**
 * Gets average response time
 */
export async function getAverageResponseTime(
  timeWindow: number = 60 * 5 // 5 minutes
): Promise<number> {
  const timeThreshold = Date.now() - timeWindow * 1000;
  const recentKeys = await redis.keys(`${LOG_PREFIX}:${timeThreshold}*`);
  const logs = await Promise.all(
    recentKeys.map(async (key) => await redis.get<RequestLog>(key))
  );

  const totalDuration = logs.reduce((sum, log) => sum + (log?.duration || 0), 0);
  return totalDuration / logs.length || 0;
} 


