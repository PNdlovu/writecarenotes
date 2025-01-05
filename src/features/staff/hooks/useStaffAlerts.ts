/**
 * @writecarenotes.com
 * @fileoverview Hook for managing staff alerts
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/useToast';

export interface Alert {
  id: string;
  type: 'WARNING' | 'ERROR' | 'INFO';
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  category: 'DOCUMENT' | 'AVAILABILITY' | 'VEHICLE' | 'COMPLIANCE';
}

export function useStaffAlerts(organizationId: string) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  const fetchAlerts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/staff/domiciliary/alerts?organizationId=${organizationId}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch staff alerts');
      }

      const data = await response.json();
      setAlerts(data);
    } catch (error) {
      console.error('Error fetching staff alerts:', error);
      showToast('error', 'Failed to fetch staff alerts');
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (alertId: string) => {
    try {
      const response = await fetch(
        `/api/staff/domiciliary/alerts/${alertId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ isRead: true }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to mark alert as read');
      }

      setAlerts(alerts.map(alert => 
        alert.id === alertId ? { ...alert, isRead: true } : alert
      ));
    } catch (error) {
      console.error('Error marking alert as read:', error);
      showToast('error', 'Failed to mark alert as read');
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [organizationId]);

  return {
    alerts,
    isLoading,
    refetch: fetchAlerts,
    markAsRead
  };
} 