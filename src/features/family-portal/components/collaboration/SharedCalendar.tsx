/**
 * @fileoverview Shared Family Calendar Component
 * Allows family members to coordinate care activities and events
 */

import React, { useState } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button/Button";
import { Input } from "@/components/ui/Input/Input";
import { Badge } from "@/components/ui/Badge/Badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog/Dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select/Select";
import { useSharedCalendar } from '../../hooks/useSharedCalendar';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { format } from 'date-fns';

interface SharedCalendarProps {
  residentId: string;
  familyMemberId: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  type: 'visit' | 'appointment' | 'activity' | 'care' | 'other';
  attendees: Array<{
    id: string;
    name: string;
    avatar?: string;
    role: string;
  }>;
  location?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: Date;
  };
}

export const SharedCalendar: React.FC<SharedCalendarProps> = ({
  residentId,
  familyMemberId,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState<string | null>(null);
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');

  const {
    events,
    isLoading,
    addEvent,
    updateEvent,
    deleteEvent,
    filterEvents,
  } = useSharedCalendar({ residentId, familyMemberId });

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    filterEvents(date);
  };

  const handleAddEvent = async (event: Omit<CalendarEvent, 'id'>) => {
    await addEvent(event);
    setShowEventDialog(false);
  };

  const handleUpdateEvent = async (id: string, updates: Partial<CalendarEvent>) => {
    await updateEvent(id, updates);
    setShowEventDetails(null);
  };

  const handleDeleteEvent = async (id: string) => {
    await deleteEvent(id);
    setShowEventDetails(null);
  };

  const getDayEvents = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const renderEventBadge = (event: CalendarEvent) => {
    const badgeVariants = {
      visit: 'default',
      appointment: 'secondary',
      activity: 'outline',
      care: 'destructive',
      other: 'default',
    };

    return (
      <Badge variant={badgeVariants[event.type]} className="mr-2">
        {event.type}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Shared Calendar</h2>
          <p className="text-muted-foreground">
            Coordinate care activities and events with family members
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={view} onValueChange={(v: 'month' | 'week' | 'day') => setView(v)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="day">Day</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setShowEventDialog(true)}>
            Add Event
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2 p-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            className="rounded-md border"
          />
        </Card>

        {/* Events List */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4">
            Events for {format(selectedDate, 'MMMM d, yyyy')}
          </h3>
          <ScrollArea className="h-[500px]">
            <div className="space-y-4">
              {getDayEvents(selectedDate).map((event) => (
                <Card
                  key={event.id}
                  className="p-3 cursor-pointer hover:bg-accent"
                  onClick={() => setShowEventDetails(event.id)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        {renderEventBadge(event)}
                        <h4 className="font-semibold">{event.title}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {format(new Date(event.start), 'h:mm a')} - 
                        {format(new Date(event.end), 'h:mm a')}
                      </p>
                      {event.location && (
                        <p className="text-sm text-muted-foreground">
                          📍 {event.location}
                        </p>
                      )}
                    </div>
                    <Badge variant={
                      event.status === 'completed' ? 'default' :
                      event.status === 'in-progress' ? 'secondary' :
                      event.status === 'cancelled' ? 'destructive' :
                      'outline'
                    }>
                      {event.status}
                    </Badge>
                  </div>
                  {event.attendees.length > 0 && (
                    <div className="mt-2">
                      <div className="flex -space-x-2">
                        {event.attendees.map((attendee) => (
                          <Avatar key={attendee.id} className="border-2 border-background">
                            <AvatarImage src={attendee.avatar} alt={attendee.name} />
                            <AvatarFallback>
                              {attendee.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </ScrollArea>
        </Card>
      </div>

      {/* Add Event Dialog */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
            <DialogDescription>
              Create a new event in the shared calendar
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input placeholder="Event title" />
            </div>
            <div>
              <label className="text-sm font-medium">Type</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="visit">Visit</SelectItem>
                  <SelectItem value="appointment">Appointment</SelectItem>
                  <SelectItem value="activity">Activity</SelectItem>
                  <SelectItem value="care">Care</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input placeholder="Event description" />
            </div>
            <div>
              <label className="text-sm font-medium">Location</label>
              <Input placeholder="Event location" />
            </div>
            <div>
              <label className="text-sm font-medium">Attendees</label>
              {/* Add attendee selection component */}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEventDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleAddEvent}>
              Add Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Event Details Dialog */}
      <Dialog
        open={showEventDetails !== null}
        onOpenChange={() => setShowEventDetails(null)}
      >
        <DialogContent className="sm:max-w-[500px]">
          {showEventDetails && (
            <div>
              {/* Event details content */}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};


