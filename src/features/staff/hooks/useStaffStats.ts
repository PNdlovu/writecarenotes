/**
 * @writecarenotes.com
 * @fileoverview Hook for managing staff statistics
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/useToast';

interface StaffStats {
  activeStaff: number;
  availableToday: number;
  expiringDocuments: number;
}

export function useStaffStats(organizationId: string) {
  const [stats, setStats] = useState<StaffStats>({
    activeStaff: 0,
    availableToday: 0,
    expiringDocuments: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/staff/domiciliary/stats?organizationId=${organizationId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch staff statistics');
      }

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching staff stats:', error);
      showToast('error', 'Failed to fetch staff statistics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [organizationId]);

  return {
    stats,
    isLoading,
    refetch: fetchStats
  };
} 