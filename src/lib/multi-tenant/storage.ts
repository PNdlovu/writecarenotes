import { TenantConfig } from './types';

export class TenantStorage {
  private static instance: TenantStorage;
  private tenantMap: Map<string, TenantConfig>;
  private cache: Map<string, any>;

  private constructor() {
    this.tenantMap = new Map();
    this.cache = new Map();
  }

  static getInstance(): TenantStorage {
    if (!TenantStorage.instance) {
      TenantStorage.instance = new TenantStorage();
    }
    return TenantStorage.instance;
  }

  async getTenant(tenantId: string): Promise<TenantConfig | null> {
    // Check in-memory cache first
    if (this.tenantMap.has(tenantId)) {
      return this.tenantMap.get(tenantId) || null;
    }

    // Fetch from database
    const tenant = await prisma.organization.findUnique({
      where: { tenantId }
    });

    if (tenant) {
      const config = this.mapOrganizationToTenantConfig(tenant);
      this.tenantMap.set(tenantId, config);
      return config;
    }

    return null;
  }

  async getTenantByDomain(domain: string): Promise<TenantConfig | null> {
    // Check cache first
    const cachedTenant = Array.from(this.tenantMap.values())
      .find(tenant => tenant.domain === domain);
    if (cachedTenant) return cachedTenant;

    // Fetch from database
    const tenant = await prisma.organization.findFirst({
      where: { customDomain: domain }
    });

    if (tenant) {
      const config = this.mapOrganizationToTenantConfig(tenant);
      this.tenantMap.set(config.id, config);
      return config;
    }

    return null;
  }

  async getCacheValue(tenantId: string, key: string): Promise<any> {
    const cacheKey = `${tenantId}:${key}`;
    return this.cache.get(cacheKey);
  }

  async setCacheValue(tenantId: string, key: string, value: any): Promise<void> {
    const cacheKey = `${tenantId}:${key}`;
    this.cache.set(cacheKey, value);
  }

  async clearTenantCache(tenantId: string): Promise<void> {
    this.tenantMap.delete(tenantId);
    
    // Clear all cache entries for this tenant
    const keysToDelete = Array.from(this.cache.keys())
      .filter(key => key.startsWith(`${tenantId}:`));
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  private mapOrganizationToTenantConfig(org: any): TenantConfig {
    return {
      id: org.tenantId,
      name: org.name,
      domain: org.customDomain || '',
      features: {
        payroll: {
          enabled: org.features?.payroll?.enabled || false,
          modules: {
            timesheet: org.features?.payroll?.timesheet || false,
            expenses: org.features?.payroll?.expenses || false,
            benefits: org.features?.payroll?.benefits || false,
            reporting: org.features?.payroll?.reporting || false,
            hmrc: org.features?.payroll?.hmrc || false,
            revenue: org.features?.payroll?.revenue || false
          },
          customizations: {
            calculators: org.features?.payroll?.calculators || false,
            templates: org.features?.payroll?.templates || false,
            workflows: org.features?.payroll?.workflows || false
          }
        }
      },
      limits: {
        maxEmployees: org.maxUsers || 10,
        maxFacilities: org.maxFacilities || 1,
        maxUsers: org.maxUsers || 10,
        storageLimit: org.storageLimit || 5368709120, // 5GB default
        apiRateLimit: org.apiRateLimit || 1000
      },
      branding: {
        logo: org.branding?.logo || '',
        colors: {
          primary: org.branding?.colors?.primary || '#000000',
          secondary: org.branding?.colors?.secondary || '#ffffff',
          accent: org.branding?.colors?.accent || '#0000ff'
        },
        fonts: {
          primary: org.branding?.fonts?.primary || 'system-ui',
          secondary: org.branding?.fonts?.secondary || 'system-ui'
        }
      },
      settings: {
        defaultLanguage: org.defaultLanguage || 'en',
        defaultTimezone: org.defaultTimezone || 'UTC',
        defaultCurrency: org.defaultCurrency || 'GBP',
        dateFormat: org.settings?.dateFormat || 'DD/MM/YYYY',
        numberFormat: org.settings?.numberFormat || 'en-GB'
      }
    };
  }
}
