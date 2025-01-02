# Calendar Module Usage Examples

## Basic Usage

### 1. Simple Calendar Page

```tsx
import { useCalendar } from '@/features/calendar/hooks/use-calendar';
import { CalendarView } from '@/features/calendar/components/CalendarView';
import { Button } from '@/components/ui/button';

export function CalendarPage() {
  const { 
    events, 
    isLoading, 
    createEvent 
  } = useCalendar();

  const handleAddEvent = async () => {
    await createEvent({
      title: 'Daily Health Check',
      date: new Date().toISOString(),
      type: 'assessment',
      priority: 'routine',
      region: 'england',
      regulatoryBody: 'CQC',
    });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <Button onClick={handleAddEvent}>Add Event</Button>
      <CalendarView events={events} />
    </div>
  );
}
```

### 2. Event Details with Offline Support

```tsx
import { useCalendar } from '@/features/calendar/hooks/use-calendar';
import { useOffline } from '@/features/offline/hooks/use-offline';
import { Badge } from '@/components/ui/badge';

interface EventDetailsProps {
  eventId: string;
}

export function EventDetails({ eventId }: EventDetailsProps) {
  const { events, updateEvent } = useCalendar();
  const { isOnline } = useOffline();

  const event = events.find(e => e.id === eventId);
  if (!event) return null;

  const handleStatusChange = async (status: 'completed' | 'cancelled') => {
    await updateEvent(eventId, { status });
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">{event.title}</h2>
        <Badge variant={isOnline ? 'success' : 'warning'}>
          {isOnline ? 'Online' : 'Offline'}
        </Badge>
      </div>

      <div className="grid gap-2">
        <p><strong>Type:</strong> {event.type}</p>
        <p><strong>Date:</strong> {new Date(event.date).toLocaleString()}</p>
        <p><strong>Status:</strong> {event.status}</p>
        {event.description && (
          <p><strong>Description:</strong> {event.description}</p>
        )}
      </div>

      <div className="flex gap-2">
        <Button 
          onClick={() => handleStatusChange('completed')}
          disabled={event.status === 'completed'}
        >
          Mark Complete
        </Button>
        <Button 
          variant="destructive"
          onClick={() => handleStatusChange('cancelled')}
          disabled={event.status === 'cancelled'}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
```

### 3. Batch Operations Example

```tsx
import { useCalendar } from '@/features/calendar/hooks/use-calendar';
import { useBatchOperations } from '@/features/calendar/hooks/use-batch-operations';

export function BatchEventCreator() {
  const { refresh } = useCalendar();
  const { batchCreate, isLoading } = useBatchOperations();

  const handleCreateWeeklyEvents = async () => {
    const startDate = new Date();
    const events = Array.from({ length: 7 }).map((_, index) => {
      const date = new Date(startDate);
      date.setDate(date.getDate() + index);
      
      return {
        title: `Daily Medication Round ${index + 1}`,
        date: date.toISOString(),
        type: 'medication',
        priority: 'important',
        region: 'england',
        regulatoryBody: 'CQC',
        recurrence: {
          pattern: 'daily',
          interval: 1,
        },
      };
    });

    const result = await batchCreate({ events });
    if (result.successful.length) {
      refresh();
    }
  };

  return (
    <Button 
      onClick={handleCreateWeeklyEvents}
      disabled={isLoading}
    >
      Create Week Schedule
    </Button>
  );
}
```

### 4. Multi-Language Support

```tsx
import { useCalendar } from '@/features/calendar/hooks/use-calendar';
import { useTranslation } from 'next-i18next';

export function MultiLanguageEvent() {
  const { createEvent } = useCalendar();
  const { i18n } = useTranslation();

  const handleCreateMultiLanguageEvent = async () => {
    await createEvent({
      title: 'Family Visit',
      titleTranslations: {
        en: 'Family Visit',
        cy: 'Ymweliad Teuluol',
        gd: 'Tadhal Teaghlaich',
        ga: 'Cuairt Teaghlaigh',
      },
      description: 'Regular family visit schedule',
      descriptionTranslations: {
        en: 'Regular family visit schedule',
        cy: 'Amserlen ymweliadau teuluol rheolaidd',
        gd: 'Clàr-ama cunbhalach tadhal teaghlaich',
        ga: 'Sceideal rialta cuairte teaghlaigh',
      },
      date: new Date().toISOString(),
      type: 'visit',
      priority: 'routine',
      region: 'wales',
      regulatoryBody: 'CIW',
    });
  };

  return (
    <Button onClick={handleCreateMultiLanguageEvent}>
      Create Multi-Language Event
    </Button>
  );
}
```

### 5. Regulatory Compliance Example

```tsx
import { useCalendar } from '@/features/calendar/hooks/use-calendar';
import { useRegulatoryRequirements } from '@/features/regulatory/hooks/use-requirements';

export function ComplianceScheduler() {
  const { createEvent } = useCalendar();
  const { requirements } = useRegulatoryRequirements();

  const scheduleAssessment = async (requirement: RegulatoryRequirement) => {
    await createEvent({
      title: requirement.title,
      type: 'assessment',
      date: new Date().toISOString(),
      priority: 'important',
      region: requirement.region,
      regulatoryBody: requirement.body,
      regulatoryRequirements: {
        assessmentType: requirement.type,
        frequency: requirement.frequency,
        lastCompleted: requirement.lastCompleted,
        nextDue: requirement.nextDue,
      },
    });
  };

  return (
    <div className="space-y-4">
      {requirements.map(req => (
        <div key={req.id} className="flex justify-between items-center p-4 border rounded">
          <div>
            <h3 className="font-bold">{req.title}</h3>
            <p className="text-sm text-muted">Due: {req.nextDue}</p>
          </div>
          <Button onClick={() => scheduleAssessment(req)}>
            Schedule Assessment
          </Button>
        </div>
      ))}
    </div>
  );
}
```

## Advanced Usage

### 1. Custom Calendar Hook with Filters

```typescript
import { useCalendar } from '@/features/calendar/hooks/use-calendar';

interface UseFilteredCalendarOptions {
  type?: string;
  priority?: string;
  residentId?: string;
}

export function useFilteredCalendar(options: UseFilteredCalendarOptions = {}) {
  const calendar = useCalendar();
  const { type, priority, residentId } = options;

  const filteredEvents = calendar.events.filter(event => {
    if (type && event.type !== type) return false;
    if (priority && event.priority !== priority) return false;
    if (residentId && event.residentId !== residentId) return false;
    return true;
  });

  return {
    ...calendar,
    events: filteredEvents,
  };
}
```

### 2. Offline-First Implementation

```typescript
import { useCalendar } from '@/features/calendar/hooks/use-calendar';
import { useOfflineStorage } from '@/features/offline/hooks/use-storage';

export function useOfflineFirstCalendar() {
  const calendar = useCalendar({ autoSync: true });
  const storage = useOfflineStorage('calendar');

  // Save events to local storage when they change
  React.useEffect(() => {
    if (calendar.events.length) {
      storage.set('events', calendar.events);
    }
  }, [calendar.events]);

  // Load from local storage when offline
  React.useEffect(() => {
    if (!calendar.isOnline) {
      const cached = storage.get('events');
      if (cached) {
        calendar.setEvents(cached);
      }
    }
  }, [calendar.isOnline]);

  return calendar;
}
```

### 3. Error Boundary Integration

```tsx
import { ErrorBoundary } from '@/components/error-boundary';
import { useCalendar } from '@/features/calendar/hooks/use-calendar';

function CalendarErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="p-4 border border-red-500 rounded">
      <h3 className="text-lg font-bold text-red-500">Calendar Error</h3>
      <p className="mt-2">{error.message}</p>
      <Button onClick={resetErrorBoundary} className="mt-4">
        Try Again
      </Button>
    </div>
  );
}

export function CalendarWithErrorHandling() {
  return (
    <ErrorBoundary
      FallbackComponent={CalendarErrorFallback}
      onReset={() => {
        // Reset calendar state if needed
      }}
    >
      <Calendar />
    </ErrorBoundary>
  );
}
```

## Best Practices

1. **Offline Support**
   - Always handle offline scenarios
   - Use optimistic updates
   - Queue operations for sync
   - Show sync status to users

2. **Performance**
   - Use pagination for large datasets
   - Implement virtual scrolling for long lists
   - Cache responses appropriately
   - Cancel stale requests

3. **Error Handling**
   - Use error boundaries
   - Show meaningful error messages
   - Provide retry mechanisms
   - Log errors for debugging

4. **Accessibility**
   - Include ARIA labels
   - Support keyboard navigation
   - Provide high contrast mode
   - Test with screen readers

5. **Regulatory Compliance**
   - Validate against requirements
   - Include audit trails
   - Support multi-language
   - Follow data protection rules 