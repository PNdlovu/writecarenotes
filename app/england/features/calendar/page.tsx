'use client';

import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { format } from 'date-fns';
import { useCalendar } from '@/features/calendar/hooks/use-calendar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { events, isLoading } = useCalendar();

  const selectedDateEvents = events.filter(
    event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date?.toDateString();
    }
  );

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'appointment':
        return 'bg-blue-500/10 text-blue-500';
      case 'activity':
        return 'bg-green-500/10 text-green-500';
      case 'medication':
        return 'bg-red-500/10 text-red-500';
      case 'assessment':
        return 'bg-yellow-500/10 text-yellow-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Calendar</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Event
        </Button>
      </div>
      
      <div className="grid gap-8 md:grid-cols-[400px_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>Select a date to view events</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border shadow-sm p-4"
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-sm font-medium",
                nav: "space-x-1 flex items-center",
                nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                row: "flex w-full mt-2",
                cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                day_today: "bg-accent text-accent-foreground",
                day_outside: "text-muted-foreground opacity-50",
                day_disabled: "text-muted-foreground opacity-50",
                day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                day_hidden: "invisible",
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Events for {date ? format(date, 'PPP') : 'Selected Date'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedDateEvents.length === 0 ? (
                <p className="text-muted-foreground">No events scheduled for this date.</p>
              ) : (
                selectedDateEvents.map(event => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{event.title}</h3>
                        <Badge variant="secondary" className={getBadgeColor(event.type)}>
                          {event.type}
                        </Badge>
                      </div>
                      {event.description && (
                        <p className="text-sm text-muted-foreground">
                          {event.description}
                        </p>
                      )}
                      {event.residentName && (
                        <p className="text-sm text-muted-foreground">
                          Resident: {event.residentName}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
