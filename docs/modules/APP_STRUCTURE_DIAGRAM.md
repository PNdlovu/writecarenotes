# Write Care Notes - Application Structure Diagram

```
write-care-notes/
│
├── app/                              # Next.js App Router
│   │
│   ├── (auth)/                      # Authentication Group
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   │
│   ├── (dashboard)/                 # Dashboard Group
│   │   ├── overview/
│   │   └── analytics/
│   │
│   ├── (features)/                  # Features Group
│   │   │
│   │   ├── residents/              # Resident Management
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── types/
│   │   │   ├── utils/
│   │   │   ├── constants.ts
│   │   │   ├── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── care-plans/            # Care Plans
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── ...
│   │   │
│   │   └── bed-management/        # Bed Management
│   │       ├── components/
│   │       ├── hooks/
│   │       └── ...
│   │
│   ├── api/                        # API Routes
│   │   ├── residents/
│   │   ├── care-plans/
│   │   └── bed-management/
│   │
│   └── layout.tsx                  # Root Layout
│
├── components/                      # Shared Components
│   │
│   ├── ui/                        # UI Components
│   │   ├── Button/
│   │   │   ├── index.tsx
│   │   │   ├── types.ts
│   │   │   ├── styles.module.css
│   │   │   └── test.tsx
│   │   │
│   │   ├── Card/
│   │   └── Form/
│   │
│   └── layout/                    # Layout Components
│       ├── Header/
│       ├── Sidebar/
│       └── Footer/
│
├── lib/                            # Core Utilities
│   ├── api/                       # API Utilities
│   │   ├── client.ts
│   │   └── endpoints.ts
│   │
│   ├── db/                        # Database Utilities
│   │   ├── client.ts
│   │   └── queries.ts
│   │
│   └── utils/                     # Helper Functions
│       ├── date.ts
│       ├── validation.ts
│       └── formatting.ts
│
├── hooks/                          # Shared Hooks
│   ├── use-auth.ts
���   ├── use-tenant.ts
│   └── use-offline.ts
│
├── providers/                      # Context Providers
│   ├── auth-provider.tsx
│   └── theme-provider.tsx
│
├── types/                          # Shared Types
│   ├── auth.ts
│   └── common.ts
│
├── styles/                         # Global Styles
│   ├── globals.css
│   └── themes/
│
├── public/                         # Static Assets
│   ├── images/
│   └── icons/
│
├── prisma/                         # Database Schema
│   ├── schema.prisma
│   └── migrations/
│
├── tests/                          # Test Files
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
└── config/                         # Configuration
    ├── next.config.js
    ├── tailwind.config.ts
    └── tsconfig.json
```

## Key Points About the Structure

1. **App Router (`/app`)**
   - Groups in parentheses `(group-name)`
   - Features isolated in `(features)`
   - API routes parallel to pages

2. **Feature Organization**
   - Each feature is self-contained
   - Components, hooks, and utils together
   - Consistent structure across features

3. **Shared Resources**
   - UI components in `/components`
   - Core utilities in `/lib`
   - Global types in `/types`

4. **Testing & Configuration**
   - Tests mirror source structure
   - Configuration at root level
   - Clear separation of concerns

## Benefits

1. **Clear Navigation**
   - Easy to find files
   - Logical grouping
   - Consistent patterns

2. **Feature Isolation**
   - Self-contained features
   - Clear boundaries
   - Easy to maintain

3. **Scalability**
   - Easy to add new features
   - Consistent patterns
   - Clear organization

4. **Development Efficiency**
   - Quick file location
   - Clear dependencies
   - Reduced confusion
``` 