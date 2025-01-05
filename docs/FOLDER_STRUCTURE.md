# Write Care Notes Application Structure

## Overview

This document outlines the actual folder structure of Write Care Notes, a Next.js-based enterprise application.

## Root Structure

```
wsapp/
├── app/                      # Next.js App Router directory
│   ├── (admin)/             # Admin routes group
│   ├── (dashboard)/         # Dashboard routes group
│   ├── (marketing)/         # Marketing pages group
│   ├── [region]/            # Dynamic region routes
│   ├── api/                 # API routes
│   ├── auth/                # Authentication routes
│   ├── blog/                # Blog routes
│   ├── brand/               # Brand assets/pages
│   ├── components/          # App-specific components
│   ├── lib/                 # App-specific utilities
│   ├── test/                # Test routes
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Root page
│   └── providers.tsx        # App providers

├── src/                     # Source directory
│   ├── components/          # Shared components
│   ├── config/             # Configuration files
│   ├── data/              # Data utilities
│   ├── db/                # Database utilities
│   ├── docs/              # Documentation
│   ├── error/             # Error handling
│   ├── features/          # Feature modules
│   ├── hooks/             # Custom React hooks
│   ├── i18n/              # Internationalization
│   ├── lib/               # Core utilities
│   ├── scripts/           # Utility scripts
│   ├── services/          # Service layer
│   ├── styles/            # Styling utilities
│   ├── tests/             # Test utilities
│   ├── types/             # TypeScript types
│   ├── utils/             # Utility functions
│   └── service-worker.ts  # Service worker

├── __tests__/             # Test files
├── docs/                  # Documentation
├── lib/                   # Root level utilities
├── prisma/               # Database schema and migrations
├── public/               # Static assets
├── scripts/              # Build and utility scripts
└── types/                # Root level types

## Configuration Files
├── .env                  # Environment variables
├── .env.example          # Example environment variables
├── env.mjs              # Environment configuration
├── jest.config.js       # Jest configuration
├── jest.setup.js        # Jest setup
├── next.config.js       # Next.js configuration
├── postcss.config.js    # PostCSS configuration
├── tailwind.config.ts   # Tailwind configuration
└── tsconfig.json        # TypeScript configuration
```

## Feature Module Structure

Each feature module under `src/features/` follows this structure:

```
feature-name/
├── components/           # Feature-specific components
├── hooks/               # Feature-specific hooks
├── services/            # Feature-specific services
├── types/               # Feature-specific types
├── utils/               # Feature-specific utilities
└── index.ts            # Feature entry point
```

## Key Architectural Points

1. **App Router Structure**
   - Route groups for different sections ((admin), (dashboard), (marketing))
   - API routes in app/api
   - Dynamic routes with [region]
   - Shared components and utilities

2. **Source Organization**
   - Feature-based modules in src/features
   - Shared components and hooks
   - Core utilities and services
   - Type definitions
   - Internationalization support

3. **Testing Structure**
   - Root level __tests__ directory
   - Feature-specific tests
   - Test utilities and setup

4. **Configuration**
   - Environment variables
   - TypeScript configuration
   - Next.js configuration
   - Testing setup

## Best Practices

1. **Module Organization**
   - Feature-first approach
   - Clear separation of concerns
   - Shared utilities at appropriate levels
   - Type safety throughout

2. **Route Organization**
   - Logical grouping with route groups
   - API routes separation
   - Dynamic routing support
   - Shared layouts

3. **Component Structure**
   - App-specific components in app/components
   - Shared components in src/components
   - Feature-specific components within features

4. **Service Layer**
   - Core services in src/services
   - Feature-specific services within features
   - Clear separation of business logic
