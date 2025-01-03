/**
 * @writecarenotes.com
 * @fileoverview API service for territories
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * API service for managing territory data, including CRUD operations
 * and territory-specific functionality.
 */

import type { Territory } from '@/features/territory/types';

// TODO: Replace with actual API calls
export const territoryAPI = {
  getTerritories: async (): Promise<Territory[]> => {
    // Mock data for development
    return [
      {
        id: '1',
        name: 'North London',
        staff: [
          {
            id: '1',
            name: 'John Doe',
            location: { lat: 51.5074, lng: -0.1278 }
          }
        ],
        clients: [
          {
            id: '1',
            name: 'Jane Smith',
            location: { lat: 51.5174, lng: -0.1378 }
          }
        ],
        area: 25,
        averageTravelTime: 30
      }
    ];
  },

  getTerritory: async (id: string): Promise<Territory> => {
    const territories = await territoryAPI.getTerritories();
    const territory = territories.find(t => t.id === id);
    if (!territory) throw new Error('Territory not found');
    return territory;
  },

  createTerritory: async (data: Omit<Territory, 'id'>): Promise<Territory> => {
    return {
      id: Math.random().toString(),
      ...data
    };
  },

  updateTerritory: async (id: string, data: Partial<Territory>): Promise<Territory> => {
    const territory = await territoryAPI.getTerritory(id);
    return {
      ...territory,
      ...data
    };
  },

  deleteTerritory: async (id: string): Promise<void> => {
    // Mock delete operation
  }
}; 
