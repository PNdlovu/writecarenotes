/**
 * @fileoverview Utility function to register service worker
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

export async function registerServiceWorker(): Promise<void> {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/',
      });

      // Request permission for background sync
      if ('sync' in registration) {
        try {
          await registration.sync.register('sync-calendar-events');
        } catch (error) {
          console.warn('Background sync failed to register:', error);
        }
      }

      // Request permission for push notifications
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          // Subscribe to push notifications
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
          });
          // Send subscription to server
          await fetch('/api/notifications/subscribe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(subscription),
          });
        }
      }

      console.log('Service Worker registered successfully:', registration.scope);
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
}

// Helper function to check if the app is running in offline mode
export function isOffline(): boolean {
  return !navigator.onLine;
}

// Helper function to check if the app is installed (PWA)
export function isPWA(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone ||
    document.referrer.includes('android-app://');
}

// Helper function to prompt PWA installation
export async function promptInstall(): Promise<void> {
  const deferredPrompt = (window as any).deferredPrompt;
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User ${outcome} the PWA installation`);
    (window as any).deferredPrompt = null;
  }
}

// Listen for PWA installation event
window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  (window as any).deferredPrompt = event;
}); 