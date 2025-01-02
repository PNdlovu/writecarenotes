/**
 * @writecarenotes.com
 * @fileoverview Regional domiciliary care layout
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Region-specific layout for domiciliary care module, handling
 * regional compliance, language support, and regulatory requirements.
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
import { RegionBadge } from '@/components/ui/RegionBadge';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useTheme } from '@/hooks/useTheme';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';
import { getRegionalConfig } from '@/lib/regional-config';

interface LayoutProps {
  children: ReactNode;
  params: {
    region: string;
  };
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const config = getRegionalConfig(params.region);
  
  return {
    title: `${config.labels.domiciliary} | Write Care Notes`,
    description: config.descriptions.domiciliary,
    viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  };
}

export default async function DomiciliaryLayout({ children, params }: LayoutProps) {
  const session = await auth();
  const { trackPageView } = useAnalytics();
  const { theme } = useTheme();
  const { isOffline } = useOfflineStatus();
  const config = getRegionalConfig(params.region);

  // Track page view with region
  trackPageView('domiciliary_module', { region: params.region });

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg">{config.messages.signInRequired}</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background ${theme}`}>
      <ErrorBoundary>
        <TopBar
          title={config.labels.domiciliary}
          user={session.user}
          module="domiciliary"
        >
          <RegionBadge region={params.region} className="ml-2" />
        </TopBar>

        <main className="container mx-auto px-4 pb-20 pt-16 md:px-6 lg:pb-6">
          <Suspense fallback={<Skeleton className="h-32" />}>
            {children}
          </Suspense>
        </main>

        <BottomNavigation
          items={[
            { 
              label: config.labels.visits, 
              icon: 'calendar', 
              href: `/${params.region}/domiciliary/visits` 
            },
            { 
              label: config.labels.clients, 
              icon: 'users', 
              href: `/${params.region}/domiciliary/clients` 
            },
            { 
              label: config.labels.staff, 
              icon: 'briefcase', 
              href: `/${params.region}/domiciliary/staff` 
            },
            { 
              label: config.labels.reports, 
              icon: 'chart-bar', 
              href: `/${params.region}/domiciliary/reports` 
            },
          ]}
        />

        {isOffline && (
          <Alert 
            variant="warning" 
            className="fixed bottom-16 left-0 right-0 z-50"
          >
            {config.messages.offlineWarning}
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