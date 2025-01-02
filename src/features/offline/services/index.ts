/**
 * @fileoverview Offline Service Initialization
 * @version 1.0.0
 * @created 2024-03-21
 */

import { OfflineService } from './offlineService';

export { OfflineService };

const offlineService = OfflineService.getInstance();

// Initialize with default config
offlineService.initialize({
  storage: {
    name: 'writecarenotes-offline',
    version: 1,
    cleanupInterval: 24 * 60 * 60 * 1000, // 24 hours
  },
  network: {
    pingEndpoint: '/api/health',
    pingInterval: 30000, // 30 seconds
  },
  sync: {
    maxRetries: 3,
    retryDelay: 5000, // 5 seconds
    batchSize: 50,
  },
  apiEndpoint: '/api',
}).catch(error => {
  console.error('Failed to initialize offline service:', error);
});

export { offlineService }; 