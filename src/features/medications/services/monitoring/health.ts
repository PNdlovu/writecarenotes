import { prisma } from '@/lib/db';
import { Cache } from '@/lib/cache';
import { Logger } from '@/lib/logger';
import { medicationMetrics } from './metrics';

export class HealthCheck {
  private readonly logger: Logger;
  private readonly cache: Cache;

  constructor() {
    this.logger = new Logger('HealthCheck');
    this.cache = new Cache();
  }

  async checkHealth(): Promise<{
    status: 'UP' | 'DOWN';
    components: Record<string, any>;
    timestamp: string;
  }> {
    const start = Date.now();
    const components: Record<string, any> = {};

    try {
      // Check database
      components.database = await this.checkDatabase();

      // Check cache
      components.cache = await this.checkCache();

      // Check external integrations
      components.integrations = await this.checkIntegrations();

      // Check API endpoints
      components.api = await this.checkApiEndpoints();

      // Calculate overall status
      const status = this.calculateOverallStatus(components);

      // Track metrics
      await medicationMetrics.trackHealthCheck({
        component: 'overall',
        status,
        duration: Date.now() - start
      });

      return {
        status,
        components,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error('Health check failed', { error });
      return {
        status: 'DOWN',
        components: {
          error: {
            status: 'DOWN',
            message: error.message
          }
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  private async checkDatabase(): Promise<{
    status: 'UP' | 'DOWN';
    responseTime: number;
    connections: number;
  }> {
    const start = Date.now();
    try {
      await prisma.$queryRaw`SELECT 1`;
      const metrics = await prisma.$metrics.json();

      const status = 'UP';
      const duration = Date.now() - start;

      await medicationMetrics.trackHealthCheck({
        component: 'database',
        status,
        duration
      });

      return {
        status,
        responseTime: duration,
        connections: metrics.connections
      };
    } catch (error) {
      this.logger.error('Database health check failed', { error });
      return {
        status: 'DOWN',
        responseTime: Date.now() - start,
        connections: 0
      };
    }
  }

  private async checkCache(): Promise<{
    status: 'UP' | 'DOWN';
    responseTime: number;
    memoryUsage: number;
  }> {
    const start = Date.now();
    try {
      const key = 'health:check';
      await this.cache.set(key, 'test', 10);
      const value = await this.cache.get(key);
      await this.cache.delete(key);

      if (value !== 'test') {
        throw new Error('Cache value mismatch');
      }

      const info = await this.cache.info();
      const status = 'UP';
      const duration = Date.now() - start;

      await medicationMetrics.trackHealthCheck({
        component: 'cache',
        status,
        duration
      });

      return {
        status,
        responseTime: duration,
        memoryUsage: info.used_memory
      };
    } catch (error) {
      this.logger.error('Cache health check failed', { error });
      return {
        status: 'DOWN',
        responseTime: Date.now() - start,
        memoryUsage: 0
      };
    }
  }

  private async checkIntegrations(): Promise<Record<string, {
    status: 'UP' | 'DOWN';
    responseTime: number;
  }>> {
    const integrations = {
      pharmacy: this.checkPharmacyIntegration.bind(this),
      healthcare: this.checkHealthcareIntegration.bind(this)
    };

    const results: Record<string, any> = {};

    await Promise.all(
      Object.entries(integrations).map(async ([name, check]) => {
        const start = Date.now();
        try {
          await check();
          const status = 'UP';
          const duration = Date.now() - start;

          await medicationMetrics.trackHealthCheck({
            component: `integration_${name}`,
            status,
            duration
          });

          results[name] = {
            status,
            responseTime: duration
          };
        } catch (error) {
          this.logger.error(`${name} integration health check failed`, { error });
          results[name] = {
            status: 'DOWN',
            responseTime: Date.now() - start
          };
        }
      })
    );

    return results;
  }

  private async checkApiEndpoints(): Promise<Record<string, {
    status: 'UP' | 'DOWN';
    responseTime: number;
  }>> {
    const endpoints = [
      '/medications',
      '/analytics',
      '/safety'
    ];

    const results: Record<string, any> = {};

    await Promise.all(
      endpoints.map(async (endpoint) => {
        const start = Date.now();
        try {
          // Implement endpoint health check
          const status = 'UP';
          const duration = Date.now() - start;

          await medicationMetrics.trackHealthCheck({
            component: `api_${endpoint}`,
            status,
            duration
          });

          results[endpoint] = {
            status,
            responseTime: duration
          };
        } catch (error) {
          this.logger.error(`API endpoint ${endpoint} health check failed`, { error });
          results[endpoint] = {
            status: 'DOWN',
            responseTime: Date.now() - start
          };
        }
      })
    );

    return results;
  }

  private async checkPharmacyIntegration(): Promise<void> {
    // Implement pharmacy integration health check
  }

  private async checkHealthcareIntegration(): Promise<void> {
    // Implement healthcare integration health check
  }

  private calculateOverallStatus(components: Record<string, any>): 'UP' | 'DOWN' {
    const statuses = Object.values(components).map(component => {
      if (typeof component === 'object' && component !== null) {
        return component.status || 'DOWN';
      }
      return 'DOWN';
    });

    return statuses.includes('DOWN') ? 'DOWN' : 'UP';
  }
}

export const healthCheck = new HealthCheck();


