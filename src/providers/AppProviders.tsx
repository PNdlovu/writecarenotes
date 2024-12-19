import React from 'react';
import { ThemeProvider } from '@/components/ui/ThemeProvider';
import { AccessibilityProvider } from '@/lib/accessibility/AccessibilityProvider';
import { OfflineProvider } from '@/lib/offline/OfflineProvider';
import { I18nProviderClient } from '@/lib/i18n/config';
import { Toaster } from '@/components/ui/toaster';
import { OfflineStatus } from '@/components/offline/OfflineStatus';
import { DocumentProvider } from '../features/documents/providers/DocumentProvider';

interface AppProvidersProps {
  children: React.ReactNode;
  locale: string;
}

export function AppProviders({ children, locale }: AppProvidersProps) {
  return (
    <I18nProviderClient locale={locale}>
      <ThemeProvider>
        <AccessibilityProvider>
          <OfflineProvider>
            <DocumentProvider>
              {children}
            </DocumentProvider>
            <Toaster />
            <OfflineStatus />
          </OfflineProvider>
        </AccessibilityProvider>
      </ThemeProvider>
    </I18nProviderClient>
  );
}


