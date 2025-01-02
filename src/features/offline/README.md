# Offline Module Documentation

## Overview

The offline module provides enterprise-grade offline capabilities for the Write Care Notes application. It handles offline data storage, synchronization, and queue management with features like priority-based processing, retry mechanisms, and comprehensive error handling.

## Architecture

The module is organized into several key components:

```
src/features/offline/
├── components/           # UI components
│   ├── OfflineIndicator.tsx
│   └── OfflineErrorBoundary.tsx
├── hooks/               # React hooks
│   ├── useOffline.ts
│   └── useOfflineSync.ts
├── sync/               # Sync infrastructure
│   └── queue.ts
├── providers/          # Context providers
│   └── OfflineProvider.tsx
└── types/             # TypeScript types
    └── index.ts
```

## Core Components

### OfflineQueue

The `OfflineQueue` class provides robust offline action management:

```typescript
const queue = new OfflineQueue({
  maxRetries: 3,
  maxQueueSize: 1000,
  storageKey: 'offline_queue'
});

// Queue an action with priority
queue.enqueue({
  type: 'data_update',
  payload: { /* ... */ }
}, priority);

// Process the queue
await queue.processQueue(async (action) => {
  // Handle the action
});
```

Features:
- Priority-based processing
- Persistent storage
- Retry mechanisms
- Error handling
- Queue size limits
- Progress tracking

### useOffline Hook

The `useOffline` hook provides React components with offline capabilities:

```typescript
const {
  isOnline,
  isSyncing,
  queueAction,
  syncNow,
  lastSyncTime
} = useOffline({
  syncInterval: 5000,
  maxRetries: 3
});
```

Features:
- Network status monitoring
- Automatic periodic sync
- Manual sync trigger
- Queue management
- Progress tracking

## Integration Examples

### Feature-Specific Implementation

Each feature can implement its own offline sync logic using the core infrastructure:

```typescript
// src/features/blog/hooks/useOfflineSync.ts
export function useOfflineSync() {
  const { queueAction } = useOffline();

  const saveOffline = async (post: Post) => {
    queueAction('blog_post_update', {
      postId: post.id,
      post,
      timestamp: new Date().toISOString()
    }, 2);
  };

  // ...
}
```

### UI Integration

The `OfflineIndicator` component provides visual feedback:

```tsx
<OfflineIndicator
  showPendingCount
  syncInterval={5000}
  onSync={handleSync}
/>
```

## Error Handling

The module implements comprehensive error handling:

1. **Network Errors**
   - Automatic retry with exponential backoff
   - Maximum retry attempts
   - Error logging and metrics

2. **Storage Errors**
   - Graceful degradation
   - Error reporting
   - Automatic recovery

3. **Sync Conflicts**
   - Last-write-wins strategy
   - Conflict detection
   - Manual resolution options

## Metrics and Monitoring

The module integrates with the application's metrics system:

```typescript
metrics.increment('offline.queue.action_added');
metrics.increment('offline.sync.success');
metrics.increment('offline.queue.action_failed');
```

Events are also logged for analytics:

```typescript
logEvent('queue_loaded', {
  size: queue.length,
  timestamp: new Date().toISOString()
});
```

## Testing

The module includes comprehensive tests:

```bash
# Run all offline module tests
npm test src/features/offline

# Run specific test suite
npm test src/features/offline/sync/__tests__/queue.test.ts
```

Test coverage includes:
- Queue management
- Priority processing
- Error handling
- Storage persistence
- Network status handling

## Best Practices

1. **Queue Management**
   - Use appropriate priorities (0-2)
   - Keep payload sizes reasonable
   - Clean up completed items

2. **Error Handling**
   - Always provide error feedback
   - Implement retry strategies
   - Log errors appropriately

3. **Performance**
   - Monitor queue size
   - Implement batch processing
   - Use appropriate sync intervals

4. **Security**
   - Sanitize offline data
   - Validate on sync
   - Handle sensitive data appropriately

## Contributing

When contributing to the offline module:

1. Follow the established patterns
2. Add comprehensive tests
3. Update documentation
4. Consider backward compatibility
5. Add appropriate metrics and logging
