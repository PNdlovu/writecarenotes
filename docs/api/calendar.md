# Calendar API Documentation

## Overview

The Calendar API provides endpoints for managing events in the Write Care Notes platform. It supports offline-first operations, multi-language content, and regulatory compliance requirements.

## Base URL

```
/api/calendar
```

## API Version

All requests must include the `x-api-version` header:
```
x-api-version: 2024-03
```

## Rate Limiting

- 100 requests per 15 minutes for single operations
- 50 requests per 15 minutes for batch operations

## Endpoints

### List Events

```http
GET /api/calendar
```

Query Parameters:
- `startDate` (ISO string): Start date for range
- `endDate` (ISO string): End date for range
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)

Response:
```typescript
{
  data: CalendarEvent[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}
```

### Create Event

```http
POST /api/calendar
```

Request Body:
```typescript
{
  title: string;
  titleTranslations?: Record<Language, string>;
  date: string;
  type: 'appointment' | 'activity' | 'medication' | 'assessment';
  description?: string;
  descriptionTranslations?: Record<Language, string>;
  residentId?: string;
  staffId?: string;
  region: Region;
  regulatoryBody: 'CQC' | 'CIW' | 'CI' | 'HIQA' | 'RQIA';
  regulatoryRequirements?: {
    assessmentType?: string;
    frequency?: string;
    lastCompleted?: string;
    nextDue?: string;
  };
  recurrence?: {
    pattern: 'daily' | 'weekly' | 'monthly' | 'custom';
    interval: number;
    endDate?: string;
    daysOfWeek?: number[];
  };
  category?: 'care' | 'health' | 'social' | 'administrative';
  priority: 'routine' | 'important' | 'urgent';
}
```

### Update Event

```http
PATCH /api/calendar/{id}
```

Request Body: Partial<CreateEventBody>

### Delete Event

```http
DELETE /api/calendar/{id}
```

### Batch Operations

#### Batch Create

```http
POST /api/calendar/batch
```

Request Body:
```typescript
{
  events: CreateEventBody[];
}
```

#### Batch Update

```http
PATCH /api/calendar/batch
```

Request Body:
```typescript
{
  events: Array<{ id: string } & Partial<CreateEventBody>>;
}
```

#### Batch Delete

```http
DELETE /api/calendar/batch
```

Request Body:
```typescript
{
  ids: string[];
}
```

## React Hooks

### useCalendar

```typescript
const {
  events,
  isLoading,
  error,
  hasMore,
  isOnline,
  pendingActions,
  fetchEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  loadMore,
  refresh,
} = useCalendar({
  autoSync?: boolean;
  syncInterval?: number;
  pageSize?: number;
});
```

Options:
- `autoSync`: Enable automatic sync (default: true)
- `syncInterval`: Sync interval in ms (default: 30000)
- `pageSize`: Items per page (default: 20)

Methods:
- `fetchEvents(params?: { startDate?: string; endDate?: string })`: Fetch events
- `createEvent(data: CreateEventData)`: Create new event
- `updateEvent(id: string, data: Partial<CalendarEvent>)`: Update event
- `deleteEvent(id: string)`: Delete event
- `loadMore()`: Load next page
- `refresh()`: Refresh current data

## Error Handling

Errors follow this structure:
```typescript
{
  error: string;
  statusCode: number;
  details?: Record<string, any>;
}
```

Common status codes:
- 400: Validation error
- 401: Unauthorized
- 403: Forbidden
- 404: Not found
- 409: Conflict
- 429: Rate limit exceeded
- 500: Internal server error

## Offline Support

The API supports offline-first operations:
1. Operations are queued when offline
2. Auto-sync when coming online
3. Conflict resolution for concurrent changes
4. Local storage for offline data

## Caching

- GET requests are cached for 5 minutes
- Stale-while-revalidate window of 1 minute
- Cache is invalidated on mutations
- Cache keys include facility ID for isolation 