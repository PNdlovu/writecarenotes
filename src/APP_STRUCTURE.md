# Write Care Notes - Application Structure

## Root Directory Structure
```bash
/
├── app/                    # Next.js App Router (Main application code)
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Dashboard routes
│   ├── (features)/        # Feature routes
│   │   ├── residents/     
│   │   ├── care-plans/    
│   │   └── bed-management/
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/            # Shared React components
│   ├── ui/               # Base UI components
│   └── layout/           # Layout components
├── lib/                  # Core utilities and business logic
│   ├── api/              # API utilities
│   ├── db/               # Database utilities
│   └── utils/            # Helper functions
├── hooks/                # Shared React hooks
├── providers/           # React context providers
├── types/               # TypeScript type definitions
├── styles/              # Global styles and themes
├── public/              # Static assets
├── prisma/              # Database schema and migrations
├── tests/               # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── config/              # Configuration files
```

## Feature Structure (inside app/(features))
Each feature follows this structure:
```bash
(features)/[feature-name]/
├── components/          # Feature-specific components
├── hooks/               # Feature-specific hooks
├── types/              # Feature-specific types
├── utils/              # Feature-specific utilities
├── constants.ts        # Feature constants
├── page.tsx            # Main page component
└── layout.tsx          # Feature layout (if needed)
```

## Component Structure
Each component follows this structure:
```bash
components/[ComponentName]/
├── index.tsx           # Component implementation
├── types.ts           # Component types
├── styles.module.css  # Component styles
└── test.tsx           # Component tests
```

## API Route Structure
```bash
app/api/[feature-name]/
├── route.ts            # Main API handler
└── [id]/              # Dynamic API routes
    └── route.ts
```

## Core Utilities (lib/)
```bash
lib/
├── api/                # API utilities
│   ├── client.ts       # API client
│   └── endpoints.ts    # API endpoints
├── db/                 # Database utilities
│   ├── client.ts       # Database client
│   └── queries.ts      # Common queries
└── utils/              # Helper functions
    ├── date.ts
    ├── validation.ts
    └── formatting.ts
```

## Configuration Files
Essential configuration files at root:
- `next.config.js` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `package.json` - Dependencies and scripts
- `.env` - Environment variables
- `.env.example` - Example environment variables
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
import { useQuery } from '@tanstack/react-query'

// 2. Internal absolute imports
import { Button } from '@/components/ui/button'
import { useBedManagement } from '@/hooks/use-bed-management'

// 3. Types and constants
import type { BedStatus } from './types'
import { BED_STATUSES } from './constants'

// 4. Styles
import styles from './styles.module.css'
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
``` 