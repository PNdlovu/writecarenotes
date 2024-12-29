/**
 * WriteCareNotes.com
 * @fileoverview Regional Context Provider
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Phibu Cloud Solutions Ltd.
 */

'use client'

import { createContext, useState, useEffect, type PropsWithChildren } from 'react'
import type { Region } from '@/types/regional'
import { REGIONAL_CONFIG } from '@/types/regional'

interface RegionalContextType {
  region: Region
  setRegion: (region: Region) => void
  config: typeof REGIONAL_CONFIG[Region]
}

export const RegionalContext = createContext<RegionalContextType | undefined>(undefined)

export function RegionalProvider({ children }: PropsWithChildren) {
  const [region, setRegion] = useState<Region>('england')

  // Load region from localStorage or other source
  useEffect(() => {
    const savedRegion = localStorage.getItem('region') as Region
    if (savedRegion && REGIONAL_CONFIG[savedRegion]) {
      setRegion(savedRegion)
    }
  }, [])

  // Save region changes
  useEffect(() => {
    localStorage.setItem('region', region)
  }, [region])

  const value = {
    region,
    setRegion,
    config: REGIONAL_CONFIG[region],
  }

  return (
    <RegionalContext.Provider value={value}>
      {children}
    </RegionalContext.Provider>
  )
} 