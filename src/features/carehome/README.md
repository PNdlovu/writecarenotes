# Care Home Module

## Overview
The Care Home module provides comprehensive management of individual care homes, including specialized care types, regional compliance, staffing management, and service delivery tracking.

## Core Features

### Care Home Types
- 14 specialized care home types
- Multiple specializations support
- Care level management
- Service requirements tracking
- Equipment management

### Regional Support
- Full UK region coverage
- Region-specific compliance
- Local authority integration
- Regional funding management
- Language and cultural support

### Staffing & Operations
- Staff ratio calculations
- Qualification tracking
- Training requirements
- Capacity planning
- Service delivery monitoring

### Compliance & Standards
- CQC compliance
- Regional requirements
- Quality metrics tracking
- Inspection management
- Certification tracking

## Architecture

### Directory Structure
```
carehome/
├── api/                    # API endpoints
│   ├── routes/            # API routes
│   └── handlers/          # Request handlers
├── components/            # UI Components
│   ├── details/          # Care home details
│   ├── forms/            # Input forms
│   ├── list/             # Listing components
│   └── stats/            # Statistics display
├── hooks/                # Custom React hooks
├── services/            # Business logic
│   ├── careHomeService.ts
│   ├── careHomeTypeService.ts
│   └── regionService.ts
└── types/              # TypeScript types
    ├── carehome.types.ts
    └── region.types.ts
```

## Getting Started

### Basic Usage
```typescript
import { 
  CareHomeService, 
  CareHomeType,
  CareHomeSpecialization 
} from '@/features/carehome'

const careHome = await CareHomeService.getInstance().createCareHome({
  name: 'Sunshine Care Home',
  type: CareHomeType.NURSING_HOME,
  specializations: [
    CareHomeSpecialization.ELDERLY,
    CareHomeSpecialization.DEMENTIA
  ]
})
```

### Regional Requirements
```typescript
import { RegionService, UKRegion } from '@/features/carehome'

const regionService = RegionService.getInstance()
const requirements = await regionService.getRegionalRequirements(
  UKRegion.NORTH_WEST
)
```

### Staffing Calculations
```typescript
import { 
  CareHomeTypeService,
  CareHomeType,
  CareLevel 
} from '@/features/carehome'

const typeService = CareHomeTypeService.getInstance()
const staffing = await typeService.calculateStaffingRequirements(
  CareHomeType.NURSING_HOME,
  [CareHomeSpecialization.ELDERLY],
  [CareLevel.HIGH],
  50 // capacity
)
```

## Integration with Organizations

The Care Home module integrates with the Organizations module (`@/features/organizations`) for multi-care home management. While this module handles individual care home operations, organization-wide concerns are delegated to the Organizations module.

### Example Integration
```typescript
import { useOrganization } from '@/features/organizations'
import { useCareHome } from '@/features/carehome'

function CareHomeDetails({ careHomeId }) {
  const { organization } = useOrganization()
  const { careHome } = useCareHome(careHomeId)
  
  return (
    <Details
      careHome={careHome}
      organizationPolicies={organization.policies}
    />
  )
}
```

## Features

### Care Home Types
- Nursing homes
- Residential homes
- Specialized care facilities
- Mental health units
- Learning disability homes
- Dementia care units
- Physical disability homes
- Respite care centers
- Palliative care units
- Rehabilitation centers
- Supported living
- Extra care housing
- Retirement villages
- Day care centers

### Specializations
- Elderly care
- Young adults
- Children's services
- Dementia care
- Mental health
- Learning disabilities
- Physical disabilities
- Brain injury
- Substance misuse
- Eating disorders
- Autism support
- Sensory impairment

### Care Levels
- Minimal support
- Low dependency
- Moderate care
- High dependency
- Intensive care
- Specialized care

## Testing
- Unit tests for services
- Integration tests for APIs
- Component tests
- Regional compliance tests
- Type-specific tests

## Documentation
- [Features](./FEATURES.md) - Detailed feature documentation
- [Changelog](./CHANGELOG.md) - Version history and changes
- [API Documentation](./docs/API.md) - API reference

## Contributing
Please see [CONTRIBUTING.md](../../CONTRIBUTING.md) for development guidelines.
