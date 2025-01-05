/**
 * @writecarenotes.com
 * @fileoverview Top bar navigation component
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Mobile-first top bar component with responsive design and touch-friendly
 * controls. Includes user profile, notifications, and quick actions.
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '@/components/ui/Icons';
import { Avatar } from '@/components/ui/Avatar/Avatar';
import { Badge } from '@/components/ui/Badge/Badge';
import { Command } from '@/components/ui/Command';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';
import { useNotifications } from '@/hooks/useNotifications';

interface User {
  name: string;
  email: string;
  image?: string;
  role: string;
}

interface TopBarProps {
  title: string;
  user: User;
  module: string;
}

export function TopBar({ title, user, module }: TopBarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { trackEvent } = useAnalytics();
  const { isOffline } = useOfflineStatus();
  const { notifications, markAsRead } = useNotifications();

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
    trackEvent('top_bar_menu_toggle', { state: !isMenuOpen });
  };

  const handleSearchToggle = () => {
    setIsSearchOpen(!isSearchOpen);
    trackEvent('top_bar_search_toggle', { state: !isSearchOpen });
  };

  const handleNotificationClick = () => {
    trackEvent('top_bar_notifications_click');
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-50 bg-white shadow-sm dark:bg-gray-900">
      <div className="safe-area-top">
        <div className="flex h-16 items-center justify-between px-4">
          {/* Left section */}
          <div className="flex items-center">
            <button
              onClick={handleMenuToggle}
              className="mr-4 rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Menu"
            >
              <Icons.menu className="h-6 w-6" />
            </button>
            
            <h1 className="text-lg font-semibold">{title}</h1>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handleSearchToggle}
              className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Search"
            >
              <Icons.search className="h-6 w-6" />
            </button>

            <button
              onClick={handleNotificationClick}
              className="relative rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Notifications"
            >
              <Icons.bell className="h-6 w-6" />
              {unreadCount > 0 && (
                <Badge
                  variant="error"
                  className="absolute -right-1 -top-1"
                >
                  {unreadCount}
                </Badge>
              )}
            </button>

            <button
              onClick={handleMenuToggle}
              className="flex items-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="User menu"
            >
              <Avatar
                src={user.image}
                alt={user.name}
                size="sm"
                className="mr-2"
              />
              <span className="hidden text-sm font-medium md:block">
                {user.name}
              </span>
            </button>
          </div>
        </div>

        {/* Search bar */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-gray-200 px-4 py-2 dark:border-gray-700"
            >
              <Command>
                <Command.Input 
                  placeholder={`Search in ${module}...`}
                  className="h-9 w-full"
                />
              </Command>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Menu overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setIsMenuOpen(false)}
            />
            
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3 }}
              className="fixed bottom-0 left-0 top-0 w-64 bg-white p-4 shadow-lg dark:bg-gray-900"
            >
              {/* Menu content */}
              <div className="flex flex-col h-full">
                <div className="mb-6 flex items-center">
                  <Avatar
                    src={user.image}
                    alt={user.name}
                    size="lg"
                    className="mr-4"
                  />
                  <div>
                    <h2 className="font-semibold">{user.name}</h2>
                    <p className="text-sm text-gray-500">{user.role}</p>
                  </div>
                </div>

                {/* Menu items */}
                <nav className="flex-1">
                  {/* Add menu items here */}
                </nav>

                {/* Bottom section */}
                <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      trackEvent('top_bar_menu_settings_click');
                    }}
                    className="flex w-full items-center rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <Icons.settings className="mr-3 h-5 w-5" />
                    <span>Settings</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style jsx>{`
        .safe-area-top {
          padding-top: env(safe-area-inset-top, 0px);
          background-color: inherit;
        }

        /* Offline state */
        ${isOffline ? `
          header {
            opacity: 0.8;
          }
          
          button {
            pointer-events: ${isOffline ? 'none' : 'auto'};
          }
        ` : ''}

        /* Large screen adjustments */
        @media (min-width: 1024px) {
          .menu-button {
            display: none;
          }
        }

        /* Touch device optimizations */
        @media (hover: none) {
          button {
            -webkit-tap-highlight-color: transparent;
          }
          
          button:active {
            background-color: rgba(0, 0, 0, 0.05);
          }
        }
      `}</style>
    </header>
  );
} 
