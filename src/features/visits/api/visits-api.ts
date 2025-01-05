/**
 * @writecarenotes.com
 * @fileoverview API service for visits
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * API service for managing visit data, including CRUD operations
 * and visit-specific functionality.
 */

import type { Visit } from '../types';

// TODO: Replace with actual API calls
export const visitsAPI = {
  getVisits: async (): Promise<Visit[]> => {
    // Mock data for development
    return [
      {
        id: '1',
        client: {
          id: '1',
          name: 'John Doe',
          location: { lat: 51.5074, lng: -0.1278 }
        },
        scheduledTime: '09:00 AM'
      },
      {
        id: '2',
        client: {
          id: '2',
          name: 'Jane Smith',
          location: { lat: 51.5074, lng: -0.1278 }
        },
        scheduledTime: '10:30 AM'
      }
    ];
  },

  getVisit: async (id: string): Promise<Visit> => {
    const visits = await visitsAPI.getVisits();
    const visit = visits.find(v => v.id === id);
    if (!visit) throw new Error('Visit not found');
    return visit;
  },

  createVisit: async (data: Omit<Visit, 'id'>): Promise<Visit> => {
    return {
      id: Math.random().toString(),
      ...data
    };
  },

  updateVisit: async (id: string, data: Partial<Visit>): Promise<Visit> => {
    const visit = await visitsAPI.getVisit(id);
    return {
      ...visit,
      ...data
    };
  },

  deleteVisit: async (id: string): Promise<void> => {
    // Mock delete operation
  }
}; 