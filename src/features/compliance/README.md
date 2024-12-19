# Compliance Module

The Compliance Module provides a comprehensive solution for managing regulatory compliance within the application. It handles compliance frameworks, audits, evidence management, and scheduling.

## Features

- Compliance Framework Management
- Audit Scheduling and Execution
- Evidence Collection and Validation
- Compliance Reporting
- Real-time Compliance Monitoring

## Directory Structure

```
compliance/
├── api/
│   └── routes.ts              # API route handlers
├── components/
│   ├── ComplianceDashboard.tsx # Main dashboard component
│   └── __tests__/            # Component tests
├── hooks/
│   └── useComplianceManagement.ts # Custom hook for compliance state
├── repositories/
│   └── complianceRepository.ts # Data access layer
├── services/
│   ├── ComplianceService.ts   # Business logic
│   └── __tests__/            # Service tests
└── types/
    └── compliance.types.ts    # Type definitions
```

## Usage

### ComplianceDashboard Component

```tsx
import { ComplianceDashboard } from '@/features/compliance/components/ComplianceDashboard';

function CareHomePage() {
  return (
    <ComplianceDashboard
      organizationId="org123"
      careHomeId="care456"
      region="UK"
    />
  );
}
```

### Compliance Service

```typescript
import { ComplianceService } from '@/features/compliance/services/ComplianceService';

const service = new ComplianceService('UK');

// Get compliance frameworks
const frameworks = await service.getFrameworks();

// Validate compliance
const audit = await service.validateCompliance(
  'organizationId',
  'careHomeId',
  'frameworkId'
);
```

## API Routes

- `GET /api/compliance/frameworks` - Get available compliance frameworks
- `GET /api/compliance/audits` - Get compliance audits
- `GET /api/compliance/audit` - Get a specific audit
- `POST /api/compliance/validate` - Validate compliance
- `POST /api/compliance/evidence` - Add compliance evidence
- `GET /api/compliance/schedule` - Get audit schedule
- `PUT /api/compliance/schedule` - Update audit schedule

## Testing

Run tests using:

```bash
npm test src/features/compliance
```

## Error Handling

The module includes comprehensive error handling at all layers:

- Repository Layer: Database operation errors
- Service Layer: Business logic validation
- API Layer: Request validation and error responses
- UI Layer: Loading states and error messages

## Types

Key types are defined in `compliance.types.ts`:

- `Region`: Supported regions (UK, US, AU, CA)
- `ComplianceFramework`: Framework structure
- `ComplianceAudit`: Audit details
- `ComplianceEvidence`: Evidence records
- `ComplianceSchedule`: Audit scheduling

## Contributing

1. Follow the existing code structure
2. Add tests for new features
3. Update documentation as needed
4. Ensure type safety
5. Handle errors appropriately
