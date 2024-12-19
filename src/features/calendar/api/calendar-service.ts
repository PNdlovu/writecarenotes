import type { CalendarEvent, CreateEventData } from '../types';

export const calendarApi = {
  async getEvents(params?: { startDate?: string; endDate?: string }): Promise<CalendarEvent[]> {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);

    const response = await fetch(`/api/calendar?${searchParams.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch events');
    }
    return response.json();
  },

  async createEvent(data: CreateEventData): Promise<CalendarEvent> {
    const response = await fetch('/api/calendar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create event');
    }
    return response.json();
  },

  async updateEvent(id: string, data: Partial<CalendarEvent>): Promise<CalendarEvent> {
    const response = await fetch(`/api/calendar/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update event');
    }
    return response.json();
  },

  async deleteEvent(id: string): Promise<void> {
    const response = await fetch(`/api/calendar/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete event');
    }
  },
};
