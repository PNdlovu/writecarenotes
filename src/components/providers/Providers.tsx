'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from '@/components/ui/theme-provider'
import { AuthProvider } from '@/lib/contexts/auth-context'
import { ErrorBoundary } from '@/error/components/ErrorBoundary'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <SessionProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </SessionProvider>
    </ErrorBoundary>
  )
}
