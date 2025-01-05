import { prisma } from '@/lib/db';
import { Cache } from '@/lib/cache';
import { Logger } from '@/lib/logger';
import { ApiError } from '@/lib/errors';

export class TenantService {
  private readonly cache: Cache;
  private readonly logger: Logger;

  constructor() {
    this.cache = new Cache();
    this.logger = new Logger('TenantService');
  }

  async validateTenantAccess(tenantId: string, userId: string): Promise<boolean> {
    const cacheKey = `tenant:access:${tenantId}:${userId}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return JSON.parse(cached);

    try {
      const access = await prisma.tenantUser.findFirst({
        where: {
          tenantId,
          userId,
          active: true
        }
      });

      await this.cache.set(cacheKey, JSON.stringify(!!access), 3600);
      return !!access;
    } catch (error) {
      this.logger.error('Failed to validate tenant access', { error, tenantId, userId });
      throw new ApiError('Failed to validate tenant access', error);
    }
  }

  async getTenantConfig(tenantId: string): Promise<any> {
    const cacheKey = `tenant:config:${tenantId}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return JSON.parse(cached);

    try {
      const config = await prisma.tenantConfiguration.findUnique({
        where: { tenantId },
        include: {
          medicationSettings: true,
          complianceSettings: true,
          notificationSettings: true,
          integrationSettings: true,
          billingSettings: true
        }
      });

      if (!config) {
        throw new ApiError('Tenant configuration not found', { tenantId });
      }

      await this.cache.set(cacheKey, JSON.stringify(config), 3600);
      return config;
    } catch (error) {
      this.logger.error('Failed to get tenant configuration', { error, tenantId });
      throw error;
    }
  }

  async validateFeatureAccess(tenantId: string, feature: string): Promise<boolean> {
    const config = await this.getTenantConfig(tenantId);
    return this.checkFeatureSubscription(config, feature);
  }

  private checkFeatureSubscription(config: any, feature: string): boolean {
    const { subscriptionTier, customFeatures } = config.billingSettings;
    
    // Check if feature is included in subscription tier
    const tierFeatures = this.getTierFeatures(subscriptionTier);
    if (tierFeatures.includes(feature)) return true;

    // Check if feature is in custom features
    return customFeatures.includes(feature);
  }

  private getTierFeatures(tier: string): string[] {
    const tierFeatures = {
      'basic': [
        'BASIC_MEDICATION_MANAGEMENT',
        'BASIC_MAR',
        'BASIC_REPORTING'
      ],
      'professional': [
        'ADVANCED_MEDICATION_MANAGEMENT',
        'ADVANCED_MAR',
        'ANALYTICS',
        'STOCK_MANAGEMENT',
        'BASIC_INTEGRATIONS'
      ],
      'enterprise': [
        'ALL_FEATURES',
        'CUSTOM_INTEGRATIONS',
        'AI_POWERED_ANALYTICS',
        'ADVANCED_COMPLIANCE'
      ]
    };

    return tierFeatures[tier] || [];
  }
}

export const tenantService = new TenantService();


