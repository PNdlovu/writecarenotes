/**
 * @fileoverview Calendar Provider Component
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/Toast/useToast';
import type { CalendarEvent, CreateEventData } from '../types';
import { calendarService } from '../services/calendar-service';

interface CalendarContextType {
  events: CalendarEvent[];
  isLoading: boolean;
  error: Error | null;
  createEvent: (data: CreateEventData) => Promise<void>;
  updateEvent: (id: string, data: Partial<CalendarEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  isOnline: boolean;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export function CalendarProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState(true);

  // Monitor online status
  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch events
  const { data: events = [], isLoading, error } = useQuery({
    queryKey: ['calendar-events'],
    queryFn: calendarService.getEvents,
  });

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: calendarService.createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      toast({
        title: 'Event created',
        description: isOnline
          ? 'Event has been created successfully'
          : 'Event will be synced when you are back online',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create event. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Update event mutation
  const updateEventMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CalendarEvent> }) =>
      calendarService.updateEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      toast({
        title: 'Event updated',
        description: isOnline
          ? 'Event has been updated successfully'
          : 'Changes will be synced when you are back online',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update event. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: calendarService.deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      toast({
        title: 'Event deleted',
        description: isOnline
          ? 'Event has been deleted successfully'
          : 'Deletion will be synced when you are back online',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete event. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const createEvent = useCallback(
    async (data: CreateEventData) => {
      await createEventMutation.mutateAsync(data);
    },
    [createEventMutation]
  );

  const updateEvent = useCallback(
    async (id: string, data: Partial<CalendarEvent>) => {
      await updateEventMutation.mutateAsync({ id, data });
    },
    [updateEventMutation]
  );

  const deleteEvent = useCallback(
    async (id: string) => {
      await deleteEventMutation.mutateAsync(id);
    },
    [deleteEventMutation]
  );

  return (
    <CalendarContext.Provider
      value={{
        events,
        isLoading,
        error,
        createEvent,
        updateEvent,
        deleteEvent,
        isOnline,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar() {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
} 