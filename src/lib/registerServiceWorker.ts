/**
 * @writecarenotes.com
 * @fileoverview Service worker registration and management
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Handles service worker registration, updates, and lifecycle management.
 * Provides functionality for offline capabilities, push notifications,
 * and background sync. Includes methods for checking installation status
 * and prompting for installation.
 */

import { toast } from '@/components/ui/toast';

type ServiceWorkerConfig = {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onOffline?: () => void;
  onOnline?: () => void;
  scope?: string;
};

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

export async function register(config: ServiceWorkerConfig = {}) {
  if ('serviceWorker' in navigator) {
    const publicUrl = new URL(process.env.PUBLIC_URL || '', window.location.href);

    // Service worker won't work if PUBLIC_URL is on a different origin
    if (publicUrl.origin !== window.location.origin) {
      console.warn('Service worker registration skipped - different origin');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: config.scope || '/'
      });

      registration.addEventListener('updatefound', () => {
        const installingWorker = registration.installing;
        if (!installingWorker) return;

        installingWorker.addEventListener('statechange', () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New content available
              console.log('New content available - reloading...');
              config.onUpdate?.(registration);
              toast({
                title: 'Update Available',
                description: 'A new version is available. Please refresh to update.',
                action: {
                  label: 'Refresh',
                  onClick: () => window.location.reload()
                }
              });
            } else {
              // Content cached for offline use
              console.log('Content cached for offline use');
              config.onSuccess?.(registration);
              toast({
                title: 'Ready for Offline Use',
                description: 'The app has been cached for offline use.'
              });
            }
          }
        });
      });

      // Check for updates periodically
      setInterval(() => {
        registration.update();
      }, 1000 * 60 * 60); // Check every hour

      // Handle online/offline events
      window.addEventListener('online', () => {
        console.log('App is online');
        config.onOnline?.();
        toast({
          title: 'Online',
          description: 'Your internet connection has been restored.'
        });
      });

      window.addEventListener('offline', () => {
        console.log('App is offline');
        config.onOffline?.();
        toast({
          title: 'Offline',
          description: 'You are now offline. Some features may be limited.'
        });
      });

      return registration;
    } catch (error) {
      console.error('Error during service worker registration:', error);
      return null;
    }
  }

  return null;
}

export async function unregister() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.unregister();
      console.log('Service worker unregistered successfully');
    } catch (error) {
      console.error('Error unregistering service worker:', error);
    }
  }
}

export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

export async function subscribeToPushNotifications(registration: ServiceWorkerRegistration) {
  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    });

    // Send subscription to server
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription)
    });

    return subscription;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return null;
  }
}

export function isInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone ||
         document.referrer.includes('android-app://');
}

export function canInstall() {
  return 'BeforeInstallPromptEvent' in window && !isInstalled();
}

let deferredPrompt: any = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
});

export async function promptInstall() {
  if (!deferredPrompt) {
    console.warn('Installation prompt not available');
    return false;
  }

  try {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    return outcome === 'accepted';
  } catch (error) {
    console.error('Error prompting for installation:', error);
    return false;
  }
}

// Listen for app installed event
window.addEventListener('appinstalled', () => {
  deferredPrompt = null;
  toast({
    title: 'App Installed',
    description: 'Write Care Notes has been installed successfully.'
  });
}); 