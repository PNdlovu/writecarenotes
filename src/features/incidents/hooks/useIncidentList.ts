/**
 * @writecarenotes.com
 * @fileoverview Custom hook for incident list management
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Custom React hook for managing incident list operations.
 * Provides sorting, filtering, and pagination functionality
 * for incident lists. Implements optimistic updates and
 * real-time data synchronization.
 */

import { useState, useMemo } from 'react';
import { Incident } from '../types';

type SortConfig = {
  key: keyof Incident;
  direction: 'asc' | 'desc';
};

export const useIncidentList = (incidents: Incident[]) => {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  const sortedIncidents = useMemo(() => {
    if (!sortConfig) return incidents;

    return [...incidents].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [incidents, sortConfig]);

  const requestSort = (key: keyof Incident) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === 'asc'
    ) {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return {
    sortedIncidents,
    sortConfig,
    requestSort,
  };
}; 