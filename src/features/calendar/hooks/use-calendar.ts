import { useState, useEffect } from 'react';
import { calendarApi } from '../api/calendar-service';
import type { CalendarEvent } from '../types';

export function useCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async (params?: { startDate?: string; endDate?: string }) => {
    try {
      setIsLoading(true);
      const response = await calendarApi.getEvents(params);
      setEvents(response);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const createEvent = async (data: Parameters<typeof calendarApi.createEvent>[0]) => {
    try {
      const newEvent = await calendarApi.createEvent(data);
      setEvents(prev => [...prev, newEvent]);
      return newEvent;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const updateEvent = async (id: string, data: Parameters<typeof calendarApi.updateEvent>[1]) => {
    try {
      const updatedEvent = await calendarApi.updateEvent(id, data);
      setEvents(prev => prev.map(event => event.id === id ? updatedEvent : event));
      return updatedEvent;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      await calendarApi.deleteEvent(id);
      setEvents(prev => prev.filter(event => event.id !== id));
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return {
    events,
    isLoading,
    error,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
  };
}
