# Offline Support System

## Overview

Enterprise-grade offline support system for care home management applications. Built with IndexedDB for robust data persistence and synchronization.

## Features

- 🔄 Automatic data synchronization
- 💾 Persistent data storage
- 🔍 Conflict resolution
- 📊 Progress tracking
- 🚦 Queue management
- 🔒 Secure storage

## Architecture

### Data Stores

1. **Offline Data Store**
   - Primary data cache
   - Versioned storage
   - Type-safe data models

2. **Sync Queue Store**
   - Operation queue
   - Retry management
   - Priority handling

3. **Metadata Store**
   - Sync timestamps
   - Version tracking
   - Configuration data

## Implementation

### Basic Usage

```typescript
import { offlineService } from '@/lib/offline'

// Store data
await offlineService.storeData('metrics-2024', metricsData, 'metrics')

// Retrieve data
const data = await offlineService.getData('metrics-2024')

// Queue sync operation
await offlineService.queueSync({
  type: 'UPDATE',
  data: updatedData,
  priority: 'high'
})
```

### Sync Configuration

```typescript
const config: OfflineConfig = {
  syncStrategy: 'periodic',  // 'immediate' | 'periodic' | 'manual'
  syncInterval: 300000,     // 5 minutes
  maxRetries: 3,
  conflictResolution: 'server-wins'
}
```

### Error Handling

```typescript
try {
  await offlineService.storeData('key', data, 'type')
} catch (error) {
  if (error instanceof StorageError) {
    // Handle storage errors
  } else if (error instanceof SyncError) {
    // Handle sync errors
  }
}
```

## Data Flow

1. **Write Operations**
   ```
   App Write → Offline Store → Sync Queue → Server
   ```

2. **Read Operations**
   ```
   App Read → Offline Store → Server (if online)
   ```

3. **Sync Process**
   ```
   Check Connection → Process Queue → Resolve Conflicts → Update Store
   ```

## Security

### Data Protection
- Encrypted storage
- Secure sync
- Access control
- Data validation

### Privacy
- Data expiry
- Selective sync
- Audit logging
- Sanitization

## Performance

### Optimization
- Batch operations
- Compression
- Lazy loading
- Cache management

### Monitoring
- Sync status
- Storage usage
- Queue length
- Error rates

## Best Practices

1. **Data Management**
   - Version all data
   - Implement TTL
   - Regular cleanup
   - Validate data

2. **Sync Strategy**
   - Use appropriate sync mode
   - Handle conflicts
   - Implement retries
   - Monitor progress

3. **Error Handling**
   - Graceful degradation
   - User feedback
   - Error logging
   - Recovery plans

## API Reference

### Core Methods

#### `storeData`
```typescript
async storeData(
  key: string,
  data: any,
  type: string
): Promise<void>
```

#### `getData`
```typescript
async getData(
  key: string
): Promise<any>
```

#### `queueSync`
```typescript
async queueSync(
  operation: SyncOperation
): Promise<void>
```

#### `processSyncQueue`
```typescript
async processSyncQueue(): Promise<void>
```

### Utility Methods

#### `isOnline`
```typescript
async isOnline(): Promise<boolean>
```

#### `getLastSyncTime`
```typescript
async getLastSyncTime(): Promise<string | null>
```

#### `getPendingChangesCount`
```typescript
async getPendingChangesCount(): Promise<number>
```

## Error Codes

| Code | Description | Resolution |
|------|-------------|------------|
| OS001 | Storage Full | Clear old data |
| OS002 | Sync Failed | Retry operation |
| OS003 | Version Conflict | Resolve manually |
| OS004 | Invalid Data | Validate input |

## Migration Guide

### Version 1.x to 2.x
1. Update config format
2. Migrate existing data
3. Update sync logic
4. Test thoroughly

## Contributing

1. Follow TypeScript standards
2. Add unit tests
3. Update documentation
4. Submit PR

## License

Copyright © 2024 Phibu Cloud Solutions Ltd. All rights reserved. 