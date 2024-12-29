/**
 * @fileoverview Platform detection and capabilities utility
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

export type Platform = 'web' | 'pwa' | 'ios' | 'android';

interface PlatformCapabilities {
  canUseCamera: boolean;
  canUseBiometrics: boolean;
  canUseNativeFS: boolean;
  canUseBackgroundSync: boolean;
  canUsePushNotifications: boolean;
  canUseOfflineStorage: boolean;
  maxOfflineStorageInMB: number;
}

export function getCurrentPlatform(): Platform {
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return 'pwa';
  }
  
  const userAgent = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(userAgent)) {
    return 'ios';
  }
  if (/android/.test(userAgent)) {
    return 'android';
  }
  
  return 'web';
}

export function getPlatformCapabilities(): PlatformCapabilities {
  const platform = getCurrentPlatform();
  
  const baseCapabilities: PlatformCapabilities = {
    canUseCamera: false,
    canUseBiometrics: false,
    canUseNativeFS: false,
    canUseBackgroundSync: 'serviceWorker' in navigator && 'SyncManager' in window,
    canUsePushNotifications: 'Notification' in window && 'serviceWorker' in navigator,
    canUseOfflineStorage: 'indexedDB' in window,
    maxOfflineStorageInMB: 50, // Default PWA storage
  };

  switch (platform) {
    case 'ios':
    case 'android':
      return {
        ...baseCapabilities,
        canUseCamera: true,
        canUseBiometrics: true,
        canUseNativeFS: true,
        maxOfflineStorageInMB: 500, // Higher storage for native apps
      };
    case 'pwa':
      return {
        ...baseCapabilities,
        canUseCamera: 'mediaDevices' in navigator,
        maxOfflineStorageInMB: 250, // Medium storage for PWA
      };
    default:
      return baseCapabilities;
  }
}

export function shouldUsePWA(): boolean {
  const platform = getCurrentPlatform();
  return platform === 'web' || platform === 'pwa';
}

export function shouldUseNativeFeatures(): boolean {
  const platform = getCurrentPlatform();
  return platform === 'ios' || platform === 'android';
}

export function getStorageQuota(): Promise<number> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    return navigator.storage.estimate().then(({ quota = 0 }) => quota);
  }
  return Promise.resolve(50 * 1024 * 1024); // Default 50MB
}

export function canUseFeature(feature: keyof PlatformCapabilities): boolean {
  const capabilities = getPlatformCapabilities();
  return capabilities[feature];
} 