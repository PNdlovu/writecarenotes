/**
 * @fileoverview Health Check API Routes
 * @version 1.0.0
 * @created 2024-03-21
 */

import { NextResponse } from 'next/server';
import { CacheService } from '@/lib/cache';
import { QueueService } from '@/lib/queue';
import { metrics } from '@/lib/metrics';
import { logger } from '@/lib/logger';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  components: {
    [key: string]: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      latency?: number;
      message?: string;
      lastChecked: string;
    };
  };
}

export async function GET(request: Request) {
  const startTime = Date.now();
  const healthStatus: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '1.0.0',
    components: {}
  };

  try {
    // Check Redis Cache
    const cacheStartTime = Date.now();
    const cacheService = CacheService.getInstance();
    const cacheHealth = await cacheService.healthCheck();
    healthStatus.components.cache = {
      status: cacheHealth ? 'healthy' : 'unhealthy',
      latency: Date.now() - cacheStartTime,
      lastChecked: new Date().toISOString()
    };

    // Check Job Queues
    const queueStartTime = Date.now();
    const queueService = QueueService.getInstance();
    const queueHealth = await queueService.healthCheck();
    healthStatus.components.queues = {
      status: queueHealth ? 'healthy' : 'unhealthy',
      latency: Date.now() - queueStartTime,
      lastChecked: new Date().toISOString()
    };

    // Check NHS Integration
    const nhsStartTime = Date.now();
    try {
      const nhsStatus = await checkNHSIntegration();
      healthStatus.components.nhs = {
        status: nhsStatus ? 'healthy' : 'degraded',
        latency: Date.now() - nhsStartTime,
        lastChecked: new Date().toISOString()
      };
    } catch (error) {
      healthStatus.components.nhs = {
        status: 'unhealthy',
        message: error.message,
        lastChecked: new Date().toISOString()
      };
    }

    // Check GP Connect
    const gpStartTime = Date.now();
    try {
      const gpStatus = await checkGPConnect();
      healthStatus.components.gpConnect = {
        status: gpStatus ? 'healthy' : 'degraded',
        latency: Date.now() - gpStartTime,
        lastChecked: new Date().toISOString()
      };
    } catch (error) {
      healthStatus.components.gpConnect = {
        status: 'unhealthy',
        message: error.message,
        lastChecked: new Date().toISOString()
      };
    }

    // Check HMRC Integration
    const hmrcStartTime = Date.now();
    try {
      const hmrcStatus = await checkHMRCIntegration();
      healthStatus.components.hmrc = {
        status: hmrcStatus ? 'healthy' : 'degraded',
        latency: Date.now() - hmrcStartTime,
        lastChecked: new Date().toISOString()
      };
    } catch (error) {
      healthStatus.components.hmrc = {
        status: 'unhealthy',
        message: error.message,
        lastChecked: new Date().toISOString()
      };
    }

    // Check Database
    const dbStartTime = Date.now();
    try {
      const dbStatus = await checkDatabase();
      healthStatus.components.database = {
        status: dbStatus ? 'healthy' : 'unhealthy',
        latency: Date.now() - dbStartTime,
        lastChecked: new Date().toISOString()
      };
    } catch (error) {
      healthStatus.components.database = {
        status: 'unhealthy',
        message: error.message,
        lastChecked: new Date().toISOString()
      };
    }

    // Determine overall system health
    const componentStatuses = Object.values(healthStatus.components).map(c => c.status);
    if (componentStatuses.some(status => status === 'unhealthy')) {
      healthStatus.status = 'unhealthy';
    } else if (componentStatuses.some(status => status === 'degraded')) {
      healthStatus.status = 'degraded';
    }

    // Record metrics
    metrics.recordTiming('health.check.duration', Date.now() - startTime);
    metrics.increment(`health.status.${healthStatus.status}`);

    // Log health check results
    logger.info('Health check completed', {
      status: healthStatus.status,
      duration: Date.now() - startTime,
      components: Object.entries(healthStatus.components).reduce((acc, [key, value]) => ({
        ...acc,
        [key]: value.status
      }), {})
    });

    return NextResponse.json(healthStatus, {
      status: healthStatus.status === 'healthy' ? 200 : 
             healthStatus.status === 'degraded' ? 200 : 503
    });
  } catch (error) {
    logger.error('Health check failed', { error });
    metrics.increment('health.check.error');

    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    }, { status: 503 });
  }
}

async function checkNHSIntegration(): Promise<boolean> {
  // Implement NHS Digital Services health check
  // This would check the connection to NHS APIs
  return true; // Placeholder
}

async function checkGPConnect(): Promise<boolean> {
  // Implement GP Connect health check
  // This would verify the connection to GP systems
  return true; // Placeholder
}

async function checkHMRCIntegration(): Promise<boolean> {
  // Implement HMRC integration health check
  // This would verify the connection to HMRC services
  return true; // Placeholder
}

async function checkDatabase(): Promise<boolean> {
  // Implement database health check
  // This would verify the database connection and performance
  return true; // Placeholder
} 
