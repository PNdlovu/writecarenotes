import { ComplianceService } from '@/features/compliance/services/complianceService';
import { FamilyPortalService } from '@/features/family-portal/services/familyPortalService';
import { ActivityService } from '@/features/activities/services/activityService';
import { Logger } from '@/lib/logger';
import { TenantConfig } from '../tenancy/types';
import { PaymentResponse } from '../providers/types';

export class OrganizationIntegration {
  private logger: Logger;
  private complianceService: ComplianceService;

  constructor() {
    this.logger = new Logger('OrganizationIntegration');
    this.complianceService = new ComplianceService();
  }

  async syncOrganizationConfig(
    organizationId: string
  ): Promise<TenantConfig> {
    try {
      // Get organization configuration
      const [organizationResponse, complianceConfig] = await Promise.all([
        fetch(`/api/organizations/${organizationId}`).then(res => res.json()),
        this.complianceService.getComplianceConfig(organizationId)
      ]);

      // Map organization settings to tenant config
      return {
        id: organizationId,
        name: organizationResponse.name,
        tier: this.mapOrganizationTier(organizationResponse.type),
        limits: {
          maxTransactions: organizationResponse.paymentLimits.maxTransactions,
          maxUsers: organizationResponse.userLimits.maxUsers,
          maxStorage: organizationResponse.storageLimits.maxBytes,
          maxConcurrentRequests: organizationResponse.apiLimits.maxConcurrent
        },
        features: {
          providers: this.getEnabledProviders(organizationResponse),
          reporting: organizationResponse.features.includes('reporting'),
          audit: organizationResponse.features.includes('audit'),
          api: organizationResponse.features.includes('api')
        },
        security: {
          ipWhitelist: organizationResponse.security.ipWhitelist,
          mfaRequired: complianceConfig.requireMFA,
          sessionTimeout: organizationResponse.security.sessionTimeout,
          passwordPolicy: complianceConfig.passwordPolicy
        }
      };
    } catch (error) {
      this.logger.error('Failed to sync organization config', {
        organizationId,
        error
      });
      throw error;
    }
  }

  async validateOrganizationPayment(
    organizationId: string,
    payment: PaymentResponse
  ): Promise<{
    isValid: boolean;
    reasons?: string[];
  }> {
    try {
      // Get organization details
      const organization = await this.organizationService.getOrganization(organizationId);
      
      // Check compliance status
      const complianceStatus = await this.complianceService.getOrganizationStatus(organizationId);
      
      const validationResults = [];

      // Validate organization status
      if (!organization.isActive) {
        validationResults.push('Organization is not active');
      }

      // Validate compliance
      if (!complianceStatus.isCompliant) {
        validationResults.push('Organization is not compliant');
      }

      // Validate payment amount against organization limits
      if (payment.amount > organization.paymentLimits.maxTransaction) {
        validationResults.push('Payment exceeds organization transaction limit');
      }

      return {
        isValid: validationResults.length === 0,
        reasons: validationResults
      };
    } catch (error) {
      this.logger.error('Failed to validate organization payment', {
        organizationId,
        paymentId: payment.id,
        error
      });
      throw error;
    }
  }

  async notifyFamilyPortal(
    organizationId: string,
    payment: PaymentResponse
  ): Promise<void> {
    try {
      // Create notification for family portal
      await this.familyPortalService.createNotification({
        organizationId,
        type: 'PAYMENT',
        title: 'Payment Processed',
        message: `Payment of ${payment.amount} ${payment.currency} has been processed`,
        metadata: {
          paymentId: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status
        }
      });

      // Log activity
      await this.activityService.logActivity({
        organizationId,
        type: 'FINANCIAL',
        action: 'PAYMENT_PROCESSED',
        details: {
          paymentId: payment.id,
          amount: payment.amount,
          currency: payment.currency
        }
      });
    } catch (error) {
      this.logger.error('Failed to notify family portal', {
        organizationId,
        paymentId: payment.id,
        error
      });
      // Don't throw error as this is a non-critical operation
    }
  }

  async updateOrganizationLimits(
    organizationId: string,
    usage: {
      transactions: number;
      storage: number;
      users: number;
    }
  ): Promise<void> {
    try {
      // Update organization usage metrics
      await this.organizationService.updateUsage(organizationId, {
        financialMetrics: {
          transactionCount: usage.transactions,
          lastUpdated: new Date()
        },
        storageMetrics: {
          bytesUsed: usage.storage,
          lastUpdated: new Date()
        },
        userMetrics: {
          activeUsers: usage.users,
          lastUpdated: new Date()
        }
      });

      // Check for limit warnings
      const organization = await this.organizationService.getOrganization(organizationId);
      
      if (usage.transactions > organization.paymentLimits.maxTransactions * 0.8) {
        await this.notifyLimitWarning(organizationId, 'transactions');
      }
      
      if (usage.storage > organization.storageLimits.maxBytes * 0.8) {
        await this.notifyLimitWarning(organizationId, 'storage');
      }
      
      if (usage.users > organization.userLimits.maxUsers * 0.8) {
        await this.notifyLimitWarning(organizationId, 'users');
      }
    } catch (error) {
      this.logger.error('Failed to update organization limits', {
        organizationId,
        error
      });
      throw error;
    }
  }

  private async notifyLimitWarning(
    organizationId: string,
    limitType: string
  ): Promise<void> {
    // Create notification in family portal
    await this.familyPortalService.createNotification({
      organizationId,
      type: 'LIMIT_WARNING',
      title: 'Approaching Usage Limit',
      message: `Your organization is approaching the ${limitType} limit`,
      metadata: { limitType }
    });

    // Log compliance event
    await this.complianceService.logEvent({
      organizationId,
      type: 'LIMIT_WARNING',
      details: {
        limitType,
        timestamp: new Date()
      }
    });
  }

  private mapOrganizationTier(type: string): TenantConfig['tier'] {
    const tierMap: Record<string, TenantConfig['tier']> = {
      'SMALL': 'basic',
      'MEDIUM': 'professional',
      'LARGE': 'enterprise'
    };
    return tierMap[type] || 'basic';
  }

  private getEnabledProviders(organization: any): string[] {
    const providers = [];
    
    if (organization.paymentMethods.directDebit) providers.push('DIRECT_DEBIT');
    if (organization.paymentMethods.goCardless) providers.push('GOCARDLESS');
    if (organization.paymentMethods.paypal) providers.push('PAYPAL');
    if (organization.paymentMethods.stripe) providers.push('STRIPE');
    
    return providers;
  }
}


