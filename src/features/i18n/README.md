# Internationalization (i18n) Feature

## Overview
This feature provides internationalization support across all features of the Care Home Management System. It is built on top of `next-international` and follows our feature-based architecture.

## Directory Structure
```
src/features/i18n/
├── components/          # Reusable i18n components
│   └── LanguageSelector/
├── hooks/              # Feature-specific translation hooks
│   ├── index.ts
│   ├── useResidentTranslation.ts
│   └── useFinancialTranslation.ts
├── lib/                # Core i18n functionality
│   ├── config.ts       # Main configuration
│   └── regions.ts      # Region-specific settings
├── locales/            # Translation files
│   ├── en/
│   │   ├── resident.ts
│   │   ├── financial.ts
│   │   └── ...
│   └── [lang]/
└── __tests__/          # Tests
    └── translations.test.ts
```

## Integration with Other Features

### Using Translations in Features
Each feature should:
1. Define its translations in `locales/[lang]/[feature].ts`
2. Create a specialized hook in `hooks/use[Feature]Translation.ts`
3. Use the specialized hook in its components

Example:
```typescript
// src/features/resident/components/ResidentProfile.tsx
import { useResidentTranslation } from '@/features/i18n/hooks';

export function ResidentProfile() {
  const { t } = useResidentTranslation();
  return <h1>{t('profile.title')}</h1>;
}
```

### Translation File Structure
```typescript
// src/features/i18n/locales/en/resident.ts
export default {
  profile: {
    title: 'Resident Profile',
    // ...
  },
  // ...
};
```

## Adding New Features
1. Create translation files for each language
2. Create a specialized translation hook
3. Add tests for the new translations
4. Update documentation

For full documentation, see:
- [CHANGELOG.md](./CHANGELOG.md)
- [FEATURES.md](./FEATURES.md)
