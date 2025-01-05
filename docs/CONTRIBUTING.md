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

## Testing Requirements

### Unit Tests
- Jest for business logic
- React Testing Library for components
- 80% minimum coverage
- Mock external dependencies
- Test edge cases

### Integration Tests
- API integration tests
- Database operations
- Authentication flows
- Regional compliance

### E2E Tests
- Cypress for critical paths
- Mobile responsive testing
- Offline functionality
- Cross-browser testing

### Accessibility Tests
- WCAG 2.1 AA compliance
- Screen reader compatibility
- Keyboard navigation
- Color contrast testing

## Performance Standards

- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Lighthouse Score: > 90
- Core Web Vitals: Pass
- Offline Load: < 2s

## Documentation Requirements

### Required Documentation
1. API Documentation
2. Component Library
3. Architecture Overview
4. Security Guidelines
5. Deployment Guide
6. User Manual
7. Admin Guide
8. Integration Guide

### Format
- Markdown for developer docs
- PDF for user manuals
- Interactive guides for onboarding
- Video tutorials for training

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