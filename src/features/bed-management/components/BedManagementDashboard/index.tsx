/**
 * WriteCareNotes.com
 * @fileoverview Bed Management Dashboard Component
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Phibu Cloud Solutions Ltd.
 */

import { useRegion } from '@/hooks/use-region'
import { RegionalComponents } from './regional'

export function BedManagementDashboard() {
  const { region } = useRegion()
  const RegionalComponent = RegionalComponents[region]

  return <RegionalComponent />
} 