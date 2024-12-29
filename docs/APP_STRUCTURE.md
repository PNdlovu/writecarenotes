# Write Care Notes - Application Structure

## Overview

Write Care Notes follows Next.js 13+ App Router conventions with a modern, scalable application structure optimized for enterprise healthcare software.

## Directory Structure

```bash
write-care-notes/
│
├── app/                              # Next.js 13+ App Router (root level)
│   ├── (auth)/                      # Authentication Routes
│   │   ├── login/
│   │   │   └── page.tsx             # Login page
│   │   ├── register/
│   │   │   └── page.tsx             # Register page
│   │   └── layout.tsx               # Auth layout
│   │
│   ├── (dashboard)/                 # Protected Dashboard Routes
│   │   ├── assessments/
│   │   │   └── page.tsx
│   │   ├── care-plans/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   │
│   ├── api/                         # API Routes
│   │   ├── auth/
│   │   │   └── route.ts
│   │   └── users/
│   │       └── route.ts
│   │
│   ├── resources/                   # Resource Routes
│   │   └── documentation/
│   │       ├── activities/
│   │       │   └── page.tsx
│   │       └── admission/
│   │           └── page.tsx
│   │
│   ├── layout.tsx                   # Root layout
│   └── page.tsx                     # Home page
│
├── public/                          # Static Assets
│   ├── images/                      # Image assets
│   └── resources/                   # Static resources
│       └── documentation/           # Documentation files
│           ├── templates/
│           └── downloads/
│
└── src/                             # Application Source
    ├── components/                  # Shared Components
    │   ├── ui/                      # UI Components
    │   │   ├── Button/
    │   │   └── Card/
    │   └── layout/                  # Layout Components
    │       ├── Header/
    │       └── Footer/
    │
    ├── features/                    # Feature Modules
    │   ├── auth/                    # Authentication
    │   │   ├── components/
    │   │   ├── hooks/
    │   │   └── utils/
    │   │
    │   └── documentation/           # Documentation
    │       ├── components/
    │       │   ├── DocumentCard/
    │       │   └── ToolCard/
    │       └── types/
    │
    ├── hooks/                       # Shared Hooks
    │   └── use-auth.ts
    │
    ├── lib/                         # Core Utilities
    │   ├── api/                     # API Utilities
    │   └── utils/                   # General Utilities
    │
    └── types/                       # Shared Types
        └── index.ts

```

## Module Organization

### Feature Module Structure
Each feature module in `src/features` follows this structure:
```bash
features/[feature-name]/
├── components/          # Feature-specific components
├── hooks/              # Feature-specific hooks
├── types/              # Type definitions
└── utils/              # Feature utilities
```

### Component Structure
Components follow this structure:
```bash
components/[component-name]/
├── index.tsx           # Component implementation
└── types.ts           # Component types
```

### Page Structure
Pages follow this structure:
```bash
app/[route]/
├── page.tsx           # Page component
├── layout.tsx         # Layout (if needed)
└── loading.tsx        # Loading state (optional)
```

## Development Standards

### Naming Conventions
- **Routes**: kebab-case (e.g., `care-plans/page.tsx`)
- **Components**: PascalCase (e.g., `Button.tsx`)
- **Hooks**: camelCase with 'use' prefix (e.g., `useAuth.ts`)
- **Utils**: camelCase (e.g., `formatDate.ts`)
- **Types**: PascalCase (e.g., `AuthTypes.ts`)

### Import Structure
```typescript
// 1. External imports
import { useState } from 'react'

// 2. Internal absolute imports
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'

// 3. Types
import type { AuthProps } from './types'

// 4. Relative imports
import { LoginForm } from './LoginForm'
```

### Configuration Files
Essential configuration files:
- `next.config.js` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `package.json` - Dependencies and scripts
- `middleware.ts` - Next.js middleware

## Key Architectural Points

### 1. App Router Organization
- Route groups in parentheses `(group-name)`
- Each route has its own `page.tsx`
- Shared layouts in `layout.tsx`
- API routes in `route.ts`
- Loading states in `loading.tsx`

### 2. Feature Organization
- Features isolated in `src/features`
- Components close to their features
- Clear separation of concerns
- Reusable components in `src/components`

### 3. Static Assets
- All static files in `public`
- Documentation resources in `public/resources`
- Images in `public/images`
- Organized by feature/type

## Code Organization Rules

1. All routes in root `app` directory
2. All static assets in `public`
3. All application code in `src`
4. Feature-specific code in feature directories
5. Shared components in `src/components`
6. One component per file
7. Clear import organization
8. Consistent naming conventions

## Benefits

1. **Next.js 13+ Optimized**
   - Follows App Router conventions
   - Server/Client components
   - Optimized routing

2. **Clear Organization**
   - Easy to navigate
   - Consistent structure
   - Maintainable code

3. **Scalable Architecture**
   - Feature isolation
   - Clear boundaries
   - Easy to extend 