import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  settings: {
    branding: {
      logo: string;
      colors: {
        primary: string;
        secondary: string;
        accent: string;
      };
    };
    features: {
      [key: string]: boolean;
    };
    limits: {
      maxUsers: number;
      maxResidents: number;
      maxStorage: number;
      allowedModules: string[];
    };
    compliance: {
      dataRetentionDays: number;
      requiredAuditLevel: 'BASIC' | 'DETAILED' | 'COMPREHENSIVE';
      backupFrequency: 'DAILY' | 'HOURLY';
      encryptionLevel: 'STANDARD' | 'HIGH' | 'MILITARY';
    };
    integrations: {
      enabled: string[];
      configurations: Record<string, any>;
    };
  };
  subscription: {
    plan: 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE';
    status: 'ACTIVE' | 'TRIAL' | 'EXPIRED';
    expiryDate: string;
    maxLocations: number;
  };
  security: {
    mfaRequired: boolean;
    passwordPolicy: {
      minLength: number;
      requireSpecialChars: boolean;
      requireNumbers: boolean;
      expiryDays: number;
    };
    ipWhitelist: string[];
    sessionTimeout: number;
  };
}

interface TenantContextType {
  tenant: Tenant | null;
  loading: boolean;
  error: Error | null;
  reloadTenant: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();

  const loadTenant = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get tenant from API based on hostname or path
      const hostname = window.location.hostname;
      const response = await fetch(`/api/tenants/resolve?hostname=${hostname}`);
      
      if (!response.ok) {
        throw new Error('Failed to load tenant');
      }

      const tenantData = await response.json();
      setTenant(tenantData);

      // Apply tenant-specific settings
      if (tenantData.settings.branding) {
        document.documentElement.style.setProperty(
          '--primary-color',
          tenantData.settings.branding.colors.primary
        );
        document.documentElement.style.setProperty(
          '--secondary-color',
          tenantData.settings.branding.colors.secondary
        );
      }

      // Check subscription status
      if (tenantData.subscription.status === 'EXPIRED') {
        router.push('/subscription-expired');
        return;
      }

      // Initialize tenant-specific services
      await initializeTenantServices(tenantData);

    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      router.push('/error');
    } finally {
      setLoading(false);
    }
  };

  const initializeTenantServices = async (tenantData: Tenant) => {
    // Initialize tenant-specific analytics
    if (typeof window !== 'undefined') {
      window.analytics?.identify(tenantData.id, {
        name: tenantData.name,
        plan: tenantData.subscription.plan,
      });
    }

    // Initialize tenant-specific features
    Object.entries(tenantData.settings.features).forEach(([feature, enabled]) => {
      if (enabled) {
        // Initialize feature-specific services
      }
    });

    // Initialize tenant-specific integrations
    for (const integration of tenantData.settings.integrations.enabled) {
      const config = tenantData.settings.integrations.configurations[integration];
      await initializeIntegration(integration, config);
    }
  };

  const initializeIntegration = async (integration: string, config: any) => {
    switch (integration) {
      case 'NHS':
        // Initialize NHS integration
        break;
      case 'SOCIAL_SERVICES':
        // Initialize Social Services integration
        break;
      // Add other integrations
    }
  };

  useEffect(() => {
    loadTenant();
  }, []);

  const reloadTenant = async () => {
    await loadTenant();
  };

  return (
    <TenantContext.Provider value={{ tenant, loading, error, reloadTenant }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}


