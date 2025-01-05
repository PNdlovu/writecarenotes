import { prisma } from '@/lib/db';
import { PayrollIntegrationService } from './integrationService';

export class HealthCheckService {
  async checkIntegrationHealth(organizationId: string): Promise<{
    status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
    issues: Array<{
      type: string;
      severity: 'LOW' | 'MEDIUM' | 'HIGH';
      message: string;
      details?: any;
    }>;
  }> {
    const issues: Array<any> = [];

    // Check provider connection
    try {
      const integrationService = new PayrollIntegrationService();
      await integrationService.initialize(organizationId);
    } catch (error) {
      issues.push({
        type: 'CONNECTION',
        severity: 'HIGH',
        message: 'Failed to connect to payroll provider',
        details: error
      });
    }

    // Check recent failures
    const recentFailures = await prisma.payrollIntegration.count({
      where: {
        organizationId,
        status: 'FAILED',
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    });

    if (recentFailures > 0) {
      issues.push({
        type: 'FAILURES',
        severity: recentFailures > 5 ? 'HIGH' : 'MEDIUM',
        message: `${recentFailures} failed integration attempts in the last 24 hours`,
        details: { count: recentFailures }
      });
    }

    // Check pending retries
    const pendingRetries = await prisma.payrollIntegration.count({
      where: {
        organizationId,
        status: 'FAILED',
        retryCount: {
          lt: 3
        }
      }
    });

    if (pendingRetries > 0) {
      issues.push({
        type: 'RETRIES',
        severity: 'LOW',
        message: `${pendingRetries} integrations pending retry`,
        details: { count: pendingRetries }
      });
    }

    // Check webhook health
    const webhookIssues = await this.checkWebhookHealth(organizationId);
    issues.push(...webhookIssues);

    // Determine overall health status
    const status = this.determineOverallStatus(issues);

    return {
      status,
      issues
    };
  }

  private async checkWebhookHealth(organizationId: string): Promise<Array<any>> {
    const issues: Array<any> = [];

    // Check webhook configuration
    const settings = await prisma.organizationSettings.findFirst({
      where: {
        organizationId,
        module: 'payroll'
      }
    });

    if (!settings?.settings?.webhookSecret) {
      issues.push({
        type: 'WEBHOOK_CONFIG',
        severity: 'MEDIUM',
        message: 'Webhook secret not configured'
      });
    }

    // Check recent webhook failures
    const recentWebhookFailures = await prisma.webhookLog.count({
      where: {
        organizationId,
        success: false,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    });

    if (recentWebhookFailures > 0) {
      issues.push({
        type: 'WEBHOOK_FAILURES',
        severity: recentWebhookFailures > 5 ? 'HIGH' : 'MEDIUM',
        message: `${recentWebhookFailures} webhook failures in the last 24 hours`,
        details: { count: recentWebhookFailures }
      });
    }

    return issues;
  }

  private determineOverallStatus(issues: Array<any>): 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY' {
    const highSeverityCount = issues.filter(i => i.severity === 'HIGH').length;
    const mediumSeverityCount = issues.filter(i => i.severity === 'MEDIUM').length;

    if (highSeverityCount > 0) {
      return 'UNHEALTHY';
    } else if (mediumSeverityCount > 0) {
      return 'DEGRADED';
    }
    return 'HEALTHY';
  }

  async generateHealthReport(organizationId: string): Promise<{
    health: any;
    metrics: any;
    recommendations: string[];
  }> {
    const health = await this.checkIntegrationHealth(organizationId);
    const metrics = await this.gatherMetrics(organizationId);
    const recommendations = this.generateRecommendations(health, metrics);

    return {
      health,
      metrics,
      recommendations
    };
  }

  private async gatherMetrics(organizationId: string): Promise<any> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalPayrolls,
      successfulPayrolls,
      averageProcessingTime,
      integrationUptime
    ] = await Promise.all([
      // Total payrolls
      prisma.payrollIntegration.count({
        where: {
          organizationId,
          createdAt: {
            gte: thirtyDaysAgo
          }
        }
      }),
      // Successful payrolls
      prisma.payrollIntegration.count({
        where: {
          organizationId,
          status: 'SUCCESS',
          createdAt: {
            gte: thirtyDaysAgo
          }
        }
      }),
      // Average processing time
      prisma.payrollIntegration.aggregate({
        where: {
          organizationId,
          status: 'SUCCESS',
          createdAt: {
            gte: thirtyDaysAgo
          }
        },
        _avg: {
          processingTimeMs: true
        }
      }),
      // Integration uptime (percentage of successful health checks)
      prisma.healthCheck.aggregate({
        where: {
          organizationId,
          createdAt: {
            gte: thirtyDaysAgo
          }
        },
        _avg: {
          success: true
        }
      })
    ]);

    return {
      period: '30 days',
      totalPayrolls,
      successRate: totalPayrolls ? (successfulPayrolls / totalPayrolls) * 100 : 100,
      averageProcessingTime: averageProcessingTime._avg.processingTimeMs || 0,
      uptime: (integrationUptime._avg.success || 1) * 100
    };
  }

  private generateRecommendations(health: any, metrics: any): string[] {
    const recommendations: string[] = [];

    // Success rate recommendations
    if (metrics.successRate < 95) {
      recommendations.push(
        'Consider reviewing and updating integration configuration to improve success rate'
      );
    }

    // Processing time recommendations
    if (metrics.averageProcessingTime > 5000) {
      recommendations.push(
        'High processing times detected. Consider optimizing payroll data or reviewing network connectivity'
      );
    }

    // Health-based recommendations
    health.issues.forEach((issue: any) => {
      switch (issue.type) {
        case 'CONNECTION':
          recommendations.push(
            'Review and update provider credentials to resolve connection issues'
          );
          break;
        case 'WEBHOOK_CONFIG':
          recommendations.push(
            'Configure webhook secret to enable real-time integration updates'
          );
          break;
        case 'WEBHOOK_FAILURES':
          recommendations.push(
            'Review webhook endpoint configuration and ensure it\'s accessible'
          );
          break;
      }
    });

    return recommendations;
  }
}


