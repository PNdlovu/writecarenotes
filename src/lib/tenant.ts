/**
 * WriteCareNotes.com
 * @fileoverview Tenant Context Management
 * @version 1.0.0
 */

import { TenantError } from './errors';

export interface TenantContext {
  tenantId: string;
  organizationId: string;
  region: string;
  features: string[];
  settings: {
    timezone: string;
    dateFormat: string;
    currency: string;
    language: string;
    theme: string;
    [key: string]: any;
  };
  compliance: {
    framework: string;
    requirements: string[];
    certifications: string[];
    lastAudit?: Date;
    nextAudit?: Date;
  };
  subscription: {
    plan: string;
    status: string;
    features: string[];
    limits: {
      users: number;
      storage: number;
      careHomes: number;
      [key: string]: number;
    };
    expiry?: Date;
  };
}

class TenantContextManager {
  private static instance: TenantContextManager;
  private currentContext?: TenantContext;
  private contextStack: TenantContext[] = [];

  private constructor() {}

  public static getInstance(): TenantContextManager {
    if (!TenantContextManager.instance) {
      TenantContextManager.instance = new TenantContextManager();
    }
    return TenantContextManager.instance;
  }

  setContext(context: TenantContext): void {
    this.validateContext(context);
    this.currentContext = context;
  }

  getContext(): TenantContext {
    if (!this.currentContext) {
      throw new TenantError('No tenant context set');
    }
    return this.currentContext;
  }

  pushContext(context: TenantContext): void {
    this.validateContext(context);
    if (this.currentContext) {
      this.contextStack.push(this.currentContext);
    }
    this.currentContext = context;
  }

  popContext(): TenantContext {
    if (!this.currentContext) {
      throw new TenantError('No tenant context to pop');
    }

    const previousContext = this.contextStack.pop();
    const currentContext = this.currentContext;

    this.currentContext = previousContext;

    return currentContext;
  }

  clearContext(): void {
    this.currentContext = undefined;
    this.contextStack = [];
  }

  hasFeature(feature: string): boolean {
    if (!this.currentContext) {
      return false;
    }
    return this.currentContext.features.includes(feature);
  }

  checkSubscriptionLimit(limitKey: string, value: number): boolean {
    if (!this.currentContext) {
      return false;
    }
    const limit = this.currentContext.subscription.limits[limitKey];
    return typeof limit === 'number' && value <= limit;
  }

  isCompliantWith(requirement: string): boolean {
    if (!this.currentContext) {
      return false;
    }
    return this.currentContext.compliance.requirements.includes(requirement);
  }

  private validateContext(context: TenantContext): void {
    if (!context.tenantId) {
      throw new TenantError('Tenant ID is required');
    }

    if (!context.organizationId) {
      throw new TenantError('Organization ID is required');
    }

    if (!context.region) {
      throw new TenantError('Region is required');
    }

    if (!this.isValidRegion(context.region)) {
      throw new TenantError(`Invalid region: ${context.region}`);
    }

    if (!context.subscription || !context.subscription.plan) {
      throw new TenantError('Subscription information is required');
    }

    if (!context.compliance || !context.compliance.framework) {
      throw new TenantError('Compliance framework is required');
    }
  }

  private isValidRegion(region: string): boolean {
    const validRegions = ['GB-ENG', 'GB-WLS', 'GB-SCT', 'GB-NIR', 'IRL'];
    return validRegions.includes(region);
  }

  getRegionalCompliance(): string {
    if (!this.currentContext) {
      throw new TenantError('No tenant context set');
    }

    switch (this.currentContext.region) {
      case 'GB-ENG':
        return 'CQC';
      case 'GB-WLS':
        return 'CIW';
      case 'GB-SCT':
        return 'Care Inspectorate';
      case 'GB-NIR':
        return 'RQIA';
      case 'IRL':
        return 'HIQA';
      default:
        throw new TenantError(`Unknown region: ${this.currentContext.region}`);
    }
  }

  getRegionalSettings(): {
    timezone: string;
    dateFormat: string;
    currency: string;
  } {
    if (!this.currentContext) {
      throw new TenantError('No tenant context set');
    }

    const settings = {
      timezone: 'Europe/London',
      dateFormat: 'DD/MM/YYYY',
      currency: 'GBP',
    };

    if (this.currentContext.region === 'IRL') {
      settings.currency = 'EUR';
    }

    return {
      ...settings,
      ...this.currentContext.settings,
    };
  }
}

export const tenantContext = TenantContextManager.getInstance(); 