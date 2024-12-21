# Find the process using port 3000 (default Next.js port)
netstat -ano | findstr :3000
# Kill the process using its PID (replace XXXX with the actual PID)
taskkill /PID XXXX /F/**
 * WriteCareNotes.com
 * @fileoverview Regional Hook
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Phibu Cloud Solutions Ltd.
 */

import { useContext } from 'react'
import { RegionalContext } from '@/providers/regional-provider'

export function useRegion() {
  const context = useContext(RegionalContext)
  
  if (!context) {
    throw new Error('useRegion must be used within a RegionalProvider')
  }
  
  return context
} 