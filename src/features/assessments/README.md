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

## Special Needs Assessment Module

### Overview

The Special Needs Assessment module extends the core assessment functionality with specialized components for comprehensive care evaluation. This module focuses on capturing detailed information about residents' communication, mobility, sensory, cognitive, behavioral, and specialized care needs.

### Components

1. **SpecialNeedsAssessmentForm**
   - Comprehensive form with multiple sections
   - Real-time validation
   - Progress tracking
   - PDF export capability

2. **Assessment Sections**
   - `CommunicationSection`: Primary and alternative communication methods
   - `MobilitySection`: Mobility aids and transfer assistance
   - `SensorySection`: Visual, auditory, and tactile needs
   - `CognitiveSection`: Comprehension and memory support
   - `BehavioralSection`: Triggers and calming strategies
   - `SpecializedCareSection`: Medical procedures and equipment
   - `ProgressSection`: Goals and adaptation tracking

### Usage

```typescript
import { SpecialNeedsAssessmentForm } from './components/special-needs/SpecialNeedsAssessmentForm';
import { useAssessment } from './context/AssessmentContext';

function AssessmentPage() {
  const handleSave = async (data) => {
    try {
      await assessmentApi.createAssessment(data);
      // Handle success
    } catch (error) {
      // Handle error
    }
  };

  return (
    <SpecialNeedsAssessmentForm
      onSave={handleSave}
      onCancel={() => router.back()}
    />
  );
}
```

### Data Management

The module uses React Context for state management:

```typescript
import { AssessmentProvider } from './context/AssessmentContext';

function App() {
  return (
    <AssessmentProvider>
      <AssessmentDashboard />
    </AssessmentProvider>
  );
}
```

### API Integration

The module provides a comprehensive API layer:

```typescript
import * as assessmentApi from './api/assessmentApi';

// Fetch assessments
const assessments = await assessmentApi.fetchAssessments();

// Search assessments
const results = await assessmentApi.searchAssessments(query);

// Export to PDF
const pdf = await assessmentApi.exportAssessmentPDF(id);
```

### Testing

The module includes comprehensive test coverage:

```bash
# Run all tests
npm test src/features/assessments

# Run specific test suite
npm test src/features/assessments/components/__tests__/SpecialNeedsAssessment.test.tsx
```

Test suites cover:
- Component rendering
- User interactions
- Form validation
- API integration
- State management
- Error handling

### Accessibility

The module follows WCAG 2.1 guidelines:
- ARIA labels and roles
- Keyboard navigation
- Screen reader support
- High contrast support
- Focus management

### Security

- Role-based access control
- Data encryption
- Audit logging
- HIPAA compliance
- Data validation

### Future Enhancements

1. **Analytics Dashboard**
   - Progress tracking visualization
   - Trend analysis
   - Outcome measurements

2. **Integration Features**
   - Care plan generation
   - Medical record integration
   - Team collaboration tools

3. **Advanced Features**
   - AI-assisted assessment recommendations
   - Real-time collaboration
   - Mobile app support
