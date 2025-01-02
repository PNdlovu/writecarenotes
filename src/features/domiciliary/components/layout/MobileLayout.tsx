/**
 * @writecarenotes.com
 * @fileoverview Mobile-first layout for domiciliary care components
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Mobile-first layout component providing responsive design and navigation
 * for domiciliary care features. Supports offline functionality and PWA features.
 */

import { useState } from 'react';
import { useRouter } from 'next/router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/icon-button';
import { useOfflineStatus } from '@/features/offline/hooks/useOfflineStatus';
import { useSync } from '@/features/sync/hooks/useSync';
import type { ReactNode } from 'react';

interface MobileLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  backUrl?: string;
  actions?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
  }[];
}

export const MobileLayout = ({
  children,
  title,
  subtitle,
  backUrl,
  actions
}: MobileLayoutProps) => {
  const router = useRouter();
  const { isOffline } = useOfflineStatus();
  const { pendingSyncs } = useSync();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {backUrl && (
                <IconButton
                  icon="arrow-left"
                  variant="ghost"
                  onClick={() => router.push(backUrl)}
                  aria-label="Go back"
                />
              )}
              <div>
                <h1 className="text-lg font-medium">{title}</h1>
                {subtitle && (
                  <p className="text-sm text-gray-500">{subtitle}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isOffline && (
                <span className="px-2 py-1 text-xs font-medium text-amber-700 bg-amber-50 rounded-full">
                  Offline
                </span>
              )}
              {pendingSyncs > 0 && (
                <span className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-full">
                  Syncing ({pendingSyncs})
                </span>
              )}
              <IconButton
                icon="menu"
                variant="ghost"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {actions && actions.length > 0 && (
          <div className="px-4 py-2 border-t flex gap-2 overflow-x-auto">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'primary'}
                onClick={action.onClick}
                className="whitespace-nowrap"
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="p-4">
        <div className="max-w-lg mx-auto">
          {children}
        </div>
      </main>

      {/* Navigation Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className="absolute right-0 top-0 bottom-0 w-64 bg-white p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-medium">Menu</h2>
              <IconButton
                icon="x"
                variant="ghost"
                onClick={() => setIsMenuOpen(false)}
                aria-label="Close menu"
              />
            </div>
            <nav className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  router.push('/domiciliary/visits');
                  setIsMenuOpen(false);
                }}
              >
                Visits
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  router.push('/domiciliary/clients');
                  setIsMenuOpen(false);
                }}
              >
                Clients
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  router.push('/domiciliary/routes');
                  setIsMenuOpen(false);
                }}
              >
                Routes
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  router.push('/domiciliary/handover');
                  setIsMenuOpen(false);
                }}
              >
                Handover
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  router.push('/domiciliary/compliance');
                  setIsMenuOpen(false);
                }}
              >
                Compliance
              </Button>
            </nav>
          </div>
        </div>
      )}

      {/* Offline Banner */}
      {isOffline && (
        <div className="fixed bottom-0 left-0 right-0 bg-amber-50 p-2 text-center text-sm text-amber-700">
          You're working offline. Changes will sync when you're back online.
        </div>
      )}
    </div>
  );
}; 