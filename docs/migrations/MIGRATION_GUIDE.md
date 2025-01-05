# Feature Migration Guide

## Migration Steps Per Feature

### 1. File Movement Pattern
```bash
# FROM:
src/features/[feature-name]/*

# TO:
app/(features)/[feature-name]/
├── components/     # From src/features/[feature-name]/components
├── hooks/          # From src/features/[feature-name]/hooks
├── types/          # From src/features/[feature-name]/types
├── utils/          # From src/features/[feature-name]/utils
├── constants.ts    # Feature constants
├── page.tsx        # Main page component
└── layout.tsx      # Feature layout
```

### 2. Import Updates

#### Old Imports
```typescript
// OLD: Component imports
import { Component } from '@/features/[feature-name]/components'
import { useHook } from '@/features/[feature-name]/hooks'
import { type } from '@/features/[feature-name]/types'

// OLD: API imports
import { api } from '@/features/[feature-name]/api'
```

#### New Imports
```typescript
// NEW: Component imports (from feature)
import { Component } from '@/app/(features)/[feature-name]/components'

// NEW: Shared component imports
import { Button } from '@/components/ui/button'

// NEW: Hook imports (feature-specific)
import { useHook } from '@/app/(features)/[feature-name]/hooks'

// NEW: API route imports
import { api } from '@/app/api/[feature-name]/route'
```

## Feature Migration Checklist

### 1. bed-management
- [ ] Move components to `app/(features)/bed-management/components`
- [ ] Move hooks to `app/(features)/bed-management/hooks`
- [ ] Move types to `app/(features)/bed-management/types`
- [ ] Create `page.tsx` and `layout.tsx`
- [ ] Update all imports
- [ ] Test feature functionality

### 2. access-management
- [ ] Move components to `app/(features)/access-management/components`
- [ ] Move hooks to `app/(features)/access-management/hooks`
- [ ] Move types to `app/(features)/access-management/types`
- [ ] Create `page.tsx` and `layout.tsx`
- [ ] Update all imports
- [ ] Test feature functionality

[... continue for each feature]

## Import Path Updates

### 1. Component Import Updates
```typescript
// Before
import { BedManagementDashboard } from '@/features/bed-management/components/BedManagementDashboard'

// After
import { BedManagementDashboard } from '@/app/(features)/bed-management/components/BedManagementDashboard'
```

### 2. Hook Import Updates
```typescript
// Before
import { useBedManagement } from '@/features/bed-management/hooks/useBedManagement'

// After
import { useBedManagement } from '@/app/(features)/bed-management/hooks/useBedManagement'
```

### 3. Type Import Updates
```typescript
// Before
import type { BedStatus } from '@/features/bed-management/types'

// After
import type { BedStatus } from '@/app/(features)/bed-management/types'
```

## Migration Process

1. **Preparation**
   - Back up current code
   - Create new feature directories in `app/(features)`
   - Set up basic `page.tsx` and `layout.tsx`

2. **Component Migration**
   ```bash
   # Example for bed-management
   mkdir -p app/(features)/bed-management/components
   mv src/features/bed-management/components/* app/(features)/bed-management/components/
   ```

3. **Hook Migration**
   ```bash
   mkdir -p app/(features)/bed-management/hooks
   mv src/features/bed-management/hooks/* app/(features)/bed-management/hooks/
   ```

4. **Type Migration**
   ```bash
   mkdir -p app/(features)/bed-management/types
   mv src/features/bed-management/types/* app/(features)/bed-management/types/
   ```

5. **Update Imports**
   ```bash
   # Use search and replace for import paths
   find . -type f -name "*.ts*" -exec sed -i 's/@\/features\//@\/app\/(features)\//g' {} +
   ```

6. **Testing**
   - Test each feature after migration
   - Check for broken imports
   - Verify functionality
   - Run type checks

## Shared Code Migration

1. **Shared Components**
   - Move to `/components/ui`
   - Update imports across all features

2. **Shared Hooks**
   - Move to `/hooks`
   - Update imports across all features

3. **Shared Types**
   - Move to `/types`
   - Update imports across all features

## Post-Migration Cleanup

1. **Remove Old Directories**
   ```bash
   # Only after successful migration and testing
   rm -rf src/features
   ```

2. **Update TypeScript Paths**
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./*"]
       }
     }
   }
   ```

3. **Update ESLint Configuration**
   ```json
   {
     "rules": {
       "import/no-restricted-paths": [
         "error",
         {
           "zones": [
             {
               "target": "./app/(features)",
               "from": "./src/features"
             }
           ]
         }
       ]
     }
   }
   ```

## Testing Checklist

1. **Type Checking**
   ```bash
   pnpm type-check
   ```

2. **Linting**
   ```bash
   pnpm lint
   ```

3. **Unit Tests**
   ```bash
   pnpm test
   ```

4. **Build Test**
   ```bash
   pnpm build
   ```

## Rollback Plan

1. **Before Migration**
   - Create backup branch
   ```bash
   git checkout -b backup/pre-migration
   git add .
   git commit -m "Backup before feature migration"
   ```

2. **Rollback if needed**
   ```bash
   git checkout backup/pre-migration
   ```

## Support

If you encounter any issues during migration:
1. Check the migration guide
2. Run type checks and linting
3. Test the feature thoroughly
4. Update documentation as needed
``` 