'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { TenantConfig, RegionalSettings, FeatureFlag } from '@/types/core';
import { REGIONS, DEFAULT_TENANT_CONFIG } from '@/config/app-config';
import { getFeatureFlags } from '@/services/featureService';
import type { User } from '@/lib/auth';

interface AppContextType {
  tenant: TenantConfig | null;
  user: User | null;
  regionalSettings: RegionalSettings;
  featureFlags: FeatureFlag[];
  isLoading: boolean;
  error: Error | null;
  updateRegionalSettings: (settings: Partial<RegionalSettings>) => Promise<void>;
  updateTenantConfig: (config: Partial<TenantConfig>) => Promise<void>;
  isFeatureEnabled: (featureId: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [tenant, setTenant] = useState<TenantConfig | null>(null);
  const [regionalSettings, setRegionalSettings] = useState<RegionalSettings | null>(null);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsLoading(true);

        // Load feature flags
        const flags = await getFeatureFlags();
        setFeatureFlags(flags);

        // Initialize tenant config
        if (user?.facility) {
          const tenantConfig = await loadTenantConfig(user.facility);
          setTenant(tenantConfig);

          // Initialize regional settings based on user's region
          const region = REGIONS[user.region || 'gb'];
          setRegionalSettings({
            ...tenantConfig.regionalSettings,
            region: user.region || 'gb',
            dateFormat: region.dateFormat,
            timeFormat: region.timeFormat,
            currency: region.currency,
            measurementSystem: region.measurementSystem,
          });
        }
      } catch (err) {
        setError(err as Error);
        console.error('Error initializing app:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading && user) {
      initializeApp();
    }
  }, [user, authLoading]);

  // Update HTML lang attribute when language changes
  useEffect(() => {
    if (regionalSettings?.language) {
      document.documentElement.lang = regionalSettings.language;
    }
  }, [regionalSettings?.language]);

  const updateRegionalSettings = async (
    settings: Partial<RegionalSettings>
  ) => {
    try {
      if (!tenant) throw new Error('No tenant configured');

      const updatedSettings = {
        ...regionalSettings,
        ...settings,
      };

      // Update backend
      await updateTenantConfig({
        regionalSettings: updatedSettings,
      });

      setRegionalSettings(updatedSettings);
    } catch (err) {
      console.error('Error updating regional settings:', err);
      throw err;
    }
  };

  const updateTenantConfig = async (
    config: Partial<TenantConfig>
  ) => {
    try {
      if (!tenant) throw new Error('No tenant configured');

      const updatedConfig = {
        ...tenant,
        ...config,
      };

      // Update backend
      await saveTenantConfig(updatedConfig);

      setTenant(updatedConfig);
    } catch (err) {
      console.error('Error updating tenant config:', err);
      throw err;
    }
  };

  const isFeatureEnabled = (featureId: string): boolean => {
    const feature = featureFlags.find(f => f.id === featureId);
    if (!feature) return false;

    // Check if feature is enabled globally
    if (!feature.enabled) return false;

    // Check tenant restrictions
    if (feature.tenantIds && !feature.tenantIds.includes(tenant?.id || '')) {
      return false;
    }

    // Check region restrictions
    if (feature.regionIds && !feature.regionIds.includes(user?.region || 'gb')) {
      return false;
    }

    // Check date restrictions
    const now = new Date();
    if (feature.startDate && new Date(feature.startDate) > now) return false;
    if (feature.endDate && new Date(feature.endDate) < now) return false;

    // Check percentage rollout
    if (feature.rules?.type === 'percentage') {
      const percentage = feature.rules.value;
      const hash = hashString(tenant?.id || '');
      return (hash % 100) < percentage;
    }

    return true;
  };

  const value = {
    tenant,
    user,
    regionalSettings,
    featureFlags,
    isLoading: isLoading || authLoading,
    error,
    updateRegionalSettings,
    updateTenantConfig,
    isFeatureEnabled,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// Utility function for percentage-based feature flags
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// These functions would be implemented in your API service
async function loadTenantConfig(facilityId: string): Promise<TenantConfig> {
  // Implementation would fetch from your API
  return DEFAULT_TENANT_CONFIG as TenantConfig;
}

async function saveTenantConfig(config: TenantConfig): Promise<void> {
  // Implementation would save to your API
}


