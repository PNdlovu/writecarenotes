export const brandAssets = {
  brandGuidelines: {
    current: '/assets/brand/guidelines/write-care-notes-brand-guidelines-v1.pdf',
    versions: [
      {
        version: 'v1',
        path: '/assets/brand/guidelines/write-care-notes-brand-guidelines-v1.pdf',
        date: '2023-12-23',
        description: 'Initial brand guidelines including color palette, typography, and logo usage',
      },
    ],
  },
  logos: {
    primary: {
      horizontal: {
        light: '/assets/brand/logos/write-care-notes-horizontal-light.svg',
        dark: '/assets/brand/logos/write-care-notes-horizontal-dark.svg',
      },
      vertical: {
        light: '/assets/brand/logos/write-care-notes-vertical-light.svg',
        dark: '/assets/brand/logos/write-care-notes-vertical-dark.svg',
      },
      icon: {
        light: '/assets/brand/logos/write-care-notes-icon-light.svg',
        dark: '/assets/brand/logos/write-care-notes-icon-dark.svg',
      },
    },
  },
  images: {
    patterns: {
      light: '/assets/brand/images/pattern-light.svg',
      dark: '/assets/brand/images/pattern-dark.svg',
    },
  },
} as const;
