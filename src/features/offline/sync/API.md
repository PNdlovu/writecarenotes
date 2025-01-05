# Offline Queue API Documentation

## OfflineQueue

The `OfflineQueue` class provides a robust system for managing offline actions with priority-based processing, persistent storage, and comprehensive error handling.

### Constructor

```typescript
new OfflineQueue(options?: {
  maxRetries?: number;      // Maximum retry attempts (default: 3)
  storageKey?: string;      // LocalStorage key (default: 'offline_queue')
  maxQueueSize?: number;    // Maximum queue size (default: 1000)
})
```

### Methods

#### enqueue

Adds an action to the queue with optional priority.

```typescript
enqueue(action: QueuedActionInput, priority: number = 0): void

interface QueuedActionInput {
  type: string;            // Action type identifier
  payload: unknown;        // Action data
  metadata?: Record<string, unknown>; // Optional metadata
}
```

**Priority Levels:**
- 0: Low priority (default)
- 1: Medium priority
- 2: High priority

**Throws:**
- `Error` if queue size limit is reached

**Example:**
```typescript
queue.enqueue({
  type: 'update_user',
  payload: { userId: '123', name: 'John' },
  metadata: { timestamp: new Date().toISOString() }
}, 2);
```

#### processQueue

Processes queued actions in priority order.

```typescript
processQueue(processor: (action: QueuedAction) => Promise<void>): Promise<void>

interface QueuedAction extends QueuedActionInput {
  id: string;             // Unique action ID
  timestamp: string;      // Enqueue timestamp
  retryCount: number;     // Number of retry attempts
  status: 'pending' | 'processing' | 'failed' | 'completed';
  error?: string;         // Error message if failed
}
```

**Example:**
```typescript
await queue.processQueue(async (action) => {
  switch (action.type) {
    case 'update_user':
      await api.updateUser(action.payload);
      break;
    case 'create_post':
      await api.createPost(action.payload);
      break;
  }
});
```

#### getStats

Returns current queue statistics.

```typescript
getStats(): QueueStats

interface QueueStats {
  total: number;          // Total actions in queue
  pending: number;        // Pending actions
  processing: number;     // Currently processing
  failed: number;         // Failed actions
}
```

#### clear

Clears all actions from the queue.

```typescript
clear(): void
```

### Events and Metrics

The queue system automatically tracks the following metrics:

```typescript
// Metrics
metrics.increment('offline.queue.loaded')
metrics.increment('offline.queue.action_added')
metrics.increment('offline.queue.action_processed')
metrics.increment('offline.queue.action_failed')
metrics.increment('offline.queue.cleared')

// Analytics Events
logEvent('queue_loaded', { size, timestamp })
logEvent('action_queued', { actionId, type, timestamp })
logEvent('action_processed', { actionId, type, timestamp })
logEvent('action_processing_failed', { actionId, type, error, retryCount })
logEvent('queue_cleared', { timestamp })
```

### Error Handling

The queue implements comprehensive error handling:

1. **Storage Errors**
   ```typescript
   try {
     queue.enqueue({ type: 'action', payload: data });
   } catch (error) {
     if (error.message === 'Queue size limit reached') {
       // Handle queue full
     }
   }
   ```

2. **Processing Errors**
   ```typescript
   await queue.processQueue(async (action) => {
     try {
       await processAction(action);
     } catch (error) {
       // Action will be retried up to maxRetries times
       throw error;
     }
   });
   ```

### Best Practices

1. **Priority Usage**
   ```typescript
   // High priority - User data
   queue.enqueue({ type: 'save_user_data', payload: userData }, 2);
   
   // Medium priority - Content updates
   queue.enqueue({ type: 'update_content', payload: content }, 1);
   
   // Low priority - Analytics
   queue.enqueue({ type: 'track_event', payload: event }, 0);
   ```

2. **Batch Processing**
   ```typescript
   // Process multiple actions of the same type together
   await queue.processQueue(async (action) => {
     if (action.type === 'sync_data') {
       const batch = queue.getBatchByType('sync_data');
       await processBatch(batch);
     }
   });
   ```

3. **Error Recovery**
   ```typescript
   // Implement custom retry logic
   await queue.processQueue(async (action) => {
     try {
       await processWithRetry(action, {
         maxAttempts: 3,
         backoff: 'exponential'
       });
     } catch (error) {
       // Handle permanent failure
       await handleFailedAction(action);
       throw error;
     }
   });
   ```

### Integration with React

```typescript
function useQueuedAction() {
  const queue = useOfflineQueue();
  
  const queueAction = useCallback(async (action) => {
    try {
      await queue.enqueue(action);
      toast.success('Action queued for processing');
    } catch (error) {
      toast.error('Failed to queue action');
    }
  }, [queue]);

  return { queueAction };
}
```

### Performance Considerations

1. **Memory Management**
   - Keep payload sizes reasonable
   - Clean up completed actions
   - Use batch processing for large datasets

2. **Storage Limits**
   - Monitor queue size
   - Implement cleanup strategies
   - Handle storage quota errors

3. **Processing Efficiency**
   - Use appropriate priorities
   - Batch similar actions
   - Implement timeouts for long-running processes
