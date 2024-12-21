'use client';

import { AppProviders } from './AppProviders';
import { useEffect, useState } from 'react';
import { getBrowserLanguage } from '@/lib/i18n/config';

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [locale, setLocale] = useState('en');

  useEffect(() => {
    // Get browser language on mount
    setLocale(getBrowserLanguage());
    setMounted(true);

    // Register service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/workers/sw.js').catch(error => {
          console.error('Service worker registration failed:', error);
        });
      });
    }
  }, []);

  // Prevent flash of unstyled content
  if (!mounted) {
    return null;
  }

  return (
    <AppProviders locale={locale}>
      {children}
    </AppProviders>
  );
}


