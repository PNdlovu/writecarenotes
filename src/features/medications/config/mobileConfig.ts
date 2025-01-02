/**
 * @writecarenotes.com
 * @fileoverview Mobile Configuration for Medication Module
 * @version 1.0.0
 * @created 2024-01-07
 * @updated 2024-01-07
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Mobile-first configuration settings for the medication module
 * including offline capabilities and performance optimizations.
 */

export const MOBILE_CONFIG = {
  // Offline Storage
  offlineStorage: {
    maxStorageSize: 50 * 1024 * 1024, // 50MB max offline storage
    maxRecords: {
      schedules: 1000,
      administrations: 5000,
      alerts: 1000,
      stock: 1000
    },
    syncInterval: 5 * 60 * 1000, // 5 minutes
    retryAttempts: 3,
    retryDelay: 30 * 1000, // 30 seconds
  },

  // Performance
  performance: {
    batchSize: 50, // Number of records to process at once
    cacheTimeout: 5 * 60 * 1000, // 5 minutes cache
    debounceDelay: 300, // 300ms for search/filter operations
    maxImageSize: 1024 * 1024, // 1MB max image size
    compressionQuality: 0.8,
  },

  // UI/UX
  ui: {
    touchTargetSize: 44, // Minimum touch target size in pixels
    loadingThreshold: 200, // Show loading after 200ms
    animationDuration: 200,
    maxListItems: 100, // Maximum items to show in lists
    infiniteScrollThreshold: 0.8, // Load more at 80% scroll
    pullToRefreshDistance: 60,
  },

  // Network
  network: {
    timeout: 30 * 1000, // 30 seconds request timeout
    retryStatusCodes: [408, 500, 502, 503, 504],
    maxConcurrentRequests: 4,
    priorityRequests: ['medication_administration', 'alerts'],
  },

  // Data Management
  data: {
    maxOfflinePeriod: 24 * 60 * 60 * 1000, // 24 hours
    cleanupInterval: 7 * 24 * 60 * 60 * 1000, // 7 days
    compressionEnabled: true,
    encryptionEnabled: true,
  },

  // Error Handling
  errors: {
    maxRetries: 3,
    logLevel: 'ERROR',
    criticalErrors: [
      'SYNC_ERROR',
      'STORAGE_FULL',
      'ENCRYPTION_ERROR',
      'AUTHENTICATION_ERROR'
    ],
  },

  // Battery Optimization
  battery: {
    lowBatteryThreshold: 0.15, // 15%
    backgroundSyncEnabled: true,
    backgroundSyncInterval: 15 * 60 * 1000, // 15 minutes
    disableAnimationsOnLowBattery: true,
  },

  // Accessibility
  accessibility: {
    minimumContrastRatio: 4.5,
    largeTouchTargets: true,
    reduceMotion: false,
    enableVibration: true,
    enableSoundFeedback: false,
  },

  // Security
  security: {
    pinTimeout: 5 * 60 * 1000, // 5 minutes
    maxPinAttempts: 3,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
    requirePinOnBackground: true,
    encryptOfflineData: true,
  },

  // Regional Settings
  regional: {
    defaultLanguage: 'en',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    timezone: 'Europe/London',
    firstDayOfWeek: 1, // Monday
  }
} as const;

// Derived configurations based on device capabilities
export const getDynamicConfig = () => {
  const deviceMemory = navigator.deviceMemory || 4; // Default to 4GB if not available
  const connection = navigator.connection || { type: '4g', downlink: 10 };
  const isLowEndDevice = deviceMemory <= 2;

  return {
    performance: {
      ...MOBILE_CONFIG.performance,
      batchSize: isLowEndDevice ? 25 : MOBILE_CONFIG.performance.batchSize,
      cacheTimeout: isLowEndDevice ? 2 * 60 * 1000 : MOBILE_CONFIG.performance.cacheTimeout,
      maxImageSize: isLowEndDevice ? 512 * 1024 : MOBILE_CONFIG.performance.maxImageSize,
    },
    network: {
      ...MOBILE_CONFIG.network,
      maxConcurrentRequests: connection.type === '4g' ? 4 : 2,
      timeout: connection.downlink < 1 ? 60 * 1000 : MOBILE_CONFIG.network.timeout,
    },
    offlineStorage: {
      ...MOBILE_CONFIG.offlineStorage,
      maxStorageSize: isLowEndDevice ? 25 * 1024 * 1024 : MOBILE_CONFIG.offlineStorage.maxStorageSize,
      syncInterval: connection.type === '4g' ? 5 * 60 * 1000 : 15 * 60 * 1000,
    },
    ui: {
      ...MOBILE_CONFIG.ui,
      animationDuration: isLowEndDevice ? 0 : MOBILE_CONFIG.ui.animationDuration,
      maxListItems: isLowEndDevice ? 50 : MOBILE_CONFIG.ui.maxListItems,
    }
  };
}; 