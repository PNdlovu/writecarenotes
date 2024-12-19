export type SubscriptionTier = 'basic' | 'professional' | 'enterprise';

export interface SubscriptionFeature {
  id: string;
  name: string;
  description: string;
  tier: SubscriptionTier;
  limits?: {
    residents?: number;
    users?: number;
    storage?: number;
    apiCalls?: number;
  };
}

export interface TenantConfiguration {
  id: string;
  tenantId: string;
  subscriptionTier: SubscriptionTier;
  medicationSettings: {
    enableAIAnalytics: boolean;
    enableAdvancedSafety: boolean;
    enableCustomProtocols: boolean;
    enableIntegrations: boolean;
    maxMedicationTypes: number;
    maxActiveResidents: number;
  };
  complianceSettings: {
    enableAutomatedAudits: boolean;
    enableCustomReports: boolean;
    enableRealTimeAlerts: boolean;
    retentionPeriodMonths: number;
    requiredDocuments: string[];
  };
  notificationSettings: {
    enableEmailNotifications: boolean;
    enableSMSNotifications: boolean;
    enablePushNotifications: boolean;
    criticalAlertChannels: string[];
    customAlertRules: any[];
  };
  integrationSettings: {
    enabledIntegrations: string[];
    customIntegrations: any[];
    apiKeys: Record<string, string>;
    webhookEndpoints: string[];
  };
  billingSettings: {
    subscriptionTier: SubscriptionTier;
    customFeatures: string[];
    billingCycle: 'monthly' | 'annual';
    price: number;
    discount?: number;
    paymentMethod: any;
  };
  limits: {
    maxUsers: number;
    maxResidents: number;
    maxStorage: number;
    maxApiCalls: number;
    retentionPeriodDays: number;
  };
  customization: {
    branding: {
      logo?: string;
      colors: {
        primary: string;
        secondary: string;
        accent: string;
      };
    };
    terminology: Record<string, string>;
    customFields: any[];
  };
}

export interface Usage {
  tenantId: string;
  period: {
    start: Date;
    end: Date;
  };
  metrics: {
    activeUsers: number;
    activeResidents: number;
    storageUsed: number;
    apiCalls: number;
    features: Record<string, number>;
  };
  costs: {
    base: number;
    overages: Record<string, number>;
    discounts: Record<string, number>;
    total: number;
  };
}


