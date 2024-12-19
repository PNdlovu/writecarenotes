import { Region, Language } from '@/types/core';

interface RegionConfig {
  name: string;
  languages: Language[];
  defaultLanguage: Language;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  currency: string;
  measurementSystem: 'metric' | 'imperial';
  regulations: {
    hipaa?: boolean;
    gdpr?: boolean;
    phipa?: boolean;
  };
}

interface FeatureConfig {
  offline: {
    enabled: boolean;
    syncInterval: number;
    maxStorageSize: number;
    compressionEnabled: boolean;
  };
  security: {
    mfaRequired: boolean;
    passwordMinLength: number;
    sessionTimeout: number;
    maxLoginAttempts: number;
  };
  performance: {
    cacheTTL: number;
    prefetchEnabled: boolean;
    compressionThreshold: number;
  };
}

export const REGIONS: Record<Region, RegionConfig> = {
  us: {
    name: 'United States',
    languages: ['en', 'es'],
    defaultLanguage: 'en',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    currency: 'USD',
    measurementSystem: 'imperial',
    regulations: {
      hipaa: true,
    },
  },
  uk: {
    name: 'United Kingdom',
    languages: ['en'],
    defaultLanguage: 'en',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    currency: 'GBP',
    measurementSystem: 'metric',
    regulations: {
      gdpr: true,
    },
  },
  eu: {
    name: 'European Union',
    languages: ['en', 'de', 'fr', 'es'],
    defaultLanguage: 'en',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    currency: 'EUR',
    measurementSystem: 'metric',
    regulations: {
      gdpr: true,
    },
  },
  ca: {
    name: 'Canada',
    languages: ['en', 'fr'],
    defaultLanguage: 'en',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '24h',
    currency: 'CAD',
    measurementSystem: 'metric',
    regulations: {
      phipa: true,
    },
  },
  au: {
    name: 'Australia',
    languages: ['en'],
    defaultLanguage: 'en',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    currency: 'AUD',
    measurementSystem: 'metric',
    regulations: {
      gdpr: true,
    },
  },
};

export const FEATURES: FeatureConfig = {
  offline: {
    enabled: true,
    syncInterval: 5 * 60 * 1000, // 5 minutes
    maxStorageSize: 50 * 1024 * 1024, // 50MB
    compressionEnabled: true,
  },
  security: {
    mfaRequired: true,
    passwordMinLength: 12,
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    maxLoginAttempts: 5,
  },
  performance: {
    cacheTTL: 5 * 60 * 1000, // 5 minutes
    prefetchEnabled: true,
    compressionThreshold: 1024, // 1KB
  },
};

export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_PREFERENCES: 'user_preferences',
  TENANT_CONFIG: 'tenant_config',
  OFFLINE_DATA: 'offline_data',
  FEATURE_FLAGS: 'feature_flags',
} as const;

export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  OFFLINE_ERROR: 'OFFLINE_ERROR',
  SYNC_ERROR: 'SYNC_ERROR',
} as const;

export const DEFAULT_TENANT_CONFIG = {
  features: {
    offline: true,
    multiLanguage: true,
    analytics: true,
    advancedSecurity: true,
  },
  security: {
    mfa: true,
    passwordPolicy: {
      minLength: 12,
      requireSpecialChars: true,
      requireNumbers: true,
      requireUppercase: true,
      expiryDays: 90,
    },
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
  },
  branding: {
    colors: {
      primary: '#007AFF',
      secondary: '#5856D6',
      accent: '#FF2D55',
    },
    theme: 'system',
  },
} as const;


