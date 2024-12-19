import { OrganizationService } from '@/features/organization/services/organizationService';
import { CareHomeService } from '@/features/carehome/services/careHomeService';
import { ComplianceService } from '@/features/compliance/services/complianceService';
import { FamilyPortalService } from '@/features/family-portal/services/familyPortalService';
import { ActivityService } from '@/features/activities/services/activityService';
import { Logger } from '@/lib/logger';
import { PaymentResponse } from '../providers/types';

export class FinancialService {
  private logger: Logger;

  constructor(
    private organizationService: OrganizationService,
    private careHomeService: CareHomeService,
    private complianceService: ComplianceService,
    private familyPortalService: FamilyPortalService,
    private activityService: ActivityService
  ) {
    this.logger = new Logger('financial-service');
  }

  async validatePayment(
    organizationId: string,
    careHomeId: string,
    payment: PaymentResponse
  ): Promise<{
    isValid: boolean;
    reasons?: string[];
  }> {
    try {
      // Get organization and care home details
      const [organization, careHome] = await Promise.all([
        this.organizationService.getOrganization(organizationId),
        this.careHomeService.getCareHome(careHomeId)
      ]);
      
      // Check compliance status
      const complianceStatus = await this.complianceService.getOrganizationStatus(organizationId);
      
      const validationResults = [];

      // Validate organization status
      if (!organization.isActive) {
        validationResults.push('Organization is not active');
      }

      // Validate care home status
      if (!careHome.isActive) {
        validationResults.push('Care home is not active');
      }

      // Validate compliance
      if (!complianceStatus.isCompliant) {
        validationResults.push('Organization is not compliant');
      }

      // Validate payment amount against organization limits
      if (payment.amount > organization.paymentLimits?.maxTransaction) {
        validationResults.push('Payment exceeds organization transaction limit');
      }

      return {
        isValid: validationResults.length === 0,
        reasons: validationResults
      };
    } catch (error) {
      this.logger.error('Failed to validate payment', {
        organizationId,
        careHomeId,
        paymentId: payment.id,
        error
      });
      throw error;
    }
  }

  async syncOrganizationConfig(organizationId: string): Promise<{
    limits: any;
    features: any;
    security: any;
  }> {
    try {
      // Get organization configuration
      const organization = await this.organizationService.getOrganization(organizationId);
      const complianceConfig = await this.complianceService.getComplianceConfig(organizationId);

      // Map organization settings to financial config
      return {
        limits: {
          maxTransactions: organization.paymentLimits?.maxTransactions,
          maxConcurrentRequests: organization.apiLimits?.maxConcurrent
        },
        features: {
          providers: this.getEnabledProviders(organization),
          reporting: organization.features?.includes('reporting'),
          audit: organization.features?.includes('audit'),
          api: organization.features?.includes('api')
        },
        security: {
          ipWhitelist: organization.security?.ipWhitelist,
          mfaRequired: complianceConfig.requireMFA,
          sessionTimeout: organization.security?.sessionTimeout,
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

  async notifyPaymentProcessed(
    organizationId: string,
    careHomeId: string,
    payment: PaymentResponse
  ): Promise<void> {
    try {
      // Get care home details
      const careHome = await this.careHomeService.getCareHome(careHomeId);

      // Create notification for family portal
      await this.familyPortalService.createNotification({
        organizationId,
        careHomeId,
        type: 'PAYMENT',
        title: 'Payment Processed',
        message: `Payment of ${payment.amount} ${payment.currency} has been processed for ${careHome.name}`,
        metadata: {
          paymentId: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          careHomeName: careHome.name
        }
      });

      // Log activity
      await this.activityService.logActivity({
        organizationId,
        careHomeId,
        type: 'FINANCIAL',
        action: 'PAYMENT_PROCESSED',
        details: {
          paymentId: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          careHomeName: careHome.name
        }
      });
    } catch (error) {
      this.logger.error('Failed to notify payment processed', {
        organizationId,
        careHomeId,
        paymentId: payment.id,
        error
      });
      // Don't throw error as this is a non-critical operation
    }
  }

  async updateOrganizationUsage(
    organizationId: string,
    usage: {
      transactions: number;
      storage: number;
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
        }
      });

      // Check for limit warnings
      const organization = await this.organizationService.getOrganization(organizationId);
      
      if (usage.transactions > (organization.paymentLimits?.maxTransactions || 0) * 0.8) {
        await this.notifyLimitWarning(organizationId, 'transactions');
      }
      
      if (usage.storage > (organization.storageLimits?.maxBytes || 0) * 0.8) {
        await this.notifyLimitWarning(organizationId, 'storage');
      }
    } catch (error) {
      this.logger.error('Failed to update organization usage', {
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

  private getEnabledProviders(organization: any): string[] {
    const providers = [];
    
    if (organization.paymentMethods?.directDebit) providers.push('DIRECT_DEBIT');
    if (organization.paymentMethods?.goCardless) providers.push('GOCARDLESS');
    if (organization.paymentMethods?.paypal) providers.push('PAYPAL');
    if (organization.paymentMethods?.stripe) providers.push('STRIPE');
    
    return providers;
  }
}


