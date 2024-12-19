'use client';

import React from 'react';
import { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { AccessibilityProvider } from './AccessibilityProvider';
import { ThemeProvider } from '@/features/theme/ThemeProvider';

interface RootProviderProps {
  children: React.ReactNode;
  session: Session | null;
}

export function RootProvider({ children, session }: RootProviderProps) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider>
        <AccessibilityProvider>
          {children}
        </AccessibilityProvider>
      </ThemeProvider>
    </SessionProvider>
  );
} 
