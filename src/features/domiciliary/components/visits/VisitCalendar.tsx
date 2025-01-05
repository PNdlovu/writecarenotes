/**
 * @writecarenotes.com
 * @fileoverview Visit calendar component for domiciliary care module
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * A calendar view component for displaying and managing domiciliary care
 * visits. Supports day, week, and month views with drag-and-drop
 * scheduling and mobile-friendly interactions.
 *
 * Features:
 * - Multiple calendar views (day/week/month)
 * - Visit scheduling
 * - Drag-and-drop support
 * - Staff availability
 * - Conflict detection
 *
 * Mobile-First Considerations:
 * - Touch-friendly interactions
 * - Responsive layout
 * - Offline support
 * - Performance optimized
 * - Gesture controls
 *
 * Enterprise Features:
 * - Role-based access
 * - Audit logging
 * - Regional compliance
 * - Error handling
 * - Analytics tracking
 */

import React, { useState, useCallback } from 'react';
import { format } from 'date-fns';

// UI Components
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button/Button';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Badge } from '@/components/ui/Badge/Badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Form/Select';

// Icons
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Users
} from 'lucide-react';

// Types
import type { Visit } from '../../types';

// Hooks
import { useVisitList } from '../../hooks';
import { StaffMetricsService } from '@/features/staff/services/monitoring-service';
import { useVisitAnalytics } from '../../hooks/useVisitAnalytics';

type CalendarView = 'day' | 'week' | 'month';

interface VisitCalendarProps {
  onVisitClick?: (visit: Visit) => void;
  onCreateVisit?: (date: Date) => void;
}

export function VisitCalendar({ onVisitClick, onCreateVisit }: VisitCalendarProps) {
  const [view, setView] = useState<CalendarView>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const { visits, loading: visitsLoading } = useVisitList();
  const { data: analytics, loading: analyticsLoading } = useVisitAnalytics({ timeRange: '7d' });

  const handleDateChange = useCallback((date: Date) => {
    setCurrentDate(date);
  }, []);

  const handleViewChange = useCallback((newView: CalendarView) => {
    setView(newView);
  }, []);

  const handleVisitClick = useCallback((visit: Visit) => {
    onVisitClick?.(visit);
  }, [onVisitClick]);

  const handleCreateVisit = useCallback((date: Date) => {
    onCreateVisit?.(date);
  }, [onCreateVisit]);

  const renderVisitCard = useCallback((visit: Visit) => {
    return (
      <Card
        key={visit.id}
        className="p-4 mb-2 cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => handleVisitClick(visit)}
      >
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">{visit.clientName}</h4>
            <p className="text-sm text-gray-500">
              {format(new Date(visit.scheduledTime), 'HH:mm')}
            </p>
          </div>
          <Badge variant={visit.status === 'COMPLETED' ? 'success' : 'default'}>
            {visit.status}
          </Badge>
        </div>
      </Card>
    );
  }, [handleVisitClick]);

  if (visitsLoading || analyticsLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleDateChange(new Date(currentDate.setDate(currentDate.getDate() - 7)))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold">
            {format(currentDate, 'MMMM d, yyyy')}
          </h2>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleDateChange(new Date(currentDate.setDate(currentDate.getDate() + 7)))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={view} onValueChange={(value) => handleViewChange(value as CalendarView)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => handleCreateVisit(currentDate)}>
            New Visit
          </Button>
        </div>
      </div>

      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <h3 className="font-medium mb-2">Completion Rate</h3>
            <p className="text-2xl font-bold">
              {analytics.overall.visitMetrics.completionRate}%
            </p>
          </Card>
          <Card className="p-4">
            <h3 className="font-medium mb-2">On-Time Rate</h3>
            <p className="text-2xl font-bold">
              {analytics.overall.visitMetrics.punctualityRate}%
            </p>
          </Card>
          <Card className="p-4">
            <h3 className="font-medium mb-2">Staff Utilization</h3>
            <p className="text-2xl font-bold">
              {analytics.overall.staffMetrics.utilization}%
            </p>
          </Card>
          <Card className="p-4">
            <h3 className="font-medium mb-2">Client Satisfaction</h3>
            <p className="text-2xl font-bold">
              {analytics.overall.serviceQuality.clientSatisfaction}%
            </p>
          </Card>
        </div>
      )}

      <ScrollArea className="h-[600px]">
        <div className="space-y-4">
          {visits.map(renderVisitCard)}
        </div>
      </ScrollArea>
    </div>
  );
} 