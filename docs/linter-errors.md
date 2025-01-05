# Write Care Notes - Linter Errors

Last Updated: 2024-03-21

## Critical Errors

### Layout Theme Provider
**File**: `src/app/layout.tsx`
- Cannot find module '@/components/theme-provider' or its corresponding type declarations

## Files to Review

The following files need to be reviewed for potential issues:

### Authentication
1. `app/(auth)/login/page.tsx`
2. `src/app/api/auth/register/route.ts`
3. `src/features/auth/components/user-auth-form.tsx`
4. `src/features/auth/components/registration/user-register-form.tsx`
5. `src/features/auth/components/registration/steps/organization-details-step.tsx`
6. `src/features/auth/components/registration/steps/data-migration-step.tsx`
7. `src/features/auth/components/registration/steps/subscription-step.tsx`
8. `src/features/auth/components/registration/steps/verification-step.tsx`
9. `src/features/auth/components/AuthButton.tsx`

### Subscription
1. `src/features/subscription/services/subscription-service.ts`

## Action Items

1. Fix theme provider import in layout
   - Verify the correct path
   - Ensure the module exists
   - Update import statement

2. Review auth components
   - Check for type declarations
   - Verify imports
   - Update component interfaces

3. Review subscription service
   - Check type declarations
   - Verify service implementation 