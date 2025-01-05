export interface TenantConfig {
  id: string;
  name: string;
  domain: string;
  features: TenantFeatures;
  limits: TenantLimits;
  branding: TenantBranding;
  settings: TenantSettings;
}

export interface TenantFeatures {
  payroll: {
    enabled: boolean;
    modules: {
      timesheet: boolean;
      expenses: boolean;
      benefits: boolean;
      reporting: boolean;
      hmrc: boolean;
      revenue: boolean;
    };
    customizations: {
      calculators: boolean;
      templates: boolean;
      workflows: boolean;
    };
  };
  // Other feature flags...
}

export interface TenantLimits {
  maxEmployees: number;
  maxFacilities: number;
  maxUsers: number;
  storageLimit: number;
  apiRateLimit: number;
}

export interface TenantBranding {
  logo: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  fonts: {
    primary: string;
    secondary: string;
  };
}

export interface TenantSettings {
  defaultLanguage: string;
  defaultTimezone: string;
  defaultCurrency: string;
  dateFormat: string;
  numberFormat: string;
}

export interface TenantContext {
  tenant: TenantConfig;
  user: {
    id: string;
    roles: string[];
    permissions: string[];
  };
}

export interface TenantContextType {
  tenantId: string;
  userId: string;
  region: string;
}
