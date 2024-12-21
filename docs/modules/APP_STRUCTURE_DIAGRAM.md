# Write Care Notes - Application Structure Diagram

```
write-care-notes/
│
├── app/                              # Next.js App Router
│   │
│   ├── (auth)/                      # Authentication Routes
│   │   ├── signin/                  # Sign In
│   │   ├── signup/                  # Sign Up
│   │   ├── magic-link/              # Magic Link Auth
│   │   ├── reset-password/          # Password Reset
│   │   └── verify-magic-link/       # Magic Link Verification
│   │
│   ├── (dashboard)/                 # Protected Dashboard Routes
│   │   ├── assessments/             # Assessments Management
│   │   ├── care-plans/              # Care Plans
│   │   ├── clinical/                # Clinical Features
│   │   ├── compliance/              # Compliance Management
│   │   ├── documents/               # Document Management
│   │   ├── financial/               # Financial Management
│   │   ├── organizations/           # Organization Management
│   │   ├── resident-care/           # Resident Care
│   │   ├── residents/               # Resident Management
│   │   ├── schedule/                # Scheduling
│   │   ├── settings/                # Settings
│   │   └── staff/                   # Staff Management
│   │
│   ├── (marketing)/                 # Public Marketing Pages
│   │   ├── about/                   # About Us
│   │   ├── demo/                    # Demo Pages
│   │   ├── features/                # Features Showcase
│   │   └── pricing/                 # Pricing Information
│   │
│   └── api/                         # API Routes
│       ├── assessments/             # Assessment APIs
│       ├── bed-management/          # Bed Management APIs
│       ├── care-homes/              # Care Home APIs
│       ├── organizations/           # Organization APIs
│       └── residents/               # Resident APIs
│
├── src/                             # Source Code
│   │
│   ├── components/                  # React Components
│   │   ├── auth/                   # Auth Components
│   │   ├── marketing/              # Marketing Components
│   │   ├── offline/                # Offline Components
│   │   └── ui/                     # UI Components
│   │
│   ├── features/                   # Feature Modules
│   │   ├── auth/                  # Authentication
│   │   ├── bed-management/        # Bed Management
│   │   ├── care-plans/           # Care Plans
│   │   ├── medications/          # Medications
│   │   ├── organizations/        # Organizations
│   │   ├── residents/           # Residents
│   │   └── waitlist/            # Waitlist
│   │
│   ├── hooks/                     # React Hooks
│   │   ├── use-bed-management.ts
│   │   ├── use-region.ts
│   │   └── useRegionalConfig.ts
│   │
│   ├── lib/                      # Core Utilities
│   │   ├── api/                 # API Utilities
│   │   ├── contexts/           # React Contexts
│   │   ├── multi-tenant/       # Multi-tenancy
│   │   ├── payroll/           # Payroll
│   │   └── utils/             # Utilities
│   │
│   ├── providers/              # React Providers
│   │   ├── RegionalProvider.tsx
│   │   └── regional-provider.tsx
│   │
│   └── types/                 # TypeScript Types
│       ├── assessment.types.ts
│       ├── bed-management.ts
│       └── regional.ts
│
├── public/                    # Static Assets
│   ├── images/               # Images
│   └── workers/             # Web Workers
│
└── prisma/                  # Database Schema
    └── schema.prisma       # Prisma Schema

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