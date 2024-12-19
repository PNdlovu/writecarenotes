import { StaffMember, Training, TrainingAssignment } from '../types';

export class StaffAPI {
  private baseUrl = '/api/staff';

  async getStaffMembers(): Promise<StaffMember[]> {
    const response = await fetch(`${this.baseUrl}`);
    return response.json();
  }

  async getStaffMember(id: string): Promise<StaffMember> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    return response.json();
  }

  async createStaffMember(data: Omit<StaffMember, 'id'>): Promise<StaffMember> {
    const response = await fetch(`${this.baseUrl}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async updateStaffMember(id: string, data: Partial<StaffMember>): Promise<StaffMember> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async deleteStaffMember(id: string): Promise<void> {
    await fetch(`${this.baseUrl}/${id}`, { method: 'DELETE' });
  }
}

export const staffAPI = new StaffAPI();


