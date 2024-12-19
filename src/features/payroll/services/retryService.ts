import { PayrollIntegrationService } from './integrationService';
import { prisma } from '@/lib/db';

export class PayrollRetryService {
  private readonly maxRetries = 3;
  private readonly retryDelays = [5000, 15000, 30000]; // Delays in milliseconds

  async retryFailedIntegrations(): Promise<void> {
    const failedIntegrations = await prisma.payrollIntegration.findMany({
      where: {
        status: 'FAILED',
        retryCount: {
          lt: this.maxRetries
        },
        lastRetryAt: {
          lt: new Date(Date.now() - this.retryDelays[0])
        }
      },
      include: {
        payroll: true
      }
    });

    for (const integration of failedIntegrations) {
      try {
        const integrationService = new PayrollIntegrationService();
        await integrationService.initialize(integration.payroll.organizationId);

        // Attempt retry
        const result = await integrationService.submitPayroll(integration.payroll);

        if (result.success) {
          // Update integration status
          await prisma.payrollIntegration.update({
            where: { id: integration.id },
            data: {
              status: 'SUCCESS',
              providerReference: result.providerReference,
              error: null,
              lastRetryAt: new Date()
            }
          });
        } else {
          // Update retry count and error
          await prisma.payrollIntegration.update({
            where: { id: integration.id },
            data: {
              retryCount: integration.retryCount + 1,
              error: result.error,
              lastRetryAt: new Date()
            }
          });

          // Notify if max retries reached
          if (integration.retryCount + 1 >= this.maxRetries) {
            await this.notifyMaxRetriesReached(integration);
          }
        }
      } catch (error) {
        console.error(`Retry failed for integration ${integration.id}:`, error);
      }
    }
  }

  private async notifyMaxRetriesReached(integration: any): Promise<void> {
    // Create notification for admin
    await prisma.notification.create({
      data: {
        organizationId: integration.payroll.organizationId,
        type: 'PAYROLL_INTEGRATION_FAILED',
        title: 'Payroll Integration Failed',
        message: `Payroll integration for payroll ID ${integration.payrollId} has failed after maximum retry attempts.`,
        severity: 'HIGH',
        metadata: {
          payrollId: integration.payrollId,
          integrationId: integration.id,
          lastError: integration.error
        }
      }
    });
  }
}


