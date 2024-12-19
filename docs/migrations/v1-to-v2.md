# API Migration Guide: v1 to v2

## Overview

This guide details the process of migrating from Write Care Notes API v1 to v2. Version 2 introduces enhanced analytics, regional compliance features, and improved error handling while maintaining our commitment to zero-downtime operations.

## Timeline

- **Deprecation Notice**: 2024-01-01
- **Sunset Warning**: 2025-01-01
- **End-of-Life**: 2025-06-30

## Key Changes

### 1. Enhanced Facility Endpoints

#### Response Structure Changes

```diff
{
  "id": "123",
  "name": "Main Facility",
  "departments": ["Emergency", "Surgery"],
+ "complianceScore": 95,
+ "analytics": {
+   "occupancyRate": 75,
+   "staffUtilization": 80
+ }
}
```

### 2. Regional Compliance

New region-specific endpoints and headers:

```typescript
// V2 API calls with regional context
const facility = await api.getFacility(id, {
  region: 'wales',  // or 'england', 'scotland', 'ireland', 'northernIreland'
});
```

### 3. Error Handling

Enhanced error responses:

```diff
{
  "error": "Resource not found",
+ "code": "FACILITY_NOT_FOUND",
+ "correlationId": "abc-123",
+ "timestamp": "2024-03-21T14:30:00Z",
+ "documentation": "https://api.writecarenotes.com/errors/FACILITY_NOT_FOUND"
}
```

## Migration Steps

### 1. Update API Client

```typescript
// Update package version
npm install @writecarenotes/api-client@2.0.0

// Update client initialization
import { ApiClient } from '@writecarenotes/api-client';

const api = new ApiClient({
  version: 'v2',
  region: 'england'
});
```

### 2. Handle New Response Formats

```typescript
// V1: Basic facility data
const facilityV1 = {
  id: '123',
  name: 'Main Facility',
  departments: ['Emergency']
};

// V2: Enhanced facility data
interface FacilityV2 {
  id: string;
  name: string;
  departments: string[];
  complianceScore: number;
  analytics: {
    occupancyRate: number;
    staffUtilization: number;
  };
}
```

### 3. Implement Regional Compliance

```typescript
// Add region-specific logic
const getRegionalRequirements = (region: string) => {
  switch (region) {
    case 'wales':
      return { regulatoryBody: 'CIW' };
    case 'england':
      return { regulatoryBody: 'CQC' };
    // ...
  }
};
```

### 4. Update Error Handling

```typescript
try {
  const facility = await api.getFacility(id);
} catch (error) {
  if (error.code === 'FACILITY_NOT_FOUND') {
    // Handle specific error
  }
  // Log correlation ID for support
  logger.error(error.correlationId);
}
```

## Testing Migration

1. **Parallel Testing**
   ```typescript
   // Run both versions simultaneously
   const [v1Result, v2Result] = await Promise.all([
     apiV1.getFacility(id),
     apiV2.getFacility(id)
   ]);
   ```

2. **Gradual Rollout**
   ```typescript
   // Feature flag based version selection
   const api = new ApiClient({
     version: featureFlags.useV2 ? 'v2' : 'v1'
   });
   ```

## Monitoring Migration

1. Monitor version usage:
   ```typescript
   metrics.increment('api.request', { version: 'v2' });
   ```

2. Track deprecation warnings:
   ```typescript
   logger.warn('v1_deprecation_warning', {
     endpoint: '/facility',
     client: clientId
   });
   ```

## Rollback Plan

1. **Immediate Rollback**
   ```typescript
   // Revert to v1
   api.downgradeToVersion('v1');
   ```

2. **Gradual Rollback**
   ```typescript
   // Use feature flags
   if (shouldRollback(clientId)) {
     api.downgradeToVersion('v1');
   }
   ```

## Support Resources

- 📧 Migration Support: migration-support@writecarenotes.com
- 📚 API Documentation: https://api.writecarenotes.com/v2/docs
- 🔍 Migration Validator: https://api.writecarenotes.com/tools/migration-validator
- 📊 Migration Dashboard: https://api.writecarenotes.com/admin/migration-status

## Regional Compliance Contacts

- 🏴󠁧󠁢󠁥󠁮󠁧󠁿 England: cqc-compliance@writecarenotes.com
- 🏴󠁧󠁢󠁷󠁬󠁳󠁿 Wales: ciw-compliance@writecarenotes.com
- 🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scotland: ci-compliance@writecarenotes.com
- 🇮🇪 Ireland: hiqa-compliance@writecarenotes.com
- 🇬🇧 Northern Ireland: rqia-compliance@writecarenotes.com
