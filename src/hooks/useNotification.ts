import { useState, useCallback } from 'react';
import { DatabaseManager } from '../utils/db';

interface UseNotificationOptions {
  onPermissionChange?: (permission: NotificationPermission) => void;
  onNotificationClick?: (notification: any) => void;
  onNotificationClose?: (notification: any) => void;
}

interface NotificationResult {
  permission: NotificationPermission;
  isSupported: boolean;
  requestPermission: () => Promise<void>;
  sendNotification: (title: string, options?: NotificationOptions) => Promise<void>;
  getNotifications: (status?: 'delivered' | 'clicked' | 'dismissed') => Promise<any[]>;
  clearNotifications: () => Promise<void>;
}

export function useNotification(
  options: UseNotificationOptions = {}
): NotificationResult {
  const [permission, setPermission] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied'
  );

  const db = DatabaseManager.getInstance();

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      options.onPermissionChange?.(result);
    } catch (error) {
      console.error('Failed to request notification permission:', error);
    }
  }, [options]);

  const sendNotification = useCallback(
    async (title: string, options: NotificationOptions = {}) => {
      if (!('Notification' in window) || permission !== 'granted') return;

      try {
        // Save notification to IndexedDB
        const id = await db.saveNotification({
          title,
          body: options.body || '',
          data: options.data,
        });

        // Show notification
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, {
          ...options,
          data: { ...options.data, id },
        });

        // Set up click and close handlers
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data.type === 'NOTIFICATION_CLICKED' && event.data.id === id) {
            db.updateNotificationStatus(id, 'clicked');
            options.onNotificationClick?.(event.data);
          } else if (event.data.type === 'NOTIFICATION_CLOSED' && event.data.id === id) {
            db.updateNotificationStatus(id, 'dismissed');
            options.onNotificationClose?.(event.data);
          }
        });
      } catch (error) {
        console.error('Failed to send notification:', error);
      }
    },
    [permission, options, db]
  );

  const getNotifications = useCallback(
    (status?: 'delivered' | 'clicked' | 'dismissed') => {
      return db.getNotifications(status);
    },
    [db]
  );

  const clearNotifications = useCallback(async () => {
    try {
      await db.clearOldNotifications();
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  }, [db]);

  return {
    permission,
    isSupported: 'Notification' in window,
    requestPermission,
    sendNotification,
    getNotifications,
    clearNotifications,
  };
}
