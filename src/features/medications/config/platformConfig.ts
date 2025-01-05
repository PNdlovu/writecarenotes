/**
 * @writecarenotes.com
 * @fileoverview Platform Configuration for Medication Module
 * @version 1.0.0
 * @created 2024-01-07
 * @updated 2024-01-07
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Platform-agnostic configuration that can be extended for mobile/native apps.
 * Focuses on core functionality that works across all platforms.
 */

export const CORE_CONFIG = {
  // Core Features
  core: {
    maxBatchSize: 100,
    cacheTimeout: 5 * 60 * 1000, // 5 minutes
    retryAttempts: 3,
    retryDelay: 30 * 1000, // 30 seconds
  },

  // Data Management
  data: {
    syncEnabled: true,
    encryptionEnabled: true,
    retentionPeriod: 90, // days
    compressionEnabled: true,
  },

  // Security
  security: {
    pinVerificationEnabled: true,
    maxPinAttempts: 3,
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
  },

  // Regional Settings
  regional: {
    defaultLanguage: 'en',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    timezone: 'Europe/London',
    firstDayOfWeek: 1, // Monday
  },

  // Accessibility (Core)
  accessibility: {
    highContrast: false,
    largeText: false,
    reduceMotion: false,
  }
} as const;

// Platform detection (but don't implement mobile features yet)
export const getPlatformType = () => {
  if (typeof window === 'undefined') return 'server';
  if (/Mobi|Android/i.test(navigator.userAgent)) return 'mobile';
  return 'desktop';
};

// Base configuration that works across platforms
export const getBaseConfig = () => {
  const platform = getPlatformType();
  
  return {
    ...CORE_CONFIG,
    platform,
    // Add basic responsive breakpoints
    breakpoints: {
      small: 600,
      medium: 960,
      large: 1280,
      xlarge: 1920,
    },
    // Feature flags for future mobile support
    features: {
      offlineSupport: false, // Enable when building mobile
      touchOptimized: false, // Enable when building mobile
      responsiveDesign: true,
      adaptiveLayout: true,
    }
  };
}; 