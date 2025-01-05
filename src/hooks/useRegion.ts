/**
 * WriteCareNotes.com
 * @fileoverview Regional Context Hook
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Phibu Cloud Solutions Ltd.
 */

import { useContext } from 'react'
import { RegionalContext } from '@/providers/RegionalProvider'

export function useRegion() {
  const context = useContext(RegionalContext)
  if (!context) {
    throw new Error('useRegion must be used within RegionalProvider')
  }
  return context
}


