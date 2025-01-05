# Activities Module Migration Guide

## Migrating to Version 3.0.0

### Key Changes
1. Analytics API now returns more comprehensive statistics
2. Activities hook provides simpler, more robust offline support
3. Sync service handles offline-to-online synchronization
4. Enhanced error handling and recovery

### Step-by-Step Migration

#### 1. Update Hook Usage
```typescript
// Old usage
const { activities, loading } = useActivities({
  careHomeId
});

// New usage - includes offline support
const { 
  activities, 
  loading,
  syncing,
  refresh 
} = useActivities({
  careHomeId,
  autoSync: true, // Enable automatic sync
  filter        // Optional activity filter
});
```

#### 2. Handle Offline States
```typescript
// Old approach - no offline handling
const handleAdd = async () => {
  await addActivity(newActivity);
};

// New approach - works offline
const handleAdd = async () => {
  try {
    await addActivity(newActivity);
    // Changes will sync automatically when online
  } catch (error) {
    // Error handling with automatic retry
  }
};
```

#### 3. Update Analytics Usage
```typescript
// Old analytics response
interface OldStats {
  total: number;
  completed: number;
}

// New analytics response
interface NewStats {
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

#### 4. Error Handling Updates
```typescript
// Old error handling
try {
  await updateActivity(id, updates);
} catch (error) {
  console.error(error);
}

// New error handling - includes rollback
try {
  await updateActivity(id, updates);
} catch (error) {
  // Automatic rollback of optimistic updates
  // Retry logic for network errors
  // User-friendly error messages
}
```

### Breaking Changes
1. Removed complex configuration options
2. Changed analytics API response structure
3. Modified error handling behavior
4. Updated offline sync approach

### Recommendations
1. Test offline scenarios thoroughly
2. Update error handling logic
3. Review analytics dashboard implementations
4. Check permission requirements
