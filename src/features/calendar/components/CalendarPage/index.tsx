/**
 * @fileoverview Calendar page component with offline support
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

'use client';

import React from 'react';
import { useCalendar } from '../../hooks/use-calendar';
import { OfflineStatus } from '@/lib/offline/components/OfflineStatus';
import { Calendar } from '../Calendar';
import { EventDialog } from '../EventDialog';
import { Button } from '@/components/ui/Button/Button';
import { Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import type { CalendarEvent, CreateEventData } from '../../types';

export function CalendarPage() {
  const { events, isLoading, error, createEvent, updateEvent, deleteEvent, isOnline } = useCalendar();
  const [selectedEvent, setSelectedEvent] = React.useState<CalendarEvent | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const { toast } = useToast();

  const handleCreateEvent = async (data: CreateEventData) => {
    try {
      await createEvent(data);
      setIsDialogOpen(false);
      toast({
        title: 'Event created',
        description: isOnline
          ? 'Event has been created successfully'
          : 'Event will be synced when you are back online',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create event. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateEvent = async (id: string, data: Partial<CalendarEvent>) => {
    try {
      await updateEvent(id, data);
      setSelectedEvent(null);
      setIsDialogOpen(false);
      toast({
        title: 'Event updated',
        description: isOnline
          ? 'Event has been updated successfully'
          : 'Changes will be synced when you are back online',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update event. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await deleteEvent(id);
      setSelectedEvent(null);
      setIsDialogOpen(false);
      toast({
        title: 'Event deleted',
        description: isOnline
          ? 'Event has been deleted successfully'
          : 'Deletion will be synced when you are back online',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete event. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (error) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold">Error loading calendar</h2>
          <p className="text-sm text-gray-500">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Calendar</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Event
        </Button>
      </div>

      <Calendar
        events={events}
        isLoading={isLoading}
        onEventClick={(event) => {
          setSelectedEvent(event);
          setIsDialogOpen(true);
        }}
      />

      <EventDialog
        event={selectedEvent}
        isOpen={isDialogOpen}
        onClose={() => {
          setSelectedEvent(null);
          setIsDialogOpen(false);
        }}
        onCreate={handleCreateEvent}
        onUpdate={handleUpdateEvent}
        onDelete={handleDeleteEvent}
      />

      <OfflineStatus module="calendar" />
    </div>
  );
} 