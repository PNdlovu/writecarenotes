# Activities Module Documentation

## Overview
The Activities module provides functionality for managing care home activities with offline support, optimistic updates, and robust error handling.

## Key Components

### 1. Analytics API (`/api/organizations/[id]/care-homes/[careHomeId]/activities/analytics`)
Provides statistical insights about activities with:
- Activity counts by status and category
- Participant engagement metrics
- Completion rates and duration averages
- Cached responses (5 minutes TTL)
- Input validation and error handling

```typescript
// Example Response
{
  total: number;
  completed: number;
  inProgress: number;
  scheduled: number;
  cancelled: number;
  participantCount: number;
  byCategory: Record<ActivityCategory, number>;
  averageDuration: number;
  completionRate: number;
}
```

### 2. Sync Service (`ActivitySyncService`)
Handles offline-to-online synchronization with:
- Batched processing to prevent API overload
- Exponential backoff retry logic
- Conflict resolution based on timestamps
- Pending changes queue

```typescript
const syncService = new ActivitySyncService(organizationId);

// Queue offline changes
await syncService.enqueuePendingChange('create', id, data);

// Sync when back online
await syncService.syncPendingChanges();
```

### 3. Activities Hook (`useActivities`)
Provides a simple interface for activity management with:
- Offline-first data access
- Optimistic updates for better UX
- Automatic error recovery
- Permission-based access control

```typescript
const {
  activities,
  stats,
  loading,
  syncing,
  addActivity,
  updateActivity,
  deleteActivity,
  refresh
} = useActivities({
  initialActivities,
  autoSync: true,
  filter,
  careHomeId
});
```

## Usage Examples

### 1. Basic Activity Management
```typescript
const ActivityList = () => {
  const { activities, loading, addActivity } = useActivities({
    careHomeId: 'care-home-1'
  });

  const handleAdd = async () => {
    await addActivity({
      title: 'Morning Exercise',
      startTime: new Date(),
      category: 'PHYSICAL'
    });
  };

  if (loading) return <Loading />;
  return <ActivityListView items={activities} onAdd={handleAdd} />;
};
```

### 2. Offline-Aware Updates
```typescript
const ActivityItem = ({ activity }) => {
  const { updateActivity, deleteActivity } = useActivities({
    careHomeId: activity.careHomeId
  });

  const handleComplete = async () => {
    await updateActivity(activity.id, { 
      status: 'COMPLETED',
      completedAt: new Date()
    });
  };

  return (
    <ActivityCard
      activity={activity}
      onComplete={handleComplete}
      onDelete={() => deleteActivity(activity.id)}
    />
  );
};
```

### 3. Analytics Dashboard
```typescript
const ActivitiesAnalytics = () => {
  const { stats, loading } = useActivities({
    careHomeId: 'care-home-1'
  });

  if (loading) return <Loading />;
  return (
    <AnalyticsDashboard
      completionRate={stats.completionRate}
      participantCount={stats.participantCount}
      categoryBreakdown={stats.byCategory}
    />
  );
};
```

## Error Handling
The module includes comprehensive error handling:
- Input validation using Zod schemas
- Automatic retry for network failures
- Optimistic update rollbacks
- User-friendly error messages
- Detailed error logging

## Offline Support
Activities can be managed offline with:
- Automatic sync when online
- Optimistic UI updates
- Conflict resolution
- Pending changes queue
- Data persistence

## Performance Considerations
- Batched API requests
- Response caching
- Efficient state updates
- Minimal re-renders
- Optimized data structures

## Security
- Role-based access control
- Input validation
- API rate limiting
- Tenant isolation
- Secure data persistence
