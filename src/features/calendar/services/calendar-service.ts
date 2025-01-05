import { apiClient } from '@/lib/api-client';
import type { CalendarEvent, CreateEventData } from '../types';

class CalendarService {
  private readonly baseUrl = '/api/calendar';

  async getEvents(): Promise<CalendarEvent[]> {
    const { data } = await apiClient.get<{ data: CalendarEvent[] }>(`${this.baseUrl}/events`);
    return data.data;
  }

  async createEvent(data: CreateEventData): Promise<CalendarEvent> {
    const response = await apiClient.post<{ data: CalendarEvent }>(`${this.baseUrl}/events`, data);
    return response.data.data;
  }

  async updateEvent(id: string, data: Partial<CreateEventData>): Promise<CalendarEvent> {
    const response = await apiClient.patch<{ data: CalendarEvent }>(`${this.baseUrl}/events/${id}`, data);
    return response.data.data;
  }

  async deleteEvent(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/events/${id}`);
  }
}

export const calendarService = new CalendarService();
