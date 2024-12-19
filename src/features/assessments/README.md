# Assessments Module

## Overview

The Assessments module provides enterprise-grade assessment management capabilities for Write Care Notes. It supports offline-first operations, multi-tenant architecture, and comprehensive audit logging.

## Features

- **Offline Support**: Full offline capability with sync
- **Multi-Tenant**: Organization-based isolation
- **Internationalization**: Full i18n support (EN/CY)
- **Audit Logging**: Comprehensive activity tracking
- **Compliance**: GDPR and healthcare regulations
- **Enterprise Security**: Role-based access control

## Architecture

### Directory Structure

```bash
assessments/
├── api/              # API layer
├── components/       # React components
├── constants/        # Constants and enums
├── hooks/           # Custom React hooks
├── i18n/            # Translations
├── repositories/    # Data access layer
├── services/        # Business logic
├── types/           # TypeScript types
└── utils/           # Utility functions
```

### Core Components

1. **Types**
   - Strong TypeScript types
   - Zod validation schemas
   - Error handling types

2. **Repository Layer**
   - Database access
   - Offline support
   - Data validation

3. **Service Layer**
   - Business logic
   - Status management
   - Audit logging

4. **API Layer**
   - RESTful endpoints
   - Request validation
   - Error handling

## Usage

### Creating an Assessment

```typescript
import { AssessmentService } from '@/features/assessments/services';

const assessment = await AssessmentService.create({
  residentId: '...',
  organizationId: '...',
  type: AssessmentType.INITIAL,
  title: 'Initial Health Assessment',
  dueDate: new Date(),
  priority: AssessmentPriority.HIGH
});
```

### Updating an Assessment

```typescript
const updated = await AssessmentService.update(id, organizationId, {
  status: AssessmentStatus.IN_PROGRESS,
  sections: [/* ... */]
});
```

### Completing an Assessment

```typescript
const completed = await AssessmentService.complete(id, organizationId, {
  witness: witnessId
});
```

## Error Handling

The module uses custom `AssessmentError` class with specific error codes:

```typescript
try {
  await AssessmentService.create(data);
} catch (error) {
  if (error instanceof AssessmentError) {
    console.error(error.code, error.getLocalizedMessage());
  }
}
```

## Validation

Uses Zod for runtime validation:

```typescript
const validationResult = await validateAssessment(data);
if (!validationResult.isValid) {
  console.error(validationResult.errors);
}
```

## Audit Logging

All operations are automatically logged:

```typescript
await auditAssessmentAccess(id, 'VIEW', context);
```

## Offline Support

Uses IndexedDB for offline storage:

```typescript
const assessment = await AssessmentService.findById(id, organizationId);
// Automatically works offline
```

## Status Workflow

1. DRAFT → IN_PROGRESS
2. IN_PROGRESS → COMPLETED/REQUIRES_REVIEW
3. REQUIRES_REVIEW → IN_PROGRESS/COMPLETED
4. Any → ARCHIVED

## Contributing

1. Follow TypeScript best practices
2. Add comprehensive tests
3. Update documentation
4. Add audit logging
5. Support offline operations
6. Maintain i18n strings

## Testing

```bash
npm test src/features/assessments
```

## License

Copyright 2024 Write Care Notes Ltd. All rights reserved.
