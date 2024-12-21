# Write Care Notes - Application Structure

## Root Directory Structure
```bash
/
├── app/                    # Next.js App Router (Main application code)
│   ├── (auth)/            # Authentication routes (signin, signup, etc.)
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── (marketing)/       # Public marketing pages
│   │   ├── about/        # About pages
│   │   ├── demo/         # Demo pages
│   │   ├── features/     # Features showcase
│   │   └── pricing/      # Pricing information
│   ├── api/              # API routes
│   └── layout.tsx        # Root layout
├── src/                   # Source code
│   ├── components/        # React components
│   │   ├── auth/         # Authentication components
│   │   ├── marketing/    # Marketing components
│   │   ├── offline/      # Offline functionality
│   │   └── ui/           # Base UI components
│   ├── features/         # Feature modules
│   │   ├── auth/         # Authentication logic
│   │   ├── bed-management/
│   │   ├── care-plans/
│   │   ├── medications/
│   │   ├── organizations/
│   │   ├── residents/
│   │   └── waitlist/
│   ├── hooks/            # Shared React hooks
│   ├── lib/              # Core utilities
│   │   ├── api/         # API utilities
│   │   ├── contexts/    # React contexts
│   │   ├── multi-tenant/# Multi-tenancy support
│   │   ├── payroll/     # Payroll processing
│   │   └── utils/       # Helper functions
│   ├── providers/        # React providers
│   ├── types/           # TypeScript types
│   └── utils/           # Utility functions
├── public/               # Static assets
│   ├── images/          # Image assets
│   └── workers/         # Web workers
└── prisma/              # Database schema
```

## Feature Module Structure
Each feature module follows this structure:
```bash
features/[feature-name]/
├── api/                 # Feature-specific API
├── components/          # Feature-specific components
├── hooks/              # Feature-specific hooks
├── repositories/       # Data access layer
├── services/          # Business logic
├── types/             # Type definitions
└── utils/             # Feature utilities
```

## Component Structure
Components follow this structure:
```bash
components/[component-type]/
├── ComponentName.tsx    # Component implementation
├── index.ts           # Exports
└── types.ts          # Component types
```

## API Route Structure
```bash
app/api/[feature-name]/
├── route.ts            # Main API handler
└── [id]/              # Dynamic routes
    └── route.ts       # Dynamic route handler
```

## Core Utilities (src/lib/)
```bash
lib/
├── api/                # API utilities
├── contexts/           # React contexts
├── multi-tenant/       # Multi-tenancy
├── payroll/           # Payroll processing
└── utils/             # Helpers
```

## Marketing Route Structure

```bash
app/
├── (marketing)/              # Marketing route group
│   ├── page.tsx             # Home page
│   ├── features/            # Features page
│   │   └── page.tsx
│   ├── pricing/             # Pricing page
│   │   └── page.tsx
│   └── layout.tsx           # Marketing layout
└── globals.css              # Global styles

src/
├── components/
│   └── marketing/           # Marketing components
│       ├── Features.tsx
│       ├── PricingPlans.tsx
│       └── Footer.tsx
```

### Component Organization

1. **Route Components** (`app/(marketing)/`)
   - These are Next.js pages and layouts
   - Each represents a unique route
   - Contains page-specific logic

2. **Reusable Components** (`src/components/marketing/`)
   - Shared marketing components
   - Feature sections
   - Pricing plans
   - Common UI elements

### Style Organization

1. **Global Styles** (`app/globals.css`)
   - Base styles
   - Tailwind directives
   - Global variables

2. **Component Styles**
   - Co-located with components
   - Tailwind classes
   - CSS modules if needed

## Configuration Files
Essential configuration files:
- `next.config.js` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `package.json` - Dependencies and scripts
- `env.mjs` - Environment variables schema
- `middleware.ts` - Next.js middleware

## Naming Conventions
- **Routes/Pages**: kebab-case (e.g., `bed-management/page.tsx`)
- **Components**: PascalCase (e.g., `BedManagementCard.tsx`)
- **Hooks**: camelCase with 'use' prefix (e.g., `useBedManagement.ts`)
- **Utils**: camelCase (e.g., `formatDate.ts`)
- **Types**: PascalCase (e.g., `BedManagementTypes.ts`)
- **Constants**: UPPER_SNAKE_CASE
- **CSS Modules**: kebab-case.module.css

## Import Structure
```typescript
// 1. External imports
import { useState } from 'react'
import { z } from 'zod'

// 2. Internal absolute imports
import { Button } from '@/components/ui'
import { useBedManagement } from '@/hooks'
import { formatDate } from '@/utils'

// 3. Types
import type { BedManagementProps } from './types'

// 4. Relative imports
import { BedStatus } from './BedStatus'
```

## Key Differences from Previous Structure
1. No more `src/` directory - everything is organized at root level
2. No more `pages/` directory - using App Router exclusively
3. Features are organized under `app/(features)/` only
4. Simplified component organization
5. Clear separation between shared and feature-specific code
6. Consistent file organization across features

## Code Organization Rules
1. All routes go in the `app` directory
2. Shared components go in root `components` directory
3. Feature-specific components stay with their features
4. Business logic in hooks and API routes
5. Types stay close to their usage
6. One component per file
7. CSS Modules for component styles
8. Constants in separate files
9. Tests alongside their components
10. Clear import organization