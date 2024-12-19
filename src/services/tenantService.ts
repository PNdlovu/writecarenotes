import { apiClient } from './apiClient';
import { 
  Tenant,
  TenantConfig,
  RegionalSettings,
  FeatureFlag,
  User
} from '@/types/core';
import { API_CONFIG } from '@/config/app-config';

interface TenantCreationData {
  name: string;
  identifier: string;
  regionalSettings: RegionalSettings;
  features?: string[];
  adminEmail: string;
}

interface TenantUpdateData {
  name?: string;
  regionalSettings?: Partial<RegionalSettings>;
  features?: string[];
}

class TenantService {
  private static instance: TenantService;
  private currentTenant: Tenant | null = null;
  private tenantConfigs: Map<string, TenantConfig> = new Map();
  private featureFlags: Map<string, FeatureFlag[]> = new Map();

  private constructor() {}

  public static getInstance(): TenantService {
    if (!TenantService.instance) {
      TenantService.instance = new TenantService();
    }
    return TenantService.instance;
  }

  // Tenant CRUD Operations
  async createTenant(data: TenantCreationData): Promise<Tenant> {
    return apiClient.post<Tenant>('/tenants', data);
  }

  async getTenant(tenantId: string): Promise<Tenant> {
    return apiClient.get<Tenant>(`/tenants/${tenantId}`);
  }

  async updateTenant(
    tenantId: string,
    data: TenantUpdateData
  ): Promise<Tenant> {
    return apiClient.patch<Tenant>(`/tenants/${tenantId}`, data);
  }

  async deleteTenant(tenantId: string): Promise<void> {
    await apiClient.delete(`/tenants/${tenantId}`);
  }

  async listTenants(page = 1, limit = 10): Promise<{
    tenants: Tenant[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    return apiClient.get<any>('/tenants', {
      params: { page, limit },
    });
  }

  // Tenant Configuration Management
  async getTenantConfig(tenantId: string): Promise<TenantConfig> {
    // Check cache first
    const cachedConfig = this.tenantConfigs.get(tenantId);
    if (cachedConfig) {
      return cachedConfig;
    }

    const config = await apiClient.get<TenantConfig>(
      `/tenants/${tenantId}/config`
    );
    this.tenantConfigs.set(tenantId, config);
    return config;
  }

  async updateTenantConfig(
    tenantId: string,
    config: Partial<TenantConfig>
  ): Promise<TenantConfig> {
    const updatedConfig = await apiClient.patch<TenantConfig>(
      `/tenants/${tenantId}/config`,
      config
    );
    this.tenantConfigs.set(tenantId, updatedConfig);
    return updatedConfig;
  }

  // Feature Flag Management
  async getFeatureFlags(tenantId: string): Promise<FeatureFlag[]> {
    // Check cache first
    const cachedFlags = this.featureFlags.get(tenantId);
    if (cachedFlags) {
      return cachedFlags;
    }

    const flags = await apiClient.get<FeatureFlag[]>(
      `/tenants/${tenantId}/features`
    );
    this.featureFlags.set(tenantId, flags);
    return flags;
  }

  async updateFeatureFlags(
    tenantId: string,
    features: string[]
  ): Promise<FeatureFlag[]> {
    const flags = await apiClient.patch<FeatureFlag[]>(
      `/tenants/${tenantId}/features`,
      { features }
    );
    this.featureFlags.set(tenantId, flags);
    return flags;
  }

  isFeatureEnabled(
    tenantId: string,
    featureKey: string,
    user?: User
  ): boolean {
    const flags = this.featureFlags.get(tenantId);
    if (!flags) return false;

    const flag = flags.find((f) => f.key === featureKey);
    if (!flag) return false;

    // Check if feature is globally enabled
    if (flag.enabled) {
      // Check percentage rollout
      if (flag.rolloutPercentage && flag.rolloutPercentage < 100) {
        const hash = this.hashString(
          `${tenantId}:${user?.id || 'anonymous'}:${featureKey}`
        );
        return (hash % 100) < flag.rolloutPercentage;
      }
      return true;
    }

    // Check user-specific override
    if (user && flag.enabledForUsers?.includes(user.id)) {
      return true;
    }

    return false;
  }

  // Regional Settings Management
  async getRegionalSettings(tenantId: string): Promise<RegionalSettings> {
    const config = await this.getTenantConfig(tenantId);
    return config.regionalSettings;
  }

  async updateRegionalSettings(
    tenantId: string,
    settings: Partial<RegionalSettings>
  ): Promise<RegionalSettings> {
    const config = await this.updateTenantConfig(tenantId, {
      regionalSettings: settings,
    });
    return config.regionalSettings;
  }

  // User Management within Tenant
  async addUserToTenant(
    tenantId: string,
    userId: string,
    role: string
  ): Promise<void> {
    await apiClient.post(`/tenants/${tenantId}/users`, {
      userId,
      role,
    });
  }

  async removeUserFromTenant(
    tenantId: string,
    userId: string
  ): Promise<void> {
    await apiClient.delete(`/tenants/${tenantId}/users/${userId}`);
  }

  async getTenantUsers(
    tenantId: string,
    page = 1,
    limit = 10
  ): Promise<{
    users: User[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    return apiClient.get<any>(`/tenants/${tenantId}/users`, {
      params: { page, limit },
    });
  }

  // Utility Methods
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Cache Management
  clearCache(tenantId?: string): void {
    if (tenantId) {
      this.tenantConfigs.delete(tenantId);
      this.featureFlags.delete(tenantId);
    } else {
      this.tenantConfigs.clear();
      this.featureFlags.clear();
    }
  }

  // Current Tenant Management
  setCurrentTenant(tenant: Tenant): void {
    this.currentTenant = tenant;
  }

  getCurrentTenant(): Tenant | null {
    return this.currentTenant;
  }
}

export const tenantService = TenantService.getInstance();


