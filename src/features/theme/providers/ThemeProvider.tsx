/**
 * @writecarenotes.com
 * @fileoverview Theme provider component for managing application theme
 * @version 1.0.0
 * @created 2024-01-03
 * @updated 2024-01-03
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
} 