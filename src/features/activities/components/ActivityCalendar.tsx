import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { Activity } from '../types';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Calendar } from '@/components/ui/Calendar';
import { Tooltip } from '@/components/ui/Tooltip';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ActivityCalendarProps {
  activities: Activity[];
  onActivityClick: (activity: Activity) => void;
}

export function ActivityCalendar({ activities, onActivityClick }: ActivityCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getActivitiesForDay = (date: Date) => {
    return activities.filter(activity => {
      const activityDate = new Date(activity.startTime);
      return isSameDay(activityDate, date);
    });
  };

  const getDayClasses = (date: Date) => {
    const baseClasses = 'h-32 p-2 border border-gray-200 relative';
    if (!isSameMonth(date, currentDate)) {
      return `${baseClasses} bg-gray-50 text-gray-400`;
    }
    if (isSameDay(date, new Date())) {
      return `${baseClasses} bg-blue-50`;
    }
    return baseClasses;
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'RESCHEDULED': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="p-2 text-center font-medium text-gray-600 border-b"
          >
            {day}
          </div>
        ))}

        {days.map((day, dayIdx) => {
          const dayActivities = getActivitiesForDay(day);
          return (
            <div
              key={day.toString()}
              className={getDayClasses(day)}
            >
              <div className="flex justify-between">
                <span className="text-sm">{format(day, 'd')}</span>
                {dayActivities.length > 0 && (
                  <Badge variant="outline">
                    {dayActivities.length} {dayActivities.length === 1 ? 'activity' : 'activities'}
                  </Badge>
                )}
              </div>

              <div className="mt-1 space-y-1 overflow-y-auto max-h-24">
                {dayActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className={`text-xs p-1 rounded cursor-pointer truncate ${getActivityColor(activity.status)}`}
                    onClick={() => onActivityClick(activity)}
                  >
                    {format(new Date(activity.startTime), 'HH:mm')} - {activity.name}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-4">
        <div className="text-sm">Status:</div>
        {['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'RESCHEDULED'].map((status) => (
          <div key={status} className="flex items-center gap-1">
            <div className={`w-3 h-3 rounded-full ${getActivityColor(status)}`} />
            <span className="text-sm">{status.charAt(0) + status.slice(1).toLowerCase()}</span>
          </div>
        ))}
      </div>
    </Card>
  );
} 
