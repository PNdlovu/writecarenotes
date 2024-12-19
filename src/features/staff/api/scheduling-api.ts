import { StaffSchedule, ShiftSwap, TimeOffRequest } from '../types';

export class SchedulingAPI {
  private baseUrl = '/api/staff/scheduling';

  async getSchedules(startDate: string, endDate: string): Promise<StaffSchedule[]> {
    const response = await fetch(`${this.baseUrl}?start=${startDate}&end=${endDate}`);
    return response.json();
  }

  async createSchedule(data: Omit<StaffSchedule, 'id'>): Promise<StaffSchedule> {
    const response = await fetch(`${this.baseUrl}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async requestShiftSwap(data: Omit<ShiftSwap, 'id'>): Promise<ShiftSwap> {
    const response = await fetch(`${this.baseUrl}/swap`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async requestTimeOff(data: Omit<TimeOffRequest, 'id'>): Promise<TimeOffRequest> {
    const response = await fetch(`${this.baseUrl}/time-off`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }
}

export const schedulingAPI = new SchedulingAPI();


