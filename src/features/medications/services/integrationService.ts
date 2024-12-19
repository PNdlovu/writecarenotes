import { prisma } from '@/lib/db';
import { Cache } from '@/lib/cache';
import { Logger } from '@/lib/logger';
import { ApiError } from '@/lib/errors';
import { tenantService } from './tenantService';
import axios from 'axios';
import { retry } from '@/lib/utils';

export class IntegrationService {
  private readonly cache: Cache;
  private readonly logger: Logger;

  constructor() {
    this.cache = new Cache();
    this.logger = new Logger('IntegrationService');
  }

  async syncWithPharmacy(tenantId: string, data: any): Promise<any> {
    const config = await tenantService.getTenantConfig(tenantId);
    const { enabledIntegrations, apiKeys } = config.integrationSettings;

    if (!enabledIntegrations.includes('PHARMACY')) {
      throw new ApiError('Pharmacy integration not enabled for tenant');
    }

    try {
      const result = await this.executeIntegration('PHARMACY', {
        apiKey: apiKeys.pharmacy,
        data,
        tenantId
      });

      await this.logIntegrationActivity(tenantId, 'PHARMACY', 'SYNC', result);
      return result;
    } catch (error) {
      this.logger.error('Pharmacy sync failed', { error, tenantId });
      throw new ApiError('Pharmacy sync failed', error);
    }
  }

  async syncWithHealthcareProvider(tenantId: string, data: any): Promise<any> {
    const config = await tenantService.getTenantConfig(tenantId);
    const { enabledIntegrations, apiKeys } = config.integrationSettings;

    if (!enabledIntegrations.includes('HEALTHCARE_PROVIDER')) {
      throw new ApiError('Healthcare provider integration not enabled for tenant');
    }

    try {
      const result = await this.executeIntegration('HEALTHCARE_PROVIDER', {
        apiKey: apiKeys.healthcareProvider,
        data,
        tenantId
      });

      await this.logIntegrationActivity(tenantId, 'HEALTHCARE_PROVIDER', 'SYNC', result);
      return result;
    } catch (error) {
      this.logger.error('Healthcare provider sync failed', { error, tenantId });
      throw new ApiError('Healthcare provider sync failed', error);
    }
  }

  async executeWebhook(tenantId: string, event: string, data: any): Promise<void> {
    const config = await tenantService.getTenantConfig(tenantId);
    const { webhookEndpoints } = config.integrationSettings;

    await Promise.all(webhookEndpoints.map(async endpoint => {
      try {
        await retry(async () => {
          await axios.post(endpoint, {
            event,
            data,
            timestamp: new Date().toISOString(),
            tenantId
          }, {
            headers: {
              'Content-Type': 'application/json',
              'X-Webhook-Event': event,
              'X-Tenant-ID': tenantId
            }
          });
        }, {
          retries: 3,
          backoff: true
        });

        await this.logIntegrationActivity(tenantId, 'WEBHOOK', event, { endpoint });
      } catch (error) {
        this.logger.error('Webhook execution failed', { error, tenantId, endpoint });
        // Don't throw error to prevent blocking other webhooks
      }
    }));
  }

  private async executeIntegration(type: string, config: any): Promise<any> {
    const integration = this.getIntegrationHandler(type);
    return await integration.execute(config);
  }

  private getIntegrationHandler(type: string): any {
    const handlers = {
      'PHARMACY': {
        execute: this.executePharmacyIntegration.bind(this)
      },
      'HEALTHCARE_PROVIDER': {
        execute: this.executeHealthcareProviderIntegration.bind(this)
      }
    };

    return handlers[type];
  }

  private async executePharmacyIntegration(config: any): Promise<any> {
    // Implement pharmacy-specific integration logic
    return {};
  }

  private async executeHealthcareProviderIntegration(config: any): Promise<any> {
    // Implement healthcare provider-specific integration logic
    return {};
  }

  private async logIntegrationActivity(
    tenantId: string,
    integrationType: string,
    activity: string,
    details: any
  ): Promise<void> {
    await prisma.integrationLog.create({
      data: {
        tenantId,
        integrationType,
        activity,
        details,
        timestamp: new Date()
      }
    });
  }
}

export const integrationService = new IntegrationService();


