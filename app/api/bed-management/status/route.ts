/**
 * WriteCareNotes.com
 * @fileoverview Bed Status API Route
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Phibu Cloud Solutions Ltd.
 */

import { NextResponse } from 'next/server'
import type { BedStatus } from '@/app/(features)/bed-management/types'

export async function GET() {
  // TODO: Implement actual data fetching
  const mockData: BedStatus = {
    id: '1',
    number: 'B101',
    status: 'occupied',
    lastUpdated: new Date().toISOString(),
  }

  return NextResponse.json(mockData)
} 