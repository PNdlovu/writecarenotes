/**
 * @fileoverview Resident API service
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 *
 * Description:
 * API service for resident-related operations
 */

import type { Resident, CreateResidentData } from '../types';

export const residentApi = {
  async getResidents(params?: { search?: string; careLevel?: string }): Promise<Resident[]> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.careLevel) searchParams.set('careLevel', params.careLevel);
    
    const response = await fetch(`/api/residents?${searchParams.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch residents');
    }
    return response.json();
  },

  async getResidentById(id: string): Promise<Resident> {
    const response = await fetch(`/api/residents/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch resident');
    }
    return response.json();
  },

  async createResident(data: CreateResidentData): Promise<Resident> {
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

  async updateResident(id: string, data: Partial<Resident>): Promise<Resident> {
    const response = await fetch(`/api/residents/${id}`, {
      method: 'PATCH',
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

  async deleteResident(id: string): Promise<void> {
    const response = await fetch(`/api/residents/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete resident');
    }
  },
}; 