import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useI18n } from '@/lib/i18n/config';

interface ServiceWorkerState {
  isSupported: boolean;
  registration: ServiceWorkerRegistration | null;
  isOffline: boolean;
  updateAvailable: boolean;
  waitingWorker: ServiceWorker | null;
}

export function useServiceWorker() {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: 'serviceWorker' in navigator,
    registration: null,
    isOffline: !navigator.onLine,
    updateAvailable: false,
    waitingWorker: null,
  });

  const { toast } = useToast();
  const t = useI18n();

  useEffect(() => {
    if (!state.isSupported) return;

    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/workers/sw.js');
        setState(prev => ({ ...prev, registration }));

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setState(prev => ({
                ...prev,
                updateAvailable: true,
                waitingWorker: newWorker,
              }));

              toast({
                title: t('common.updateAvailable'),
                description: t('common.updateDescription'),
                action: {
                  label: t('common.update'),
                  onClick: () => {
                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                  },
                },
              });
            }
          });
        });

        // Handle controller change
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (!refreshing) {
            refreshing = true;
            window.location.reload();
          }
        });

      } catch (error) {
        console.error('Service worker registration failed:', error);
        toast({
          title: t('common.error'),
          description: t('errors.serviceWorker'),
          variant: 'destructive',
        });
      }
    };

    registerServiceWorker();

    // Handle online/offline status
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOffline: false }));
      toast({
        title: t('common.online'),
        description: t('common.onlineDescription'),
      });
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOffline: true }));
      toast({
        title: t('common.offline'),
        description: t('common.offlineDescription'),
        variant: 'destructive',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [state.isSupported]);

  // Function to update the service worker
  const update = () => {
    if (state.waitingWorker) {
      state.waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  // Function to check for updates manually
  const checkForUpdates = async () => {
    if (!state.registration) return;
    try {
      await state.registration.update();
    } catch (error) {
      console.error('Failed to check for updates:', error);
    }
  };

  return {
    ...state,
    update,
    checkForUpdates,
  };
}


