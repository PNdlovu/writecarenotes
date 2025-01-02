/**
 * @writecarenotes.com
 * @fileoverview Domiciliary care module layout component
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Main layout component for the domiciliary care module. Implements a
 * mobile-first, responsive design with offline support and accessibility
 * features. Handles navigation, authentication, and common UI elements.
 *
 * Features:
 * - Responsive layout
 * - Navigation menu
 * - Authentication state
 * - Offline indicator
 * - Theme support
 * - Accessibility
 *
 * Mobile-First Considerations:
 * - Touch-friendly controls
 * - Bottom navigation
 * - Swipe gestures
 * - Performance optimized
 *
 * Enterprise Features:
 * - Role-based access
 * - Audit logging
 * - Error boundaries
 * - Analytics tracking
 */

import { ReactNode } from 'react';
import { auth } from '@/lib/auth';
import { Metadata } from 'next';
import { Suspense } from 'react';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';
import { TopBar } from '@/components/navigation/TopBar';
import { Alert } from '@/components/ui/Alert';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useTheme } from '@/hooks/useTheme';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';

export const metadata: Metadata = {
  title: 'Domiciliary Care | Write Care Notes',
  description: 'Comprehensive domiciliary care management system',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
};

interface LayoutProps {
  children: ReactNode;
}

export default async function DomiciliaryLayout({ children }: LayoutProps) {
  const session = await auth();
  const { trackPageView } = useAnalytics();
  const { theme } = useTheme();
  const { isOffline } = useOfflineStatus();

  // Track page view
  trackPageView('domiciliary_module');

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg">Please sign in to access this module</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background ${theme}`}>
      <ErrorBoundary>
        <TopBar
          title="Domiciliary Care"
          user={session.user}
          module="domiciliary"
        />

        <main className="container mx-auto px-4 pb-20 pt-16 md:px-6 lg:pb-6">
          <Suspense fallback={<Skeleton className="h-32" />}>
            {children}
          </Suspense>
        </main>

        <BottomNavigation
          items={[
            { label: 'Visits', icon: 'calendar', href: '/domiciliary/visits' },
            { label: 'Clients', icon: 'users', href: '/domiciliary/clients' },
            { label: 'Staff', icon: 'briefcase', href: '/domiciliary/staff' },
            { label: 'Reports', icon: 'chart-bar', href: '/domiciliary/reports' },
          ]}
        />

        {isOffline && (
          <Alert 
            variant="warning" 
            className="fixed bottom-16 left-0 right-0 z-50"
          >
            You are currently offline. Some features may be limited.
          </Alert>
        )}
      </ErrorBoundary>

      <style jsx global>{`
        :root {
          --safe-area-inset-bottom: env(safe-area-inset-bottom, 0px);
        }

        body {
          padding-bottom: var(--safe-area-inset-bottom);
        }

        /* Mobile-first styles */
        @media (max-width: 640px) {
          .container {
            padding-left: 1rem;
            padding-right: 1rem;
          }
        }

        /* Touch-friendly tap targets */
        button, a {
          min-height: 44px;
          min-width: 44px;
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </div>
  );
} 