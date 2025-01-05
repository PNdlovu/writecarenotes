/**
 * @writecarenotes.com
 * @fileoverview Application providers wrapper
 * @version 1.0.0
 * @created 2024-01-03
 * @updated 2024-01-03
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

"use client"

import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "@/features/theme/providers/ThemeProvider"
import { Toaster } from "@/components/ui/Toast/Toaster"

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ThemeProvider>
        {children}
        <Toaster />
      </ThemeProvider>
    </SessionProvider>
  )
}
