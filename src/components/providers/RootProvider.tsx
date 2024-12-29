'use client';

import React from 'react';
import { ThemeProvider } from '@/components/theme';
import { AccessibilityProvider } from '@/features/access-management/accessibility';
import { AuthProvider } from '@/features/access-management/auth';

export function RootProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AccessibilityProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </AccessibilityProvider>
    </ThemeProvider>
  );
} 
