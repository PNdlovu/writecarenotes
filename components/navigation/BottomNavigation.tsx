/**
 * @writecarenotes.com
 * @fileoverview Bottom navigation component
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Mobile-first bottom navigation component with touch-friendly controls
 * and smooth transitions.
 */

'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Icons } from '@/components/ui/Icons';
import { Badge } from '@/components/ui/Badge/Badge';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';

interface NavigationItem {
  label: string;
  icon: keyof typeof Icons;
  href: string;
  badge?: number;
}

interface BottomNavigationProps {
  items: NavigationItem[];
}

export function BottomNavigation({ items }: BottomNavigationProps) {
  const pathname = usePathname();
  const { trackEvent } = useAnalytics();
  const { isOffline } = useOfflineStatus();

  const handleNavigation = (label: string) => {
    trackEvent('bottom_navigation_click', { item: label });
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-lg dark:bg-gray-900">
      <div className="safe-area-bottom flex h-16 items-center justify-around">
        {items.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = Icons[item.icon];
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => handleNavigation(item.label)}
              className={`relative flex h-full w-full flex-col items-center justify-center px-2 ${
                isActive
                  ? 'text-primary'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
              aria-label={item.label}
              role="button"
              tabIndex={0}
            >
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1.1 : 1,
                  y: isActive ? -2 : 0,
                }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                <Icon
                  className={`h-6 w-6 ${isActive ? 'text-primary' : ''}`}
                  aria-hidden="true"
                />
                
                {item.badge && (
                  <Badge
                    variant="error"
                    className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center"
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </Badge>
                )}
              </motion.div>

              <motion.span
                initial={false}
                animate={{
                  scale: isActive ? 1 : 0.9,
                  opacity: isActive ? 1 : 0.7,
                }}
                className="mt-1 text-xs font-medium"
              >
                {item.label}
              </motion.span>

              {isActive && (
                <motion.div
                  layoutId="bottomNav-indicator"
                  className="absolute bottom-0 h-0.5 w-12 bg-primary"
                  transition={{ duration: 0.3 }}
                />
              )}
            </Link>
          );
        })}
      </div>

      <style jsx>{`
        .safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom, 0px);
          background-color: inherit;
        }

        /* Haptic feedback for touch devices */
        @media (hover: none) {
          a {
            -webkit-tap-highlight-color: transparent;
          }
          
          a:active {
            background-color: rgba(0, 0, 0, 0.05);
          }
        }

        /* Hide on larger screens */
        @media (min-width: 1024px) {
          nav {
            display: none;
          }
        }

        /* Offline state */
        ${isOffline ? `
          nav {
            opacity: 0.8;
          }
          
          a {
            pointer-events: ${isOffline ? 'none' : 'auto'};
          }
        ` : ''}
      `}</style>
    </nav>
  );
} 