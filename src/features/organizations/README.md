# Organizations Module

## Overview
The Organizations module provides enterprise-grade management of multi-care home organizations. It focuses on organization-wide operations, resource sharing, and cross-care home coordination.

## Core Features

### Organization Management
- Multi-care home coordination
- Organization-wide policies
- Resource allocation
- Cross-care home reporting
- Group-level analytics

### Security & Compliance
- GDPR compliant data handling
- WCAG 2.1 AA accessibility
- NHS Digital compliance
- Organization-wide audit logging
- Security policy enforcement

### Enterprise Features
- Multi-tenant architecture
- Role-based access control
- Error handling and monitoring
- Performance telemetry
- Health checks
- Organization-wide analytics

## Architecture

### Directory Structure
```
organizations/
├── api/                    # API endpoints
│   ├── routes/            # API routes
│   └── handlers/          # Request handlers
├── components/            # UI Components
│   ├── dashboard/         # Organization dashboard
│   ├── settings/         # Organization settings
│   ├── analytics/        # Organization analytics
│   └── error/           # Error boundaries
├── hooks/                # Custom React hooks
├── lib/                  # Core utilities
├── providers/           # Context providers
├── repositories/        # Data access layer
├── services/           # Business logic
│   ├── organizationService.ts
│   ├── analyticsService.ts
│   ├── securityService.ts
│   ├── auditService.ts
│   └── telemetryService.ts
└── types/             # TypeScript types
```

## Getting Started

### Basic Setup
```typescript
import { OrganizationProvider, useOrganization } from '@/features/organizations'

function App() {
  return (
    <OrganizationProvider organizationId="org_123">
      <YourComponent />
    </OrganizationProvider>
  )
}
```

### Security Features
```typescript
import { SecurityService, AuditService } from '@/features/organizations'

// Organization-wide audit logging
const auditService = new AuditService()
await auditService.logEvent({
  type: 'organization.updated',
  organizationId: 'org_123',
  action: 'update_settings',
  changes: { name: 'New Name' }
})
```

### Analytics & Reporting
```typescript
import { OrganizationAnalyticsService } from '@/features/organizations'

const analytics = new OrganizationAnalyticsService()
const report = await analytics.generateOrganizationReport({
  organizationId: 'org_123',
  metrics: ['occupancy', 'staffing', 'compliance']
})
```

## Integration with Care Homes

The Organizations module integrates with the Care Homes module (`@/features/carehome`) for individual care home management. While this module handles organization-wide concerns, care home specific operations are delegated to the Care Homes module.

### Example Integration
```typescript
import { useOrganization } from '@/features/organizations'
import { useCareHomeList } from '@/features/carehome'

function OrganizationDashboard() {
  const { organization } = useOrganization()
  const { careHomes } = useCareHomeList(organization.id)
  
  return (
    <Dashboard
      organization={organization}
      careHomes={careHomes}
    />
  )
}
```

## Testing
- Unit tests for business logic
- Integration tests for API endpoints
- E2E tests for critical flows
- Accessibility testing
- Security testing

## Error Handling
All components are wrapped with error boundaries:
```typescript
import { OrganizationErrorBoundary } from '@/features/organizations'

function YourComponent() {
  return (
    <OrganizationErrorBoundary>
      <YourFeature />
    </OrganizationErrorBoundary>
  )
}
```

## Monitoring & Telemetry
```typescript
import { TelemetryService } from '@/features/organizations'

const telemetry = TelemetryService.getInstance()
await telemetry.trackEvent('organization_usage', {
  feature: 'cross_home_reporting',
  action: 'generate_report'
})
```

## Documentation
- [Features](./FEATURES.md) - Detailed feature documentation
- [Changelog](./CHANGELOG.md) - Version history and changes
- [Architecture](../../ARCHITECTURE.md) - System architecture overview

## Contributing
Please see [CONTRIBUTING.md](../../CONTRIBUTING.md) for development guidelines.