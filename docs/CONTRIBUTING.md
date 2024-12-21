# Write Care Notes - Contributing Guide

## Overview

Write Care Notes is an enterprise-grade SaaS platform for care home management across the UK and Ireland. This guide outlines our development standards, architecture decisions, and compliance requirements.

## Core Principles

- **Enterprise-Grade**: Production-ready, scalable, and maintainable
- **Compliance-First**: Built around healthcare regulations
- **Accessibility-Focused**: Usable by all age groups and abilities
- **Multi-Region**: Supporting UK & Ireland with localization
- **Offline-Capable**: Core functionality works without internet
- **Multi-Tenant**: Secure isolation between organizations

## Development Setup

### Prerequisites
- Node.js 18+
- pnpm 8+
- PostgreSQL 14+
- Redis 7+

### Getting Started
1. Clone the repository
```bash
git clone https://github.com/your-org/write-care-notes.git
cd write-care-notes
```

2. Install dependencies
```bash
pnpm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
# Edit .env.local with your values
```

4. Set up the database
```bash
pnpm prisma generate
pnpm prisma migrate dev
```

5. Start the development server
```bash
pnpm dev
```

## Git Workflow

### Branch Naming Convention
- Feature: `feature/WCN-123-feature-name`
- Bug Fix: `fix/WCN-123-bug-description`
- Hotfix: `hotfix/WCN-123-critical-fix`
- Release: `release/v1.2.3`

### Commit Convention
We use Conventional Commits:
```bash
# Format
<type>(<scope>): <description>

# Examples
feat(residents): add care plan timeline
fix(auth): resolve session timeout issue
docs(api): update endpoint documentation
```

### Pull Request Process
1. Create feature branch from `develop`
2. Implement changes following our standards
3. Write/update tests
4. Update documentation
5. Create PR with template
6. Address review comments
7. Squash and merge

## Code Standards

### TypeScript
```typescript
// Use strict types
const residents: Resident[] = []

// Define interfaces/types
interface Resident {
  id: string
  name: string
  dateOfBirth: Date
  careLevel: CareLevel
}

// Use enums for fixed values
enum CareLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

// Use type guards
function isResident(obj: any): obj is Resident {
  return 'id' in obj && 'careLevel' in obj
}
```

### React Components
```typescript
// Use functional components
import { type FC } from 'react'

interface Props {
  resident: Resident
  onUpdate: (id: string) => void
}

export const ResidentCard: FC<Props> = ({
  resident,
  onUpdate
}) => {
  return (
    <div>
      {/* Component JSX */}
    </div>
  )
}
```

### API Routes
```typescript
// app/api/residents/route.ts
import { validateRequest } from '@/lib/api'

export async function GET(req: Request) {
  // 1. Validate request
  const { user, query } = await validateRequest(req)
  
  // 2. Process request
  const data = await processRequest(query)
  
  // 3. Return response
  return Response.json({ data })
}
```

## Care Home Module Guidelines

### 1. Terminology Standards
- Use "care home" consistently throughout the codebase
- Use "resident" instead of "patient"
- Use proper regulatory body names (CQC, CIW, etc.)
- Use role-specific terminology (e.g., "care worker", "nurse")
- Follow regional naming conventions

### 2. Component Structure
```typescript
// Care Home Context
interface CareHomeContextProps {
  careHome: CareHome;
  residents: Resident[];
  staff: Staff[];
  compliance: ComplianceStatus;
  dispatch: CareHomeDispatch;
}

// Care Home Provider
const CareHomeProvider: React.FC = ({ children }) => {
  const [state, dispatch] = useCareHomeReducer();
  const { isOffline } = useMobileContext();
  
  return (
    <CareHomeContext.Provider value={{ ...state, dispatch }}>
      {children}
    </CareHomeContext.Provider>
  );
};
```

### 3. Mobile-First Implementation
```scss
// Care Home Layout
.care-home-layout {
  display: grid;
  gap: 1rem;
  padding: 1rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    padding: 1.5rem;
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
    padding: 2rem;
  }
}

// Care Home Card
.care-home-card {
  border-radius: 0.5rem;
  padding: 1rem;
  
  &__header {
    display: flex;
    align-items: center;
    min-height: 44px; // Touch target
  }
  
  &__actions {
    gap: 0.5rem;
    touch-action: manipulation;
  }
}

## Module-Specific Guidelines

### Payroll Module

#### Development Requirements
- Strong understanding of UK/Ireland payroll regulations
- Experience with financial calculations and tax systems
- Knowledge of secure payment processing

#### Testing Standards
1. **Unit Tests**
   - Tax calculation accuracy
   - Salary computation
   - Deduction processing
   - Currency conversions

2. **Integration Tests**
   - Payment processing flows
   - Tax compliance checks
   - Time tracking integration
   - Report generation

3. **Security Tests**
   - Data encryption verification
   - Access control validation
   - Audit log completeness
   - PII data handling

#### Code Organization
- Follow repository pattern for data access
- Implement service layer for business logic
- Use TypeScript interfaces for all data models
- Maintain separate concerns for calculation and presentation

#### Documentation Requirements
- API endpoint documentation
- Calculation formulas and logic
- Tax compliance considerations
- Security measures
- Data flow diagrams
- Error handling procedures

#### Compliance Checklist
- [ ] HMRC compliance verified
- [ ] Data protection measures implemented
- [ ] Audit logging enabled
- [ ] Error handling documented
- [ ] Security review completed
- [ ] Performance testing done
- [ ] Documentation updated

## Development Standards

### Code Style
- TypeScript strict mode enabled
- ESLint with custom ruleset
- Prettier for code formatting
- Husky for pre-commit hooks

### Component Guidelines
- Functional components with hooks
- Props validation with TypeScript
- Error boundaries for fault isolation
- Accessibility-first development

### Testing Requirements
1. **Unit Tests**
   - Jest for business logic
   - React Testing Library for components
   - 80% minimum coverage

2. **Integration Tests**
   - API integration tests
   - Database operations
   - Authentication flows

3. **E2E Tests**
   - Cypress for critical paths
   - Mobile responsive testing
   - Offline functionality

4. **Accessibility Tests**
   - WCAG 2.1 AA compliance
   - Screen reader compatibility
   - Keyboard navigation

### Performance Standards
- Lighthouse score targets:
  - Performance: 90+
  - Accessibility: 100
  - Best Practices: 95+
  - SEO: 95+

### Security Requirements
1. **Code Security**
   - No sensitive data in code
   - Dependency scanning
   - Regular security audits

2. **Data Protection**
   - GDPR compliance
   - NHS Data Security standards
   - Encryption at rest and in transit

### Release Process
1. **Pre-release Checklist**
   - All tests passing
   - Security scan complete
   - Performance benchmarks met
   - Documentation updated
   - Accessibility verified
   - Regional compliance checked

2. **Deployment Steps**
   - Database migrations
   - Feature flags configured
   - CDN cache invalidation
   - Monitoring setup

3. **Post-deployment**
   - Smoke tests
   - Error monitoring
   - Usage analytics
   - Performance metrics

### Branching Strategy
```
main
├── develop
│   ├── feature/ABC-123
│   ├── bugfix/ABC-456
│   └── hotfix/ABC-789
└── release/v1.x.x
```

### Commit Guidelines
- Conventional Commits format
- Linked to JIRA tickets
- Include test coverage
- Document breaking changes

## Pull Request Guidelines

### 1. PR Template
```markdown
## Description
[Describe the changes made and why]

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Mobile Considerations
- [ ] Tested on mobile devices
- [ ] Optimized for touch interactions
- [ ] Offline functionality verified
- [ ] Performance impact assessed

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated
- [ ] Mobile testing completed

## Documentation
- [ ] API documentation updated
- [ ] Component documentation updated
- [ ] README updated if needed
- [ ] CHANGELOG updated

## Screenshots/Videos
[If applicable, add visual evidence]

## Performance Impact
- [ ] Bundle size impact assessed
- [ ] Load time impact measured
- [ ] Memory usage verified
- [ ] Battery impact
```

### 2. Code Review Checklist
```markdown
## Functionality
- [ ] Requirements met
- [ ] Edge cases handled
- [ ] Error states managed
- [ ] Offline behavior correct

## Code Quality
- [ ] TypeScript types complete
- [ ] No any types used
- [ ] Error handling implemented
- [ ] Comments clear and necessary

## Mobile & Accessibility
- [ ] Mobile-first approach
- [ ] Touch interactions natural
- [ ] WCAG 2.1 compliant
- [ ] Screen reader tested

## Performance
- [ ] No unnecessary re-renders
- [ ] Proper code splitting
- [ ] Assets optimized
- [ ] Memory leaks checked
```

## Release Process

### Version Bumping
```bash
# Patch version (bug fixes)
npm version patch

# Minor version (new features)
npm version minor

# Major version (breaking changes)
npm version major
```

### Changelog Format
```markdown
# Changelog

## [1.2.0] - 2024-12-13

### Added
- Offline support for care plans
- Mobile-optimized touch interactions
- Performance monitoring system

### Changed
- Improved mobile form layouts
- Enhanced error handling system
- Updated documentation structure

### Fixed
- Touch event handling on iOS
- Offline sync conflicts
- Memory leaks in form components
```

### Release Checklist
```markdown
## Pre-Release
- [ ] Version bumped
- [ ] Changelog updated
- [ ] Documentation current
- [ ] Tests passing
- [ ] Mobile testing complete
- [ ] Performance benchmarks run

## Release
- [ ] Build artifacts generated
- [ ] Release notes prepared
- [ ] Tags created
- [ ] Deployment verified

## Post-Release
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify mobile functionality
- [ ] Update status page
```

# Updates to Design System Section

## UI Framework & Styling

### Tailwind CSS Configuration
```typescript:tailwind.config.ts
import type { Config } from 'tailwindcss'

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // NHS Colors
        primary: {
          DEFAULT: '#0F52BA', // NHS Blue
          light: '#E6F0FF',
          dark: '#003087'
        },
        secondary: {
          DEFAULT: '#005EB8', // Care Quality Blue
          light: '#E6F0FF',
          dark: '#003D78'
        },
        success: {
          DEFAULT: '#00A499', // Healthcare Green
          light: '#E6F5F4',
          dark: '#006C64'
        },
        warning: {
          DEFAULT: '#FFB81C', // Alert Yellow
          light: '#FFF7E6',
          dark: '#A67712'
        },
        error: {
          DEFAULT: '#DA291C', // Emergency Red
          light: '#FCE8E6',
          dark: '#8F1B13'
        },
        neutral: {
          50: '#F0F4F5',  // Background
          100: '#E1E8EA',
          200: '#C3CCD0',
          300: '#A5B1B6',
          400: '#87959C',
          500: '#697982',
          600: '#4B5D68',
          700: '#2D414E',
          800: '#212B32', // Text
          900: '#0F1A21'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        nhs: ['Frutiger', 'Arial', 'sans-serif']
      },
      spacing: {
        // NHS spacing scale
        '1': '0.25rem',   // 4px
        '2': '0.5rem',    // 8px
        '3': '0.75rem',   // 12px
        '4': '1rem',      // 16px
        '5': '1.25rem',   // 20px
        '6': '1.5rem',    // 24px
        '8': '2rem',      // 32px
        '10': '2.5rem',   // 40px
        '12': '3rem',     // 48px
        '16': '4rem',     // 64px
        '20': '5rem',     // 80px
        '24': '6rem'      // 96px
      },
      borderRadius: {
        'nhs': '0.375rem' // 6px NHS standard
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio')
  ]
}
```

### Base Component Examples

```typescript:src/components/ui/Button.tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-nhs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-white hover:bg-primary-dark',
        secondary: 'bg-secondary text-white hover:bg-secondary-dark',
        outline: 'border border-input bg-background hover:bg-neutral-50',
        ghost: 'hover:bg-neutral-50',
        link: 'text-primary underline-offset-4 hover:underline'
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-nhs px-3',
        lg: 'h-11 rounded-nhs px-8',
        icon: 'h-10 w-10'
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default'
    }
  }
)
```

## Enhanced Care Home Features

### Clinical Features
- Electronic Medication Administration Records (eMAR)
- Care Plan Management
- Risk Assessments
- Wound Care Management
- Vital Signs Monitoring
- Nutrition & Hydration Tracking
- Infection Control
- End of Life Care

### Operational Features
- Staff Rota Management
- Room & Bed Management
- Inventory Control
- Maintenance Tracking
- Visitor Management
- Transport Coordination
- Kitchen & Dietary Management
- Laundry Service Management

### Compliance Features
- Regulatory Inspection Preparation
- Policy & Procedure Management
- Training & Competency Tracking
- Incident Reporting
- Safeguarding Management
- Health & Safety Compliance
- Fire Safety Management
- Infection Prevention Control

### Financial Features
- Resident Billing
- Staff Payroll
- Supplier Management
- Budget Tracking
- Expense Management
- Grant Management
- Financial Reporting
- Cost Analysis

### Communication Features
- Family Portal
- Staff Communication
- GP Integration
- Pharmacy Integration
- Emergency Services Liaison
- Social Services Coordination
- Multi-disciplinary Team Communication
- Relative Updates & Notifications

## Care Home Types & Regulatory Frameworks

### Adult Care (CQC Regulated)
- Residential Care
- Nursing Care
- Dementia Care
- Mental Health Care
- Learning Disability Support

### Children's Care (Ofsted Regulated)
1. Children's Homes
   - Residential Care
   - Secure Children's Homes
   - Short Break/Respite Care
   - Emergency Placements
   - Therapeutic Care

2. Education Integration
   - School Performance Tracking
   - Individual Education Plans (IEPs)
   - SEND Support
   - Educational Progress Reports
   - Learning Support Programs

3. Safeguarding Requirements
   - Enhanced DBS Checks
   - Safer Recruitment
   - Prevent Duty Compliance
   - Child Protection Procedures
   - Missing Children Protocols

## Regulatory Compliance

### Ofsted Requirements
1. Quality Standards
   - Quality of Education
   - Behaviour and Attitudes
   - Personal Development
   - Leadership and Management

2. Documentation
   - Statement of Purpose
   - Children's Guide
   - Location Assessment
   - Risk Assessments
   - Behaviour Management Policies

3. Record Keeping
   - Daily Logs
   - Educational Records
   - Health Records
   - Incident Reports
   - Contact Records

4. Staff Requirements
   - Qualification Verification
   - Continuous Professional Development
   - Regular Supervision
   - Performance Reviews
   - Training Records

### CQC Requirements
[existing CQC content...]

## Module-Specific Guidelines

### Children's Care Module
```typescript
// Example Children's Record Structure
interface ChildRecord {
  personalDetails: {
    id: string;
    name: string;
    dateOfBirth: Date;
    legalStatus: LegalStatus;
    placementType: PlacementType;
  };
  education: {
    school: SchoolDetails;
    educationalNeeds: EducationalNeeds;
    progressReports: ProgressReport[];
    iepGoals: IEPGoal[];
  };
  safeguarding: {
    riskAssessments: RiskAssessment[];
    incidents: SafeguardingIncident[];
    contactRestrictions: ContactRestriction[];
  };
  development: {
    developmentalGoals: DevelopmentGoal[];
    achievements: Achievement[];
    behaviourPlans: BehaviourPlan[];
  };
}
```

### Education Tracking Module
```typescript
// Education Progress Monitoring
interface EducationTracking {
  academics: {
    subjects: SubjectProgress[];
    assessments: Assessment[];
    interventions: Intervention[];
  };
  attendance: {
    records: AttendanceRecord[];
    patterns: AttendancePattern[];
    interventions: AttendanceIntervention[];
  };
  behaviour: {
    incidents: BehaviourIncident[];
    improvements: BehaviourImprovement[];
    supports: BehaviourSupport[];
  };
}
```

### Safeguarding Module
```typescript
// Safeguarding Requirements
interface SafeguardingModule {
  checks: {
    staffChecks: DBSCheck[];
    visitorChecks: VisitorCheck[];
    regularReviews: SafeguardingReview[];
  };
  incidents: {
    reports: IncidentReport[];
    investigations: Investigation[];
    outcomes: IncidentOutcome[];
  };
  training: {
    requirements: TrainingRequirement[];
    completions: TrainingCompletion[];
    updates: TrainingUpdate[];
  };
}
```

## Development Standards

### Children's Care Specific Requirements
1. Data Protection
   - Enhanced privacy controls
   - Age-appropriate consent handling
   - Restricted access levels
   - Audit trail requirements

2. User Interface
   - Age-appropriate interfaces
   - Accessibility for young users
   - Simple navigation
   - Clear visual hierarchy

3. Documentation
   - Detailed incident logging
   - Educational progress tracking
   - Behaviour monitoring
   - Contact records
   - Placement history

4. Security
   - Enhanced access controls
   - Location tracking
   - Visitor management
   - Communication monitoring

### Testing Requirements
```typescript
// Example Test Cases
describe('Children\'s Module', () => {
  describe('Safeguarding', () => {
    it('should enforce enhanced privacy controls', () => {
      // Test privacy implementation
    });

    it('should maintain detailed audit logs', () => {
      // Test audit logging
    });

    it('should handle incident reporting correctly', () => {
      // Test incident workflows
    });
  });

  describe('Education Tracking', () => {
    it('should track educational progress', () => {
      // Test progress monitoring
    });

    it('should manage IEP goals', () => {
      // Test IEP functionality
    });
  });
});
```

## Compliance Reporting

### Ofsted Reporting Requirements
1. Regular Reports
   - Quality of Care Review
   - Education Progress Review
   - Safeguarding Review
   - Leadership Assessment
   - Location Assessment

2. Incident Reports
   - Behaviour Incidents
   - Safeguarding Concerns
   - Missing Person Reports
   - Restraint Records
   - Complaint Records

3. Outcome Tracking
   - Educational Achievements
   - Personal Development
   - Health Outcomes
   - Behaviour Progress
   - Placement Stability

## Ofsted-Specific Requirements

### 1. Quality of Care Standards
```typescript
interface QualityOfCareStandards {
  // Children's Views, Wishes and Feelings
  childrenViews: {
    participationRecords: ParticipationRecord[];
    feedbackMechanisms: FeedbackMechanism[];
    advocacySupport: AdvocacySupport[];
  };

  // Education Standards
  education: {
    schoolAttendance: AttendanceRecord[];
    educationalProgress: ProgressReport[];
    personalEducationPlans: PEP[];
    extraCurricularActivities: Activity[];
  };

  // Health and Wellbeing
  health: {
    medicalRecords: MedicalRecord[];
    mentalHealthSupport: MentalHealthSupport[];
    therapeuticInterventions: TherapySession[];
    healthyLifestylePromotions: HealthPromotion[];
  };

  // Positive Relationships
  relationships: {
    familyContact: ContactRecord[];
    peerRelationships: RelationshipAssessment[];
    communityEngagement: CommunityActivity[];
    professionalNetworks: ProfessionalNetwork[];
  };
}
```

### 2. Safeguarding Framework
```typescript
interface SafeguardingFramework {
  // Risk Management
  riskManagement: {
    riskAssessments: RiskAssessment[];
    safetyPlans: SafetyPlan[];
    restrictivePractices: RestrictivePracticeRecord[];
  };

  // Child Protection
  childProtection: {
    concerns: SafeguardingConcern[];
    referrals: SafeguardingReferral[];
    multiAgencyMeetings: MeetingRecord[];
    protectionPlans: ProtectionPlan[];
  };

  // Missing Episodes
  missingEpisodes: {
    incidents: MissingIncident[];
    returnInterviews: ReturnInterview[];
    riskAssessments: MissingRiskAssessment[];
    preventionStrategies: PreventionStrategy[];
  };
}
```

### 3. Leadership Requirements
```typescript
interface LeadershipRequirements {
  // Service Management
  management: {
    qualityAssurance: QualityCheck[];
    staffSupervision: SupervisionRecord[];
    teamMeetings: MeetingMinutes[];
    developmentPlans: DevelopmentPlan[];
  };

  // Staff Development
  staffDevelopment: {
    trainingMatrix: TrainingRecord[];
    qualifications: QualificationRecord[];
    cpd: CPDRecord[];
    performanceReviews: PerformanceReview[];
  };

  // Regulatory Compliance
  compliance: {
    registrationDetails: RegistrationDetail[];
    inspectionReports: InspectionReport[];
    actionPlans: ActionPlan[];
    notifications: StatutoryNotification[];
  };
}
```

### 4. Documentation Requirements
```typescript
interface DocumentationRequirements {
  // Core Documents
  coreDocuments: {
    statementOfPurpose: StatementOfPurpose;
    childrensGuide: ChildrensGuide;
    locationAssessment: LocationAssessment;
    qualityStandardsPolicy: QualityStandardsPolicy;
  };

  // Care Records
  careRecords: {
    placementPlans: PlacementPlan[];
    dailyLogs: DailyLog[];
    incidentReports: IncidentReport[];
    behaviorRecords: BehaviorRecord[];
  };

  // Professional Records
  professionalRecords: {
    staffRecords: StaffRecord[];
    visitorRecords: VisitorLog[];
    professionalVisits: ProfessionalVisit[];
    externalReviews: ExternalReview[];
  };
}
```

### 5. Monitoring Requirements
```typescript
interface MonitoringRequirements {
  // Quality Monitoring
  qualityMonitoring: {
    monthlyMonitoring: MonitoringReport[];
    independentVisits: Reg44Visit[];
    stakeholderFeedback: FeedbackRecord[];
    improvementPlans: ImprovementPlan[];
  };

  // Outcome Monitoring
  outcomeMonitoring: {
    educationalOutcomes: EducationOutcome[];
    healthOutcomes: HealthOutcome[];
    socialOutcomes: SocialOutcome[];
    emotionalOutcomes: EmotionalOutcome[];
  };

  // Incident Monitoring
  incidentMonitoring: {
    behaviorIncidents: BehaviorIncident[];
    restraints: RestraintRecord[];
    complaints: ComplaintRecord[];
    safeguardingIncidents: SafeguardingIncident[];
  };
}
```

### 6. Compliance Testing Requirements
```typescript
describe('Ofsted Compliance', () => {
  describe('Documentation', () => {
    it('should maintain complete child records', async () => {
      // Test child record completeness
    });

    it('should track all required notifications', async () => {
      // Test notification system
    });

    it('should manage staff records appropriately', async () => {
      // Test staff record management
    });
  });

  describe('Safeguarding', () => {
    it('should handle missing episodes correctly', async () => {
      // Test missing episode workflow
    });

    it('should manage risk assessments properly', async () => {
      // Test risk assessment process
    });

    it('should track all safeguarding concerns', async () => {
      // Test safeguarding tracking
    });
  });

  describe('Quality Standards', () => {
    it('should monitor educational progress', async () => {
      // Test education monitoring
    });

    it('should track health outcomes', async () => {
      // Test health tracking
    });

    it('should manage behavior incidents', async () => {
      // Test behavior management
    });
  });
});
```

## Regional Support Guidelines

### Regional Configuration
```typescript
// src/config/regions/index.ts
export const SUPPORTED_REGIONS = {
  ENGLAND: {
    code: 'en-GB',
    regulator: 'CQC',
    currency: 'GBP',
    languages: ['en'],
    timezone: 'Europe/London',
    compliance: ['CQC', 'NICE', 'NHS']
  },
  WALES: {
    code: 'cy-GB',
    regulator: 'CIW',
    currency: 'GBP',
    languages: ['en', 'cy'],
    timezone: 'Europe/London',
    compliance: ['CIW', 'NHS Wales']
  },
  SCOTLAND: {
    code: 'en-GB',
    regulator: 'Care Inspectorate',
    currency: 'GBP',
    languages: ['en', 'gd'],
    timezone: 'Europe/London',
    compliance: ['Care Inspectorate', 'NHS Scotland']
  },
  NORTHERN_IRELAND: {
    code: 'en-GB',
    regulator: 'RQIA',
    currency: 'GBP',
    languages: ['en', 'ga'],
    timezone: 'Europe/London',
    compliance: ['RQIA', 'NHS Northern Ireland']
  },
  IRELAND: {
    code: 'en-IE',
    regulator: 'HIQA',
    currency: 'EUR',
    languages: ['en', 'ga'],
    timezone: 'Europe/Dublin',
    compliance: ['HIQA', 'HSE']
  }
} as const;
```

### Regional Development Process
1. **Feature Planning**
   - Review regulatory requirements for each region
   - Document region-specific variations
   - Plan for language support
   - Consider currency handling

2. **Implementation**
   - Use region-aware components
   - Implement proper i18n support
   - Handle regional date/time formats
   - Support regional currencies

3. **Testing**
   - Test in all supported regions
   - Verify language support
   - Validate regulatory compliance
   - Check currency handling

## Multi-Tenant Architecture Guidelines

### Tenant Isolation
```typescript
// src/lib/tenant/middleware.ts
export async function withTenant(
  req: Request,
  handler: RouteHandler
): Promise<Response> {
  const tenantId = req.headers.get('x-tenant-id');
  if (!tenantId) {
    throw new UnauthorizedError('Missing tenant ID');
  }

  const tenant = await validateTenant(tenantId);
  return handler(req, { tenant });
}
```

### Data Access
```typescript
// src/lib/db/client.ts
export class TenantPrismaClient extends PrismaClient {
  constructor(private tenant: Tenant) {
    super({
      datasourceUrl: getTenantDatabaseUrl(tenant),
    });
  }

  async $connect() {
    await super.$connect();
    await this.setTenantContext();
  }

  private async setTenantContext() {
    await this.$executeRaw`
      SET app.tenant_id = ${this.tenant.id}::uuid;
    `;
  }
}
```

## Compliance & Security Standards

### Code Security Requirements
1. **Authentication & Authorization**
   - Multi-factor authentication
   - Role-based access control
   - Session management
   - JWT handling

2. **Data Protection**
   - End-to-end encryption
   - Data anonymization
   - PII handling
   - Audit logging

3. **API Security**
   - Rate limiting
   - Input validation
   - Output sanitization
   - Error handling

### Compliance Testing
```typescript
describe('Compliance', () => {
  describe('Data Protection', () => {
    test('should encrypt sensitive data', () => {
      // Test encryption
    });

    test('should maintain audit logs', () => {
      // Test audit logging
    });
  });

  describe('Access Control', () => {
    test('should enforce role-based access', () => {
      // Test RBAC
    });

    test('should handle MFA correctly', () => {
      // Test MFA
    });
  });
});
```

## Testing Requirements

### Regional Testing
```typescript
describe('Regional Features', () => {
  SUPPORTED_REGIONS.forEach((region) => {
    describe(region.code, () => {
      test('should handle regional date formats', () => {
        // Test date formatting
      });

      test('should support regional languages', () => {
        // Test i18n
      });

      test('should handle regional currency', () => {
        // Test currency
      });
    });
  });
});
```

### Offline Support Testing
```typescript
describe('Offline Support', () => {
  test('should work without internet', async () => {
    // Test offline functionality
  });

  test('should sync when back online', async () => {
    // Test sync
  });

  test('should handle conflicts', async () => {
    // Test conflict resolution
  });
});
```

### Performance Testing
```typescript
describe('Performance', () => {
  test('should meet load time targets', async () => {
    // Test load times
  });

  test('should handle concurrent users', async () => {
    // Test concurrency
  });

  test('should optimize memory usage', async () => {
    // Test memory
  });
});
```

## Naming Conventions

### 1. File & Directory Structure
```bash
src/
├── components/          # React Components (PascalCase)
│   ├── ui/             # Base UI components
│   │   ├── Button.tsx
│   │   └── Card.tsx
│   └── features/       # Feature components
│       └── bed-management/  # Feature modules (kebab-case)
│           ├── BedManagementDashboard.tsx
│           └── BedStatusOverview.tsx
├── hooks/              # React Hooks (kebab-case)
│   ├── use-auth.ts
│   └── use-bed-management.ts
├── lib/               # Utilities (kebab-case)
│   ├── api/
│   │   └── bed-management.ts
│   └── utils/
│       └── date-formatter.ts
└── types/             # TypeScript types (kebab-case)
    └── bed-management-types.ts
```

### 2. Naming Rules
- **Components**: PascalCase (e.g., `BedManagementDashboard.tsx`)
- **Hooks**: Kebab-case with 'use-' prefix (e.g., `use-bed-management.ts`)
- **API Routes**: Kebab-case (e.g., `/api/bed-management/route.ts`)
- **Types**: Kebab-case for files, PascalCase for types (e.g., `bed-management-types.ts`)
- **Utilities**: Kebab-case (e.g., `api-utils.ts`)

## Enterprise-Grade Standards

### 1. File Headers
```typescript
/**
 * WriteCareNotes.com
 * @fileoverview Brief description
 * @version 1.0.0
 * @created YYYY-MM-DD
 * @author [Author Name]
 * @copyright Phibu Cloud Solutions Ltd.
 *
 * Description:
 * Detailed description of the file's purpose
 */
```

### 2. Component Requirements
- Must include proper TypeScript types
- Must handle loading states
- Must implement error boundaries
- Must support offline functionality
- Must be accessibility compliant
- Must support regional variations
- Must include proper documentation

### 3. Healthcare Compliance
- CQC (England) compliance
- CIW (Wales) compliance
- Care Inspectorate (Scotland) compliance
- RQIA (Northern Ireland) compliance
- HIQA (Ireland) compliance

### 4. Security Requirements
- Data encryption at rest
- Secure data transmission
- Role-based access control
- Audit logging
- GDPR compliance
- NHS Data Security standards

### 5. Regional Support
- Language support (English, Welsh, Irish, Scottish Gaelic)
- Regional regulatory compliance
- Regional date/time formats
- Regional currency handling
- Regional terminology

### 6. Code Quality Standards
```typescript
// Component Example
interface BedManagementProps {
  facilityId: string;
  region: Region;
  onStatusChange: (status: BedStatus) => void;
}

export function BedManagement({ 
  facilityId,
  region,
  onStatusChange 
}: BedManagementProps) {
  // Implementation
}

// Hook Example
export function useBedManagement(facilityId: string) {
  // Implementation
}

// Type Example
export interface BedStatus {
  id: string;
  status: BedStatusType;
  lastUpdated: Date;
}
```

### 7. Testing Requirements
- Unit tests for business logic
- Integration tests for API endpoints
- E2E tests for critical workflows
- Accessibility testing
- Performance testing
- Regional compliance testing

### 8. Documentation Requirements
- Component documentation
- API documentation
- Regional compliance documentation
- Security documentation
- Deployment documentation

### 9. Performance Standards
- First contentful paint < 1.5s
- Time to interactive < 3.5s
- Offline capability
- Mobile responsiveness
- Memory optimization

### 10. Accessibility Requirements
- WCAG 2.1 AA compliance
- Screen reader support
- Keyboard navigation
- Color contrast compliance
- Motion reduction support

## Feature Implementation Checklist

### 1. Planning Phase
- [ ] Regional requirements identified
- [ ] Compliance requirements documented
- [ ] Security requirements defined
- [ ] Offline capabilities planned
- [ ] API endpoints designed

### 2. Development Phase
- [ ] TypeScript types defined
- [ ] Components implemented
- [ ] API routes created
- [ ] Tests written
- [ ] Documentation added

### 3. Review Phase
- [ ] Code review completed
- [ ] Security review completed
- [ ] Accessibility review completed
- [ ] Performance review completed
- [ ] Regional compliance verified

### 4. Testing Phase
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] Accessibility tests passing
- [ ] Performance benchmarks met

### 5. Deployment Phase
- [ ] Feature flags configured
- [ ] Monitoring setup
- [ ] Documentation published
- [ ] Release notes prepared
- [ ] Support team briefed