/**
 * @writecarenotes.com
 * @fileoverview Resident API service
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Service for handling resident-related API calls including fetching,
 * creating, updating, and deleting residents.
 */

import { Resident } from '../types';

export const residentApi = {
  getResidents: async (): Promise<Resident[]> => {
    const response = await fetch('/api/residents');
    if (!response.ok) {
      throw new Error('Failed to fetch residents');
    }
    return response.json();
  },

  getResident: async (id: string): Promise<Resident> => {
    const response = await fetch(`/api/residents/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch resident');
    }
    return response.json();
  },

  createResident: async (data: Partial<Resident>): Promise<Resident> => {
    const response = await fetch('/api/residents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create resident');
    }
    return response.json();
  },

  updateResident: async (id: string, data: Partial<Resident>): Promise<Resident> => {
    const response = await fetch(`/api/residents/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update resident');
    }
    return response.json();
  },

  deleteResident: async (id: string): Promise<void> => {
    const response = await fetch(`/api/residents/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete resident');
    }
  },
}; 