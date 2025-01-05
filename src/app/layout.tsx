/**
 * @writecarenotes.com
 * @fileoverview Root layout component
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Root layout component that provides the base structure for
 * the application, including navigation, offline status, and
 * theme provider. Handles service worker registration and
 * offline capabilities.
 */

import React, { useEffect } from 'react';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { Toaster } from '@/components/ui/toaster';
import { Navigation } from '@/components/navigation/Navigation';
import { OfflineStatus } from '@/lib/offline/components/OfflineStatus';
import { register } from '@/lib/registerServiceWorker';

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  useEffect(() => {
    register({
      onSuccess: (registration) => {
        console.log('Service worker registered successfully');
      },
      onUpdate: (registration) => {
        console.log('New content is available; please refresh');
      }
    });
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Write Care Notes</title>
        <meta name="description" content="Enterprise-grade care home management platform" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0070f3" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen bg-background">
            <Navigation />
            <main className="container mx-auto px-4 py-8">
              {children}
            </main>
            <div className="fixed bottom-4 right-4 z-50 w-80">
              <OfflineStatus />
            </div>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
} 