/**
 * @writecarenotes.com
 * @fileoverview Theme hook for managing application theme
 * @version 1.0.0
 * @created 2024-01-03
 * @updated 2024-01-03
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

"use client"

import { useTheme as useNextTheme } from "next-themes"

export function useTheme() {
  return useNextTheme()
} 