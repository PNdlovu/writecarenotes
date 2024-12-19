import { PayrollRetryService } from '../services/retryService';
import { HealthCheckService } from '../services/healthCheckService';
import { prisma } from '@/lib/db';

export class PayrollWorker {
  private retryService: PayrollRetryService;
  private healthService: HealthCheckService;
  private retryInterval: NodeJS.Timeout | null = null;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.retryService = new PayrollRetryService();
    this.healthService = new HealthCheckService();
  }

  start() {
    // Run retry service every 5 minutes
    this.retryInterval = setInterval(
      () => this.runRetryService(),
      5 * 60 * 1000
    );

    // Run health checks every hour
    this.healthCheckInterval = setInterval(
      () => this.runHealthChecks(),
      60 * 60 * 1000
    );

    console.log('Payroll worker started');
  }

  stop() {
    if (this.retryInterval) {
      clearInterval(this.retryInterval);
    }
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    console.log('Payroll worker stopped');
  }

  private async runRetryService() {
    try {
      console.log('Running payroll retry service...');
      await this.retryService.retryFailedIntegrations();
    } catch (error) {
      console.error('Error in retry service:', error);
    }
  }

  private async runHealthChecks() {
    try {
      console.log('Running payroll health checks...');
      const organizations = await prisma.organization.findMany();
      
      for (const org of organizations) {
        try {
          const health = await this.healthService.checkIntegrationHealth(org.id);
          await prisma.healthCheck.create({
            data: {
              organizationId: org.id,
              status: health.status,
              issues: health.issues,
              metrics: await this.healthService.gatherMetrics(org.id)
            }
          });

          // Create notifications for unhealthy status
          if (health.status === 'UNHEALTHY') {
            await prisma.notification.create({
              data: {
                organizationId: org.id,
                type: 'INTEGRATION_HEALTH',
                title: 'Payroll Integration Health Alert',
                message: `Your payroll integration is currently unhealthy. ${health.issues.length} issues detected.`,
                severity: 'HIGH',
                metadata: health
              }
            });
          }
        } catch (error) {
          console.error(`Health check failed for organization ${org.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error in health check service:', error);
    }
  }
}


