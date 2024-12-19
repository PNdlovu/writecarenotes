import { StaffMember } from '@/features/staff/types';

export interface ScheduleShift {
  id: string;
  startTime: Date;
  endTime: Date;
  staffId: string;
  notes?: string;
}

export interface ScheduleShiftWithStaff extends ScheduleShift {
  staff: StaffMember;
}

interface BatchShiftData {
  templateId?: string;
  staffIds: string[];
  startTime: string;
  endTime: string;
  daysOfWeek: number[];
  notes: string;
}

interface StaffAvailability {
  id: string;
  staffId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  type: 'PREFERRED' | 'UNAVAILABLE';
}

interface SwapRequest {
  id: string;
  requestingShiftId: string;
  targetShiftId?: string;
  requestingStaffId: string;
  targetStaffId?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  notes: string;
  createdAt: string;
}

class ScheduleAPI {
  async getShifts(startDate: string, endDate: string): Promise<ScheduleShiftWithStaff[]> {
    const response = await fetch(
      `/api/shifts?startDate=${startDate}&endDate=${endDate}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch shifts');
    }
    return response.json();
  }

  async createShift(shiftData: Omit<ScheduleShift, 'id'>): Promise<ScheduleShift> {
    const response = await fetch('/api/shifts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(shiftData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create shift');
    }
    return response.json();
  }

  async createBatchShifts(data: BatchShiftData): Promise<any> {
    const response = await fetch('/api/schedule/batch-shifts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create batch shifts');
    }
    return response.json();
  }

  async getStaffAvailability(staffId: string): Promise<StaffAvailability[]> {
    const response = await fetch(`/api/schedule/staff/${staffId}/availability`);
    if (!response.ok) {
      throw new Error('Failed to fetch staff availability');
    }
    return response.json();
  }

  async addAvailabilitySlot(data: Omit<StaffAvailability, 'id'>): Promise<StaffAvailability> {
    const response = await fetch('/api/schedule/availability', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to add availability slot');
    }
    return response.json();
  }

  async deleteAvailabilitySlot(slotId: string): Promise<void> {
    const response = await fetch(`/api/schedule/availability/${slotId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete availability slot');
    }
  }

  async getEligibleSwapShifts(
    shiftId: string,
    targetStaffId: string
  ): Promise<ScheduleShiftWithStaff[]> {
    const response = await fetch(
      `/api/schedule/shifts/${shiftId}/eligible-swaps?targetStaffId=${targetStaffId}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch eligible swap shifts');
    }
    return response.json();
  }

  async createSwapRequest(data: {
    requestingShiftId: string;
    targetShiftId?: string;
    targetStaffId?: string;
    notes: string;
  }): Promise<SwapRequest> {
    const response = await fetch('/api/schedule/swap-requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create swap request');
    }
    return response.json();
  }

  async getSwapRequests(
    staffId: string,
    status?: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  ): Promise<SwapRequest[]> {
    const url = new URL('/api/schedule/swap-requests', window.location.origin);
    url.searchParams.append('staffId', staffId);
    if (status) {
      url.searchParams.append('status', status);
    }
    
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error('Failed to fetch swap requests');
    }
    return response.json();
  }

  async respondToSwapRequest(
    requestId: string,
    accept: boolean
  ): Promise<SwapRequest> {
    const response = await fetch(
      `/api/schedule/swap-requests/${requestId}/${accept ? 'accept' : 'reject'}`,
      {
        method: 'POST',
      }
    );
    if (!response.ok) {
      throw new Error('Failed to respond to swap request');
    }
    return response.json();
  }
}

export const scheduleAPI = new ScheduleAPI();
